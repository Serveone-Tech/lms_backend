import CourseProgress from "../models/courseProgressModel.js";

export const markLectureCompleted = async (req, res) => {
  try {
    const userId = req.userId;
    const { courseId, lectureId, watchedSeconds } = req.body;

    let progress = await CourseProgress.findOne({
      user: userId,
      course: courseId,
    });

    if (!progress) {
      progress = await CourseProgress.create({
        user: userId,
        course: courseId,
      });
    }

    if (!progress.completedLectures.includes(lectureId)) {
      progress.completedLectures.push(lectureId);
    }

    if (watchedSeconds) {
      progress.watchedTime += watchedSeconds;
    }

    await progress.save();

    res.status(200).json({ message: "Lecture marked completed" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Progress update failed" });
  }
};
