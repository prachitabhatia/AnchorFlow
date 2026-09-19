const express = require("express");
const service = require("../services/scriptService");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const requireOrganizer = require("../middleware/requireOrganizer");
const batchService = require("../services/batchScriptService");
const batchScriptsRouter = express.Router();
batchScriptsRouter.use(requireOrganizer);

batchScriptsRouter.post("/:id/generate-all-scripts", asyncHandler(async (req, res) => {
  res.json(await batchService.generateAllScripts(req.params.id));
}));
batchScriptsRouter.post("/:id/pregenerate-contingency", asyncHandler(async (req, res) => {
  res.json(await batchService.pregenerateContingency(req.params.id));
}));

const generateRouter = express.Router();
const eventScriptsRouter = express.Router({ mergeParams: true });
const scriptsRouter = express.Router();
generateRouter.use(requireOrganizer);
eventScriptsRouter.use(requireOrganizer);
scriptsRouter.use(requireOrganizer);

generateRouter.post("/", asyncHandler(async (req, res) => {
  const { eventId, type, agendaItemId, extra } = req.body || {};
  res.json(await service.generateAndStore({ eventId, type, agendaItemId, extra }));
}));

eventScriptsRouter.get("/", asyncHandler(async (req, res) => {
  res.json(await service.listScripts(req.params.eventId, { type: req.query.type, agendaItemId: req.query.agendaItemId }));
}));

scriptsRouter.patch("/:id", asyncHandler(async (req, res) => {
  if (!req.body || typeof req.body !== "object" || Array.isArray(req.body) || Object.keys(req.body).some((field) => field !== "content")) {
    throw ApiError.badRequest("Only content may be edited");
  }
  res.json(await service.updateScript(req.params.id, req.body.content));
}));

module.exports = { generateRouter, eventScriptsRouter, scriptsRouter, batchScriptsRouter };
