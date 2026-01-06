import Message from "../models/Message.model.js";

export const getRoomMessages = async (req, res) => {
  try {
    const { roomId } = req.params;

    if (!roomId) {
      return res.status(400).json({
        message: "Room ID is required",
      });
    }

    const messages = await Message.find({ roomId })
      .populate("sender", "handle")
      .sort({ createdAt: 1 });

    return res.status(200).json({
      messages,
    });
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({
      message: "Failed to fetch messages",
    });
  }
};
