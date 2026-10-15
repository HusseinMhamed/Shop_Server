import Product from "../models/Product.mjs";
import { Type, Category, Model } from "../models/ProductsMetaDeta.mjs";
import { AppError } from "../utils/AppError.js";
// --- إظهار البيانات ---

// 1. جلب كل الهيكلة (للقائمة الجانبية مثلاً)
export const getFullStructure = async (req, res) => {
  const structure = await Type.find().populate({
    path: "categories",
    populate: { path: "models" },
  });
  res.status(200).json({
    status: "success",
    data: structure,
  });
};

export const getModelsByCategory = async (req, res) => {
  const models = await Model.find({ parentCategory: req.params.categoryId });
  res.status(200).json({
    status: "success",
    data: models,
  });
};

// 2. جلب الفئات التابعة لنوع معين
export const getCategoriesByType = async (req, res) => {
  const categories = await Category.find({ parentType: req.params.typeId });
  res.status(200).json({
    status: "success",
    data: categories,
  });
};

export const getType = async (req, res) => {
  const Types = await Type.find();
  res.status(200).json({
    status: "success",
    data: Types,
  });
};

// --- إضافة البيانات ---

// 3. إضافة نوع جديد
export const addType = async (req, res) => {
  const newType = await Type.create({ name: req.body.name });
  res.status(201).json({
    status: "success",
    data: newType,
  });
};

// 4. إضافة فئة مرتبطة بنوع
export const addCategory = async (req, res) => {
  const parentType = await Type.findById(req.body.typeId);
  if (!parentType) {
    throw new AppError("النوع غير موجود", 404);
  }
  const newCategory = await Category.create({
    name: req.body.name,
    parentType: req.body.typeId,
  });
  res.status(201).json({
    status: "success",
    data: newCategory,
  });
};

export const addModel = async (req, res) => {
  const parentCategory = await Category.findById(req.body.categoryId);
  if (!parentCategory) {
    throw new AppError("الفئة غير موجودة", 404);
  }
  const newModel = await Model.create({
    name: req.body.name,
    parentCategory: req.body.categoryId,
  });
  res.status(201).json({
    status: "success",
    data: newModel,
  });
};

export const deleteType = async (req, res) => {
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
    throw new AppError("النوع غير موجود", 404);
  }

  res.json({
    message: "تم حذف النوع وكل الفئات والموديلات و المنتجات التابعة له بنجاح",
    details: {
      categoriesDeleted: categoryIds.length,
      typeId: typeId,
    },
  });
};

export const deleteCategory = async (req, res) => {
  const cateId = req.params.id;

  await Model.deleteMany({ parentCategory: cateId });

  await Product.deleteMany({ category: cateId });

  // 4. أخيراً، نحذف الفئة نفسه
  const deletedCateg = await Category.findByIdAndDelete(cateId);

  if (!deletedCateg) {
    throw new AppError("الفئة غير موجود", 404);
  }

  res.json({
    message: "تم حذف الفئة وكل الموديلات و المنتجات التابعة له بنجاح",
  });
};

export const deleteModel = async (req, res) => {
  const modelId = req.params.id;

  await Product.deleteMany({ model: modelId });

  // 4. أخيراً، نحذف الفئة نفسه
  const deletedModel = await Model.findByIdAndDelete(modelId);

  if (!deletedModel) {
    throw new AppError("الموديل غير موجود", 404);
  }

  res.json({
    message: "تم حذف الموديل وكل المنتجات التابعة له بنجاح",
  });
};

export const patchTypes = async (req, res) => {
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
};

export const patchCategory = async (req, res) => {
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
};

export const patchModel = async (req, res) => {
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
};
