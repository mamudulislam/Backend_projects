import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js";
import { Video } from "../models/video.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// Export as getAdminDashboard
export const getAdminDashboard = asyncHandler(async (req, res) => {
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
