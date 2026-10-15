// import express from 'express'
import { Router } from "express";
import { fileURLToPath } from "url";
import path from "path";
import auth from "./authRoutes.mjs";
import usersrouter from "./userRoutes.mjs";
import productsRouter from "./products.mjs";
import TCMRouter from "./TCM_Data.mjs";
import ContactRouter from "./Contact.mjs";
let orgPath = fileURLToPath(import.meta.url);
let dirPath = path.join(path.dirname(orgPath), "..", "views", "index.html");

// console.log( orgPath)
// console.log( dirPath)
const router = Router();

router.use("/auth", auth);
router.use("/users", usersrouter);
router.get("/", (req, res) => {
  res.sendFile(dirPath);
});

router.use("/products", productsRouter);

router.use("/productsmetadata", TCMRouter);

router.use("/contact", ContactRouter);

export default router;
