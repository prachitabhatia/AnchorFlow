const prisma = require("../db");
const ApiError = require("../utils/ApiError");

async function createEvent(data) {
  return prisma.event.create({ data });
}

async function listEvents() {
  return prisma.event.findMany({ orderBy: { createdAt: "desc" } });
}

async function getEvent(id) {
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      speakers: true,
      agendaItems: { orderBy: { orderIndex: "asc" } },
    },
  });
  if (!event) throw ApiError.notFound("Event not found");
  return event;
}

async function updateEvent(id, data) {
  try {
    return await prisma.event.update({ where: { id }, data });
  } catch (error) {
    if (error.code === "P2025") throw ApiError.notFound("Event not found");
    throw error;
  }
}

async function deleteEvent(id) {
  try {
    await prisma.event.delete({ where: { id } });
  } catch (error) {
    if (error.code === "P2025") throw ApiError.notFound("Event not found");
    throw error;
  }
}

module.exports = { createEvent, listEvents, getEvent, updateEvent, deleteEvent };
