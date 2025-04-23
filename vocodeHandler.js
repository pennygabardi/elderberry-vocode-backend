const { v4: uuidv4 } = require("uuid");
const WebSocket = require("ws");

function startVocodeSession(socket) {
  console.log("🎤 Setting up Vocode WebRTC session...");

  const sessionId = uuidv4();
  const vocodeSocket = new WebSocket(`wss://api.vocode.dev/websocket?sessionId=${sessionId}`);

  vocodeSocket.on("open", () => {
    console.log("🔗 Connected to Vocode WebSocket");
    socket.emit("ready");
  });

  vocodeSocket.on("message", (data) => {
    // Pass audio or text from Vocode → browser
    socket.emit("botMessage", data);
  });

  socket.on("userMessage", (msg) => {
    // Send browser mic/audio/text → Vocode
    if (vocodeSocket.readyState === WebSocket.OPEN) {
      vocodeSocket.send(msg);
    }
  });

  socket.on("disconnect", () => {
    console.log("👋 Browser disconnected. Closing Vocode session.");
    vocodeSocket.close();
  });
}

module.exports = { startVocodeSession };
