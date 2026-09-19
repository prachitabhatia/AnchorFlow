const express = require("express");
const requireOrganizer = require("../middleware/requireOrganizer");
const buildEventContext = require("../services/contextBuilder");
const asyncHandler = require("../utils/asyncHandler");
const validate = require("../utils/validate");

const router = express.Router();
router.use(requireOrganizer);
router.post("/protected-ping", (req, res) => res.json({ ok: true }));

router.get("/context", asyncHandler(async (req, res) => {
  const eventId = validate.requireString(req.query.eventId, "eventId");
  const agendaItemId = validate.optionalString(req.query.agendaItemId, "agendaItemId");
  let delayMinutes;
  if (req.query.delayMinutes !== undefined) {
    const value = validate.requireString(req.query.delayMinutes, "delayMinutes");
    delayMinutes = validate.requireInt(Number(value), "delayMinutes");
  }
  res.json(await buildEventContext({ eventId, agendaItemId, extra: { delayMinutes } }));
}));

module.exports = router;
