import User from "../models/User.mjs";

const isAdmin = async (req, res, next) => {
  try {
    // console.log(req.user);
    const currentUser = await User.findById(req.user).exec();

    if (!currentUser || currentUser.role !== "admin") {
      return res.status(403).json({ message: "Forbidden: Admin access only" });
    }

    next();
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error in admin verification" });
  }
};

export default isAdmin;
