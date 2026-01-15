import express from "express";
import { getAllUsersForAdmin } from "../../controllers/admin/adminUserController.js";
import isAuth from "../../middlewares/isAuth.js";
import { isAdmin } from "../../middlewares/isAdmin.js";

const router = express.Router();

router.get("/users", isAuth, isAdmin, getAllUsersForAdmin);

export default router;
