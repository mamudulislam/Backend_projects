import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { Video } from "../models/video.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const getDashboardStats = asyncHandler(async (req, res) => {
  // Example: Return total users, videos, and recent uploads
  const totalUsers = await User.countDocuments();
  const totalVideos = await Video.countDocuments();
  const recentVideos = await Video.find().sort({ createdAt: -1 }).limit(5);

  return res.status(200).json(
    new ApiResponse(200, {
      totalUsers,
      totalVideos,
      recentVideos,
    }, "Dashboard stats fetched successfully")
  );
});
