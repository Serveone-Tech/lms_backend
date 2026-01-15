import mongoose from "mongoose";

const lectureSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true, // title mandatory
      trim: true,
    },

    module: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Module",
      default: null, // baad me assign hoga
    },

    videoUrl: {
      type: String,
      default: "", // baad me upload hoga
    },

    duration: {
      type: Number,
      default: 0,
    },

    isFree: {
      type: Boolean,
      default: false,
    },

    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Lecture", lectureSchema);
