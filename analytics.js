const express = require("express");
const router = express.Router();

let stats = {
  totalMessages: 0,
  totalUsers: 0,
  lastActive: null,
};

router.get("/", (req, res) => {
  res.json(stats);
});

router.post("/update", (req, res) => {
  const { totalMessages, totalUsers, lastActive } = req.body;
  if (totalMessages) stats.totalMessages = totalMessages;
  if (totalUsers) stats.totalUsers = totalUsers;
  if (lastActive) stats.lastActive = lastActive;

  res.json({ message: "📊 Analytics updated", stats });
});

module.exports = router;
