import { Video } from "../models/video.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/Cludinary.js";

// Upload video
export const uploadVideo = asyncHandler(async (req, res) => {
  try {
    const { title, description, duration } = req.body;
    const videoFile = req.files?.video?.[0]?.path;
    const thumbnailFile = req.files?.thumbnail?.[0]?.path;

    if (!videoFile || !thumbnailFile) {
      throw new ApiError(400, "Video file and thumbnail are required");
    }

    const uploadedVideo = await uploadOnCloudinary(videoFile);
    const uploadedThumbnail = await uploadOnCloudinary(thumbnailFile);

    const video = await Video.create({
      title,
      description,
      duration,
      videoFile: uploadedVideo.secure_url,
      thumbnail: uploadedThumbnail.secure_url,
      owner: req.user._id,
    });

    return res
      .status(201)
      .json(new ApiResponse(201, video, "Video uploaded successfully"));
  } catch (error) {
    throw error;
  }
});

// Get all videos
export const getVideos = asyncHandler(async (req, res) => {
  const videos = await Video.find().populate("owner", "username avatar");
  return res.status(200).json(new ApiResponse(200, videos, "Videos fetched successfully"));
});

// Get video by ID
export const getVideoById = asyncHandler(async (req, res) => {
  const video = await Video.findById(req.params.id).populate("owner", "username avatar");
  if (!video) throw new ApiError(404, "Video not found");
  return res.status(200).json(new ApiResponse(200, video, "Video fetched successfully"));
});

// Increment view count
export const incrementViews = asyncHandler(async (req, res) => {
  const video = await Video.findByIdAndUpdate(
    req.params.id,
    { $inc: { views: 1 } },
    { new: true }
  );
  if (!video) throw new ApiError(404, "Video not found");
  return res.status(200).json(new ApiResponse(200, video, "Views incremented"));
});
