import { Router } from "express";
import upload from "../middleware/multer.mjs"; // استخدام الإعدادات الجاهزة التي شرحناها
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  productDetails,
  updateProductWithImages,
} from "../controllers/products.mjs";

const router = Router();

// لإنشاء منتج جديد
router.post("/create", upload.array("images", 6), createProduct);

router.get("/all", getAllProducts);

// لتعديل منتج موجود (الذي كنا نعمل عليه)

router.put("/:id", updateProductWithImages);

router.delete("/:id", deleteProduct);

router.route("/:id").get(productDetails);

export default router;
