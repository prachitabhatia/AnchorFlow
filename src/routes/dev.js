const express = require("express");
const requireOrganizer = require("../middleware/requireOrganizer");

const router = express.Router();
router.use(requireOrganizer);
router.post("/protected-ping", (req, res) => res.json({ ok: true }));

module.exports = router;
