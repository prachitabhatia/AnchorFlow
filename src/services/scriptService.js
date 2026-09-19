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

async function getScriptWithFallback({ eventId, agendaItemId, type, extra = {} }, { generationFailed = false } = {}) {
  eventId = validate.requireString(eventId, "eventId");
  agendaItemId = validate.optionalString(agendaItemId, "agendaItemId");
  type = validate.requireOneOf(type, "type", SCRIPT_TYPE);
  extra = validateExtra(extra);
  // Delay reporting already made its one AI attempt; it uses only the remaining two steps.
  const generated = generationFailed ? null : await generateAndStore({ eventId, agendaItemId, type, extra });
  if (generated?.source === "ai") return generated;
  const context = await buildEventContext({ eventId, agendaItemId, extra });
  const cached = await prisma.script.findMany({
    where: { eventId, agendaItemId: context.current?.id ?? null, type, variant: SCRIPT_VARIANT.CACHED },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }], select: scriptFields,
  });
  // The two filler buckets are up to five minutes and longer waits (15-minute rehearsal).
  // Announcements match their documented sub-kind, never an unrelated cached announcement.
  let kind = type === SCRIPT_TYPE.FILLER ? `filler_${(extra.delayMinutes ?? 0) <= 5 ? 5 : 15}` : null;
  if (type === SCRIPT_TYPE.ANNOUNCEMENT) {
    if (/technical difficulty/i.test(extra.announcementText || "")) kind = "technical_difficulty";
    else if (/cancelled|unable to join/i.test(extra.announcementText || "")) kind = "speaker_cancelled";
  }
  const match = cached.find((script) => {
    const prefix = script.content.match(/^\[contingency:([^\]]+)\]\n/);
    return script.content.replace(/^\[contingency:[^\]]+\]\n/, "").trim() &&
      (prefix ? prefix[1] === kind : true);
  });
  if (match) {
    // generateAndStore persisted its local fallback; discard that unused row when cache wins.
    if (generated) await prisma.script.delete({ where: { id: generated.script.id } });
    return { script: { ...match, content: match.content.replace(/^\[contingency:[^\]]+\]\n/, "") }, source: "cached" };
  }
  return {
    script: generated?.script ?? {
      id: null, type, variant: SCRIPT_VARIANT.LIVE, agendaItemId: context.current?.id ?? null,
      content: getFallbackScript(type, context), createdAt: null,
    },
    source: "hardcoded",
  };
}

module.exports = { generateAndStore, listScripts, updateScript, getScriptWithFallback };
