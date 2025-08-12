import { asyncHandler } from "../utils/asyncHandler.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const subscribe = asyncHandler(async (req, res) => {
  const { channelId } = req.body;
  if (!channelId) throw new ApiError(400, "Channel ID is required");

  if (channelId === req.user._id.toString()) {
    throw new ApiError(400, "Cannot subscribe to yourself");
  }

  const existingSubscription = await Subscription.findOne({
    subscriber: req.user._id,
    channel: channelId,
  });

  if (existingSubscription) {
    throw new ApiError(400, "Already subscribed to this channel");
  }

  await Subscription.create({
    subscriber: req.user._id,
    channel: channelId,
  });

  return res.status(201).json(new ApiResponse(201, {}, "Subscribed successfully"));
});

export const unsubscribe = asyncHandler(async (req, res) => {
  const { channelId } = req.body;
  if (!channelId) throw new ApiError(400, "Channel ID is required");

  await Subscription.findOneAndDelete({
    subscriber: req.user._id,
    channel: channelId,
  });

  return res.status(200).json(new ApiResponse(200, {}, "Unsubscribed successfully"));
});
