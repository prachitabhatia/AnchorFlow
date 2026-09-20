const express = require("express");
const templateService = require("../services/templateService");
const validate = require("../utils/validate");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const requireOrganizer = require("../middleware/requireOrganizer");

const eventTemplateRouter = express.Router({ mergeParams: true });
const templatesRouter = express.Router();
eventTemplateRouter.use(requireOrganizer);
templatesRouter.use(requireOrganizer);

eventTemplateRouter.post("/save-as-template", asyncHandler(async (req, res) => {
  const body = req.body;
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw ApiError.badRequest("Body must be a JSON object");
  }
  const allowedFields = ["name", "description"];
  for (const field of Object.keys(body)) {
    if (!allowedFields.includes(field)) {
      throw ApiError.badRequest(`${field} cannot be set`, { field });
    }
  }
  const data = {
    name: validate.requireString(body.name, "name", { min: 2, max: 120 }),
    description: validate.optionalString(body.description, "description", { min: 0, max: 500 }),
  };
  res.status(201).json(await templateService.createTemplateFromEvent(req.params.eventId, data));
}));

templatesRouter.get("/", asyncHandler(async (req, res) => {
  res.json(await templateService.listTemplates());
}));

templatesRouter.post("/:id/create-event", asyncHandler(async (req, res) => {
  const body = req.body;
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw ApiError.badRequest("Body must be a JSON object");
  }
  const allowedFields = ["name", "date", "tone", "type", "startTime"];
  for (const field of Object.keys(body)) {
    if (!allowedFields.includes(field)) {
      throw ApiError.badRequest(`${field} cannot be set`, { field });
    }
  }
  // The service validates field values too, so direct callers get the same guarantees.
  res.status(201).json(await templateService.createEventFromTemplate(req.params.id, body));
}));

templatesRouter.get("/:id", asyncHandler(async (req, res) => {
  res.json(await templateService.getTemplate(req.params.id));
}));

templatesRouter.delete("/:id", asyncHandler(async (req, res) => {
  await templateService.deleteTemplate(req.params.id);
  res.status(204).end();
}));

module.exports = { eventTemplateRouter, templatesRouter };
