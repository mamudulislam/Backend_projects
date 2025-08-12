import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const uploadVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  if (!title || !req.file) throw new ApiError(400, "Video file and title are required");

  // Assume video file path is saved by multer as req.file.path
  const video = await Video.create({
    owner: req.user._id,
    title,
    description,
    videoUrl: req.file.path, // Or Cloudinary URL if uploading to cloud
  });

  return res.status(201).json(new ApiResponse(201, video, "Video uploaded successfully"));
});

export const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const video = await Video.findById(videoId).populate("owner", "username avatar");
  if (!video) throw new ApiError(404, "Video not found");

  return res.status(200).json(new ApiResponse(200, video, "Video fetched successfully"));
});
