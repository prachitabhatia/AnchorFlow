const config = require("../../config");

async function generate({ system, user, timeoutMs }) {
  if (!config.aiApiKey) throw new Error("OpenAI API key is not configured");
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  let failure = "OpenAI request failed";
  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST", signal: controller.signal,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${config.aiApiKey}` },
      body: JSON.stringify({ model: config.aiModel || "gpt-4.1-mini", instructions: system, input: user, store: false }),
    });
    if (!response.ok) {
      failure = `OpenAI request failed (HTTP ${response.status})`;
      throw new Error(failure);
    }
    const data = await response.json();
    const content = data.output?.filter((item) => item.type === "message")
      .flatMap((item) => item.content || []).filter((part) => part.type === "output_text")
      .map((part) => part.text).join("\n").trim();
    if (data.status !== "completed" || !content) {
      failure = "OpenAI returned no complete text";
      throw new Error(failure);
    }
    return content;
  } catch {
    // Never expose the provider's response body, request headers, or raw error.
    throw new Error(controller.signal.aborted ? "OpenAI request timed out" : failure);
  } finally {
    clearTimeout(timer);
  }
}

module.exports = { generate };
