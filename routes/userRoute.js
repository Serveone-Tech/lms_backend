import express from "express";
import isAuth from "../middlewares/isAuth.js";
import {
  getCurrentUser,
  UpdateProfile,
} from "../controllers/userController.js";
import upload from "../middlewares/multer.js";
import { getAllUsers } from "../controllers/userController.js";

let userRouter = express.Router();

userRouter.get("/currentuser", isAuth, getCurrentUser);
userRouter.post(
  "/updateprofile",
  isAuth,
  upload.single("photo"),
  UpdateProfile,
);
userRouter.get("/all", isAuth, getAllUsers);

export default userRouter;
