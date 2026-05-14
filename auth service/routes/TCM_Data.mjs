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
const router = Router();

router.route("/types").get(getType);
router.route("/categories/:typeId").get(getCategoriesByType);
router.route("/models/:categoryId").get(getModelsByCategory);

router.route("/structure").get(getFullStructure);

router.use(verifyJWT);
router.use(isAdmin);

router.route("/types").post(addType);
router.route("/categories").post(addCategory);
router.route("/models").post(addModel);

router.route("/types/:id").delete(deleteType);
router.route("/categories/:id").delete(deleteCategory);
router.route("/models/:id").delete(deleteModel);

router.route("/types/:id").patch(patchTypes);
router.route("/categories/:id").patch(patchCategory);
router.route("/models/:id").patch(patchModel);

export default router;
