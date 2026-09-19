async function generate({ system, user, timeoutMs }) {
  const { type, context } = JSON.parse(user);
  const speaker = context.speaker;
  return `MOCK PLACEHOLDER: ${type} for ${context.event.name}. ` +
    `Tone: ${context.event.tone}. Current segment: ${context.current?.title || "the event"}. ` +
    (speaker ? `${speaker.name}, ${speaker.role} at ${speaker.organization}. ${speaker.bio} ` : "") +
    `Next: ${context.next[0]?.title || "the end of the program"}. Delay: ${context.timing.delayMinutes} minutes. ` +
    (context.extra.announcementText ? `Announcement: ${context.extra.announcementText}. ` : "") +
    "This is deterministic development text, not an AI-generated script.";
}

module.exports = { generate };
