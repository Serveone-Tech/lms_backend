import express from "express";
import { downloadCertificate } from "../controllers/certificateController.js";
import isAuth from "../middlewares/isAuth.js";
import certificateModel from "../models/certificateModel.js";

const certificateRouter = express.Router();

certificateRouter.get("/download/:courseId", isAuth, downloadCertificate);

certificateRouter.get("/verify/:certificateId", async (req, res) => {
  const { certificateId } = req.params;

  const certificate = await certificateModel
    .findOne({ certificateId })
    .populate("user")
    .populate("course");

  if (!certificate || !certificate.isValid) {
    return res.status(404).json({ message: "Invalid Certificate" });
  }

  res.json({
    student: certificate.user.userName,
    course: certificate.course.title,
    issuedAt: certificate.issueDate,
    certificateId: certificate.certificateId,
  });
});

export default certificateRouter;
