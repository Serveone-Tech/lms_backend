import jwt from "jsonwebtoken";

export const genToken = async (userId) => {
  try {
    console.log("Generating token for userId:", userId.toString());
    const token = jwt.sign(
      { userId: userId.toString() },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );
    return token;
  } catch (error) {
    console.error("token error", error);
    throw error;
  }
};
