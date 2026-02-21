import express from "express";
import dotenv from "dotenv";
import connectDb from "./configs/db.js";
import authRouter from "./routes/authRoute.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import userRouter from "./routes/userRoute.js";
import courseRouter from "./routes/courseRoute.js";
import paymentRouter from "./routes/paymentRoute.js";
import aiRouter from "./routes/aiRoute.js";
import reviewRouter from "./routes/reviewRoute.js";
import adminUserRoute from "./routes/admin/adminUserRoute.js";
import adminOrderRoute from "./routes/admin/adminOrderRoute.js";
import progressRouter from "./routes/progressRoute.js";
import couponRouter from "./routes/couponRoute.js";
import certificateRouter from "./routes/certificateRoutes.js";

dotenv.config();

const app = express();

/* ================= MIDDLEWARES ================= */
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: ["http://localhost:3000", "https://lms.zalgoedutech.com"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

/* ================= STATIC FILES ================= */
app.use("/uploads", express.static("public/uploads"));

/* ================= ROUTES ================= */
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/course", courseRouter);
app.use("/api/payment", paymentRouter);
app.use("/api/ai", aiRouter);
app.use("/api/review", reviewRouter);
app.use("/api/admin", adminUserRoute);
app.use("/api/admin", adminOrderRoute);
app.use("/api/progress", progressRouter);
app.use("/api/coupons", couponRouter);
app.use("/api/certificate", certificateRouter);

/* ================= HEALTH CHECK ================= */
app.get("/", (req, res) => {
  res.send("Hello From Zalgo");
});

/* ================= START SERVER ================= */
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDb();
    console.log("✅ Database connected");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server started on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
