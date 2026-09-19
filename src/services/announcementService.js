const prisma = require("../db");
const ApiError = require("../utils/ApiError");
const { requireString } = require("../utils/validate");
const { SCRIPT_TYPE, ANNOUNCEMENT_SOURCE } = require("../constants");
const scriptService = require("./scriptService");
const buildLiveSnapshot = require("./liveSnapshot");
const { emitLiveUpdate } = require("../realtime");

async function createAnnouncement(eventId, message) {
  eventId = requireString(eventId, "eventId");
  message = requireString(message, "message", { min: 3, max: 500 });
  // Check before generation so a missing live state cannot leave a half-finished request.
  await buildLiveSnapshot(eventId);
  const generated = await scriptService.generateAndStore({
    eventId, type: SCRIPT_TYPE.ANNOUNCEMENT, extra: { announcementText: message },
  });
  const content = generated.source === "fallback" || generated.script.content.trim() === message
    ? `Quick announcement, everyone: ${message}${/[.!?]$/.test(message) ? "" : "."} Thank you for your patience and attention.`
    : generated.script.content;
  const { announcement, script } = await prisma.$transaction(async (tx) => {
    const script = await tx.script.update({ where: { id: generated.script.id }, data: { content } });
    const announcement = await tx.announcement.create({ data: {
      eventId, source: ANNOUNCEMENT_SOURCE.ORGANIZER_MANUAL,
      message, generatedScriptId: script.id,
    } });
    return { announcement, script };
  });
  const liveState = await buildLiveSnapshot(eventId);
  // Deliver this one-off announcement instead of the builder's preferred intro/filler.
  liveState.current.script = { id: script.id, type: script.type, content: script.content };
  emitLiveUpdate(eventId, liveState);
  return { announcement, script, liveState };
}

async function listAnnouncements(eventId) {
  eventId = requireString(eventId, "eventId");
  if (!await prisma.event.findUnique({ where: { id: eventId } })) throw ApiError.notFound("Event not found");
  return prisma.announcement.findMany({
    where: { eventId }, orderBy: [{ createdAt: "desc" }, { id: "desc" }],
  });
}

module.exports = { createAnnouncement, listAnnouncements };
