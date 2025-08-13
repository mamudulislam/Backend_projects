import mongoose from "mongoose";

const likeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    video: { type: mongoose.Schema.Types.ObjectId, ref: "Video", default: null, index: true },
    comment: { type: mongoose.Schema.Types.ObjectId, ref: "Comment", default: null, index: true },
  },
  { timestamps: true }
);

likeSchema.pre("save", function (next) {
  const hasVideo = !!this.video;
  const hasComment = !!this.comment;
  if (hasVideo === hasComment) {
    return next(new Error("Like must reference exactly one of: video or comment"));
  }
  next();
});

// Prevent duplicate likes on the same target by the same user
likeSchema.index({ user: 1, video: 1 }, { unique: true, partialFilterExpression: { video: { $type: "objectId" } } });
likeSchema.index({ user: 1, comment: 1 }, { unique: true, partialFilterExpression: { comment: { $type: "objectId" } } });

export const Like = mongoose.model("Like", likeSchema);
