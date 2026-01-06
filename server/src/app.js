import express from "express"
import cors from "cors"
import authRoutes from "./routes/auth.routes.js"
import roomRoutes from "./routes/room.routes.js"
import chatRoutes from "./routes/chat.routes.js"

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
    res.json({ status: "Backend running" });
});

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/rooms", roomRoutes)
app.use("/api/chat", chatRoutes)

export default app;
