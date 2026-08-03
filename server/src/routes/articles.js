const express = require('express');
const router = express.Router();
const { getAllArticles, getArticleById, createArticle, updateArticle, deleteArticle } = require('../controllers/articleController');
const authMiddleware = require('../middlewares/auth');
const { uploadArticle } = require('../middlewares/upload');

router.get('/', getAllArticles);
router.get('/:id', getArticleById);
router.post('/', authMiddleware, uploadArticle, createArticle);
router.put('/:id', authMiddleware, uploadArticle, updateArticle);
router.delete('/:id', authMiddleware, deleteArticle);

module.exports = router;
