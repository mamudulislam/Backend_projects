import { asyncHandler } from "../utils/asyncHandler.js";
import { Tweet } from "../models/tweet.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// Create a tweet
export const createTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;
  if (!content?.trim()) throw new ApiError(400, "Tweet content is required");

  const tweet = await Tweet.create({
    user: req.user._id,
    content,
  });

  return res.status(201).json(new ApiResponse(201, tweet, "Tweet posted successfully"));
});

// Get user tweets
export const getUserTweets = asyncHandler(async (req, res) => {
  const userId = req.params.userId || req.user._id;
  const tweets = await Tweet.find({ user: userId }).sort({ createdAt: -1 });

  return res.status(200).json(new ApiResponse(200, tweets, "Tweets fetched successfully"));
});

// Delete a tweet
export const deleteTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const tweet = await Tweet.findById(tweetId);
  if (!tweet) throw new ApiError(404, "Tweet not found");
  if (tweet.user.toString() !== req.user._id.toString())
    throw new ApiError(403, "Unauthorized");

  await tweet.remove();
  return res.status(200).json(new ApiResponse(200, null, "Tweet deleted successfully"));
});
