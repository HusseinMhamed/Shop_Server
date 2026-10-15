import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import fs from "fs";
import { bootstrap } from "./src/app.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("تم إنشاء مجلد uploads بنجاح");
}

mongoose.connection.on("error", () => {
  console.log("erre");
});

bootstrap(app, express);

app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});
