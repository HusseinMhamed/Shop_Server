import { Router } from "express";
import verifyJWT from "../middleware/verifyJWT.mjs";
import getAllUsers from "../controllers/userController.mjs";
import isAdmin from "../middleware/isAdmin.mjs";
import makeMeAdmin from "../controllers/makeMeAdmin.mjs";

let router = Router();

router.use(verifyJWT);

router.route("/make-me-admin").patch(makeMeAdmin);

router.use(isAdmin);

router.route("/").get(getAllUsers);

export default router;
