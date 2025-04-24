const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const fs = require("fs");
const path = require("path");
require("dotenv").config();
const OpenAI = require("openai"); // ✅ Correct SDK v4 import

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const PORT = process.env.PORT || 10000;

// ✅ Correct OpenAI SDK v4 client initialization
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Serve static files from /public
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

wss.on("connection", (ws) => {
  console.log("🔗 New client connected via WebSocket!");

  ws.on("message", async (message) => {
    try {
      const data = JSON.parse(message);
      console.log("📩 Received from client:", data);

      if (data.type === "start") {
        const prompt = data.message || "Tell me a story about a wise elder.";

      const completion = await openai.chat.completions.create({
  model: "gpt-3.5-turbo",
  messages: [{ role: "user", content: data.message }],
});

        const reply = completion.choices[0].message.content;
console.log("🧠 GPT-3.5 says:", reply);

ws.send(JSON.stringify({ transcript: `Elderberry says: ${reply}` }));
      }
    } catch (err) {
      console.error("❌ Error handling message:", err);
      ws.send(JSON.stringify({ error: "Failed to process message." }));
    }
  });

  ws.on("close", () => {
    console.log("🔌 Client disconnected.");
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Voice chat bot running at http://localhost:${PORT}`);
});