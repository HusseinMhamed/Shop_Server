import User from "../models/User.mjs";
import { AppError } from "../utils/AppError.js";

const getAllUsers = async (req, res) => {
  const users = await User.find().select("-password").lean();
  if (!users.length) {
    throw new AppError("no users found", 400);
  }
  res.json(users);
};

export default getAllUsers;
