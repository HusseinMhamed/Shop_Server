import { AppError } from "../utils/AppError.js";

export const globalErrorHandeller = (err, req, res, next) => {
  let status = err.status || 500;
  let message = err.message || "internal server error";

  if (err instanceof AppError) {
    status = err.status;
    message = err.message;
  } else if (err.code === 11000) {
    status = 400;
    message = "هذا الاسم مسجل مسبقاً";
  } else if (err.name === "CastError") {
    status = 400;
    message = "معرف غير صالح";
  } else if (err.name === "ValidationError") {
    status = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
  }

  res.status(status).json({ success: false, message });
};
