import allowedOrigins from "./allowedOrigins.mjs";

const corsOptions = {
  origin: (origin, callback) => {
    allowedOrigins.indexOf(origin) !== -1 || !origin
      ? callback(null, true)
      : callback(new Error("not allowed by cors"));
  },
  credentials: true,
  optionSuccessStatus: 200
};

export default corsOptions