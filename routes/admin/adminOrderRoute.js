import express from "express";
import { getAllOrdersForAdmin } from "../../controllers/admin/adminOrderController.js";
import isAuth from "../../middlewares/isAuth.js";

const router = express.Router();

router.get("/orders", isAuth, getAllOrdersForAdmin);

export default router;
