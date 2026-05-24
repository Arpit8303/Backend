import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema(
  {
    videoFile: {
      type: String,
      required: [true, "Video file storage location path is mandatory."],
      trim: true,
    },
    thumbnail: {
      type: String,
      required: [true, "Video thumbnail image asset route is mandatory."],
      trim: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "A video entry must be linked to a valid account creator owner."],
      index: true, // Speeds up queries like "Find all videos by this user"
    },
    title: {
      type: String,
      required: [true, "Video title field is mandatory."],
      trim: true,
      index: true, // Speeds up video search algorithms significantly
    },
    description: {
      type: String,
      required: [true, "Video text description breakdown is mandatory."],
      trim: true,
    },
    duration: {
      type: Number, // Fixed capitalization typo 'NUmber'
      required: [true, "Media playback length duration in seconds is mandatory."],
      min: [0, "Video length duration constraints cannot fall below a zero integer threshold."],
    },
    views: {
      type: Number,
      default: 0,
      min: [0, "Video interaction counter tallies cannot scale into negative integer spaces."],
    },
    isPublished: {
      type: Boolean,
      default: true,
      index: true, // Speeds up dashboard queries filtering only public content
    },
  },
  { 
    timestamps: true 
  }
);

// Optimize database lookup speeds by implementing compound query indexes
videoSchema.index({ title: "text", description: "text" });

// Mount aggregate pagination tracking plugins
videoSchema.plugin(mongooseAggregatePaginate);

export const Video = mongoose.model("Video", videoSchema);
