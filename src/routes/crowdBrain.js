const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const crowdBrainService = require("../services/crowdBrainService");
const crowdBrainInsightService = require("../services/crowdBrainInsightService");

const router = express.Router();
router.get("/:id/crowd-brain/segments", asyncHandler(async (req, res) => {
  res.json(await crowdBrainService.listSegmentOptions(req.params.id));
}));

router.post("/:id/crowd-brain/feedback", asyncHandler(async (req, res) => {
  res.status(201).json(await crowdBrainService.submitFeedback(req.params.id, {
    agendaItemId: req.body?.agendaItemId, reaction: req.body?.reaction,
  }));
}));
router.get("/:id/crowd-brain/:agendaItemId/aggregate", asyncHandler(async (req, res) => {
  res.json(await crowdBrainService.getAggregate(req.params.id, req.params.agendaItemId));
}));

router.post("/:id/crowd-brain/:agendaItemId/regenerate-line", asyncHandler(async (req, res) => {
  res.json(await crowdBrainInsightService.regenerateLine(req.params.id, req.params.agendaItemId));
}));

module.exports = router;
