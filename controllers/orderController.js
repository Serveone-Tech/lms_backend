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

    const userId = req.userId; // ✅ FROM JWT

    // 1️⃣ Verify payment from Razorpay
    const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id);

    if (orderInfo.status !== "paid") {
      return res.status(400).json({ message: "Payment not verified" });
    }

    // 2️⃣ Find order in DB
    const order = await Order.findOne({ razorpay_order_id });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // 3️⃣ Update order
    order.razorpay_payment_id = razorpay_payment_id;
    order.razorpay_signature = razorpay_signature;
    order.isPaid = true;
    order.paidAt = new Date();
    await order.save();

    // 4️⃣ Enroll user
    const user = await User.findById(userId);
    if (!user.enrolledCourses.includes(courseId)) {
      user.enrolledCourses.push(courseId);
      await user.save();
    }

    // 5️⃣ Update course
    const course = await Course.findById(courseId);
    if (!course.enrolledStudents.includes(userId)) {
      course.enrolledStudents.push(userId);
      await course.save();
    }

    return res.status(200).json({
      message: "Payment verified and enrollment successful",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Payment verification failed" });
  }
};
