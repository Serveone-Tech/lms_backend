import uploadOnCloudinary from "../configs/cloudinary.js";
import Course from "../models/courseModel.js";
import Lecture from "../models/lectureModel.js";
import User from "../models/userModel.js";
import Order from "../models/orderModel.js";
import Module from "../models/moduleModel.js";
import CourseProgress from "../models/courseProgressModel.js";

export const getLecturePlayerData = async (req, res) => {
  try {
    const userId = req.userId;
    const { courseId } = req.params;

    const course = await Course.findById(courseId).populate({
      path: "modules",
      populate: {
        path: "lectures",
        select: "title videoUrl isFree duration",
      },
    });

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const order = await Order.findOne({
      course: courseId,
      student: userId,
      isPaid: true,
    });

    const hasPurchased = !!order;

    const progress =
      (await CourseProgress.findOne({ user: userId, course: courseId })) ||
      (await CourseProgress.create({ user: userId, course: courseId }));

    /* 🔥 IMPORTANT PART – LOCK LOGIC */
    const modules = course.modules.map((module) => ({
      _id: module._id,
      title: module.title,
      lectures: module.lectures.map((lec) => ({
        _id: lec._id,
        title: lec.title,
        videoUrl: lec.videoUrl,
        isFree: lec.isFree,
        duration: lec.duration,
        locked: !hasPurchased && !lec.isFree, // ✅ यही logic चाहिए था
      })),
    }));

    const allLectures = modules.flatMap((m) => m.lectures);

    const progressPercent =
      allLectures.length === 0
        ? 0
        : Math.round(
            (progress.completedLectures.length / allLectures.length) * 100,
          );

    res.json({
      course: {
        _id: course._id,
        title: course.title,
      },
      modules, // ✅ transformed modules
      hasPurchased,
      completedLectures: progress.completedLectures,
      progressPercent,
      watchedTime: progress.watchedTime,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lecture player load failed" });
  }
};

export const createCourse = async (req, res) => {
  try {
    console.log("Creating course with data:", req.body);
    console.log("Creating course userId", req.userId);
    const { title, category, shortDescription, price, thumbnail } = req.body;

    const course = await Course.create({
      title,
      category,
      shortDescription,
      price,
      thumbnail,
      creator: req.userId,
    });

    return res.status(201).json(course);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Course creation failed" });
  }
};

export const getPublishedCourses = async (req, res) => {
  try {
    const courses = await Course.find({ isPublished: true }).populate({
      path: "modules",
      populate: {
        path: "lectures",
        select: "title videoUrl isFree duration",
      },
    });

    return res.status(200).json(courses);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to get published courses" });
  }
};

export const getCreatorCourses = async (req, res) => {
  try {
    const courses = await Course.find({ creator: req.userId }).select(
      "title category price thumbnail isPublished createdAt",
    );

    return res.json(courses);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch courses" });
  }
};

export const updateCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const {
      title,
      subTitle,
      description,
      category,
      level,
      price,
      isPublished,
    } = req.body;
    let thumbnail;
    if (req.file) {
      thumbnail = await uploadOnCloudinary(req.file.path);
    }
    let course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    const updateData = {
      title,
      subTitle,
      description,
      category,
      level,
      price,
      isPublished,
      thumbnail,
    };

    course = await Course.findByIdAndUpdate(courseId, updateData, {
      new: true,
    });
    return res.status(201).json(course);
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Failed to update course ${error}` });
  }
};

export const getCourseById = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId).populate({
      path: "modules",
      populate: {
        path: "lectures",
      },
    });

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.status(200).json(course);
  } catch (err) {
    res.status(500).json({ message: "Failed to get course" });
  }
};

export const deleteCourse = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    await course.deleteOne();
    return res.status(200).json({ message: "Course Removed Successfully" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: `Failed to remove course ${error}` });
  }
};

//create lecture

export const createLecture = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const { lectureTitle, isFree = false } = req.body;
    if (!lectureTitle) {
      return res.status(400).json({ message: "Lecture title required" });
    }

    // 1️⃣ Find module (to get courseId)
    const module = await Module.findById(moduleId);
    if (!module) {
      return res.status(404).json({ message: "Module not found" });
    }

    // 2️⃣ Create lecture WITH course
    const lecture = await Lecture.create({
      title: lectureTitle,
      isFree,
      module: moduleId,
      course: module.course, // ✅ FIX
    });

    // 3️⃣ Push lecture into module
    module.lectures.push(lecture._id);
    await module.save();

    return res.status(201).json(lecture);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Failed to create lecture",
    });
  }
};

export const getCourseLectures = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId).populate({
      path: "modules",
      populate: {
        path: "lectures",
      },
    });

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    return res.status(200).json(course.modules);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to get lectures" });
  }
};

export const updateLecture = async (req, res) => {
  try {
    const { lectureId } = req.params;
    const { title, isFree } = req.body;

    const lecture = await Lecture.findById(lectureId);
    if (!lecture) {
      return res.status(404).json({ message: "Lecture not found" });
    }

    // video upload
    if (req.file) {
      const videoUrl = await uploadOnCloudinary(req.file.path);
      lecture.videoUrl = videoUrl;
      lecture.status = "published";
    }

    if (title) lecture.title = title;
    if (typeof isFree !== "undefined") lecture.isFree = isFree;

    await lecture.save();
    res.status(200).json(lecture);
  } catch (error) {
    res.status(500).json({ message: "Failed to update lecture" });
  }
};

export const deleteLecture = async (req, res) => {
  try {
    const { lectureId } = req.params;

    const lecture = await Lecture.findById(lectureId);
    if (!lecture) {
      return res.status(404).json({ message: "Lecture not found" });
    }

    // remove from module
    await Module.findByIdAndUpdate(lecture.module, {
      $pull: { lectures: lecture._id },
    });

    await lecture.deleteOne();

    res.status(200).json({ message: "Lecture deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete lecture" });
  }
};

//get Creator data

// controllers/userController.js

export const getCreatorById = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await User.findById(userId).select("-password"); // Exclude password

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    res.status(500).json({ message: "get Creator error" });
  }
};

// create module under course

export const createModule = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Module title required" });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const module = await Module.create({
      title,
      course: courseId,
    });

    course.modules.push(module._id);
    await course.save();

    res.status(201).json(module);
  } catch (err) {
    res.status(500).json({ message: "Failed to create module" });
  }
};

export const deleteModule = async (req, res) => {
  try {
    const { moduleId } = req.params;

    const module = await Module.findById(moduleId);
    if (!module) {
      return res.status(404).json({ message: "Module not found" });
    }

    await Lecture.deleteMany({ module: module._id });

    await Course.findByIdAndUpdate(module.course, {
      $pull: { modules: module._id },
    });

    await module.deleteOne();

    return res.status(200).json({ message: "Module deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to delete module" });
  }
};

export const markLectureCompleted = async (req, res) => {
  try {
    const userId = req.userId;
    const { lectureId } = req.params;

    const lecture = await Lecture.findById(lectureId);
    if (!lecture) {
      return res.status(404).json({ message: "Lecture not found" });
    }

    let progress = await CourseProgress.findOne({
      user: userId,
      course: lecture.course,
    });

    if (!progress) {
      progress = await CourseProgress.create({
        user: userId,
        course: lecture.course,
      });
    }

    if (!progress.completedLectures.includes(lectureId)) {
      progress.completedLectures.push(lectureId);
      await progress.save();
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Failed to mark lecture completed" });
  }
};

export const updateLastWatchedLecture = async (req, res) => {
  const userId = req.userId;
  const { lectureId } = req.params;

  const lecture = await Lecture.findById(lectureId);

  await CourseProgress.findOneAndUpdate(
    { user: userId, course: lecture.course },
    { lastLecture: lectureId },
    { upsert: true },
  );

  res.json({ success: true });
};

export const getMyEnrolledCourses = async (req, res) => {
  try {
    const userId = req.userId;

    /* 1️⃣ USER */
    const user = await User.findById(userId).select("enrolledCourses");
    console.log("user448", user);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    /* 2️⃣ COURSES */
    const courses = await Course.find({
      _id: { $in: user.enrolledCourses },
    })
      .select("title category modules")
      .populate({
        path: "modules",
        select: "lectures",
      });

    /* 3️⃣ COURSE PROGRESS */
    const progressDocs = await CourseProgress.find({
      user: userId,
    });

    const progressMap = {};
    progressDocs.forEach((p) => {
      progressMap[p.course.toString()] = p.completedLectures.length;
    });

    /* 4️⃣ BUILD RESPONSE */
    const response = courses.map((course) => {
      const totalLectures = course.modules.reduce(
        (sum, mod) => sum + mod.lectures.length,
        0,
      );

      const completed = progressMap[course._id.toString()] || 0;

      const progress =
        totalLectures === 0 ? 0 : Math.round((completed / totalLectures) * 100);

      return {
        _id: course._id,
        title: course.title,
        category: course.category,
        progress,
      };
    });

    return res.status(200).json(response);
  } catch (error) {
    console.error("getMyEnrolledCourses error:", error);
    return res
      .status(500)
      .json({ message: "Failed to fetch enrolled courses" });
  }
};
