const dotenv = require("dotenv");

dotenv.config();

if (!process.env.ORGANIZER_PASSCODE) {
  throw new Error("ORGANIZER_PASSCODE is required. Set it in your .env file.");
}

const config = Object.freeze({
  port: Number(process.env.PORT) || 4000,
  organizerPasscode: process.env.ORGANIZER_PASSCODE,
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",
  aiProvider: process.env.AI_PROVIDER || "mock",
  aiApiKey: process.env.AI_API_KEY,
  aiModel: process.env.AI_MODEL,
  aiTimeoutMs: Number(process.env.AI_TIMEOUT_MS) || 6000,
});

module.exports = config;
