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
