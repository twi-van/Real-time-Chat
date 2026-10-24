const { verifyToken } = require("../lib/jwt");
const {
  findUserById,
  publicUser,
  isRoomMember,
  createMessage,
} = require("../lib/store");

function registerSocket(io) {
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error("UNAUTHORIZED"));
    }

    try {
      const payload = verifyToken(token);
      const user = findUserById(payload.userId);
      if (!user) {
        return next(new Error("UNAUTHORIZED"));
      }
      socket.user = publicUser(user);
      return next();
    } catch {
      return next(new Error("UNAUTHORIZED"));
    }
  });

  io.on("connection", (socket) => {
    console.log("socket OK:", socket.user.displayName, socket.id);

    socket.on("join_room", (payload = {}, ack) => {
      const roomId = payload.roomId;
      if (!roomId) {
        if (typeof ack === "function") {
          ack({ error: "VALIDATION_ERROR", message: "roomId required" });
        }
        return;
      }
      if (!isRoomMember(roomId, socket.user.id)) {
        if (typeof ack === "function") ack({ error: "FORBIDDEN" }); //ack báo client lỗi/ok
        return;
      }
      socket.join(roomId);
      if (typeof ack === "function") ack({ ok: true, roomId });
    });

    socket.on("send_message", (payload = {}, ack) => {
      const { roomId, content } = payload;
      if (!roomId || content == null || !String(content).trim()) {
        if (typeof ack === "function") {
          ack({
            error: "VALIDATION_ERROR",
            message: "roomId and content required",
          });
        }
        return;
      }
      if (!isRoomMember(roomId, socket.user.id)) {
        if (typeof ack === "function") ack({ error: "FORBIDDEN" });
        return;
      }
      // Contract: phải join_room trước
      if (!socket.rooms.has(roomId)) {
        if (typeof ack === "function") {
          ack({ error: "FORBIDDEN", message: "Join room first" });
        }
        return;
      }
      const message = createMessage({
        roomId,
        senderId: socket.user.id,
        content,
      });
      const out = {
        id: message.id,
        roomId: message.roomId,
        content: message.content,
        sender: socket.user,
        createdAt: message.createdAt,
      };
      io.to(roomId).emit("receive_message", out);
      if (typeof ack === "function") ack({ ok: true, message: out });
    });
    socket.on("disconnect", () => {
      console.log("socket off:", socket.user.displayName);
    });
  });
}

module.exports = { registerSocket };
