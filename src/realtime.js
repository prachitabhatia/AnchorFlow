const { Server } = require("socket.io");
const config = require("./config");

let io;

function initRealtime(httpServer) {
  if (io) return io;
  // Socket.IO has its own CORS settings, separate from Express.
  io = new Server(httpServer, { cors: { origin: config.corsOrigin } });
  io.on("connection", (socket) => {
    socket.on("join", (payload) => {
      if (!payload || typeof payload.eventId !== "string" || !payload.eventId.trim()) return;
      const eventId = payload.eventId.trim();
      socket.join(`event:${eventId}`);
      socket.emit("joined", { eventId });
    });
  });
  return io;
}

function emitLiveUpdate(eventId, snapshot) {
  if (!io) {
    console.warn("Realtime is not initialized; live updates remain available through polling.");
    return;
  }
  io.to(`event:${eventId}`).emit("live:update", snapshot);
}

module.exports = { initRealtime, emitLiveUpdate };
