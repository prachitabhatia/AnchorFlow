const prisma = require("../db");
const ApiError = require("../utils/ApiError");

function withEffectiveTimes(item) {
  const effectiveStart = new Date(item.plannedStart.getTime() + item.offsetMinutes * 60000);
  const effectiveEnd = new Date(effectiveStart.getTime() + item.durationMinutes * 60000);
  return { ...item, effectiveStart, effectiveEnd };
}

async function requireEvent(eventId, tx) {
  const event = await tx.event.findUnique({ where: { id: eventId } });
  if (!event) throw ApiError.notFound("Event not found");
}

async function checkSpeaker(speakerId, eventId, tx) {
  if (speakerId === undefined || speakerId === null) return;
  const speaker = await tx.speaker.findUnique({ where: { id: speakerId } });
  if (!speaker || speaker.eventId !== eventId) {
    throw ApiError.badRequest("speakerId must belong to this event", { field: "speakerId" });
  }
}

async function reindex(eventId, tx) {
  // Preserve the current order and close gaps using the caller's transaction.
  const items = await tx.agendaItem.findMany({ where: { eventId }, orderBy: { orderIndex: "asc" } });
  for (let index = 0; index < items.length; index++) {
    if (items[index].orderIndex !== index) {
      items[index] = await tx.agendaItem.update({ where: { id: items[index].id }, data: { orderIndex: index } });
    }
  }
  return items;
}

async function createAgendaItem(eventId, data) {
  return prisma.$transaction(async (tx) => {
    await requireEvent(eventId, tx);
    await checkSpeaker(data.speakerId, eventId, tx);
    const orderIndex = await tx.agendaItem.count({ where: { eventId } });
    const item = await tx.agendaItem.create({ data: { ...data, eventId, orderIndex, offsetMinutes: 0 } });
    const items = await reindex(eventId, tx);
    return withEffectiveTimes(items.find((entry) => entry.id === item.id));
  });
}

async function listAgendaItems(eventId) {
  await requireEvent(eventId, prisma);
  const items = await prisma.agendaItem.findMany({ where: { eventId }, orderBy: { orderIndex: "asc" } });
  return items.map(withEffectiveTimes);
}

async function updateAgendaItem(id, data) {
  return prisma.$transaction(async (tx) => {
    const item = await tx.agendaItem.findUnique({ where: { id } });
    if (!item) throw ApiError.notFound("Agenda item not found");
    await checkSpeaker(data.speakerId, item.eventId, tx);
    return withEffectiveTimes(await tx.agendaItem.update({ where: { id }, data }));
  });
}

async function reorderAgenda(eventId, orderedIds) {
  return prisma.$transaction(async (tx) => {
    await requireEvent(eventId, tx);
    const items = await tx.agendaItem.findMany({ where: { eventId }, select: { id: true } });
    const existingIds = new Set(items.map((item) => item.id));
    if (orderedIds.length !== items.length || new Set(orderedIds).size !== orderedIds.length ||
        orderedIds.some((id) => !existingIds.has(id))) {
      throw ApiError.badRequest("orderedIds must contain every agenda item ID for this event exactly once, with no missing, extra, or duplicate IDs", { field: "orderedIds" });
    }
    for (let index = 0; index < orderedIds.length; index++) {
      await tx.agendaItem.update({ where: { id: orderedIds[index] }, data: { orderIndex: index } });
    }
    return (await reindex(eventId, tx)).map(withEffectiveTimes);
  });
}

async function deleteAgendaItem(id) {
  await prisma.$transaction(async (tx) => {
    const item = await tx.agendaItem.findUnique({ where: { id } });
    if (!item) throw ApiError.notFound("Agenda item not found");
    await tx.agendaItem.delete({ where: { id } });
    await reindex(item.eventId, tx);
  });
}

module.exports = { createAgendaItem, listAgendaItems, updateAgendaItem, reorderAgenda, deleteAgendaItem };
