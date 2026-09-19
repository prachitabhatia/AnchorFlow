const prisma = require("../db");
const ApiError = require("../utils/ApiError");

async function createSpeaker(eventId, data) {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw ApiError.notFound("Event not found");
  return prisma.speaker.create({ data: { ...data, eventId } });
}

async function listSpeakers(eventId) {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw ApiError.notFound("Event not found");
  return prisma.speaker.findMany({
    where: { eventId },
    orderBy: { createdAt: "asc" },
  });
}

async function updateSpeaker(id, data) {
  try {
    return await prisma.speaker.update({ where: { id }, data });
  } catch (error) {
    if (error.code === "P2025") throw ApiError.notFound("Speaker not found");
    throw error;
  }
}

async function deleteSpeaker(id) {
  try {
    await prisma.speaker.delete({ where: { id } });
  } catch (error) {
    if (error.code === "P2025") throw ApiError.notFound("Speaker not found");
    throw error;
  }
}

module.exports = { createSpeaker, listSpeakers, updateSpeaker, deleteSpeaker };
