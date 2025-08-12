import { asyncHandler } from "../utils/asyncHandler.js";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const createComment = asyncHandler(async (req, res) => {
  const { videoId, text } = req.body;
  if (!videoId || !text) throw new ApiError(400, "Video ID and comment text are required");

  const comment = await Comment.create({
    video: videoId,
    user: req.user._id,
    text,
  });

  return res.status(201).json(new ApiResponse(201, comment, "Comment created successfully"));
});

export const getCommentsByVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) throw new ApiError(400, "Video ID is required");

  const comments = await Comment.find({ video: videoId })
    .populate("user", "username avatar")
    .sort({ createdAt: -1 });

  return res.status(200).json(new ApiResponse(200, comments, "Comments fetched successfully"));
});

export const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const comment = await Comment.findById(commentId);
  if (!comment) throw new ApiError(404, "Comment not found");

  // Authorization: Only comment owner or admin can delete
  if (!comment.user.equals(req.user._id)) {
    throw new ApiError(403, "Not authorized to delete this comment");
  }

  await comment.remove();

  return res.status(200).json(new ApiResponse(200, {}, "Comment deleted successfully"));
});
