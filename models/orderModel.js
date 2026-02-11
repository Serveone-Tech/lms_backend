import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    // 🔹 SINGLE COURSE (CURRENT FLOW – REQUIRED)
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    // 🔹 STUDENT
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // 🔹 RAZORPAY DATA
    razorpay_order_id: {
      type: String,
      required: true,
    },

    razorpay_payment_id: {
      type: String,
      default: null,
    },

    razorpay_signature: {
      type: String,
      default: null,
    },

    // 🔹 PAYMENT INFO
    amount: {
      type: Number, // final amount (after discount if any)
      required: true,
    },

    currency: {
      type: String,
      default: "INR",
    },

    // 🔹 COUPON SUPPORT (OPTIONAL – SAFE)
    coupon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coupon",
      default: null,
    },

    discount: {
      type: Number, // amount discounted
      default: 0,
    },

    // 🔹 PAYMENT STATUS
    isPaid: {
      type: Boolean,
      default: false,
    },

    paidAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// 🔹 INDEX (OPTIONAL BUT GOOD)
// Prevent duplicate paid orders for same user & course
orderSchema.index(
  { student: 1, course: 1, isPaid: 1 },
  { unique: true, partialFilterExpression: { isPaid: true } },
);

const Order = mongoose.model("Order", orderSchema);

export default Order;
