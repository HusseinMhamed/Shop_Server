// const express = require("express");
// const router = express.Router();
// const WebsiteSettings = require("../models/WebsiteSettings");
import ContactWebsiteSettings from "../models/ContactWebsiteSettings.mjs";
// 1. جلب بيانات التواصل
export const getConacts = async (req, res) => {
  // console.log("contacts");
  try {
    // نفترض وجود مستند واحد فقط لإعدادات الموقع
    let settings = await ContactWebsiteSettings.findOne();

    // إذا لم يكن هناك إعدادات بعد، نرسل مصفوفة فارغة
    if (!settings) {
      return res.status(200).json({ contacts: [] });
    }

    res.status(200).json({ contacts: settings.contacts, state: "success" });
  } catch (err) {
    res.status(500).json({ message: err.message || "خطأ في جلب البيانات" });
  }
};

// 2. حفظ أو تحديث البيانات (كل المصفوفة دفعة واحدة)
export const updateConacts = async (req, res) => {
  try {
    const { contacts } = req.body; // المصفوفة القادمة من React

    // التحديث أو الإنشاء (Upsert)
    let settings = await ContactWebsiteSettings.findOne();
    if (!settings) {
      settings = new ContactWebsiteSettings();
    }
    if (contacts && contacts.length > 0) {
      settings.contacts = contacts;
      await settings.save();
    } else {
      settings.contacts = [];
      await settings.save();
    }

    res.status(200).json({
      message: "تم حفظ البيانات بنجاح",
      contacts: settings.contacts,
      state: "success",
    });
  } catch (err) {
    console.log(err.message);
    res
      .status(400)
      .json({ message: "خطأ في حفظ البيانات", error: err.message });
  }
};
