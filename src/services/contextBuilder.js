const prisma = require("../db");
const ApiError = require("../utils/ApiError");
const { AGENDA_STATUS, SCHEDULE_STATUS } = require("../constants");
const { withEffectiveTimes } = require("./agendaService");

function itemSummary(item) {
  return item ? { id: item.id, title: item.title, type: item.type } : null;
}

async function buildEventContext({ eventId, agendaItemId, extra = {}, now = new Date() }) {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { speakers: true, agendaItems: { orderBy: { orderIndex: "asc" } }, liveState: true },
  });
  if (!event) throw ApiError.notFound("Event not found");

  const items = event.agendaItems;
  const live = event.liveState;
  // An explicit position wins; otherwise use live state, or the first item before going live.
  const currentId = agendaItemId === undefined
    ? (live ? live.currentAgendaItemId : items[0]?.id)
    : agendaItemId;
  const index = items.findIndex((item) => item.id === currentId);
  if (agendaItemId !== undefined && index === -1) throw ApiError.notFound("Agenda item not found in this event");
  const current = index === -1 ? null : withEffectiveTimes(items[index]);
  const speakers = new Map(event.speakers.map((speaker) => [speaker.id, speaker]));
  const speaker = current ? speakers.get(current.speakerId) : null;
  const downstream = index === -1 ? [] : items.slice(index + 1);
  // Only unfinished buffers strictly after the current item can absorb a future delay.
  const bufferMinutesAvailable = downstream
    .filter((item) => item.isBuffer && item.status !== AGENDA_STATUS.DONE)
    .reduce((minutes, item) => minutes + item.durationMinutes, 0);
  const itemsCompleted = items.filter((item) => item.status === AGENDA_STATUS.DONE).length;
  const delayMinutes = extra.delayMinutes ?? 0;

  return {
    event: { name: event.name, type: event.type, tone: event.tone, dateIso: event.date.toISOString() },
    current: current ? { ...itemSummary(current), durationMinutes: current.durationMinutes, isBuffer: current.isBuffer } : null,
    previous: index > 0 ? itemSummary(items[index - 1]) : null,
    next: downstream.slice(0, 2).map((item) => ({ ...itemSummary(item), speakerName: speakers.get(item.speakerId)?.name ?? null })),
    speaker: speaker ? { name: speaker.name, role: speaker.role, organization: speaker.organization, bio: speaker.bio } : null,
    timing: {
      minutesRemaining: current ? Math.max(0, (current.effectiveEnd.getTime() - now.getTime()) / 60000) : 0,
      delayMinutes,
      bufferMinutesAvailable,
      plannedStartIso: current ? current.plannedStart.toISOString() : null,
      effectiveStartIso: current ? current.effectiveStart.toISOString() : null,
    },
    schedule: {
      status: live?.scheduleStatus ?? SCHEDULE_STATUS.ON_TIME,
      delayOffsetMinutes: live?.delayOffsetMinutes ?? 0,
      itemsRemaining: items.length - itemsCompleted,
      itemsCompleted,
    },
    extra: {
      announcementText: extra.announcementText ?? null,
      energyLevel: extra.energyLevel ?? null,
      delayMinutes,
    },
  };
}

module.exports = buildEventContext;
