import Product from "../models/Product.mjs";
// افترضنا استخدام Cloudinary كما في مشاريعك السابقة
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import fs from "fs";
import { Type, Category, Model } from "../models/ProductsMetaDeta.mjs";
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const getAllStructure = async () => {
  const data = await Type.find().populate({
    path: "categories",
    populate: {
      path: "models",
    },
  });
  return data;
};
const getFullTree = async () => {
  return await Type.aggregate([
    {
      $lookup: {
        from: "categories", // اسم مجموعة الفئات في قاعدة البيانات
        localField: "_id",
        foreignField: "parentType",
        as: "categories",
      },
    },
    {
      $unwind: { path: "$categories", preserveNullAndEmptyArrays: true },
    },
    {
      $lookup: {
        from: "models", // اسم مجموعة الموديلات
        localField: "categories._id",
        foreignField: "parentCategory",
        as: "categories.models",
      },
    },
    {
      $group: {
        _id: "$_id",
        name: { $first: "$name" },
        categories: { $push: "$categories" },
      },
    },
  ]);
};

// /////////////////////////
export const createProduct = async (req, res) => {
  try {
    const { name, price, description, type, category, model } = req.body;

    const isTypeValid = await Type.findById(type);
    if (!isTypeValid) {
      return res.status(400).json({ message: "نوع المنتج غير صالح" });
    }
    const isCategoryValid = await Category.findById(category);
    if (!isCategoryValid || isCategoryValid.parentType.toString() !== type) {
      return res.status(400).json({ message: "فئة المنتج غير صالحة" });
    }
    const isModelValid = await Model.findById(model);
    if (!isModelValid || isModelValid.parentCategory.toString() !== category) {
      return res.status(400).json({ message: "موديل المنتج غير صالح" });
    }

    // التأكد من وجود ملفات مرفوعة
    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ message: "يرجى رفع صورة واحدة على الأقل للمنتج" });
    }

    const files = req.files;

    // رفع الصور بالتوازي (Parallel) لسرعة الأداء
    const uploadPromises = files.map(async (file) => {
      // 1. رفع الصورة إلى Cloudinary
      const result = await cloudinary.uploader.upload(file.path, {
        folder: "store/products",
        transformation: [
          { width: 800, height: 800, crop: "limit" }, // تصغير الصورة إذا كانت أكبر من 800px مع الحفاظ على الأبعاد
          { quality: "auto" }, // ضغط الصورة ذكياً لتقليل الحجم دون التأثير على الجودة
          { fetch_format: "auto" }, // تحويلها لأفضل صيغة يدعمها المتصفح مثل WebP
        ],
      });

      // 2. مسح الملف من مجلد uploads فور انتهاء الرفع
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }

      return result.secure_url;
    });

    const imageUrls = await Promise.all(uploadPromises);

    // إنشاء المنتج في قاعدة البيانات
    const newProduct = new Product({
      name,
      price,
      description,
      images: imageUrls,
      type,
      category,
      model,
    });

    await newProduct.save();

    res.status(201).json({
      success: true,
      message: "تم إضافة المنتج بنجاح",
      product: newProduct,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      success: false,
      message: error.message || "حدث خطأ أثناء إضافة المنتج",
      error: error.message,
    });
  }
};

export const getAllProducts = async (req, res) => {
  try {
    // نستخدم .find() لجلب كل البيانات و .sort() لترتيبها حسب تاريخ الإضافة
    const products = await Product.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "فشل في جلب المنتجات",
      error: error.message,
    });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, description, existingImages } = req.body;

    // 1. معالجة الصور الجديدة إذا وُجدت
    let uploadedImagesUrls = [];
    if (req.files && req.files.length > 0) {
      const files = req.files;

      const uploadPromises = files.map((file) =>
        cloudinary.uploader.upload(file.path, { folder: "shop/products" }),
      );

      const results = await Promise.all(uploadPromises);
      uploadedImagesUrls = results.map((result) => result.secure_url);
    }

    // 2. دمج الصور القديمة (المُرسلة من الفرونت) مع الروابط الجديدة
    // ملاحظة: existingImages تأتي كـ string أو Array حسب عدد الصور
    const finalImages = [
      ...(Array.isArray(existingImages)
        ? existingImages
        : [existingImages].filter(Boolean)),
      ...uploadedImagesUrls,
    ];

    // 3. تحديث البيانات في MongoDB
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        name,
        price,
        description,
        images: finalImages,
      },
      { new: true }, // لإرجاع البيانات بعد التعديل
    );

    res.status(200).json({
      success: true,
      message: "تم تحديث المنتج بنجاح",
      data: updatedProduct,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "خطأ في الخادم",
      error,
    });
  }
};
