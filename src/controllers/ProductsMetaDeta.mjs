import Product from "../models/Product.mjs";
import { Type, Category, Model } from "../models/ProductsMetaDeta.mjs";
// --- إظهار البيانات ---

// 1. جلب كل الهيكلة (للقائمة الجانبية مثلاً)
export const getFullStructure = async (req, res) => {
  try {
    const structure = await Type.find().populate({
      path: "categories",
      populate: { path: "models" },
    });
    res.status(200).json({
      status: "success",
      data: structure,
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message || "فشل جلب البيانات حاول مجدداً لاحقاً",
    });
  }
};

export const getModelsByCategory = async (req, res) => {
  try {
    // if (!req.params.categoryId) {
    //   return res.status(400).json({ message: "يرجى تقديم معرف الفئة" });
    // }
    const models = await Model.find({ parentCategory: req.params.categoryId });
    res.status(200).json({
      status: "success",
      data: models,
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message || "فشل جلب الموديلات حاول مجدداً لاحقاً",
    });
  }
};

// 2. جلب الفئات التابعة لنوع معين
export const getCategoriesByType = async (req, res) => {
  try {
    // if (!req.params.typeId) {
    //   return res.status(400).json({ message: "يرجى تقديم معرف النوع" });
    // }
    const categories = await Category.find({ parentType: req.params.typeId });
    res.status(200).json({
      status: "success",
      data: categories,
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message || "فشل جلب الفئات حاول مجدداً لاحقاً",
    });
  }
};

export const getType = async (req, res) => {
  try {
    const Types = await Type.find();
    res.status(200).json({
      status: "success",
      data: Types,
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message || "فشل جلب الأنواع حاول مجدداً لاحقاً",
    });
  }
};

// --- إضافة البيانات ---

// 3. إضافة نوع جديد
export const addType = async (req, res) => {
  try {
    const newType = await Type.create({ name: req.body.name });
    res.status(201).json({
      status: "success",
      data: newType,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        status: "fail",
        message: "هذا الاسم مسجل مسبقاً",
      });
    }
    res.status(400).json({
      status: "fail",
      message: error.message || " فشل إضافة النوع حاول مجدداً لاحقاً",
    });
  }
};

// 4. إضافة فئة مرتبطة بنوع
export const addCategory = async (req, res) => {
  try {
    const parentType = await Type.findById(req.body.typeId);
    if (!parentType) {
      return res.status(404).json({ message: "النوع غير موجود" });
    }
    const newCategory = await Category.create({
      name: req.body.name,
      parentType: req.body.typeId,
    });
    res.status(201).json({
      status: "success",
      data: newCategory,
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message || "فشل إضافة الفئة حاول مجدداً لاحقاً",
    });
  }
};

export const addModel = async (req, res) => {
  try {
    const parentCategory = await Category.findById(req.body.categoryId);
    if (!parentCategory) {
      return res.status(404).json({ message: "الفئة غير موجودة" });
    }
    const newModel = await Model.create({
      name: req.body.name,
      parentCategory: req.body.categoryId,
    });
    res.status(201).json({
      status: "success",
      data: newModel,
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message || "فشل إضافة الموديل حاول مجدداً لاحقاً",
    });
  }
};

export const deleteType = async (req, res) => {
  try {
    const typeId = req.params.id;

    // 1. جلب جميع الفئات التابعة لهذا النوع قبل حذفها
    // نحتاج معرفات الفئات (IDs) لكي نعرف ما هي الموديلات التي سنحذفها
    const relatedCategories = await Category.find({
      parentType: typeId,
    }).select("_id");
    const categoryIds = relatedCategories.map((cat) => cat._id);

    // 2. حذف جميع الموديلات التي تنتمي لأي فئة من الفئات التي وجدناها
    if (categoryIds.length > 0) {
      await Model.deleteMany({ parentCategory: { $in: categoryIds } });
    }

    // 3. الآن نحذف جميع الفئات التابعة للنوع
    await Category.deleteMany({ parentType: typeId });

    await Product.deleteMany({ type: typeId });

    // 4. أخيراً، نحذف النوع نفسه
    const deletedType = await Type.findByIdAndDelete(typeId);

    if (!deletedType) {
      return res.status(404).json({ message: "النوع غير موجود" });
    }

    res.json({
      message: "تم حذف النوع وكل الفئات والموديلات و المنتجات التابعة له بنجاح",
      details: {
        categoriesDeleted: categoryIds.length,
        typeId: typeId,
      },
    });
  } catch (error) {
    console.log("Cascade Delete Error:", error);
    res
      .status(500)
      .json({ message: error.message || "حدث خطأ أثناء الحذف المتسلسل" });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const cateId = req.params.id;

    await Model.deleteMany({ parentCategory: cateId });

    await Product.deleteMany({ category: cateId });

    // 4. أخيراً، نحذف الفئة نفسه
    const deletedCateg = await Category.findByIdAndDelete(cateId);

    if (!deletedCateg) {
      return res.status(404).json({ message: "الفئة غير موجود" });
    }

    res.json({
      message: "تم حذف الفئة وكل الموديلات و المنتجات التابعة له بنجاح",
    });
  } catch (error) {
    console.log("Cascade Delete Error:", error);
    res
      .status(500)
      .json({ message: error.message || "حدث خطأ أثناء الحذف المتسلسل" });
  }
};
export const deleteModel = async (req, res) => {
  try {
    const modelId = req.params.id;

    await Product.deleteMany({ model: modelId });

    // 4. أخيراً، نحذف الفئة نفسه
    const deletedModel = await Model.findByIdAndDelete(modelId);

    if (!deletedModel) {
      return res.status(404).json({ message: "الموديل غير موجود" });
    }

    res.json({
      message: "تم حذف الموديل وكل المنتجات التابعة له بنجاح",
    });
  } catch (error) {
    console.log("Cascade Delete Error:", error);
    res
      .status(500)
      .json({ message: error.message || "حدث خطأ أثناء الحذف المتسلسل" });
  }
};

export const patchTypes = async (req, res) => {
  try {
    const updated = await Type.findByIdAndUpdate(
      req.params.id,
      { name: req.body.name },
      { new: true, runValidators: true },
    );

    res.json({
      data: updated,
      state: "success",
      message: "تم تعديل اسم النوع بنجاح",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const patchCategory = async (req, res) => {
  try {
    const updated = await Category.findByIdAndUpdate(
      req.params.id,
      { name: req.body.name },
      { new: true, runValidators: true },
    );
    res.json({
      data: updated,
      state: "success",
      message: "تم تعديل اسم الفئة بنجاح",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const patchModel = async (req, res) => {
  try {
    const updated = await Model.findByIdAndUpdate(
      req.params.id,
      { name: req.body.name },
      { new: true, runValidators: true },
    );

    res.json({
      data: updated,
      state: "success",
      message: "تم تعديل اسم الموديل بنجاح",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
