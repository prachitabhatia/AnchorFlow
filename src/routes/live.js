const express = require("express");
const liveService = require("../services/liveService");
const buildLiveSnapshot = require("../services/liveSnapshot");
const asyncHandler = require("../utils/asyncHandler");
const requireOrganizer = require("../middleware/requireOrganizer");

const liveControlsRouter = express.Router({ mergeParams: true });
const liveRouter = express.Router();
liveControlsRouter.use(requireOrganizer);

liveControlsRouter.post("/go-live", asyncHandler(async (req, res) => {
  res.json(await liveService.goLive(req.params.id));
}));
liveControlsRouter.post("/advance", asyncHandler(async (req, res) => {
  res.json(await liveService.advance(req.params.id));
}));
liveControlsRouter.post("/pause", asyncHandler(async (req, res) => {
  res.json(await liveService.pause(req.params.id));
}));
liveControlsRouter.post("/resume", asyncHandler(async (req, res) => {
  res.json(await liveService.resume(req.params.id));
}));
liveControlsRouter.post("/end", asyncHandler(async (req, res) => {
  res.json(await liveService.endEvent(req.params.id));
}));

// Public polling has no organizer middleware, including on its mount in app.js.
liveRouter.get("/:eventId", asyncHandler(async (req, res) => {
  res.json(await buildLiveSnapshot(req.params.eventId));
}));

module.exports = { liveControlsRouter, liveRouter };
