const fs = require("fs");
const http = require("http");
const path = require("path");
const express = require("express");
const WebSocket = require("ws");

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.static("public"));

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on("connection", (ws) => {
  console.log("New client connected via WebSocket!");

  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message);
      console.log("Received:", data);

      if (data.type === "start") {
        // Send transcript
        ws.send(JSON.stringify({ transcript: `Elderberry says: ${data.message}` }));

        // Send audio file as binary
        const audioPath = path.join(__dirname, "public", "mock_voice.wav");
        const audioBuffer = fs.readFileSync(audioPath);
        ws.send(audioBuffer);
        console.log("✅ Sent mock audio blob to client");
      }
    } catch (err) {
      console.error("Failed to process message:", err);
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected.");
  });
});

server.listen(PORT, () => {
  console.log(`Voice chat bot running at http://localhost:${PORT}`);
});