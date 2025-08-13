import { Comment } from "../models/comment.model.js";

export const getVideoComments = async (req, res) => {
  try {
    const videoId = req.params.videoId;
    const comments = await Comment.find({ video: videoId }).populate("user", "username avatar");
    res.status(200).json({ success: true, comments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addComment = async (req, res) => {
  try {
    const videoId = req.params.videoId;
    const { text } = req.body;
    const comment = await Comment.create({
      text,
      video: videoId,
      user: req.user._id
    });
    res.status(201).json({ success: true, comment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
