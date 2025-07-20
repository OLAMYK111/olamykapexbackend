const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
} = require("@whiskeysockets/baileys");

const askOpenRouterAI = require("./ai");

let sockGlobal = null;
let currentQR = null;

function detectTone(message) {
  const lower = message.toLowerCase();

  const abusiveWords = ["mad", "fool", "idiot", "stupid", "dumb", "fuck", "nonsense", "mumu", "werey"];
  const nameTriggers = ["your name", "what's your name", "what is your name", "who are you"];
  const creatorTriggers = ["who created you", "who made you", "your creator", "your boss", "who built you"];

  if (abusiveWords.some(w => lower.includes(w))) return "savage";
  if (nameTriggers.some(w => lower.includes(w))) return "name";
  if (creatorTriggers.some(w => lower.includes(w))) return "creator";

  return "normal";
}

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("./session");

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
  });

  sockGlobal = sock;

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      currentQR = qr;
      console.log("📸 New QR generated");
    }

    if (connection === "close") {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log("🔁 Connection closed. Reconnecting:", shouldReconnect);
      if (shouldReconnect) {
        startBot();
      }
    } else if (connection === "open") {
      console.log("✅ WhatsApp connected!");
      currentQR = null;
    }
  });

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const sender = msg.key.remoteJid;
    const text =
      msg.message?.conversation ||
      msg.message?.extendedTextMessage?.text ||
      msg.message?.imageMessage?.caption ||
      msg.message?.videoMessage?.caption;

    if (!text) return;

    console.log("📨 Message from", sender, ":", text);

    const tone = detectTone(text);
    let prompt = "";

    if (tone === "savage") {
      prompt = `Reply short and savage like a Naija street guy. No long talk. Use Pidgin or bold English based on what the person said. Don’t sign or introduce yourself. No explanation, just clap back smart and hard.`;
    } else if (tone === "name") {
      prompt = `Dem ask for your name. Reply short and confident: "My name na APEX." If dem ask with good English, use English. No add anything extra.`;
    } else if (tone === "creator") {
      prompt = `User ask who build you. Reply short and clear: "OLAMYK build me." Use the same tone and language dem use. No add anything more.`;
    } else {
      prompt = `You be APEX, Naija-style AI. Reply smart and short, no long grammar. Use Pidgin or clean English based on the message. No sign-off, no name. Just be direct, confident and human-like.`;
    }

    try {
      const fullPrompt = `${prompt}\n\nUser said: "${text}"\n\nYour reply (max 2 sentences):`;
      const reply = await askOpenRouterAI(fullPrompt);
      await sock.sendMessage(sender, { text: reply.trim() });
    } catch (error) {
      console.error("❌ AI Error:", error.message);
      await sock.sendMessage(sender, {
        text: "😤 Wahala dey. Try again later abeg.",
      });
    }
  });
}

// 🟩 Expose QR and contacts to frontend
function getQR() {
  return currentQR;
}

async function getContacts() {
  if (!sockGlobal) return [];

  const contacts = Object.values(sockGlobal.contacts || {});
  return contacts.map(c => ({
    id: c.id,
    name: c.name || c.notify || c.vname || "No Name",
  }));
}

module.exports = {
  startBot,
  getQR,
  getContacts,
};
