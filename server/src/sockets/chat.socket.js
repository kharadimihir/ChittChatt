import Message from "../models/Message.model.js";
import jwt from "jsonwebtoken";

export default function registerChatSocket(io) {
  // roomId => Set(socketId)
  const roomUsers = new Map();

  /* ---------------- AUTH MIDDLEWARE ---------------- */
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("Authentication error"));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;

      next();
    } catch (err) {
      next(new Error("Authentication error"));
    }
  });

  /* ---------------- CONNECTION ---------------- */
  io.on("connection", (socket) => {

    /* ---------- JOIN ROOM ---------- */
    socket.on("join-room", (roomId) => {
      socket.join(roomId);

      if (!roomUsers.has(roomId)) {
        roomUsers.set(roomId, new Set());
      }

      const users = roomUsers.get(roomId);
      users.add(socket.id);

      const count = users.size;

      // ChatRoom users
      io.to(roomId).emit("active-users", count);

      // RoomList cards
      io.emit("room-user-count", { roomId, count });
    });

    /* ---------- LEAVE ROOM ---------- */
    socket.on("leave-room", (roomId) => {
      if (!roomUsers.has(roomId)) return;

      const users = roomUsers.get(roomId);
      users.delete(socket.id);

      if (users.size === 0) {
        roomUsers.delete(roomId);
      }

      const count = users.size || 0;

      io.to(roomId).emit("active-users", count);
      io.emit("room-user-count", { roomId, count });
    });

    /* ---------- SEND MESSAGE ---------- */
    socket.on("send-message", async ({ roomId, text }) => {
      if (!roomId || !text) return;

      try {
        const message = await Message.create({
          roomId,
          sender: socket.userId,
          text,
          type: "text",
        });

        await message.populate("sender", "handle");

        io.to(roomId).emit("receive-message", message);
      } catch (err) {
        console.error("send-message error:", err);
      }
    });

    /* ---------- DELETE ROOM (CREATOR) ---------- */
    socket.on("delete-room", (roomId) => {
      // Notify users inside room
      io.to(roomId).emit("room-deleted", {
        roomId,
        message: "Room was deleted by creator",
      });

      // Force everyone out of socket room
      io.socketsLeave(roomId);

      // Cleanup memory
      roomUsers.delete(roomId);

      // Update room list counts
      io.emit("room-user-count", {
        roomId,
        count: 0,
      });
    });

    /* ---------- DISCONNECT ---------- */
    socket.on("disconnect", () => {
      for (const [roomId, users] of roomUsers.entries()) {
        if (users.has(socket.id)) {
          users.delete(socket.id);

          if (users.size === 0) {
            roomUsers.delete(roomId);
          }

          const count = users.size || 0;

          io.to(roomId).emit("active-users", count);
          io.emit("room-user-count", { roomId, count });
        }
      }
    });
  });
}
