import express from "express";
import { getAllUsersForAdmin } from "../../controllers/admin/adminUserController.js";
import isAuth from "../../middlewares/isAuth.js";

const router = express.Router();

router.get("/users", isAuth, getAllUsersForAdmin);

export default router;
