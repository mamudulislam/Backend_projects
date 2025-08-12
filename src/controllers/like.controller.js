import { asyncHandler } from "../utils/asyncHandler.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const toggleLike = asyncHandler(async (req, res) => {
  const { videoId } = req.body;
  if (!videoId) throw new ApiError(400, "Video ID is required");

  const existingLike = await Like.findOne({ video: videoId, user: req.user._id });
  if (existingLike) {
    await existingLike.remove();
    return res.status(200).json(new ApiResponse(200, { liked: false }, "Like removed"));
  }

  const newLike = await Like.create({ video: videoId, user: req.user._id });
  return res.status(201).json(new ApiResponse(201, { liked: true }, "Video liked"));
});
