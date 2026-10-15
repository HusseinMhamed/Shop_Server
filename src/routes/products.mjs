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

const router = Router();

router.get("/all", getAllProducts);

router.route("/:id").get(productDetails);
// لإنشاء منتج جديد
router.use(verifyJWT);
router.use(isAdmin);

router.post("/create", upload.array("images", 6), createProduct);

// لتعديل منتج موجود (الذي كنا نعمل عليه)

router.put("/:id", updateProductWithImages);

router.delete("/:id", deleteProduct);

export default router;
