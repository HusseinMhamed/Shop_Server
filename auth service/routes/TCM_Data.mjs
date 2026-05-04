import { Router } from "express";
import {
  addType,
  addCategory,
  addModel,
  getType,
  getCategoriesByType,
  getFullStructure,
  getModelsByCategory,
} from "../controllers/ProductsMetaDeta.mjs";
const router = Router();

router.route("/types").post(addType);
router.route("/categories").post(addCategory);
router.route("/models").post(addModel);

router.route("/types").get(getType);
router.route("/categories/:typeId").get(getCategoriesByType);
router.route("/models/:categoryId").get(getModelsByCategory);

router.route("/structure").get(getFullStructure);

export default router;
