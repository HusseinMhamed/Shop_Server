import { Router } from "express";
import verifyJWT from "../middleware/verifyJWT.mjs";
import getAllUsers from "../controllers/userController.mjs";
import isAdmin from "../middleware/isAdmin.mjs";

let router = Router();

router.use(verifyJWT);

router.use(isAdmin);

router.route("/").get(getAllUsers);

export default router;
