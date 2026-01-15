import express from "express";
import isAuth from "../middlewares/isAuth.js";
import { markLectureCompleted } from "../controllers/progressController.js";

const progressRouter = express.Router();

progressRouter.post("/lecture-complete", isAuth, markLectureCompleted);

export default progressRouter;
