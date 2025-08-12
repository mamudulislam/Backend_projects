import { asyncHandler } from "../utils/asyncHandler.js";
import { Tweet } from "../models/tweet.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const postTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;
  if (!content?.trim()) throw new ApiError(400, "Tweet content is required");

  const tweet = await Tweet.create({
    user: req.user._id,
    content,
  });

  return res.status(201).json(new ApiResponse(201, tweet, "Tweet posted successfully"));
});

export const getUserTweets = asyncHandler(async (req, res) => {
  const userId = req.params.userId || req.user._id;
  const tweets = await Tweet.find({ user: userId }).sort({ createdAt: -1 });

  return res.status(200).json(new ApiResponse(200, tweets, "Tweets fetched successfully"));
});
