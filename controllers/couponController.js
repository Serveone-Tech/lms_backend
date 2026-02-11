import Coupon from "../models/couponModel.js";

export const createCoupon = async (req, res) => {
  try {
    const {
      title,
      description,
      code,
      discountType,
      discountValue,
      minAmount,
      maxDiscount,
      expiresAt,
      usageLimit,
      isActive,
    } = req.body;

    const coupon = await Coupon.create({
      title,
      description,
      code,
      discountType,
      discountValue,
      minAmount,
      maxDiscount,
      expiresAt,
      usageLimit,
      isActive,
      createdBy: req.userId,
    });

    res.status(201).json(coupon);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create coupon" });
  }
};

/* ===========================
   GET ALL COUPONS (ADMIN)
=========================== */
export const getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch coupons" });
  }
};

/* ===========================
   UPDATE COUPON
=========================== */
export const updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    res.json(coupon);
  } catch (error) {
    res.status(500).json({ message: "Failed to update coupon" });
  }
};

/* ===========================
   TOGGLE ACTIVE / INACTIVE
=========================== */
export const toggleCouponStatus = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    coupon.isActive = !coupon.isActive;
    await coupon.save();

    res.json(coupon);
  } catch (error) {
    res.status(500).json({ message: "Failed to toggle coupon" });
  }
};

/* ===========================
   DELETE COUPON
=========================== */
export const deleteCoupon = async (req, res) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete coupon" });
  }
};
