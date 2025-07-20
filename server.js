const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

const { startBot, getQR, getContacts } = require("./bot");
const { askOpenRouterAI } = require("./ai");

// 🆕 New backend API routes
const analyticsRoutes = require("./analytics");
const settingsRoutes = require("./settings");
const userRoutes = require("./user");

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// 🚀 Serve latest QR to frontend
app.get("/api/qr", (req, res) => {
  const qr = getQR();
  res.json({ qr: qr || null });
});

// 🧠 Direct AI ask route (for test.html or other UI)
app.post("/api/ask", async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "No message provided" });

  try {
    const reply = await askOpenRouterAI(message);
    res.json({ reply });
  } catch (error) {
    console.error("❌ AI Error:", error.message);
    res.status(500).json({ error: "AI failed to respond" });
  }
});

// 📇 Serve WhatsApp contact list to frontend
app.get("/api/contacts", async (req, res) => {
  try {
    const contacts = await getContacts();
    res.json(contacts);
  } catch (err) {
    console.error("❌ Error loading contacts:", err.message);
    res.status(500).json({ error: "Failed to get contacts" });
  }
});

// ✅ Add routes for settings, analytics, and user management
app.use("/api/analytics", analyticsRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/users", userRoutes);

// 🔥 Start server and bot
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("✅ Server running on port", PORT);
  startBot();
});
