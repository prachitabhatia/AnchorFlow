function getFallbackScript(type, context) {
  const event = context.event.name;
  const next = context.next[0]?.title;
  const preview = next ? `Coming up next is ${next}.` : "Please stay with us for the next update from our organizers.";
  const current = context.current?.title || "our next segment";
  const speaker = context.speaker;
  const scripts = {
    opening: `Welcome to ${event}! Thank you for joining us and bringing your ideas and enthusiasm. Let us begin with ${current}. ${preview}`,
    intro: speaker
      ? `Please join me in welcoming ${speaker.name}, ${speaker.role} at ${speaker.organization}, to ${event}. We look forward to hearing their perspective during ${current}. Let us give them a warm welcome.`
      : `We are ready for ${current} at ${event}. Thank you for your attention as we move into this part of our program. ${preview}`,
    activity_intro: `It is time for ${current} at ${event}. Bring your curiosity and get ready to take part. Please listen for instructions from the organizers. ${preview}`,
    transition: `Thank you for being part of ${event}. We now turn our attention to ${current}. Let us carry that same curiosity into this next part of the program. ${preview}`,
    filler: `Thank you for your patience here at ${event}. ` +
      (context.timing.delayMinutes > 0 ? `We are working around a delay of about ${context.timing.delayMinutes} minutes. ` : "While we prepare the next part of the program, let us keep the conversation going. ") +
      `${preview} Here is a question for everyone: what is one idea from today that you would like to explore further? Take a moment to share it with someone beside you.`,
    announcement: `May I have your attention here at ${event}? ${context.extra.announcementText || "Please listen for the next update from our organizers."} Thank you for your attention. ${preview}`,
    closing: `As we bring ${event} to a close, thank you to our participants, speakers, and organizers for being part of the program. Keep asking questions, sharing ideas, and building on what you have learned. Thank you for joining us, and have a wonderful day.`,
  };
  return scripts[type];
}

module.exports = { getFallbackScript };
