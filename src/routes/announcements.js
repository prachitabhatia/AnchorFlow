const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const requireOrganizer = require("../middleware/requireOrganizer");
const announcements = require("../services/announcementService");
const { getSummary } = require("../services/summaryService");

const router = express.Router();
router.use(requireOrganizer);
router.post("/:id/announcements", asyncHandler(async (req, res) => {
  res.json(await announcements.createAnnouncement(req.params.id, req.body?.message));
}));
router.get("/:id/announcements", asyncHandler(async (req, res) => {
  res.json(await announcements.listAnnouncements(req.params.id));
}));
router.get("/:id/summary", asyncHandler(async (req, res) => {
  res.json(await getSummary(req.params.id));
}));

module.exports = router;
