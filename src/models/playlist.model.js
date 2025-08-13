import mongoose, { Schema } from "mongoose";

const playlistSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    videos: [{ type: mongoose.Schema.Types.ObjectId, ref: "Video" }],
    isPrivate: { type: Boolean, default: false },
  },
  { timestamps: true }
);

playlistSchema.index({ owner: 1, name: 1 }, { unique: true });

export const Playlist = mongoose.model("Playlist", playlistSchema);
