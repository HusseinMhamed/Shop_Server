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
    const { type, category, model } = req.query;
    // console.log("Received query parameters:", { type, category, model });
    let products;
    if (model)
      products = await Product.find({ model }).sort({
        isFeatured: -1,
        priority: -1,
        createdAt: -1,
      });
    else if (category)
      products = await Product.find({ category }).sort({
        isFeatured: -1,
        priority: -1,
        createdAt: -1,
      });
    else if (type)
      products = await Product.find({ type }).sort({
        isFeatured: -1,
        priority: -1,
        createdAt: -1,
      });
    else
      // نستخدم .find() لجلب كل البيانات و .sort() لترتيبها حسب تاريخ الإضافة
      products = await Product.find().sort({
        isFeatured: -1,
        priority: -1,
        createdAt: -1,
      });

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

export const updateProductWithImages = async (req, res) => {
  try {
    const { id } = req.params;
    const { images, ...otherData } = req.body; // images هي المصفوفة القادمة من الفرونت إند

    if (images && (images.length > 6 || images.length === 0)) {
      return res.status(400).json({
        success: false,
        message: "عذراً، الحد الأقصى المسموح به هو 6 صور فقط",
      });
    }

    // 1. جلب المنتج الحالي من القاعدة لمعرفة الصور القديمة
    const oldProduct = await Product.findById(id);
    if (!oldProduct)
      return res.status(404).json({ message: "المنتج غير موجود" });

    // 2. تحديد الصور التي تم حذفها من الفرونت إند لمسحها من Cloudinary
    // أي صورة كانت موجودة في oldProduct.images وليست موجودة في images القادمة
    const imagesToDelete = oldProduct.images.filter(
      (imgUrl) => !images.includes(imgUrl),
    );

    for (const url of imagesToDelete) {
      try {
        // استخراج الـ public_id من الرابط
        const publicId = url.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(`store/products/${publicId}`);
      } catch (err) {
        console.error("فشل حذف صورة من Cloudinary:", err);
      }
    }

    // 3. معالجة الصور القادمة (الرفع أو الإبقاء)
    const finalImages = [];
    for (const img of images) {
      if (img.startsWith("data:image")) {
        // هذه صورة جديدة (Base64) تحتاج رفع
        const uploadRes = await cloudinary.uploader.upload(img, {
          folder: "store/products",
          transformation: [
            { width: 800, height: 800, crop: "limit" }, // تصغير الصورة إذا كانت أكبر من 800px مع الحفاظ على الأبعاد
            { quality: "auto" }, // ضغط الصورة ذكياً لتقليل الحجم دون التأثير على الجودة
            { fetch_format: "auto" }, // تحويلها لأفضل صيغة يدعمها المتصفح مثل WebP
          ],
        });
        finalImages.push(uploadRes.secure_url);
      } else {
        // هذا رابط قديم، نحتفظ به كما هو
        finalImages.push(img);
      }
    }
    // -------------------------------------------------------

    // حساب السعر بعد الخصم قبل التحديث لضمان دقة البيانات
    let updatePayload = { ...otherData, images: finalImages };

    if (
      updatePayload.price !== undefined ||
      updatePayload.discountPercentage !== undefined
    ) {
      const price = updatePayload.price ?? oldProduct.price;
      const discount =
        updatePayload.discountPercentage ?? oldProduct.discountPercentage;
      updatePayload.priceAfterDiscount = price - price * (discount / 100);
    }
    // 4. تحديث المنتج في قاعدة البيانات
    const updatedProduct = await Product.findByIdAndUpdate(id, updatePayload, {
      returnDocument: "after",
      runValidators: true,
    }).populate("type category model");

    res.status(200).json({
      success: true,
      data: updatedProduct,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "حدث خطأ أثناء التحديث" });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. البحث عن المنتج أولاً لجلب روابط الصور
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "المنتج غير موجود",
      });
    }

    // 2. حذف الصور من Cloudinary (اختياري ولكن ينصح به)
    // نفترض أنك تخزن الـ public_id أو روابط يمكن استخراج الـ ID منها
    if (product.images && product.images.length > 0) {
      const deletePromises = product.images.map((imgUrl) => {
        // استخراج الـ public_id من الرابط إذا لم تكن تخزنه بشكل منفصل
        // غالباً ما يكون الجزء الأخير من الرابط قبل الامتداد
        const publicId = imgUrl.split("/").pop().split(".")[0];
        return cloudinary.uploader.destroy(`store/products/${publicId}`);
      });
      await Promise.all(deletePromises);
    }

    // 3. حذف المنتج من قاعدة البيانات
    await Product.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "تم حذف المنتج وجميع الصور التابعة له بنجاح",
    });
  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء محاولة الحذف",
      error: error.message,
    });
  }
};

export const productDetails = async (req, res) => {
  try {
    const { id } = req.params;

    // التحقق من صحة المعرف (اختياري ولكن ينصح به)
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "معرف المنتج غير صالح" });
    }

    const product = await Product.findById(id)
      .populate("type", "name") // جلب حقل الاسم فقط من موديل الأنواع
      .populate("category", "name") // جلب حقل الاسم فقط من موديل الفئات
      .populate("model", "name"); // جلب حقل الاسم فقط من موديل الموديلات

    if (!product) {
      return res.status(404).json({ message: "هذا المنتج غير موجود" });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("Error fetching product details:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ في الخادم أثناء جلب تفاصيل المنتج",
    });
  }
};
