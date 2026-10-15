import { Router } from "express";
import verifyJWT from "../middleware/verifyJWT.mjs";
import getAllUsers from "../controllers/userController.mjs";
import isAdmin from "../middleware/isAdmin.mjs";
import { makeUserAdmin } from "../utils/makeUserAdmin.js";
import { asyncErrorHandeler } from "../middleware/asyncErrorHandeler.js";

let router = Router();

router.use(verifyJWT);

router.use(isAdmin);

router.patch("/makeuseradmin", asyncErrorHandeler(makeUserAdmin));

router.route("/").get(asyncErrorHandeler(getAllUsers));

export default router;
