import { Router } from "express";
import {
  getConacts,
  updateConacts,
} from "../controllers/ContactWebsiteSettings.mjs";
import isAdmin from "../middleware/isAdmin.mjs";
const router = Router();

router.route("/contact-info").get(getConacts);

router.use(isAdmin);

router.route("/contact-info").put(updateConacts);

export default router;
