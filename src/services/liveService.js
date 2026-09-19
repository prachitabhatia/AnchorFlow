const prisma = require("../db");
const ApiError = require("../utils/ApiError");
const { EVENT_STATUS, RUN_STATE, SCHEDULE_STATUS, AGENDA_STATUS, DELAY_STRATEGY, SCRIPT_TYPE } = require("../constants");
const { recalculateSchedule } = require("./scheduleEngine");
const scriptService = require("./scriptService");
const buildLiveSnapshot = require("./liveSnapshot");
const { emitLiveUpdate } = require("../realtime");

async function loadEvent(eventId, tx) {
  const event = await tx.event.findUnique({
    where: { id: eventId },
    include: { liveState: true, agendaItems: { orderBy: { orderIndex: "asc" } } },
  });
  if (!event) throw ApiError.notFound("Event not found");
  return event;
}

function requireLive(event) {
  if (!event.liveState || event.liveState.runState === RUN_STATE.ENDED ||
      ![EVENT_STATUS.LIVE, EVENT_STATUS.PAUSED].includes(event.status)) {
    throw ApiError.badRequest("Event is not live; go live before using this control");
  }
}

function itemClock(item, now) {
  return {
    currentItemStartedAt: item ? now : null,
    currentItemEndsAt: item ? new Date(now.getTime() + item.durationMinutes * 60000) : null,
  };
}

async function finishEvent(eventId, tx) {
  await tx.agendaItem.updateMany({ where: { eventId }, data: { status: AGENDA_STATUS.DONE } });
  await tx.event.update({ where: { id: eventId }, data: { status: EVENT_STATUS.ENDED } });
  await tx.liveEventState.update({ where: { eventId }, data: {
    runState: RUN_STATE.ENDED, currentAgendaItemId: null, nextAgendaItemId: null,
    currentItemStartedAt: null, currentItemEndsAt: null, pausedAt: null,
  } });
}

async function goLive(eventId) {
  const opening = await prisma.$transaction(async (tx) => {
    const event = await loadEvent(eventId, tx);
    const first = event.agendaItems[0];
    if (!first) throw ApiError.badRequest("Cannot go live without agenda items");
    // Repeated go-live preserves the active position and clock instead of restarting it.
    if (!event.liveState || event.liveState.runState === RUN_STATE.ENDED) {
      const now = new Date();
      await tx.agendaItem.updateMany({ where: { eventId }, data: { status: AGENDA_STATUS.UPCOMING, offsetMinutes: 0 } });
      await tx.agendaItem.update({ where: { id: first.id }, data: { status: AGENDA_STATUS.CURRENT } });
      const state = {
        runState: RUN_STATE.LIVE, scheduleStatus: SCHEDULE_STATUS.ON_TIME, delayOffsetMinutes: 0,
        currentAgendaItemId: first.id, nextAgendaItemId: event.agendaItems[1]?.id ?? null,
        ...itemClock(first, now), pausedAt: null,
      };
      await tx.liveEventState.upsert({ where: { eventId }, create: { eventId, ...state }, update: state });
      await tx.event.update({ where: { id: eventId }, data: { status: EVENT_STATUS.LIVE } });
    }
    const existing = await tx.script.findFirst({ where: { eventId, agendaItemId: first.id, type: SCRIPT_TYPE.OPENING } });
    return { agendaItemId: first.id, exists: Boolean(existing) };
  });
  // The existing script service performs AI and its script insert outside lifecycle transactions.
  if (!opening.exists) await scriptService.generateAndStore({ eventId, type: SCRIPT_TYPE.OPENING, agendaItemId: opening.agendaItemId });
  const snapshot = await buildLiveSnapshot(eventId);
  emitLiveUpdate(eventId, snapshot);
  return snapshot;
}

async function advance(eventId) {
  await prisma.$transaction(async (tx) => {
    const event = await loadEvent(eventId, tx);
    requireLive(event);
    if (event.liveState.runState === RUN_STATE.PAUSED) throw ApiError.badRequest("Resume the event before advancing");
    const now = new Date();
    const completedItemIds = event.agendaItems.filter((item) => item.status === AGENDA_STATUS.DONE).map((item) => item.id);
    if (event.liveState.currentAgendaItemId) completedItemIds.push(event.liveState.currentAgendaItemId);
    const schedule = recalculateSchedule({
      items: event.agendaItems, delayedItemId: null, delayMinutes: 0,
      strategy: DELAY_STRATEGY.ABSORB_VIA_BUFFER, completedItemIds, now,
    });
    for (const item of schedule.items) {
      await tx.agendaItem.update({ where: { id: item.id }, data: {
        status: item.status, durationMinutes: item.durationMinutes, offsetMinutes: item.offsetMinutes,
      } });
    }
    if (!schedule.currentItemId) return finishEvent(eventId, tx);
    const current = schedule.items.find((item) => item.id === schedule.currentItemId);
    await tx.liveEventState.update({ where: { eventId }, data: {
      currentAgendaItemId: schedule.currentItemId, nextAgendaItemId: schedule.nextItemId,
      ...itemClock(current, now), scheduleStatus: SCHEDULE_STATUS.ON_TIME, delayOffsetMinutes: 0,
    } });
  });
  const snapshot = await buildLiveSnapshot(eventId);
  emitLiveUpdate(eventId, snapshot);
  return snapshot;
}

async function pause(eventId) {
  await prisma.$transaction(async (tx) => {
    const event = await loadEvent(eventId, tx);
    requireLive(event);
    if (event.liveState.runState === RUN_STATE.PAUSED) return;
    await tx.liveEventState.update({ where: { eventId }, data: { runState: RUN_STATE.PAUSED, pausedAt: new Date() } });
    await tx.event.update({ where: { id: eventId }, data: { status: EVENT_STATUS.PAUSED } });
  });
  const snapshot = await buildLiveSnapshot(eventId);
  emitLiveUpdate(eventId, snapshot);
  return snapshot;
}

async function resume(eventId) {
  await prisma.$transaction(async (tx) => {
    const event = await loadEvent(eventId, tx);
    requireLive(event);
    const state = event.liveState;
    if (state.runState === RUN_STATE.LIVE) return;
    const pausedMs = state.pausedAt ? Math.max(0, Date.now() - state.pausedAt.getTime()) : 0;
    const currentItemEndsAt = state.currentItemEndsAt ? new Date(state.currentItemEndsAt.getTime() + pausedMs) : null;
    await tx.liveEventState.update({ where: { eventId }, data: { runState: RUN_STATE.LIVE, currentItemEndsAt, pausedAt: null } });
    await tx.event.update({ where: { id: eventId }, data: { status: EVENT_STATUS.LIVE } });
  });
  const snapshot = await buildLiveSnapshot(eventId);
  emitLiveUpdate(eventId, snapshot);
  return snapshot;
}

async function endEvent(eventId) {
  const agendaItemId = await prisma.$transaction(async (tx) => {
    const event = await loadEvent(eventId, tx);
    requireLive(event);
    const currentId = event.liveState.currentAgendaItemId;
    await finishEvent(eventId, tx);
    return event.agendaItems.find((item) => item.id === currentId)?.id;
  });
  const { script: closingScript } = await scriptService.generateAndStore({ eventId, type: SCRIPT_TYPE.CLOSING, agendaItemId });
  const snapshot = await buildLiveSnapshot(eventId);
  emitLiveUpdate(eventId, snapshot);
  return { snapshot, closingScript };
}

module.exports = { goLive, advance, pause, resume, endEvent };
