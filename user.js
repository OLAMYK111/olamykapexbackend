const express = require("express");
const router = express.Router();

let users = [];

router.get("/", (req, res) => {
  res.json(users);
});

router.post("/add", (req, res) => {
  const { id, name } = req.body;
  if (!id || !name) return res.status(400).json({ error: "User ID and name required" });

  users.push({ id, name });
  res.json({ message: "👤 User added", users });
});

router.post("/remove", (req, res) => {
  const { id } = req.body;
  users = users.filter(user => user.id !== id);
  res.json({ message: "🗑️ User removed", users });
});

module.exports = router;
