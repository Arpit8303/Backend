import mongoose, { Schema } from "mongoose";

const likeSchema = new Schema(
  {
    video: {
      type: Schema.Types.ObjectId,
      ref: "Video",
      default: null,
    },
    comment: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },
    tweet: {
      type: Schema.Types.ObjectId,
      ref: "Tweet", // Fixed capitalization to match standard capitalized model casing
      default: null,
    },
    likedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "A like interaction must be associated with a voting User account."],
    },
  },
  { 
    timestamps: true 
  }
);

// Unique Compound Indexes: Prevents a single user from liking the exact same asset multiple times
likeSchema.index({ video: 1, likedBy: 1 }, { unique: true, sparse: true });
likeSchema.index({ comment: 1, likedBy: 1 }, { unique: true, sparse: true });
likeSchema.index({ tweet: 1, likedBy: 1 }, { unique: true, sparse: true });

// Individual lookup optimization index for counting an asset's total likes quickly
likeSchema.index({ likedBy: 1 });

export const Like = mongoose.model("Like", likeSchema);
