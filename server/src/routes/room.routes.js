import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import { createRoom, deleteRoom, getMyActiveRoom, getNearbyRooms } from "../controllers/room.controller.js";


const router = express.Router();

router.post("/", authMiddleware, createRoom);

router.get("/", authMiddleware, getNearbyRooms);

router.get("/my-active", authMiddleware, getMyActiveRoom);

router.delete("/:roomId", authMiddleware, deleteRoom);

export default router;