const express = require("express");
const { reportDelay } = require("../services/delayService");
const asyncHandler = require("../utils/asyncHandler");
const requireOrganizer = require("../middleware/requireOrganizer");

const router = express.Router();
router.use(requireOrganizer);
router.post("/", asyncHandler(async (req, res) => {
  const { agendaItemId, delayMinutes } = req.body || {};
  res.json(await reportDelay({ agendaItemId, delayMinutes }));
}));

module.exports = router;
