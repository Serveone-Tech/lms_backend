import Coupon from "../models/couponModel.js";
import Course from "../models/courseModel.js";

export const applyCoupon = async (req, res) => {
  try {
    const { code, courseId } = req.body;
    const userId = req.userId;

    /* 1️⃣ COURSE CHECK */
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const coursePrice = course.price;

    /* 2️⃣ COUPON CHECK */
    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
      isActive: true,
    });

    if (!coupon) {
      return res.status(400).json({ message: "Invalid coupon code" });
    }

    /* 3️⃣ EXPIRY CHECK */
    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      return res.status(400).json({ message: "Coupon expired" });
    }

    /* 4️⃣ USAGE LIMIT */
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ message: "Coupon usage limit reached" });
    }

    /* 5️⃣ MIN AMOUNT CHECK */
    if (coursePrice < coupon.minAmount) {
      return res.status(400).json({
        message: `Minimum amount ₹${coupon.minAmount} required`,
      });
    }

    /* 6️⃣ DISCOUNT CALCULATION */
    let discount = 0;

    if (coupon.discountType === "PERCENT") {
      discount = (coursePrice * coupon.discountValue) / 100;

      if (coupon.maxDiscount) {
        discount = Math.min(discount, coupon.maxDiscount);
      }
    } else {
      discount = coupon.discountValue;
    }

    const finalAmount = Math.max(coursePrice - discount, 0);

    /* 7️⃣ RESPONSE */
    return res.status(200).json({
      success: true,
      coupon: {
        id: coupon._id,
        title: coupon.title,
        code: coupon.code,
      },
      price: coursePrice,
      discount,
      finalAmount,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to apply coupon" });
  }
};
