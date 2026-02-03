import express from "express";
import isAuth from "../middlewares/isAuth.js";
import { getAdminUsers } from "../controllers/userController.js";

const adminRouter = express.Router();

adminRouter.get("/users", isAuth, getAdminUsers);

export default adminRouter;
