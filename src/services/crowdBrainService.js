const prisma = require("../db");
const ApiError = require("../utils/ApiError");
const validate = require("../utils/validate");
const { CROWD_REACTION } = require("../constants");

async function listSegmentOptions(eventId) {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: {
      agendaItems: { select: { id: true, title: true }, orderBy: { orderIndex: "asc" } },
      liveState: { select: { currentAgendaItemId: true } },
    },
  });
  if (!event) throw ApiError.notFound("Event not found");
  return {
    segments: event.agendaItems,
    currentAgendaItemId: event.liveState?.currentAgendaItemId ?? null,
  };
}

async function submitFeedback(eventId, { agendaItemId, reaction }) {
  reaction = validate.requireOneOf(reaction, "reaction", CROWD_REACTION);
  agendaItemId = validate.requireString(agendaItemId, "agendaItemId");
  const item = await prisma.agendaItem.findUnique({ where: { id: agendaItemId } });
  if (!item || item.eventId !== eventId) {
    throw ApiError.badRequest("agendaItemId must belong to this event", { field: "agendaItemId" });
  }
  return prisma.crowdBrainResponse.create({
    data: { eventId, agendaItemId, reaction },
    select: { id: true, createdAt: true },
  });
}

async function getAggregate(eventId, agendaItemId) {
  agendaItemId = validate.requireString(agendaItemId, "agendaItemId");
  const item = await prisma.agendaItem.findUnique({ where: { id: agendaItemId } });
  if (!item) throw ApiError.notFound("Agenda item not found");
  if (item.eventId !== eventId) {
    throw ApiError.badRequest("agendaItemId must belong to this event", { field: "agendaItemId" });
  }
  const groups = await prisma.crowdBrainResponse.groupBy({
    by: ["reaction"], where: { eventId, agendaItemId }, _count: { _all: true },
  });
  const counts = Object.fromEntries(Object.values(CROWD_REACTION).map((reaction) => [reaction, 0]));
  let totalResponses = 0;
  for (const group of groups) {
    counts[group.reaction] = group._count._all;
    totalResponses += group._count._all;
  }
  const percentages = Object.fromEntries(Object.values(CROWD_REACTION).map((reaction) => [
    reaction, totalResponses === 0 ? 0 : Math.round((counts[reaction] / totalResponses) * 100),
  ]));
  const aggregate = { agendaItemId, segmentTitle: item.title, totalResponses, counts, percentages };
  const { maybeRecomputeInsight } = require("./crowdBrainInsightService");
  const crowdBrain = await maybeRecomputeInsight(eventId, agendaItemId, aggregate);
  return { ...aggregate, crowdBrain };
}

module.exports = { listSegmentOptions, submitFeedback, getAggregate };
