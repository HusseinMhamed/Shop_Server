import User from "../models/User.mjs";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const register = async (req, res) => {
  try {
    const { first_name, last_name, email, password } = req.body;
    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({ message: "please fill all fields" });
    }
    const foundUser = await User.findOne({ email: email }).exec();
    if (foundUser) {
      return res.status(401).json({ message: "User already exist" });
    }
    const hashedpassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      first_name,
      last_name,
      email,
      password: hashedpassword,
    });
    const accessToken = jwt.sign(
      {
        UserInfo: { id: user._id },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" },
    );
    const refreshToken = jwt.sign(
      {
        UserInfo: { id: user._id },
      },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" },
    );
    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });
    res.json({
      accessToken,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
    });
  } catch (err) {
    res.status(500).json({ message: "internal server error" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "please fill all feilds" });
    }
    const foundUser = await User.findOne({ email: email }).exec();
    if (!foundUser) {
      return res.status(401).json({ message: "incorrect email" });
    }
    const matched = await bcrypt.compare(password, foundUser.password);
    if (!matched) {
      return res.status(401).json({ message: "incorrect password" });
    }
    const accessToken = jwt.sign(
      { UserInfo: { id: foundUser._id } },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "15m",
      },
    );
    const refreshToken = jwt.sign(
      { UserInfo: { id: foundUser._id } },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" },
    );
    // console.log(refreshToken);
    res.cookie("jwt", refreshToken, {
      httpOnly: true, // أمان: يمنع الوصول للكوكي عبر JavaScript
      secure: false, // هام جداً: اجعلها false طالما أنك تعمل على localhost (HTTP)
      sameSite: "Lax", // تسمح بإرسال الكوكي في طلبات التنقل العادية (مثل الـ Refresh)
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 أيام
    });
    res.json({
      accessToken,
      email: foundUser.email,
      first_name: foundUser.first_name,
      last_name: foundUser.last_name,
      role: foundUser.role,
    });
  } catch (err) {
    res.status(500).json({ message: "internal server error" });
  }
};

const refresh = (req, res) => {
  const cookies = req.cookies;
  // console.log("cookies", cookies);
  if (!cookies?.jwt) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const refreshToken = cookies.jwt;
  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    async (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: "forbidden" });
      }
      const foundUser = await User.findById(decoded.UserInfo.id).exec();
      if (!foundUser) {
        return res.status(404).json({ message: "not found" });
      }
      const accessToken = jwt.sign(
        { UserInfo: { id: foundUser._id } },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "15m" },
      );

      res.status(200).json({ accessToken });
    },
  );
};

const logout = (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) {
    return res.status(201).json({ message: "already out" });
  }
  res.clearCookie("jwt", {
    httpOnly: true,
    secure: true,
    sameSite: "None",
  });
  res.json({ message: "logged out" });
};

export default { register, login, refresh, logout };
