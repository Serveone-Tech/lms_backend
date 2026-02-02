import express from "express";
import isAuth from "../middlewares/isAuth.js";
import upload from "../middlewares/multer.js";

import {
  createCourse,
  getPublishedCourses,
  getCreatorCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  createLecture,
  getCourseLectures,
  updateLecture,
  deleteLecture,
  getCreatorById,
  getLecturePlayerData,
  createModule,
  deleteModule,
  markLectureCompleted,
  updateLastWatchedLecture,
  getMyEnrolledCourses,
} from "../controllers/courseController.js";

const courseRouter = express.Router();

/* =====================================================
   COURSE ROUTES
===================================================== */

// Create new course (ADMIN)
courseRouter.post(
  "/create",
  isAuth,
  (req, res, next) => {
    const isMultipart = req.headers["content-type"]?.includes(
      "multipart/form-data",
    );

    if (!isMultipart) return next();
    upload.single("thumbnail")(req, res, next);
  },
  createCourse,
);

// Get all published courses (USER)
courseRouter.get("/published", getPublishedCourses);

// Get logged-in creator courses (ADMIN)
courseRouter.get("/creator", isAuth, getCreatorCourses);

// Get single course by ID (ADMIN / USER)
courseRouter.get("/:courseId", isAuth, getCourseById);

// Update course (title, category, isPublished, thumbnail)
courseRouter.put(
  "/:courseId",
  isAuth,
  upload.single("thumbnail"),
  updateCourse,
);

// Delete course (ADMIN)
courseRouter.delete("/:courseId", isAuth, deleteCourse);

/* =====================================================
   LECTURE ROUTES
===================================================== */

// Create lecture under course
courseRouter.post("/lecture/:moduleId", isAuth, createLecture);

// Get lectures of a course
courseRouter.get("/lecture/:courseId", isAuth, getCourseLectures);

// Update lecture (video upload, preview flag)
courseRouter.put(
  "/lecture/:lectureId",
  isAuth,
  upload.single("video"),
  updateLecture,
);

// Delete lecture
courseRouter.delete("/lecture/:lectureId", isAuth, deleteLecture);

/* =====================================================
   CREATOR ROUTE
===================================================== */

// Get creator profile (ADMIN)
courseRouter.get("/creator/profile", isAuth, getCreatorById);

courseRouter.get("/:courseId/lecture-player", isAuth, getLecturePlayerData);

// create module

courseRouter.post("/:courseId/module", isAuth, createModule);

courseRouter.delete("/module/:moduleId", isAuth, deleteModule);

courseRouter.post("/lecture/:lectureId/complete", isAuth, markLectureCompleted);

courseRouter.post(
  "/lecture/:lectureId/watch",
  isAuth,
  updateLastWatchedLecture,
);

courseRouter.get("/user/my-enrolled", isAuth, getMyEnrolledCourses);

courseRouter.put("/module/:moduleId", isAuth, async (req, res) => {
  try {
    const { title } = req.body;
    const { moduleId } = req.params;

    if (!title) {
      return res.status(400).json({ message: "Module title required" });
    }

    const module = await Module.findByIdAndUpdate(
      moduleId,
      { title },
      { new: true },
    );

    if (!module) {
      return res.status(404).json({ message: "Module not found" });
    }

    res.json(module);
  } catch (e) {
    res.status(500).json({ message: "Failed to update module" });
  }
});

export default courseRouter;
