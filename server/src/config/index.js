const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

module.exports = {
  port: process.env.PORT || 5000,
  jwtSecret: process.env.JWT_SECRET || 'fallback-secret-key',
  databaseUrl: process.env.DATABASE_URL,
  // Folder tempat menyimpan file upload (thumbnail, cover, pdf).
  // Di lokal (laptop) default-nya folder "uploads" di dalam project (server/uploads).
  // Di Railway, set env UPLOADS_DIR=/data/uploads agar file tersimpan di Volume (persisten).
  uploadsDir: process.env.UPLOADS_DIR || path.join(__dirname, '../../uploads'),
};
