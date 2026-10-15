import User from "../models/User.mjs";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AppError } from "../utils/AppError.js";

const isProduction = process.env.NODE_ENV === "production";

// إعدادات كوكي الـ Refresh Token موحّدة لكل من register / login / logout
const refreshCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "None" : "Lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 أيام
};

const createTokens = (id) => {
  const accessToken = jwt.sign(
    { UserInfo: { id } },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" },
  );
  const refreshToken = jwt.sign(
    { UserInfo: { id } },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" },
  );
  return { accessToken, refreshToken };
};

const register = async (req, res) => {
  const { first_name, last_name, email, password } = req.body;
  if (!first_name || !last_name || !email || !password) {
    throw new AppError("please fill all fields", 400);
  }
  const foundUser = await User.findOne({ email: email }).exec();
  if (foundUser) {
    throw new AppError("User already exist", 401);
  }
  const hashedpassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    first_name,
    last_name,
    email,
    password: hashedpassword,
  });
  const { accessToken, refreshToken } = createTokens(user._id);
  res.cookie("jwt", refreshToken, refreshCookieOptions);
  res.json({
    accessToken,
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
    role: user.role,
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new AppError("please fill all feilds", 400);
  }
  const foundUser = await User.findOne({ email: email }).exec();
  if (!foundUser) {
    throw new AppError("incorrect email", 401);
  }
  const matched = await bcrypt.compare(password, foundUser.password);
  if (!matched) {
    throw new AppError("incorrect password", 401);
  }
  const { accessToken, refreshToken } = createTokens(foundUser._id);
  res.cookie("jwt", refreshToken, refreshCookieOptions);
  res.json({
    accessToken,
    email: foundUser.email,
    first_name: foundUser.first_name,
    last_name: foundUser.last_name,
    role: foundUser.role,
  });
};

const verifyRefreshToken = (token) =>
  new Promise((resolve, reject) => {
    jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
      if (err) reject(new AppError("forbidden", 403));
      else resolve(decoded);
    });
  });

const refresh = async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) {
    throw new AppError("Unauthorized", 401);
  }
  const decoded = await verifyRefreshToken(cookies.jwt);
  const foundUser = await User.findById(decoded.UserInfo.id).exec();
  if (!foundUser) {
    throw new AppError("not found", 404);
  }
  const accessToken = jwt.sign(
    { UserInfo: { id: foundUser._id } },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" },
  );
  res.status(200).json({ accessToken });
};

const logout = (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) {
    return res.status(201).json({ message: "already out" });
  }
  res.clearCookie("jwt", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "None" : "Lax",
  });
  res.json({ message: "logged out" });
};

export default { register, login, refresh, logout };
