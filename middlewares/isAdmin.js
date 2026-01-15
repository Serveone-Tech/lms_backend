export const isAdmin = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized: User not authenticated",
      });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Forbidden: Admin access only",
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      message: "Admin authorization failed",
    });
  }
};
