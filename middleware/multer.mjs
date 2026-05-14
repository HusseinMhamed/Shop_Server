import multer from "multer";
import path from "path";

/**
 * إعداد التخزين (Storage)
 * نستخدم diskStorage لرفع الملفات مؤقتاً على السيرفر قبل نقلها للسحاب
 */
const storage = multer.diskStorage({
  // تحديد المجلد المؤقت لحفظ الصور
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // تأكد من إنشاء مجلد باسم uploads في جذور المشروع
  },

  // توليد اسم فريد للملف لتجنب التكرار ومشاكل الترميز العربي
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname),
    );
  },
});

/**
 * فحص نوع الملفات (File Filter)
 * لضمان أن المستخدم يرفع صوراً فقط
 */
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("عذراً، يجب رفع ملفات صور فقط!"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // حد أقصى 5 ميجابايت للصورة الواحدة
  },
});

export default upload;
