import express from "express";
import isAuth from "../middlewares/isAuth.js";
import {
  createCoupon,
  getAllCoupons,
  updateCoupon,
  deleteCoupon,
  toggleCouponStatus,
} from "../controllers/couponController.js";
import { applyCoupon } from "../controllers/couponApplyController.js";

let couponRouter = express.Router();

couponRouter.use(isAuth);

couponRouter.post("/", createCoupon);
couponRouter.get("/", getAllCoupons);
couponRouter.put("/:id", updateCoupon);
couponRouter.patch("/:id/toggle", toggleCouponStatus);
couponRouter.delete("/:id", deleteCoupon);
couponRouter.post("/apply", applyCoupon);

export default couponRouter;
