import { asyncHandler } from "../utils/asyncHandler.js";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const createPlaylist = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  if (!title) throw new ApiError(400, "Playlist title is required");

  const playlist = await Playlist.create({
    user: req.user._id,
    title,
    description,
  });

  return res.status(201).json(new ApiResponse(201, playlist, "Playlist created successfully"));
});

export const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.body;
  if (!playlistId || !videoId) throw new ApiError(400, "Playlist ID and Video ID are required");

  const playlist = await Playlist.findOne({ _id: playlistId, user: req.user._id });
  if (!playlist) throw new ApiError(404, "Playlist not found or unauthorized");

  if (playlist.videos.includes(videoId)) {
    throw new ApiError(400, "Video already in playlist");
  }

  playlist.videos.push(videoId);
  await playlist.save();

  return res.status(200).json(new ApiResponse(200, playlist, "Video added to playlist"));
});
