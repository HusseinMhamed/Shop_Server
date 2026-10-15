import { Router } from "express";
import {
  addType,
  addCategory,
  addModel,
  getType,
  getCategoriesByType,
  getFullStructure,
  getModelsByCategory,
  deleteType,
  deleteModel,
  patchTypes,
  patchCategory,
  deleteCategory,
  patchModel,
} from "../controllers/ProductsMetaDeta.mjs";
import isAdmin from "../middleware/isAdmin.mjs";
import verifyJWT from "../middleware/verifyJWT.mjs";
import { asyncErrorHandeler } from "../middleware/asyncErrorHandeler.js";
const router = Router();

router.route("/types").get(asyncErrorHandeler(getType));
router
  .route("/categories/:typeId")
  .get(asyncErrorHandeler(getCategoriesByType));
router.route("/models/:categoryId").get(asyncErrorHandeler(getModelsByCategory));

router.route("/structure").get(asyncErrorHandeler(getFullStructure));

router.use(verifyJWT);
router.use(isAdmin);

router.route("/types").post(asyncErrorHandeler(addType));
router.route("/categories").post(asyncErrorHandeler(addCategory));
router.route("/models").post(asyncErrorHandeler(addModel));

router.route("/types/:id").delete(asyncErrorHandeler(deleteType));
router.route("/categories/:id").delete(asyncErrorHandeler(deleteCategory));
router.route("/models/:id").delete(asyncErrorHandeler(deleteModel));

router.route("/types/:id").patch(asyncErrorHandeler(patchTypes));
router.route("/categories/:id").patch(asyncErrorHandeler(patchCategory));
router.route("/models/:id").patch(asyncErrorHandeler(patchModel));

export default router;
