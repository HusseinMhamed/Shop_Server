import { Router } from "express";
import authController from "../controllers/authController.mjs";
import { asyncErrorHandeler } from "../middleware/asyncErrorHandeler.js";

let router = Router();

router.route("/refresh").get(asyncErrorHandeler(authController.refresh));
router.route("/register").post(asyncErrorHandeler(authController.register));
router.route("/login").post(asyncErrorHandeler(authController.login));
router.route("/logout").post(asyncErrorHandeler(authController.logout));
export default router;
