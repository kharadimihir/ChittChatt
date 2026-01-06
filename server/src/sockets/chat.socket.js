import Message from "../models/Message.model.js";
import jwt from "jsonwebtoken";
export default function registerChatSocket(io) {

  // roomId => Set of userIds
  const roomUsers = new Map();

  // Socket auth middleware
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token) {
        return next(new Error("Authentication error"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // attach userId to socket
      socket.userId = decoded.userId;

      next();
    } catch (error) {
      return next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {

    // Join room
    socket.on("join-room", async (roomId) => {
      socket.join(roomId);
      if (!roomUsers.has(roomId)) {
        roomUsers.set(roomId, new Set());
      }
      roomUsers.get(roomId).add(socket.id);

      const count = roomUsers.get(roomId).size;
      io.to(roomId).emit("active-users", count);
      io.emit("room-user-count", {
        roomId,
        count,
      });
    });
    

    socket.on("send-message", async (data) => {
      try {
        const { roomId, text } = data;

        if (!roomId || !text) {
          return;
        }

        // Save msg to db
        const message = await Message.create({
          roomId,
          sender: socket.userId,
          text,
          type: "text",
        });

        await message.populate("sender", "handle");

        // Broadcast to everyone
        io.to(roomId).emit("receive-message", message);
      } catch (error) {
        console.log("Socket send-message error:", error);
      }
    });
    socket.on("disconnect", () => {
        for (const [roomId, users] of roomUsers.entries()) {
          if (users.has(socket.id)) {
            users.delete(socket.id);
  
            if (users.size === 0) {
              roomUsers.delete(roomId);
            }
  
            const count = users.size || 0;
  
            io.to(roomId).emit("active-users", count);
            io.emit("room-user-count", {
              roomId,
              count,
            });
          }
        }

      });
  });
}
