const express = require("express");
const agendaService = require("../services/agendaService");
const validate = require("../utils/validate");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const requireOrganizer = require("../middleware/requireOrganizer");

const eventAgendaRouter = express.Router({ mergeParams: true });
const agendaRouter = express.Router();
eventAgendaRouter.use(requireOrganizer);
agendaRouter.use(requireOrganizer);

function parseAgenda(body, partial = false) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw ApiError.badRequest("Body must be a JSON object");
  }
  const allowedFields = ["title", "type", "speakerId", "plannedStart", "durationMinutes", "isBuffer"];
  for (const field of Object.keys(body)) {
    if (!allowedFields.includes(field)) throw ApiError.badRequest(`${field} cannot be set`, { field });
  }
  if (body.isBuffer !== undefined && typeof body.isBuffer !== "boolean") {
    throw ApiError.badRequest("isBuffer must be a boolean", { field: "isBuffer" });
  }
  const string = partial ? validate.optionalString : validate.requireString;
  const date = partial ? validate.optionalIsoDate : validate.requireIsoDate;
  const integer = partial ? validate.optionalInt : validate.requireInt;
  return {
    title: string(body.title, "title", { min: 2, max: 160 }),
    type: string(body.type, "type", { min: 2, max: 40 }),
    // null explicitly clears the optional speaker relationship.
    speakerId: body.speakerId === null ? null : validate.optionalString(body.speakerId, "speakerId"),
    plannedStart: date(body.plannedStart, "plannedStart"),
    durationMinutes: integer(body.durationMinutes, "durationMinutes", { min: 1, max: 480 }),
    isBuffer: body.isBuffer === undefined && !partial ? false : body.isBuffer,
  };
}

eventAgendaRouter.post("/", asyncHandler(async (req, res) => {
  const data = parseAgenda(req.body);
  res.status(201).json(await agendaService.createAgendaItem(req.params.eventId, data));
}));

eventAgendaRouter.get("/", asyncHandler(async (req, res) => {
  res.json(await agendaService.listAgendaItems(req.params.eventId));
}));

eventAgendaRouter.post("/reorder", asyncHandler(async (req, res) => {
  const orderedIds = req.body?.orderedIds;
  if (!Array.isArray(orderedIds) || orderedIds.some((id) => typeof id !== "string" || !id.trim())) {
    throw ApiError.badRequest("orderedIds must be an array of non-empty string IDs", { field: "orderedIds" });
  }
  res.json(await agendaService.reorderAgenda(req.params.eventId, orderedIds));
}));

agendaRouter.patch("/:id", asyncHandler(async (req, res) => {
  const data = parseAgenda(req.body, true);
  res.json(await agendaService.updateAgendaItem(req.params.id, data));
}));

agendaRouter.delete("/:id", asyncHandler(async (req, res) => {
  await agendaService.deleteAgendaItem(req.params.id);
  res.status(204).end();
}));

module.exports = { eventAgendaRouter, agendaRouter };
