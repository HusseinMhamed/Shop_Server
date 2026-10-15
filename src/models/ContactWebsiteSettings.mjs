// const mongoose = require("mongoose");
import { Schema, model } from "mongoose";

const contactFieldSchema = new Schema({
  // نستخدم id من نوع string ليطابق Date.now().toString() المرسل من الفرونت إند
  id: { type: String, required: true },
  label: { type: String, required: true },
  value: { type: String, required: true },
  type: {
    type: String,
    enum: ["text", "email", "phone", "link"],
    default: "text",
  },
});

const websiteSettingsSchema = new Schema({
  // مصفوفة تحتوي على الحقول بترتيبها الذي حدده المستخدم
  contacts: { type: [contactFieldSchema], default: [] },
  updatedAt: { type: Date, default: Date.now },
});

const ContactWebsiteSettings = model(
  "ContactWebsiteSettings",
  websiteSettingsSchema,
);
export default ContactWebsiteSettings;
