import { Router } from "express";
import authController from "../controllers/authController.mjs";

let router = Router();

router.route("/refresh").get(authController.refresh);
router.route("/register").post(authController.register);
router.route("/login").post(authController.login);
router.route("/logout").post(authController.logout)
export default router;