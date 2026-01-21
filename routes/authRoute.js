import express from "express";
import jwt from "jsonwebtoken";
import {
  googleSignup,
  login,
  logOut,
  resetPassword,
  sendOtp,
  signUp,
  verifyOtp,
} from "../controllers/authController.js";

const authRouter = express.Router();

authRouter.post("/signup", signUp);

authRouter.post("/sign-in", login);

authRouter.post("/issue-token", (req, res) => {
  const jwtToken = jwt.sign({ userId: req.userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.cookie("token", jwtToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
  });

  res.json({ success: true });
});

authRouter.get("/logout", logOut);
authRouter.post("/googlesignup", googleSignup);
authRouter.post("/sendotp", sendOtp);
authRouter.post("/verifyotp", verifyOtp);
authRouter.post("/reset-password", resetPassword);

export default authRouter;
