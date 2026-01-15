import mongoose from "mongoose";

const courseProgressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    completedLectures: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lecture",
      },
    ],
    watchedTime: {
      type: Number, // seconds
      default: 0,
    },
  },
  { timestamps: true }
);

courseProgressSchema.index({ user: 1, course: 1 }, { unique: true });

export default mongoose.model("CourseProgress", courseProgressSchema);
