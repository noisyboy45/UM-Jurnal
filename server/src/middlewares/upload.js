const multer = require('multer');
const path = require('path');
const fs = require('fs');
const AppError = require('../utils/AppError');
const { uploadsDir } = require('../config');

const storage = (subfolder) =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      const dest = path.join(uploadsDir, subfolder);
      // Pastikan folder tujuan selalu ada (mis. setelah Volume baru dipasang di Railway
      // atau saat pertama kali dijalankan di lokal), supaya tidak error ENOENT.
      fs.mkdirSync(dest, { recursive: true });
      cb(null, dest);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      cb(null, uniqueSuffix + ext);
    },
  });

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Tipe file tidak diizinkan. Hanya jpg, jpeg, png, dan pdf yang diperbolehkan.', 400), false);
  }
};

const uploadArticle = multer({
  storage: storage('article'),
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 },
}).fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'pdfFile', maxCount: 1 },
]);

const uploadBook = multer({
  storage: storage('book'),
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 },
}).fields([
  { name: 'cover', maxCount: 1 },
  { name: 'pdfFile', maxCount: 1 },
]);

const uploadScientific = multer({
  storage: storage('scientific'),
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 },
}).single('pdfFile');

const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'Ukuran file terlalu besar.',
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
  next(err);
};

module.exports = { uploadArticle, uploadBook, uploadScientific, handleMulterError };
