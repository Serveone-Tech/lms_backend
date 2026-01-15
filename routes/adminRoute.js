import express from "express";
import isAuth from "../middlewares/isAuth.js";
import { getAdminUsers } from "../controllers/userController.js";
import { isAdmin } from "../middlewares/isAdmin.js";

const adminRouter = express.Router();

adminRouter.get("/users", isAuth, isAdmin, getAdminUsers);

export default adminRouter;
