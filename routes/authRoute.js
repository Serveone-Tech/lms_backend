import express from "express";
import {
  googleSignup,
  login,
  logOut,
  resetPassword,
  sendOtp,
  signUp,
  verifyOtp,
} from "../controllers/authController.js";
import { genToken } from "../configs/token.js";
import jwt from "jsonwebtoken";
import upload from "../middlewares/multer.js";

const authRouter = express.Router();

authRouter.post("/issue-token", (req, res) => {
  const { userId } = req.body; // 🔥 frontend से आएगा

  if (!userId) {
    return res.status(400).json({ message: "userId required" });
  }

  const backendToken = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.cookie("token", backendToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
  });

  res.json({ success: true });
});

authRouter.post("/signup", upload.single("photo"), signUp);

authRouter.post("/sign-in", login);

authRouter.get("/logout", logOut);
authRouter.post("/googlesignup", googleSignup);
authRouter.post("/sendotp", sendOtp);
authRouter.post("/verifyotp", verifyOtp);
authRouter.post("/reset-password", resetPassword);

export default authRouter;
