const { randomUUID } = require("node:crypto");
const prisma = require("../db");
const config = require("../config");
const ApiError = require("../utils/ApiError");
const validate = require("../utils/validate");
const { ARRIVAL_STATUS, AGENDA_STATUS, RUN_STATE, SCHEDULE_STATUS, SCRIPT_TYPE, SCRIPT_VARIANT } = require("../constants");
const buildEventContext = require("./contextBuilder");
const scriptService = require("./scriptService");
const ai = require("./ai");
const { intro } = require("./promptTemplates");
const { getFallbackScript } = require("./fallbackScripts");
const buildLiveSnapshot = require("./liveSnapshot");
const { emitLiveUpdate } = require("../realtime");

const pendingArrivals = new Map();

async function loadSpeaker(speakerId, db = prisma) {
  const speaker = await db.speaker.findUnique({
    where: { id: speakerId },
    include: { event: { include: { liveState: true } }, agendaItems: { orderBy: { orderIndex: "asc" } } },
  });
  if (!speaker) throw ApiError.notFound("Speaker not found");
  if (speaker.event.liveState?.runState !== RUN_STATE.LIVE) {
    throw ApiError.badRequest("Event must be live and not paused to mark a speaker arrived");
  }
  return speaker;
}

function selectItem(speaker) {
  return speaker.agendaItems.find((item) => item.status === AGENDA_STATUS.DELAYED)
    || speaker.agendaItems.find((item) => item.status === AGENDA_STATUS.UPCOMING)
    || speaker.agendaItems.find((item) => item.id === speaker.event.liveState.currentAgendaItemId)
    || speaker.agendaItems[0] || null;
}

async function previousArrival(speaker, prefix, db = prisma) {
  if (speaker.arrivalStatus !== ARRIVAL_STATUS.ARRIVED) return null;
  const script = db === prisma
    ? (await scriptService.listScripts(speaker.eventId, { type: SCRIPT_TYPE.INTRO })).find((entry) => entry.id.startsWith(prefix))
    : await db.script.findFirst({
    where: { eventId: speaker.eventId, type: SCRIPT_TYPE.INTRO, id: { startsWith: prefix } },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
  });
  if (!script) return null;
  const newDelay = speaker.agendaItems.some((item) => item.status === AGENDA_STATUS.DELAYED && item.updatedAt > script.createdAt);
  return newDelay ? null : script;
}

async function arrive(speakerId) {
  // 1. Validate that the speaker belongs to an actively running event.
  const speaker = await loadSpeaker(speakerId);
  const eventId = speaker.eventId;
  const state = speaker.event.liveState;

  // 2. Prefer the earliest delayed slot, then the earliest upcoming slot.
  const item = selectItem(speaker);
  // Script has no speaker/source columns; this ID prefix makes retries durable across restarts.
  const prefix = `arrival:${encodeURIComponent(speakerId)}:`;
  let script = await previousArrival(speaker, prefix);
  if (!script) {
    // 3. Build the shared context; unassigned speakers still get their own bio, not the current speaker's.
    const delayMinutes = item?.status === AGENDA_STATUS.DELAYED ? Math.max(0, item.offsetMinutes) : 0;
    const context = await buildEventContext({ eventId, agendaItemId: item?.id, extra: { delayMinutes } });
    context.speaker = { name: speaker.name, role: speaker.role, organization: speaker.organization, bio: speaker.bio };
    if (!item) context.current = null;

    // 4. Reuse the same provider/fallback helpers without generateAndStore's premature insert.
    let content;
    let source = "ai";
    try {
      content = await ai.generate({ ...intro(context), timeoutMs: config.aiTimeoutMs });
      if (typeof content !== "string" || !content.trim()) throw new Error("Empty intro");
    } catch {
      content = getFallbackScript(SCRIPT_TYPE.INTRO, context);
      source = "fallback";
    }

    // 5. Atomically mark arrival, clear only the selected delayed flag, and save the intro.
    script = await prisma.$transaction(async (tx) => {
      const freshSpeaker = await loadSpeaker(speakerId, tx);
      const existing = await previousArrival(freshSpeaker, prefix, tx);
      if (existing) return existing;
      const freshItem = selectItem(freshSpeaker);
      if (freshItem?.id !== item?.id || freshSpeaker.updatedAt.getTime() !== speaker.updatedAt.getTime() ||
          (item && freshItem.updatedAt.getTime() !== item.updatedAt.getTime())) {
        throw ApiError.conflict("Speaker or agenda changed during arrival; refresh and try again");
      }
      if (freshItem?.status === AGENDA_STATUS.DELAYED) {
        await tx.agendaItem.update({ where: { id: freshItem.id }, data: {
          status: freshItem.id === state.currentAgendaItemId ? AGENDA_STATUS.CURRENT : AGENDA_STATUS.UPCOMING,
        } });
      }
      const otherDelays = await tx.agendaItem.count({ where: { eventId, status: AGENDA_STATUS.DELAYED } });
      const scheduleStatus = item?.status === AGENDA_STATUS.DELAYED && otherDelays === 0
        ? SCHEDULE_STATUS.ON_TIME : state.scheduleStatus;
      const changed = await tx.liveEventState.updateMany({
        where: { eventId, runState: RUN_STATE.LIVE, updatedAt: state.updatedAt },
        data: { scheduleStatus },
      });
      if (changed.count !== 1) throw ApiError.conflict("Live state changed during arrival; refresh and try again");
      await tx.speaker.update({ where: { id: speakerId }, data: { arrivalStatus: ARRIVAL_STATUS.ARRIVED } });
      return tx.script.create({ data: {
        id: `${prefix}${source}:${randomUUID()}`,
        eventId, agendaItemId: item?.id ?? null, type: SCRIPT_TYPE.INTRO,
        variant: SCRIPT_VARIANT.LIVE, content,
      } });
    });
  }

  // 6. Serialize and broadcast committed state; offsets and countdown clocks were never written.
  const liveState = await buildLiveSnapshot(eventId);
  emitLiveUpdate(eventId, liveState);
  return {
    speaker: { id: speakerId, name: speaker.name, arrivalStatus: ARRIVAL_STATUS.ARRIVED },
    script: { id: script.id, type: script.type, content: script.content, source: script.id.startsWith(`${prefix}fallback:`) ? "fallback" : "ai" },
    liveState,
  };
}

function speakerArrived({ speakerId }) {
  speakerId = validate.requireString(speakerId, "speakerId");
  // Concurrent duplicate clicks share the same generation instead of spending quota twice.
  if (pendingArrivals.has(speakerId)) return pendingArrivals.get(speakerId);
  const pending = arrive(speakerId).finally(() => pendingArrivals.delete(speakerId));
  pendingArrivals.set(speakerId, pending);
  return pending;
}

module.exports = { speakerArrived };
