import mongoose from "mongoose";

// 1. موديل النوع (Type) - مثال: (رجالي، نسائي، أطفال)

const typeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

// 2. موديل الفئة (Category) - مثال: (أحذية، ملابس، إكسسوارات)
const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    parentType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Type",
      required: true,
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

// 3. موديل الموديل (Model/Sub-Category) - مثال: (سنيكرز، كلاسيك، جري)
const modelSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    parentCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

typeSchema.virtual("categories", {
  ref: "Category",
  localField: "_id",
  foreignField: "parentType",
});

// في ملف Category Schema
categorySchema.virtual("models", {
  ref: "Model",
  localField: "_id",
  foreignField: "parentCategory",
});
export const Type = mongoose.model("Type", typeSchema);
export const Category = mongoose.model("Category", categorySchema);
export const Model = mongoose.model("Model", modelSchema);
