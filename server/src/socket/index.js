const { verifyToken } = require("../lib/jwt");
const { prisma } = require("../lib/prisma");
const { publicUser } = require("../lib/store");
const {
  allowSocketConnect,
  allowSendMessage,
} = require("../lib/rateLimit");
const { isUuid, MAX_MESSAGE_LENGTH } = require("../lib/validate");

async function isRoomMember(roomId, userId) {
  const row = await prisma.roomMember.findUnique({
    where: {
      roomId_userId: { roomId, userId },
    },
  });
  return Boolean(row);
}

/** userId → Set(socketId) — presence chỉ offline khi hết mọi tab */
const onlineSockets = new Map();

function addOnline(userId, socketId) {
  if (!onlineSockets.has(userId)) onlineSockets.set(userId, new Set());
  onlineSockets.get(userId).add(socketId);
}

function removeOnline(userId, socketId) {
  const set = onlineSockets.get(userId);
  if (!set) return true;
  set.delete(socketId);
  if (set.size === 0) {
    onlineSockets.delete(userId);
    return true; // vừa offline hẳn
  }
  return false;
}

function registerSocket(io) {
  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error("UNAUTHORIZED"));
    }

    try {
      const payload = verifyToken(token);
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
      });
      if (!user) {
        return next(new Error("UNAUTHORIZED"));
      }

      if (!allowSocketConnect(user.id)) {
        return next(new Error("RATE_LIMITED"));
      }

      socket.user = publicUser(user);
      return next();
    } catch (err) {
      if (err?.message === "RATE_LIMITED") {
        return next(new Error("RATE_LIMITED"));
      }
      return next(new Error("UNAUTHORIZED"));
    }
  });

  io.on("connection", (socket) => {
    console.log("socket OK:", socket.user.displayName, socket.id);

    addOnline(socket.user.id, socket.id);
    // Báo mọi client: user online (kể cả lần connect đầu)
    io.emit("presence", {
      userId: socket.user.id,
      status: "online",
    });

    // Gửi trạng thái hiện tại tới tab vừa kết nối, kể cả các user đã online
    // trước đó (nếu không, tab mới chỉ nhận được sự kiện presence trong tương lai).
    for (const userId of onlineSockets.keys()) {
      socket.emit("presence", { userId, status: "online" });
    }

    socket.on("join_room", async (payload = {}, ack) => {
      try {
        const roomId = payload.roomId;
        if (!roomId) {
          if (typeof ack === "function") {
            ack({ error: "VALIDATION_ERROR", message: "roomId required" });
          }
          return;
        }
        if (!isUuid(roomId)) {
          if (typeof ack === "function") {
            ack({ error: "VALIDATION_ERROR", message: "Invalid room id" });
          }
          return;
        }
        if (!(await isRoomMember(roomId, socket.user.id))) {
          if (typeof ack === "function") ack({ error: "FORBIDDEN" });
          return;
        }
        socket.join(roomId);
        if (typeof ack === "function") ack({ ok: true, roomId });
      } catch (err) {
        console.error("join_room error:", err);
        if (typeof ack === "function") ack({ error: "VALIDATION_ERROR" });
      }
    });

    socket.on("leave_room", (payload = {}, ack) => {
      const roomId = payload.roomId;
      if (roomId) socket.leave(roomId);
      if (typeof ack === "function") ack({ ok: true });
    });

    socket.on("typing", async (payload = {}, ack) => {
      try {
        const { roomId, isTyping } = payload;
        if (!roomId || typeof isTyping !== "boolean") {
          if (typeof ack === "function") {
            ack({ error: "VALIDATION_ERROR", message: "roomId and isTyping required" });
          }
          return;
        }
        if (!(await isRoomMember(roomId, socket.user.id))) {
          if (typeof ack === "function") ack({ error: "FORBIDDEN" });
          return;
        }
        if (!socket.rooms.has(roomId)) {
          if (typeof ack === "function") {
            ack({ error: "FORBIDDEN", message: "Join room first" });
          }
          return;
        }

        socket.to(roomId).emit("typing", {
          roomId,
          userId: socket.user.id,
          isTyping,
        });
        if (typeof ack === "function") ack({ ok: true });
      } catch (err) {
        console.error("typing error:", err);
        if (typeof ack === "function") ack({ error: "VALIDATION_ERROR" });
      }
    });

    socket.on("send_message", async (payload = {}, ack) => {
      try {
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
        if (!isUuid(roomId)) {
          if (typeof ack === "function") {
            ack({ error: "VALIDATION_ERROR", message: "Invalid room id" });
          }
          return;
        }
        if (String(content).trim().length > MAX_MESSAGE_LENGTH) {
          if (typeof ack === "function") {
            ack({
              error: "VALIDATION_ERROR",
              message: `content max ${MAX_MESSAGE_LENGTH} characters`,
            });
          }
          return;
        }

        if (!allowSendMessage(socket.user.id)) {
          if (typeof ack === "function") ack({ error: "RATE_LIMITED" });
          else socket.emit("error_message", { error: "RATE_LIMITED" });
          return;
        }

        if (!(await isRoomMember(roomId, socket.user.id))) {
          if (typeof ack === "function") ack({ error: "FORBIDDEN" });
          return;
        }
        if (!socket.rooms.has(roomId)) {
          if (typeof ack === "function") {
            ack({ error: "FORBIDDEN", message: "Join room first" });
          }
          return;
        }

        const message = await prisma.message.create({
          data: {
            roomId,
            senderId: socket.user.id,
            content: String(content).trim(),
          },
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
      } catch (err) {
        console.error("send_message error:", err);
        if (typeof ack === "function") ack({ error: "VALIDATION_ERROR" });
      }
    });

    socket.on("disconnect", () => {
      const wentOffline = removeOnline(socket.user.id, socket.id);
      if (wentOffline) {
        io.emit("presence", {
          userId: socket.user.id,
          status: "offline",
        });
      }
      console.log("socket off:", socket.user.displayName);
    });
  });
}

module.exports = { registerSocket };
