const express = require("express");
const path = require("path");
const http = require("http");
const WebSocket = require("ws");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on("connection", (ws) => {
  console.log("New client connected via WebSocket!");

  ws.on("message", (message) => {
    const data = JSON.parse(message);
    console.log("Received:", data);

    if (data.type === "start") {
      ws.send(JSON.stringify({ transcript: `Elderberry says: ${data.message}` }));
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected.");
  });
});

server.listen(PORT, () => {
  console.log(`Voice chat bot running at http://localhost:${PORT}`);
});
