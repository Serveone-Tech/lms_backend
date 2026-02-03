import uploadOnCloudinary from "../configs/cloudinary.js";
import User from "../models/userModel.js";
import Order from "../models/orderModel.js";

export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .select("-password")
      .populate("enrolledCourses");

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isProfileComplete =
      !!user.userName && !!user.description && !!user.photoUrl;

    return res.status(200).json({
      user,
      isProfileComplete,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: "get current user error" });
  }
};

export const UpdateProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const { userName, description } = req.body;

    const updateData = {};

    if (userName) updateData.userName = userName;
    if (description) updateData.description = description;

    if (req.file) {
      const uploaded = await uploadOnCloudinary(req.file.path);
      updateData.photoUrl = uploaded;
    }

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }, // 🔥 updated user return karega
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "Profile updated successfully",
      user,
      isProfileComplete:
        !!user.userName && !!user.description && !!user.photoUrl,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Update Profile Error" });
  }
};

// ADMIN: get all users
export const getAllUsers = async (req, res) => {
  try {
    // OPTIONAL: role check (recommended)
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const users = await User.find().select("-password");
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch users" });
  }
};

export const getAdminUsers = async (req, res) => {
  try {
    const { search, courseId, status, fromDate, toDate } = req.query;

    // 1️⃣ Fetch users
    let users = await User.find().select("userName email createdAt");

    // Search filter (userName/email)
    if (search) {
      const keyword = search.toLowerCase();
      users = users.filter(
        (u) =>
          u.userName.toLowerCase().includes(keyword) ||
          u.email.toLowerCase().includes(keyword),
      );
    }

    // 2️⃣ Fetch paid orders
    const orderQuery = { isPaid: true };

    if (courseId) orderQuery.course = courseId;

    if (fromDate || toDate) {
      orderQuery.createdAt = {};
      if (fromDate) orderQuery.createdAt.$gte = new Date(fromDate);
      if (toDate) orderQuery.createdAt.$lte = new Date(toDate);
    }

    const orders = await Order.find(orderQuery)
      .populate("course", "title")
      .populate("student", "userName email");

    // 3️⃣ Map orders by user
    const orderMap = new Map();
    orders.forEach((order) => {
      orderMap.set(order.student._id.toString(), order);
    });

    // 4️⃣ Merge users + orders
    let result = users.map((user) => {
      const order = orderMap.get(user._id.toString());

      return {
        userId: user._id,
        userName: user.userName,
        email: user.email,
        joinedAt: user.createdAt,
        hasPurchased: !!order,
        courseName: order?.course?.title || null,
        amountPaid: order?.amount || null,
        purchasedAt: order?.createdAt || null,
      };
    });

    // Status filter
    if (status === "paid") {
      result = result.filter((u) => u.hasPurchased);
    }
    if (status === "unpaid") {
      result = result.filter((u) => !u.hasPurchased);
    }

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
