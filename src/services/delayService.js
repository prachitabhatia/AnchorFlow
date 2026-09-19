const prisma = require("../db");
const config = require("../config");
const ApiError = require("../utils/ApiError");
const validate = require("../utils/validate");
const { DELAY_STRATEGY, AGENDA_STATUS, RUN_STATE, SCHEDULE_STATUS, SCRIPT_TYPE, SCRIPT_VARIANT, ANNOUNCEMENT_SOURCE } = require("../constants");
const buildEventContext = require("./contextBuilder");
const { recalculateSchedule } = require("./scheduleEngine");
const { withEffectiveTimes } = require("./agendaService");
const { filler } = require("./promptTemplates");
const { getScriptWithFallback } = require("./scriptService");
const ai = require("./ai");
const buildLiveSnapshot = require("./liveSnapshot");
const { emitLiveUpdate } = require("../realtime");

async function loadLiveItem(agendaItemId) {
  const item = await prisma.agendaItem.findUnique({
    where: { id: agendaItemId },
    include: { event: { include: { liveState: true, agendaItems: { orderBy: { orderIndex: "asc" } } } } },
  });
  if (!item) throw ApiError.notFound("Agenda item not found");
  if (item.event.liveState?.runState !== RUN_STATE.LIVE) {
    throw ApiError.badRequest("Event must be live and not paused to report a delay");
  }
  return item;
}

async function reportDelay({ agendaItemId, delayMinutes }) {
  // 1. Validate the request and the target's live event before contacting AI.
  agendaItemId = validate.requireString(agendaItemId, "agendaItemId");
  delayMinutes = validate.requireInt(delayMinutes, "delayMinutes", { min: 1, max: 240 });
  let delayedItem = await loadLiveItem(agendaItemId);
  const eventId = delayedItem.eventId;

  // 2. Reuse the prompt context with this report's incremental delay.
  const context = await buildEventContext({ eventId, agendaItemId, extra: { delayMinutes } });

  // 3. One AI request, outside all transactions; reserve time for database writes.
  let answer;
  let timer;
  const timeoutMs = Math.min(config.aiTimeoutMs > 0 ? config.aiTimeoutMs : 3000, 3000);
  try {
    const prompt = filler(context, { includeStrategy: true });
    const text = await Promise.race([
      ai.generate({ ...prompt, timeoutMs }),
      new Promise((resolve, reject) => { timer = setTimeout(() => reject(new Error("Delay AI timeout")), timeoutMs); }),
    ]);
    answer = JSON.parse(text);
  } catch {
    // Malformed output and provider failures never prevent a usable filler.
    answer = null;
  } finally {
    clearTimeout(timer);
  }

  // 4. Accept only a known strategy and a non-empty script; otherwise use local defaults.
  let strategy = DELAY_STRATEGY.ABSORB_VIA_BUFFER;
  let content;
  let source;
  if (answer && !Array.isArray(answer) && typeof answer.script === "string" && answer.script.trim()) {
    content = answer.script.trim();
    source = "ai";
    if (Object.values(DELAY_STRATEGY).includes(answer.strategy)) strategy = answer.strategy;
  } else {
    const fallback = await getScriptWithFallback({
      eventId, agendaItemId, type: SCRIPT_TYPE.FILLER, extra: { delayMinutes },
    }, { generationFailed: true });
    content = fallback.script.content;
    source = fallback.source;
  }

  // 5. Refresh after the AI wait; apply only the NEW delay to remaining durations.
  delayedItem = await loadLiveItem(agendaItemId);
  const event = delayedItem.event;
  const state = event.liveState;
  const now = new Date();
  const schedule = recalculateSchedule({
    items: event.agendaItems, delayedItemId: agendaItemId, delayMinutes, strategy, now,
    completedItemIds: event.agendaItems.filter((item) => item.status === AGENDA_STATUS.DONE).map((item) => item.id),
  });
  const originals = new Map(event.agendaItems.map((item) => [item.id, item]));
  const updatedItems = schedule.items.map((item) => {
    const original = originals.get(item.id);
    // Compose offset deltas, then derive timestamps from the immutable plannedStart.
    return withEffectiveTimes({ ...original, ...item, offsetMinutes: original.offsetMinutes + item.offsetMinutes });
  });
  const current = updatedItems.find((item) => item.id === schedule.currentItemId);
  let currentItemEndsAt = current ? new Date(now.getTime() + current.durationMinutes * 60000) : null;
  if (current && current.id === state.currentAgendaItemId && state.currentItemEndsAt) {
    const previousEnd = withEffectiveTimes(originals.get(current.id)).effectiveEnd;
    currentItemEndsAt = new Date(state.currentItemEndsAt.getTime() + current.effectiveEnd.getTime() - previousEnd.getTime());
  }

  // 6. Commit schedule, state, filler, and announcement together; reject a stale concurrent write.
  const saved = await prisma.$transaction(async (tx) => {
    const changed = await tx.liveEventState.updateMany({
      where: { eventId, runState: RUN_STATE.LIVE, updatedAt: state.updatedAt },
      data: {
        delayOffsetMinutes: { increment: delayMinutes }, scheduleStatus: SCHEDULE_STATUS.DELAYED,
        currentAgendaItemId: schedule.currentItemId, nextAgendaItemId: schedule.nextItemId,
        currentItemEndsAt,
        currentItemStartedAt: current?.id === state.currentAgendaItemId ? state.currentItemStartedAt : (current ? now : null),
      },
    });
    if (changed.count !== 1) throw ApiError.conflict("Live state changed while reporting the delay; refresh and try again");
    for (const item of updatedItems) {
      await tx.agendaItem.update({ where: { id: item.id }, data: {
        offsetMinutes: item.offsetMinutes, durationMinutes: item.durationMinutes, status: item.status,
      } });
    }
    const script = await tx.script.create({ data: {
      eventId, agendaItemId, type: SCRIPT_TYPE.FILLER, variant: SCRIPT_VARIANT.LIVE, content,
    } });
    const announcement = await tx.announcement.create({
      data: {
        eventId, source: ANNOUNCEMENT_SOURCE.ORGANIZER_DELAY,
        message: `${delayedItem.title}: ${delayMinutes}-minute delay reported. Strategy: ${strategy}.` +
          (delayedItem.status === AGENDA_STATUS.DONE ? " This item is already done; schedule timings are unchanged." : ""),
        generatedScriptId: script.id,
      },
      select: { id: true, source: true, message: true, createdAt: true },
    });
    return { script, announcement };
  }, { maxWait: 500, timeout: 1500 });

  // 7. Serialize the committed state through the same builder as public polling.
  const liveState = await buildLiveSnapshot(eventId);
  // 8. Broadcast only after the entire transaction has committed.
  emitLiveUpdate(eventId, liveState);
  // 9. Return that exact snapshot and the persisted script and announcement.
  return {
    liveState,
    script: { id: saved.script.id, type: saved.script.type, content: saved.script.content, source },
    strategy, announcement: saved.announcement,
  };
}

module.exports = { reportDelay };
