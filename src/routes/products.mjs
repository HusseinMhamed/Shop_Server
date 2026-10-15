import { Router } from "express";
import upload from "../middleware/multer.mjs"; // استخدام الإعدادات الجاهزة التي شرحناها
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  productDetails,
  updateProductWithImages,
} from "../controllers/products.mjs";
import isAdmin from "../middleware/isAdmin.mjs";
import verifyJWT from "../middleware/verifyJWT.mjs";
import { asyncErrorHandeler } from "../middleware/asyncErrorHandeler.js";

const router = Router();

router.get("/all", asyncErrorHandeler(getAllProducts));

router.route("/:id").get(asyncErrorHandeler(productDetails));
// لإنشاء منتج جديد
router.use(verifyJWT);
router.use(isAdmin);

router.post(
  "/create",
  upload.array("images", 6),
  asyncErrorHandeler(createProduct),
);

// لتعديل منتج موجود (الذي كنا نعمل عليه)

router.put("/:id", asyncErrorHandeler(updateProductWithImages));

router.delete("/:id", asyncErrorHandeler(deleteProduct));

export default router;
