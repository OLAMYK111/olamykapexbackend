const express = require("express");
const router = express.Router();

let settings = {
  autoReply: true,
  savageMode: true,
  aiActive: true,
};

router.get("/", (req, res) => {
  res.json(settings);
});

router.post("/update", (req, res) => {
  const { autoReply, savageMode, aiActive } = req.body;
  if (autoReply !== undefined) settings.autoReply = autoReply;
  if (savageMode !== undefined) settings.savageMode = savageMode;
  if (aiActive !== undefined) settings.aiActive = aiActive;

  res.json({ message: "⚙️ Settings updated", settings });
});

module.exports = router;
