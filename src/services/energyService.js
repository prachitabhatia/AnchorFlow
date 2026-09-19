const prisma = require("../db");
const ApiError = require("../utils/ApiError");
const { requireString, requireInt } = require("../utils/validate");
const { ENERGY_THRESHOLDS, RUN_STATE, SCRIPT_TYPE, ANNOUNCEMENT_SOURCE } = require("../constants");
const scriptService = require("./scriptService");
const buildLiveSnapshot = require("./liveSnapshot");
const { emitLiveUpdate } = require("../realtime");

const lastTrigger = new Map();
const pendingTriggers = new Set();

async function requireEvent(eventId) {
  const event = await prisma.event.findUnique({ where: { id: eventId }, include: { liveState: true } });
  if (!event) throw ApiError.notFound("Event not found");
  return event;
}

async function rollingEnergy(eventId) {
  const now = new Date();
  const result = await prisma.energyPing.aggregate({
    where: { eventId, createdAt: { gte: new Date(now.getTime() - ENERGY_THRESHOLDS.WINDOW_MS), lte: now } },
    _avg: { value: true }, _count: { _all: true },
  });
  const sampleCount = result._count._all;
  const average = Math.round((result._avg.value ?? 0) * 10) / 10;
  return {
    average, sampleCount,
    level: !sampleCount ? "ok" : average < ENERGY_THRESHOLDS.LOW ? "low" : average > ENERGY_THRESHOLDS.HIGH ? "high" : "ok",
  };
}

async function getEnergy(eventId) {
  eventId = requireString(eventId, "eventId");
  await requireEvent(eventId);
  return rollingEnergy(eventId);
}

async function recordEnergy(eventId, value) {
  eventId = requireString(eventId, "eventId");
  value = requireInt(value, "value", { min: 1, max: 3 });
  await requireEvent(eventId);
  await prisma.energyPing.create({ data: { eventId, value } });
  const energy = await rollingEnergy(eventId);
  const event = await requireEvent(eventId);
  const now = Date.now();
  if (energy.average >= ENERGY_THRESHOLDS.LOW || energy.sampleCount < ENERGY_THRESHOLDS.MIN_SAMPLES ||
      event.liveState?.runState !== RUN_STATE.LIVE || pendingTriggers.has(eventId) ||
      now - (lastTrigger.get(eventId) ?? -Infinity) < ENERGY_THRESHOLDS.COOLDOWN_MS) {
    return { ...energy, triggered: false };
  }
  // Reserve synchronously before awaiting AI so simultaneous audience taps cannot duplicate it.
  pendingTriggers.add(eventId);
  try {
    const { script } = await scriptService.generateAndStore({
      eventId, type: SCRIPT_TYPE.ANNOUNCEMENT,
      extra: { energyLevel: "low", announcementText: "Let us bring the energy back! Turn to someone nearby and share one idea from today that excited you." },
    });
    // Existing templates produce longer scripts; keep at most two complete sentences (45 words).
    const sentences = script.content.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [];
    let content = "";
    for (const sentence of sentences.slice(0, 2)) {
      const next = `${content} ${sentence.trim()}`.trim();
      if (next.split(/\s+/).length > 45) break;
      content = next;
    }
    if (!content) content = "Let us bring the energy back! Share one idea from today with someone nearby.";
    // Do not interrupt an event that paused or ended while generation was running.
    if ((await requireEvent(eventId)).liveState?.runState !== RUN_STATE.LIVE) return { ...energy, triggered: false };
    await prisma.$transaction(async (tx) => {
      await tx.script.update({ where: { id: script.id }, data: { content } });
      await tx.announcement.create({ data: {
        eventId, source: ANNOUNCEMENT_SOURCE.VIBE_METER,
        message: "Audience energy is low; re-engagement prompted.", generatedScriptId: script.id,
      } });
    });
    lastTrigger.set(eventId, Date.now());
    const snapshot = await buildLiveSnapshot(eventId);
    snapshot.current.script = { id: script.id, type: script.type, content };
    emitLiveUpdate(eventId, snapshot);
    return { ...energy, triggered: true };
  } finally {
    pendingTriggers.delete(eventId);
  }
}

module.exports = { getEnergy, recordEnergy };
