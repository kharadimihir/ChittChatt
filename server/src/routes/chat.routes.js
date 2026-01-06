import express from "express"
import authMiddleware from "../middleware/auth.middleware.js";
import { getRoomMessages } from "../controllers/chat.controller.js";


const router = express.Router();

// Get all messages
router.get("/:roomId", authMiddleware, getRoomMessages);

export default router;