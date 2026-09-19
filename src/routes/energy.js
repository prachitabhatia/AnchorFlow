const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const { getEnergy, recordEnergy } = require("../services/energyService");

const router = express.Router();
router.post("/:id/energy", asyncHandler(async (req, res) => {
  res.json(await recordEnergy(req.params.id, req.body?.value));
}));
router.get("/:id/energy", asyncHandler(async (req, res) => {
  res.json(await getEnergy(req.params.id));
}));

module.exports = router;
