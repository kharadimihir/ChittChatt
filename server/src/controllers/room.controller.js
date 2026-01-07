import Room from "../models/Room.model.js";
import { getDistantInKm } from "../utils/distant.js";
import { io } from "../server.js"
import Message from "../models/Message.model.js";

export const createRoom = async (req, res) => {
  try {
    const { lat, lng, title, tag } = req.body;
    const userId = req.user._id;

    if (!title || !tag) {
      return res.status(400).json({ message: "Title and tag are required" });
    }

    if (typeof lat !== "number" || typeof lng !== "number") {
      return res.status(400).json({ message: "Valid location is required" });
    }

    // Check if user already has an active room
    const existingRoom = await Room.findOne({
      createdBy: userId,
      isActive: true,
      expiresAt: { $gt: new Date() },
    });

    if (existingRoom) {
      return res.status(400).json({
        message: "You already have an active room",
      });
    }

    const expiresAt = new Date(Date.now() + 3 * 60 * 60 * 1000);

    const room = await Room.create({
      title,
      tag,
      createdBy: userId,
      location: { lat, lng },
      expiresAt,
    });

    const populatedRoom = await Room.findById(room._id)
      .populate("createdBy", "_id handle");

    io.emit("room-created", { room: populatedRoom });

    res.status(201).json({
      message: "Room created Successfully",
      room,
    });
  } catch (error) {
    console.error("Create room error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getMyActiveRoom = async (req, res) => {
  try {
    const room = await Room.findOne({
      createdBy: req.user._id,
      isActive: true, 
      expiresAt: { $gt: new Date() },
    });

    return res.status(201).json({
      hasActiveRoom: !!room,
      room,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getNearbyRooms = async (req, res) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        message: "Latitude and longitude are required",
      });
    }

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);

    const rooms = await Room.find({
      expiresAt: { $gt: new Date() },
    }).populate("createdBy", "_id handle");

    const nearbyRooms = rooms.filter((room) => {
      // 🛡️ ABSOLUTE SAFETY CHECKS
      if (
        !room.location ||
        typeof room.location.lat !== "number" ||
        typeof room.location.lng !== "number"
      ) {
        return false;
      }

      const distance = getDistantInKm(
        userLat,
        userLng,
        room.location.lat,
        room.location.lng
      );

      return distance <= 15; // km radius
    });

    return res.json({ rooms: nearbyRooms });
  } catch (error) {
    console.error("Get nearby rooms error:", error);
    res.status(500).json({ message: "Failed to fetch rooms" });
  }
};
export const deleteRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user._id;

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    // only creator can delete
    if (room.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    io.to(roomId).emit("room-deleted", {
      roomId,
      createdBy: room.createdBy.toString(),
      message: "Room was deleted by creator",
    });


    io.emit("room-removed", { roomId });

    // kick all sockets from the room
    const sockets = await io.in(roomId).fetchSockets();
    sockets.forEach((s) => s.leave(roomId));

    // delete messages
    await Message.deleteMany({ roomId });

    // delete room
    await Room.findByIdAndDelete(roomId);

    res.status(200).json({ message: "Room deleted successfully" });
  } catch (err) {
    console.error("Delete room error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

