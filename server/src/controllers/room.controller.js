import Room from "../models/Room.model.js";
import { getDistantInKm } from "../utils/distant.js";

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

    // Only creator can delete this room
    if (room.createdBy.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this room" });
    }

    room.isActive = false;
    room.expiresAt = new Date(); // expire immediately
    await room.save();

    return res.status(200).json({
      message: "Room deleted successfully",
    });
  } catch (error) {
    console.error("Delete room error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
