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

const router = Router();

router.get("/all", getAllProducts);
// لإنشاء منتج جديد

router.use(isAdmin);

router.post("/create", upload.array("images", 6), createProduct);

// لتعديل منتج موجود (الذي كنا نعمل عليه)

router.put("/:id", updateProductWithImages);

router.delete("/:id", deleteProduct);

router.route("/:id").get(productDetails);

export default router;
