const config = require("../../config");
const providers = { mock: require("./mock"), openai: require("./openai"), gemini: require("./gemini") };

async function generate({ system, user, timeoutMs }) {
  const provider = providers[config.aiProvider];
  if (!Object.hasOwn(providers, config.aiProvider)) throw new Error("Unsupported AI provider");
  const content = await provider.generate({ system, user, timeoutMs });
  if (typeof content !== "string" || !content.trim()) throw new Error("AI provider returned no text");
  if (config.aiApiKey && content.includes(config.aiApiKey)) throw new Error("AI provider returned unsafe content");
  return content.trim();
}

module.exports = { generate };
