const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const fs = require("fs");
const path = require("path");
require("dotenv").config();
const { Configuration, OpenAIApi } = require("openai");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const PORT = process.env.PORT || 10000;

// Set up OpenAI API
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

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

        const response = await openai.createChatCompletion({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: prompt }],
        });

        const reply = response.data.choices[0].message.content;
        console.log("💬 OpenAI says:", reply);

        ws.send(JSON.stringify({ transcript: reply }));
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