import { Schema, model } from "mongoose";

const productSchema = new Schema(
  {
    name: { type: String, required: [true, "Product name is required"] },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Price cannot be negative"],
    },
    // --- حقول الخصم الجديدة ---
    discountPercentage: {
      type: Number,
      default: 0,
      min: [0, "Discount cannot be less than 0"],
      max: [100, "Discount cannot exceed 100"],
    },
    priceAfterDiscount: {
      type: Number,
      default: 0,
    },
    // -----------------------
    description: { type: String, default: "" },
    type: { type: Schema.Types.ObjectId, ref: "Type", required: true },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    model: { type: Schema.Types.ObjectId, ref: "Model", required: true },
    images: [{ type: String }],
    priority: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true },
);

/**
 * Middleware (Pre-save):
 * يقوم بحساب السعر بعد الخصم تلقائياً قبل حفظ المنتج في قاعدة البيانات
 */
productSchema.pre("save", function () {
  if (this.price && this.discountPercentage >= 0) {
    const discountAmount = (this.price * this.discountPercentage) / 100;
    this.priceAfterDiscount = this.price - discountAmount;
  } else {
    this.priceAfterDiscount = this.price;
  }
});

const Product = model("Product", productSchema);
export default Product;
