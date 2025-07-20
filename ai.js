const axios = require("axios");

const askOpenRouterAI = async (prompt) => {
  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "mistralai/mistral-7b-instruct",
        messages: [{ role: "user", content: prompt }],
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://olamyk-apex-bot.vercel.app/",
          "X-Title": "OLAMYK-APEX-BOT",
        },
      }
    );

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error("🔥 OpenRouter AI Error:", error.message);
    return "😓 Sorry, I couldn't process that. Please try again.";
  }
};

module.exports = askOpenRouterAI;
