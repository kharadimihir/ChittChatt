import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
    {
        roomId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Room",
            required: true,
            index: true,
        },

        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        text: {
            type: String,
            required: true,
            trim: true,
            maxLength: 1000,
        },
        type: {
            type: String,
            enum: ["text", "system"],
            default: "text",
        },
        expiresAt: {
            type: Date,
            index: { expires: 0 }, 
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

messageSchema.index({ roomId: 1, createdAt: 1 });

const Message = mongoose.model("Message", messageSchema);
export default Message;