import express from "express";
import { getAllOrdersForAdmin } from "../../controllers/admin/adminOrderController.js";
import isAuth from "../../middlewares/isAuth.js";
import { isAdmin } from "../../middlewares/isAdmin.js";

const router = express.Router();

router.get("/orders", isAuth, isAdmin, getAllOrdersForAdmin);

export default router;
