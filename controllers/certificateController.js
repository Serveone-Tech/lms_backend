import puppeteer from "puppeteer";
import QRCode from "qrcode";
import Certificate from "../models/certificateModel.js";
import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";
import Course from "../models/courseModel.js";
import CourseProgress from "../models/courseProgressModel.js";
import User from "../models/userModel.js";
import { generateCertificateHTML } from "../certificates/certificateTemplate.js";

export const downloadCertificate = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.userId;

    const progress = await CourseProgress.findOne({
      user: userId,
      course: courseId,
    });

    if (!progress) {
      return res.status(400).json({ message: "Course not completed" });
    }
    // 🔍 Check if certificate already exists
    let certificate = await Certificate.findOne({
      user: userId,
      course: courseId,
    });

    if (!certificate) {
      const certificateId = uuidv4();

      const rawData = `${userId}-${courseId}-${Date.now()}`;

      const blockchainHash = crypto
        .createHash("sha256")
        .update(rawData)
        .digest("hex");

      certificate = await Certificate.create({
        certificateId,
        user: userId,
        course: courseId,
        blockchainHash,
      });
    }

    const user = await User.findById(userId);
    const course = await Course.findById(courseId);

    const certificateId = certificate.certificateId;

    const verificationUrl = `${process.env.BASE_URL}/verify/${certificateId}`;

    const qrCodeImage = await QRCode.toDataURL(verificationUrl);

    const html = generateCertificateHTML({
      studentName: user.userName,
      courseName: course.title,
      issueDate: new Date(),
      certificateId,
      qrCodeImage,
    });

    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setContent(html);

    const pdf = await page.pdf({
      format: "A4",
      landscape: true,
      printBackground: true,
    });

    await browser.close();

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=certificate.pdf",
    });

    res.send(pdf);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Certificate generation failed" });
  }
};
