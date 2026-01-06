import app from "./app.js";
import connectDB from "./config/db.js";
import env from "./config/env.js";
import http from "http"
import registerChatSocket from "./sockets/chat.socket.js";
import { Server } from "socket.io"


connectDB();

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: [
            "http://localhost:5173",
            "https://chittchatt-theta.vercel.app"
          ],
        credentials: true,
    },
});


registerChatSocket(io);

// Start server
server.listen(env.PORT, () => {
    console.log(`🚀 Server + Socket.IO running on http://localhost:${env.PORT}`);
  });