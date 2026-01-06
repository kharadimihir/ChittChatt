import mongoose from "mongoose"

const roomSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },

        tag: {
            type: String,
            required: true,
            trim: true,
        },
        
        location: {
            lat: {
              type: Number,
              required: true,
            },
            lng: {
              type: Number,
              required: true,
            },
          },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        expiresAt: {
            type: Date,
            required: true,
        },

        isActive: {
            type: Boolean,
            default: true,
        }
    },
    { timestamps: true }
);

roomSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("Room", roomSchema);