import User from "../../models/userModel.js";

export const getAllUsersForAdmin = async (req, res) => {
  try {
    const users = await User.find()
      .select("name email createdAt")
      .sort({ createdAt: -1 });

    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};
