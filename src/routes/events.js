const express = require("express");
const eventService = require("../services/eventService");
const { EVENT_TONE } = require("../constants");
const validate = require("../utils/validate");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const requireOrganizer = require("../middleware/requireOrganizer");

const router = express.Router();
router.use(requireOrganizer);

router.post("/", asyncHandler(async (req, res) => {
  const body = req.body;
  const data = {
    name: validate.requireString(body?.name, "name", { min: 2, max: 120 }),
    type: validate.requireString(body?.type, "type", { min: 2, max: 40 }),
    tone: validate.requireOneOf(body?.tone, "tone", EVENT_TONE),
    date: validate.requireIsoDate(body?.date, "date"),
  };
  res.status(201).json(await eventService.createEvent(data));
}));

router.get("/", asyncHandler(async (req, res) => {
  res.json(await eventService.listEvents());
}));

router.get("/:id", asyncHandler(async (req, res) => {
  res.json(await eventService.getEvent(req.params.id));
}));

router.patch("/:id", asyncHandler(async (req, res) => {
  const body = req.body;
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw ApiError.badRequest("Body must be a JSON object");
  }
  const allowedFields = ["name", "type", "tone", "date"];
  for (const field of Object.keys(body)) {
    if (!allowedFields.includes(field)) {
      throw ApiError.badRequest(`${field} cannot be updated`, { field });
    }
  }
  const data = {
    name: validate.optionalString(body.name, "name", { min: 2, max: 120 }),
    type: validate.optionalString(body.type, "type", { min: 2, max: 40 }),
    tone: validate.optionalOneOf(body.tone, "tone", EVENT_TONE),
    date: validate.optionalIsoDate(body.date, "date"),
  };
  res.json(await eventService.updateEvent(req.params.id, data));
}));

router.delete("/:id", asyncHandler(async (req, res) => {
  await eventService.deleteEvent(req.params.id);
  res.status(204).end();
}));

module.exports = router;
