const express = require("express");
const speakerService = require("../services/speakerService");
const { ARRIVAL_STATUS } = require("../constants");
const validate = require("../utils/validate");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const requireOrganizer = require("../middleware/requireOrganizer");

const eventSpeakersRouter = express.Router({ mergeParams: true });
const speakersRouter = express.Router();
eventSpeakersRouter.use(requireOrganizer);
speakersRouter.use(requireOrganizer);

function requireBio(value) {
  try {
    return validate.requireString(value, "bio", { min: 20, max: 1500 });
  } catch (error) {
    if (error instanceof ApiError) {
      throw ApiError.badRequest(
        `${error.message}. AI introductions need real detail about the speaker's experience or achievements.`,
        error.details,
      );
    }
    throw error;
  }
}

eventSpeakersRouter.post("/", asyncHandler(async (req, res) => {
  const body = req.body;
  const data = {
    name: validate.requireString(body?.name, "name", { min: 2, max: 120 }),
    role: validate.requireString(body?.role, "role", { min: 2, max: 120 }),
    organization: validate.requireString(body?.organization, "organization", { min: 2, max: 160 }),
    bio: requireBio(body?.bio),
  };
  res.status(201).json(await speakerService.createSpeaker(req.params.eventId, data));
}));

eventSpeakersRouter.get("/", asyncHandler(async (req, res) => {
  res.json(await speakerService.listSpeakers(req.params.eventId));
}));

speakersRouter.patch("/:id", asyncHandler(async (req, res) => {
  const body = req.body;
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw ApiError.badRequest("Body must be a JSON object");
  }
  const allowedFields = ["name", "role", "organization", "bio", "arrivalStatus"];
  for (const field of Object.keys(body)) {
    if (!allowedFields.includes(field)) {
      throw ApiError.badRequest(`${field} cannot be updated`, { field });
    }
  }
  const data = {
    name: validate.optionalString(body.name, "name", { min: 2, max: 120 }),
    role: validate.optionalString(body.role, "role", { min: 2, max: 120 }),
    organization: validate.optionalString(body.organization, "organization", { min: 2, max: 160 }),
    bio: body.bio === undefined ? undefined : requireBio(body.bio),
    arrivalStatus: validate.optionalOneOf(body.arrivalStatus, "arrivalStatus", ARRIVAL_STATUS),
  };
  res.json(await speakerService.updateSpeaker(req.params.id, data));
}));

speakersRouter.delete("/:id", asyncHandler(async (req, res) => {
  await speakerService.deleteSpeaker(req.params.id);
  res.status(204).end();
}));

module.exports = { eventSpeakersRouter, speakersRouter };
