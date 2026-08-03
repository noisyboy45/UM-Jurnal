const express = require('express');
const router = express.Router();
const { getAllBooks, getBookById, createBook, updateBook, deleteBook } = require('../controllers/bookController');
const authMiddleware = require('../middlewares/auth');
const { uploadBook } = require('../middlewares/upload');

router.get('/', getAllBooks);
router.get('/:id', getBookById);
router.post('/', authMiddleware, uploadBook, createBook);
router.put('/:id', authMiddleware, uploadBook, updateBook);
router.delete('/:id', authMiddleware, deleteBook);

module.exports = router;
