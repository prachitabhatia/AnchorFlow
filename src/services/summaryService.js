const prisma = require("../db");
const ApiError = require("../utils/ApiError");
const { requireString } = require("../utils/validate");
const { AGENDA_STATUS, ANNOUNCEMENT_SOURCE } = require("../constants");
const { withEffectiveTimes } = require("./agendaService");

async function getSummary(eventId) {
  eventId = requireString(eventId, "eventId");
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { agendaItems: true, liveState: true, scripts: true, announcements: true },
  });
  if (!event) throw ApiError.notFound("Event not found");
  const items = event.agendaItems;
  const completed = items.filter((item) => item.status === AGENDA_STATUS.DONE);
  const delays = event.announcements.filter((row) => row.source === ANNOUNCEMENT_SOURCE.ORGANIZER_DELAY);
  const scripts = new Map(event.scripts.map((script) => [script.id, script]));
  // Delay-to-script links preserve the target after arrival/advance clears its delayed flag.
  const delayedIds = new Set(delays
    .filter((row) => !row.message.endsWith("This item is already done; schedule timings are unchanged."))
    .map((row) => scripts.get(row.generatedScriptId)?.agendaItemId).filter(Boolean));
  const onTime = completed.filter((item) => !delayedIds.has(item.id)).length;
  let plannedDurationMinutes = 0;
  let actualDurationMinutes = 0;
  if (items.length) {
    const firstStart = Math.min(...items.map((item) => item.plannedStart.getTime()));
    const plannedEnd = Math.max(...items.map((item) => item.plannedStart.getTime() + item.durationMinutes * 60000));
    const effectiveEnd = Math.max(...items.map((item) => withEffectiveTimes(item).effectiveEnd.getTime()));
    // These are agenda-span estimates: original durations and actual event timestamps are not stored.
    plannedDurationMinutes = Math.max(0, (plannedEnd - firstStart) / 60000);
    actualDurationMinutes = Math.max(0, (effectiveEnd - firstStart) / 60000);
  }
  return {
    itemsTotal: items.length, itemsCompleted: completed.length,
    delaysHandled: delays.length, totalDelayMinutes: event.liveState?.delayOffsetMinutes ?? 0,
    scriptsGenerated: event.scripts.length,
    onTimePercent: completed.length ? Math.round(onTime / completed.length * 100) : 0,
    plannedDurationMinutes, actualDurationMinutes,
  };
}

module.exports = { getSummary };
