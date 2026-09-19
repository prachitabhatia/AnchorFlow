const prisma = require("../db");
const config = require("../config");
const { SCRIPT_TYPE, SCRIPT_VARIANT } = require("../constants");
const validate = require("../utils/validate");
const ApiError = require("../utils/ApiError");
const buildEventContext = require("./contextBuilder");
const templates = require("./promptTemplates");
const ai = require("./ai");
const { getFallbackScript } = require("./fallbackScripts");

const scriptFields = { id: true, type: true, variant: true, content: true, agendaItemId: true, createdAt: true };

function validateExtra(extra) {
  if (!extra || typeof extra !== "object" || Array.isArray(extra)) throw ApiError.badRequest("extra must be an object");
  for (const field of Object.keys(extra)) {
    if (!["delayMinutes", "announcementText", "energyLevel"].includes(field)) throw ApiError.badRequest(`Unknown extra field: ${field}`);
  }
  return {
    delayMinutes: validate.optionalInt(extra.delayMinutes, "delayMinutes", { min: 0 }),
    announcementText: validate.optionalString(extra.announcementText, "announcementText"),
    energyLevel: validate.optionalString(extra.energyLevel, "energyLevel"),
  };
}

async function generateAndStore({ eventId, type, agendaItemId, extra = {}, variant = SCRIPT_VARIANT.LIVE }) {
  eventId = validate.requireString(eventId, "eventId");
  type = validate.requireOneOf(type, "type", SCRIPT_TYPE);
  variant = validate.requireOneOf(variant, "variant", SCRIPT_VARIANT);
  agendaItemId = validate.optionalString(agendaItemId, "agendaItemId");
  const context = await buildEventContext({ eventId, agendaItemId, extra: validateExtra(extra) });
  let content;
  let source = "ai";
  try {
    const prompt = templates[type](context);
    content = await ai.generate({ ...prompt, timeoutMs: config.aiTimeoutMs });
    if (typeof content !== "string" || !content.trim()) throw new Error("Empty script");
  } catch {
    // Provider errors never escape to the anchor or expose credentials in logs.
    content = getFallbackScript(type, context);
    source = "fallback";
  }
  const script = await prisma.script.create({
    data: { eventId, type, variant, content, agendaItemId: context.current?.id ?? null },
    select: scriptFields,
  });
  return { script, source };
}

async function listScripts(eventId, { type, agendaItemId } = {}) {
  eventId = validate.requireString(eventId, "eventId");
  type = validate.optionalOneOf(type, "type", SCRIPT_TYPE);
  agendaItemId = validate.optionalString(agendaItemId, "agendaItemId");
  if (!await prisma.event.findUnique({ where: { id: eventId } })) throw ApiError.notFound("Event not found");
  return prisma.script.findMany({ where: { eventId, type, agendaItemId }, orderBy: { createdAt: "desc" }, select: scriptFields });
}

async function updateScript(id, content) {
  content = validate.requireString(content, "content");
  try {
    return await prisma.script.update({ where: { id }, data: { content }, select: scriptFields });
  } catch (error) {
    if (error.code === "P2025") throw ApiError.notFound("Script not found");
    throw error;
  }
}

module.exports = { generateAndStore, listScripts, updateScript };
