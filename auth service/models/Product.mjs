import { Schema, model, Document } from "mongoose";


const productSchema = new Schema(
  {
    name: { type: String, required: [true, "Product name is required"] },
    price: { type: Number, required: [true, "Product price is required"] },
    description: { type: String, default: "" },
    type: {
      type: Schema.Types.ObjectId,
      ref: "Type",
      required: [true, "Product type is required"],
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Product category is required"],
    },
    model: {
      type: Schema.Types.ObjectId,
      ref: "Model",
      required: [true, "Product model is required"],
    },
    images: [{ type: String }], // مصفوفة لتخزين روابط الصور
  },
  { timestamps: true },
);
const Product = model("Product", productSchema);
export default Product;
