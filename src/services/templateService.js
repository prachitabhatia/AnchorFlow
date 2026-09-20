const prisma = require("../db");
const ApiError = require("../utils/ApiError");
const validate = require("../utils/validate");
const { EVENT_TONE } = require("../constants");

async function createTemplateFromEvent(eventId, { name, description }) {
  return prisma.$transaction(async (tx) => {
    const event = await tx.event.findUnique({
      where: { id: eventId },
      include: { agendaItems: { orderBy: { orderIndex: "asc" } } },
    });
    if (!event) throw ApiError.notFound("Event not found");
    name = validate.requireString(name, "name");
    if (description !== undefined && description !== null) {
      description = validate.requireString(description, "description", { min: 0 });
    }
    return tx.eventTemplate.create({
      data: {
        name, description, type: event.type, tone: event.tone,
        // Copy reusable structure explicitly, leaving source rows and runtime fields untouched.
        agendaItems: { create: event.agendaItems.map((item) => ({
          title: item.title, type: item.type, durationMinutes: item.durationMinutes,
          isBuffer: item.isBuffer, orderIndex: item.orderIndex,
        })) },
      },
      include: { agendaItems: { orderBy: { orderIndex: "asc" } } },
    });
  });
}

async function listTemplates() {
  return prisma.eventTemplate.findMany({
    orderBy: { updatedAt: "desc" },
    select: {
      id: true, name: true, description: true, type: true, tone: true, updatedAt: true,
      _count: { select: { agendaItems: true } },
    },
  });
}

async function getTemplate(id) {
  const template = await prisma.eventTemplate.findUnique({
    where: { id }, include: { agendaItems: { orderBy: { orderIndex: "asc" } } },
  });
  if (!template) throw ApiError.notFound("Template not found");
  return template;
}

async function deleteTemplate(id) {
  try {
    await prisma.eventTemplate.delete({ where: { id } });
  } catch (error) {
    if (error.code === "P2025") throw ApiError.notFound("Template not found");
    throw error;
  }
}

// This function only reads EventTemplate/TemplateAgendaItem; it never creates, updates, or deletes template rows.
async function createEventFromTemplate(templateId, { name, date, tone, type, startTime }) {
  return prisma.$transaction(async (tx) => {
    const template = await tx.eventTemplate.findUnique({
      where: { id: templateId }, include: { agendaItems: { orderBy: { orderIndex: "asc" } } },
    });
    if (!template) throw ApiError.notFound("Template not found");
    name = validate.requireString(name, "name", { min: 2, max: 120 });
    const eventDate = validate.requireIsoDate(date, "date");
    tone = tone === undefined ? template.tone : validate.requireOneOf(tone, "tone", EVENT_TONE);
    type = type === undefined ? template.type : validate.requireString(type, "type", { min: 2, max: 40 });
    let plannedStart = eventDate;
    if (startTime !== undefined) {
      startTime = validate.requireString(startTime, "startTime");
      if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(startTime)) {
        throw ApiError.badRequest("startTime must be HH:mm (00:00 to 23:59)", { field: "startTime" });
      }
      // Override the clock in the input date's timezone; date-only inputs use UTC.
      const timezone = date.match(/(Z|[+-]\d{2}:\d{2})$/)?.[1] ?? "Z";
      plannedStart = validate.requireIsoDate(`${date.slice(0, 10)}T${startTime}:00${timezone}`, "startTime");
    }
    const event = await tx.event.create({ data: { name, date: eventDate, tone, type, sourceTemplateId: templateId } });
    for (const item of template.agendaItems) {
      await tx.agendaItem.create({ data: {
        eventId: event.id, title: item.title, type: item.type, durationMinutes: item.durationMinutes,
        isBuffer: item.isBuffer, orderIndex: item.orderIndex, speakerId: null, plannedStart,
      } });
      plannedStart = new Date(plannedStart.getTime() + item.durationMinutes * 60000);
    }
    return tx.event.findUnique({
      where: { id: event.id }, include: { speakers: true, agendaItems: { orderBy: { orderIndex: "asc" } } },
    });
  });
}

module.exports = { createTemplateFromEvent, listTemplates, getTemplate, deleteTemplate, createEventFromTemplate };
