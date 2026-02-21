import { genToken } from "../configs/token.js";
import validator from "validator";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import User from "../models/userModel.js";
import sendEmail from "../configs/Mail.js";

export const signUp = async (req, res) => {
  try {
    const { userName, email, password, role } = req.body;

    const existUser = await User.findOne({ email });
    if (existUser) {
      return res.status(400).json({ message: "email already exist" });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "Please enter valid Email" });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const photoUrl = req.file ? `/uploads/users/${req.file.filename}` : "";

    const user = await User.create({
      userName,
      email,
      password: hashPassword,
      role,
      photoUrl,
    });

    const token = await genToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json(user);
  } catch (error) {
    console.log("signUp error", error);
    return res.status(500).json({ message: "Signup failed" });
  }
};

export const login = async (req, res) => {
  try {
    let { email, password } = req.body;
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "user does not exist" });
    }
    console.log("user", user);
    let isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "incorrect Password" });
    }
    let token = await genToken(user._id);
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json(user);
  } catch (error) {
    console.log("login error");
    return res.status(500).json({ message: `login Error ${error}` });
  }
};

export const logOut = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });
    return res.status(200).json({ message: "logOut Successfully" });
  } catch (error) {
    return res.status(500).json({ message: `logout Error ${error}` });
  }
};

export const googleSignup = async (req, res) => {
  try {
    const { userName, email, role } = req.body;
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        userName,
        email,
        role,
      });
    }
    let token = await genToken(user._id);
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.status(200).json(user);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: `googleSignup  ${error}` });
  }
};

export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    ((user.resetOtp = otp),
      (user.otpExpires = Date.now() + 5 * 60 * 1000),
      (user.isOtpVerifed = false));

    await user.save();
    await sendEmail(email, otp);
    return res.status(200).json({ message: "Email Successfully send" });
  } catch (error) {
    return res.status(500).json({ message: `send otp error ${error}` });
  }
};

export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });

  if (
    user.resetOtp !== otp ||
    !user.otpExpires ||
    user.otpExpires < Date.now()
  ) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }

  const resetToken = crypto.randomBytes(32).toString("hex");

  user.resetOtp = resetToken;
  user.otpExpires = Date.now() + 15 * 60 * 1000;
  await user.save();

  res.status(200).json({ resetToken });
};

export const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  const user = await User.findOne({
    resetOtp: token,
    otpExpires: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({ message: "Invalid or expired token" });
  }

  user.password = await bcrypt.hash(newPassword, 10);
  user.resetOtp = undefined;
  user.otpExpires = undefined;

  await user.save();

  res.status(200).json({ message: "Password reset successful" });
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 🔐 Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.resetOtp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    user.isOtpVerifed = false;

    await user.save();

    // ✉️ Send Email
    await sendEmail({
      to: user.email,
      subject: "Password Reset OTP",
      html: `
        <h3>Password Reset</h3>
        <p>Your OTP is:</p>
        <h2>${otp}</h2>
        <p>This OTP is valid for 10 minutes.</p>
      `,
    });

    return res.status(200).json({
      message: "Password reset OTP sent to email",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Forgot password failed" });
  }
};
