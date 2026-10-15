import { Router } from "express";
import {
  getConacts,
  updateConacts,
} from "../controllers/ContactWebsiteSettings.mjs";
import isAdmin from "../middleware/isAdmin.mjs";
import verifyJWT from "../middleware/verifyJWT.mjs";
const router = Router();

router.route("/contact-info").get(getConacts);

router.use(verifyJWT);
router.use(isAdmin);

router.route("/contact-info").put(updateConacts);

export default router;
