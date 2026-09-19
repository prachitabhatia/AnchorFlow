const prisma = require("../db");
const ApiError = require("../utils/ApiError");
const { RUN_STATE, AGENDA_STATUS, SCRIPT_TYPE } = require("../constants");

async function buildLiveSnapshot(eventId) {
  const state = await prisma.liveEventState.findUnique({
    where: { eventId },
    include: { event: { include: {
      agendaItems: { include: { speaker: true } },
      scripts: { orderBy: [{ createdAt: "desc" }, { id: "desc" }] },
    } } },
  });
  if (!state) throw ApiError.notFound("Event has no live state");
  const now = new Date();
  const event = state.event;
  const current = event.agendaItems.find((item) => item.id === state.currentAgendaItemId);
  const next = event.agendaItems.find((item) => item.id === state.nextAgendaItemId);
  const scripts = current ? event.scripts.filter((script) => script.agendaItemId === current.id) : [];
  let preferredType = SCRIPT_TYPE.INTRO;
  if (current?.isBuffer || current?.status === AGENDA_STATUS.DELAYED) preferredType = SCRIPT_TYPE.FILLER;
  else if (current?.orderIndex === 0) preferredType = SCRIPT_TYPE.OPENING;
  const script = scripts.find((entry) => entry.type === preferredType) || scripts[0];

  // Project the paused deadline so polling preserves the same remaining interval.
  const pausedMs = state.runState === RUN_STATE.PAUSED && state.pausedAt
    ? Math.max(0, now.getTime() - state.pausedAt.getTime()) : 0;
  const endsAt = current && state.currentItemEndsAt
    ? new Date(state.currentItemEndsAt.getTime() + pausedMs).toISOString() : null;
  return {
    eventId: event.id, eventName: event.name, tone: event.tone,
    runState: state.runState, scheduleStatus: state.scheduleStatus,
    delayOffsetMinutes: state.delayOffsetMinutes,
    current: {
      item: current ? { id: current.id, title: current.title, type: current.type, isBuffer: current.isBuffer } : null,
      script: script ? { id: script.id, type: script.type, content: script.content } : null,
      startedAt: current ? state.currentItemStartedAt?.toISOString() ?? null : null,
      endsAt,
    },
    next: next ? { id: next.id, title: next.title, type: next.type, speakerName: next.speaker?.name ?? null } : null,
    updatedAt: state.updatedAt.toISOString(), serverTime: now.toISOString(),
  };
}

module.exports = buildLiveSnapshot;
