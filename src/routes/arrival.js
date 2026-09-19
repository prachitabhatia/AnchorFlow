const express = require("express");
const { speakerArrived } = require("../services/arrivalService");
const asyncHandler = require("../utils/asyncHandler");
const requireOrganizer = require("../middleware/requireOrganizer");

const router = express.Router();
router.use(requireOrganizer);
router.post("/", asyncHandler(async (req, res) => {
  res.json(await speakerArrived({ speakerId: req.body?.speakerId }));
}));

module.exports = router;
