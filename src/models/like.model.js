import mongoose from "mongoose";

const likeSchema = new mongoose.Schema(
    {
        video: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Video",
            required: true,
            index: true
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        }
    },
    { timestamps: true }
);

likeSchema.index({ video: 1, user: 1 }, { unique: true });

export const Like = mongoose.model("Like", likeSchema);


