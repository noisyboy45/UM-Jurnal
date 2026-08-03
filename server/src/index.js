const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { port, uploadsDir } = require('./config');
const errorHandler = require('./middlewares/errorHandler');
const { handleMulterError } = require('./middlewares/upload');

const authRoutes = require('./routes/auth');
const articleRoutes = require('./routes/articles');
const bookRoutes = require('./routes/books');
const scientificRoutes = require('./routes/scientific');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const projectRoot = path.join(__dirname, '../../');
app.use(express.static(projectRoot));

// Pastikan folder uploads (lokal ATAU volume /data di Railway) sudah ada
// sebelum diserve, supaya tidak error saat pertama kali dijalankan.
['article', 'book', 'scientific'].forEach((sub) => {
  fs.mkdirSync(path.join(uploadsDir, sub), { recursive: true });
});
app.use('/uploads', express.static(uploadsDir));

app.use('/api/auth', authRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/scientific', scientificRoutes);

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is running' });
});

app.use(handleMulterError);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Frontend: http://localhost:${port}/index.html`);
  console.log(`API: http://localhost:${port}/api`);
});

module.exports = app;
