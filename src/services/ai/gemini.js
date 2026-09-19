const config = require("../../config");

async function generate({ system, user, timeoutMs }) {
  if (!config.aiApiKey) throw new Error("Gemini API key is not configured");
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  let failure = "Gemini request failed";
  try {
    const model = encodeURIComponent(config.aiModel || "gemini-2.5-flash");
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: "POST", signal: controller.signal,
      headers: { "Content-Type": "application/json", "x-goog-api-key": config.aiApiKey },
      body: JSON.stringify({ systemInstruction: { parts: [{ text: system }] }, contents: [{ role: "user", parts: [{ text: user }] }] }),
    });
    if (!response.ok) {
      failure = `Gemini request failed (HTTP ${response.status})`;
      throw new Error(failure);
    }
    const data = await response.json();
    const candidate = data.candidates?.[0];
    const content = candidate?.content?.parts?.filter((part) => !part.thought && typeof part.text === "string")
      .map((part) => part.text).join("\n").trim();
    if (candidate?.finishReason !== "STOP" || !content) {
      failure = "Gemini returned no complete text";
      throw new Error(failure);
    }
    return content;
  } catch {
    throw new Error(controller.signal.aborted ? "Gemini request timed out" : failure);
  } finally {
    clearTimeout(timer);
  }
}

module.exports = { generate };
