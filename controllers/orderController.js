import Course from "../models/courseModel.js";
import razorpay from "razorpay";
import User from "../models/userModel.js";
import dotenv from "dotenv";
import Order from "../models/orderModel.js";
dotenv.config();
const razorpayInstance = new razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

export const createOrder = async (req, res) => {
  try {
    const existing = await Order.findOne({
      student: req.userId,
      course: courseId,
      isPaid: true,
    });

    if (existing) {
      return res.status(400).json({
        message: "Course already purchased",
      });
    }

    const { courseId } = req.body;
    const userId = req.userId;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const options = {
      amount: course.price * 100,
      currency: "INR",
      receipt: `${courseId}_${userId}`,
    };

    const razorpayOrder = await razorpayInstance.orders.create(options);

    // ✅ SAVE ORDER IN DB
    await Order.create({
      course: courseId,
      student: userId,
      razorpay_order_id: razorpayOrder.id,
      amount: course.price,
      currency: "INR",
      isPaid: false,
    });

    return res.status(200).json(razorpayOrder);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Order creation failed" });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      courseId,
    } = req.body;

    const userId = req.userId;

    /* 1️⃣ VERIFY SIGNATURE */
    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid payment signature" });
    }

    /* 2️⃣ FIND ORDER */
    const order = await Order.findOne({
      razorpay_order_id,
      student: userId,
      course: courseId,
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.isPaid) {
      return res.status(200).json({ message: "Already paid" });
    }

    /* 3️⃣ MARK ORDER PAID */
    order.razorpay_payment_id = razorpay_payment_id;
    order.razorpay_signature = razorpay_signature;
    order.isPaid = true;
    order.paidAt = new Date();
    await order.save();

    /* 4️⃣ ENROLL USER */
    await User.findByIdAndUpdate(userId, {
      $addToSet: { enrolledCourses: courseId },
    });

    await Course.findByIdAndUpdate(courseId, {
      $addToSet: { enrolledStudents: userId },
    });

    /* 5️⃣ CREATE COURSE PROGRESS (IMPORTANT) */
    await CourseProgress.findOneAndUpdate(
      { user: userId, course: courseId },
      { user: userId, course: courseId },
      { upsert: true, new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Payment verified & course unlocked",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Payment verification failed" });
  }
};
