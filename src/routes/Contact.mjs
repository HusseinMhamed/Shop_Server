import { Router } from "express";
import {
  getConacts,
  updateConacts,
} from "../controllers/ContactWebsiteSettings.mjs";
import isAdmin from "../middleware/isAdmin.mjs";
import verifyJWT from "../middleware/verifyJWT.mjs";
import { asyncErrorHandeler } from "../middleware/asyncErrorHandeler.js";
const router = Router();

router.route("/contact-info").get(asyncErrorHandeler(getConacts));

router.use(verifyJWT);
router.use(isAdmin);

router.route("/contact-info").put(asyncErrorHandeler(updateConacts));

export default router;
