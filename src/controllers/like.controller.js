import { asyncHandler } from "../utils/asyncHandler.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// Like a video
export const likeVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) throw new ApiError(400, "Video ID is required");

  const existingLike = await Like.findOne({ video: videoId, user: req.user._id });
  if (existingLike) {
    return res.status(400).json(new ApiResponse(400, null, "Already liked"));
  }

  const newLike = await Like.create({ video: videoId, user: req.user._id });
  res.status(201).json(new ApiResponse(201, newLike, "Video liked"));
});

// Unlike a video
export const unlikeVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) throw new ApiError(400, "Video ID is required");

  const existingLike = await Like.findOne({ video: videoId, user: req.user._id });
  if (!existingLike) {
    return res.status(404).json(new ApiResponse(404, null, "Like not found"));
  }

  await existingLike.remove();
  res.status(200).json(new ApiResponse(200, null, "Like removed"));
});

// Get likes of a video
export const getVideoLikes = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) throw new ApiError(400, "Video ID is required");

  const likes = await Like.find({ video: videoId }).populate("user", "username avatar");
  res.status(200).json(new ApiResponse(200, likes, "Video likes retrieved"));
});
