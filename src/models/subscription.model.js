import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    subscriber: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    channel: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // subscribedAt: {
    //   type: Date,
    //   default: Date.now,
    // },
  },
  {
    timestamps: true, 
  }
);

// Prevent duplicate subscriptions
subscriptionSchema.index({ subscriber: 1, subscribedTo: 1 }, { unique: true });

export const Subscription = mongoose.model("Subscription", subscriptionSchema);
