import jwt from "jsonwebtoken";

const verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  // console.log("authHeader", authHeader);
  if (!authHeader?.startsWith("Bearer")) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const token = authHeader.split(" ")[1];
  // console.log(token);
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      console.log(err.message);
      // إذا كان الخطأ هو انتهاء الصلاحية
      if (err.name === "TokenExpiredError") {
        return res
          .status(401)
          .json({ message: "Expired Token", isExpired: true });
      }
      return res.status(403).json({ message: "Forbidden" });
    }
    req.user = decoded.UserInfo.id;
    next();
  });
};

export default verifyJWT;
