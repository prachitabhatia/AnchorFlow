const prisma = require("../db");
const ApiError = require("../utils/ApiError");
const { requireString } = require("../utils/validate");
const { SCRIPT_TYPE, SCRIPT_VARIANT } = require("../constants");
const scriptService = require("./scriptService");

async function loadEvent(eventId) {
  eventId = requireString(eventId, "eventId");
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      agendaItems: { orderBy: { orderIndex: "asc" }, take: 30 },
      _count: { select: { agendaItems: true } },
    },
  });
  if (!event) throw ApiError.notFound("Event not found");
  return event;
}

async function runBatch(event, jobs, variant) {
  const results = [];
  // Four requests per chunk keep provider load bounded while allowing parallel work.
  for (let start = 0; start < jobs.length; start += 4) {
    const chunk = await Promise.all(jobs.slice(start, start + 4).map(async (job) => {
      const result = { agendaItemId: job.agendaItemId ?? null, type: job.type };
      if (job.kind) result.kind = job.kind;
      try {
        const { script, source } = await scriptService.generateAndStore({
          eventId: event.id, agendaItemId: job.agendaItemId,
          type: job.type, extra: job.extra, variant,
        });
        // Cached sub-kinds use a first-line prefix; fallback lookup removes it before speaking.
        if (job.kind) await scriptService.updateScript(script.id, `[contingency:${job.kind}]\n${script.content}`);
        return { ...result, ok: true, source };
      } catch {
        // Keep failures isolated and never expose provider messages or credentials.
        return { ...result, ok: false, source: null };
      }
    }));
    results.push(...chunk);
  }
  const generated = results.filter((result) => result.ok).length;
  return {
    generated, failed: results.length - generated, results,
    ...(event._count.agendaItems > 30 ? {
      truncated: true, processedAgendaItems: 30, totalAgendaItems: event._count.agendaItems,
    } : {}),
  };
}

async function generateAllScripts(eventId) {
  const event = await loadEvent(eventId);
  const items = event.agendaItems;
  const jobs = [{ type: SCRIPT_TYPE.OPENING, agendaItemId: items[0]?.id }];
  for (const [index, item] of items.entries()) {
    if (item.speakerId || !item.isBuffer) jobs.push({
      agendaItemId: item.id, type: item.speakerId ? SCRIPT_TYPE.INTRO : SCRIPT_TYPE.ACTIVITY_INTRO,
    });
    // Transition context connects the preceding item to this destination item.
    if (index > 0) jobs.push({ agendaItemId: item.id, type: SCRIPT_TYPE.TRANSITION });
  }
  jobs.push({ type: SCRIPT_TYPE.CLOSING, agendaItemId: items.at(-1)?.id });
  return runBatch(event, jobs, SCRIPT_VARIANT.LIVE);
}

async function pregenerateContingency(eventId) {
  const event = await loadEvent(eventId);
  const jobs = [];
  for (const item of event.agendaItems.filter((item) => !item.isBuffer)) {
    for (const delayMinutes of [5, 15]) jobs.push({
      agendaItemId: item.id, type: SCRIPT_TYPE.FILLER,
      kind: `filler_${delayMinutes}`, extra: { delayMinutes },
    });
    jobs.push({
      agendaItemId: item.id, type: SCRIPT_TYPE.ANNOUNCEMENT, kind: "speaker_cancelled",
      extra: { announcementText: `The scheduled speaker for ${item.title} is unable to join us. The organizers will share the next program update shortly.` },
    }, {
      agendaItemId: item.id, type: SCRIPT_TYPE.ANNOUNCEMENT, kind: "technical_difficulty",
      extra: { announcementText: `There is a technical difficulty affecting ${item.title}. Thank you for your patience while the team works on it.` },
    });
  }
  return runBatch(event, jobs, SCRIPT_VARIANT.CACHED);
}

module.exports = { generateAllScripts, pregenerateContingency };
