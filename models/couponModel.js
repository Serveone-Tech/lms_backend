import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    // 🏷️ Admin friendly title
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    // 🎫 Actual coupon code
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    // 💸 Discount type
    discountType: {
      type: String,
      enum: ["PERCENT", "FLAT"],
      required: true,
    },

    // 💰 Discount value
    discountValue: {
      type: Number,
      required: true,
    },

    // 🧾 Minimum cart amount
    minAmount: {
      type: Number,
      default: 0,
    },

    // 🔒 Safety cap (for percent coupons)
    maxDiscount: {
      type: Number,
      default: null,
    },

    // ⏰ Expiry
    expiresAt: {
      type: Date,
      default: null,
    },

    // 🔁 Usage limit
    usageLimit: {
      type: Number,
      default: null,
    },

    usedCount: {
      type: Number,
      default: 0,
    },

    // 🔛 Enable / Disable
    isActive: {
      type: Boolean,
      default: true,
    },

    // 👑 Created by admin
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Coupon", couponSchema);
