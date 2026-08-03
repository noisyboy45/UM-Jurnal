const prisma = require('../config/database');
const { successResponse, errorResponse } = require('../utils/response');
const fs = require('fs');
const path = require('path');

const getAllArticles = async (req, res) => {
  try {
    const articles = await prisma.article.findMany({
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return successResponse(res, 'Artikel berhasil diambil.', { articles });
  } catch (error) {
    console.error('GetArticles error:', error);
    return errorResponse(res, 'Gagal mengambil data artikel.', 500);
  }
};

const getArticleById = async (req, res) => {
  try {
    const { id } = req.params;
    const article = await prisma.article.findUnique({
      where: { id },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    if (!article) {
      return errorResponse(res, 'Artikel tidak ditemukan.', 404);
    }
    return successResponse(res, 'Artikel berhasil diambil.', { article });
  } catch (error) {
    console.error('GetArticle error:', error);
    return errorResponse(res, 'Gagal mengambil data artikel.', 500);
  }
};

const createArticle = async (req, res) => {
  try {
    const { title, content, abstract } = req.body;
    if (!title) {
      return errorResponse(res, 'Judul wajib diisi.');
    }

    const thumbnail = req.file ? req.file.filename : null;

    const article = await prisma.article.create({
      data: {
        title,
        content: content || null,
        abstract: abstract || null,
        thumbnail,
        userId: req.user.id,
      },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    return successResponse(res, 'Artikel berhasil dibuat.', { article }, 201);
  } catch (error) {
    console.error('CreateArticle error:', error);
    return errorResponse(res, 'Gagal membuat artikel.', 500);
  }
};

const updateArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, abstract } = req.body;

    const existing = await prisma.article.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse(res, 'Artikel tidak ditemukan.', 404);
    }
    if (existing.userId !== req.user.id) {
      return errorResponse(res, 'Anda tidak memiliki akses untuk mengubah artikel ini.', 403);
    }

    let thumbnail = existing.thumbnail;
    if (req.file) {
      if (existing.thumbnail) {
        const oldPath = path.join(__dirname, '../../uploads/article', existing.thumbnail);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      thumbnail = req.file.filename;
    }

    const article = await prisma.article.update({
      where: { id },
      data: {
        title: title || existing.title,
        content: content !== undefined ? content : existing.content,
        abstract: abstract !== undefined ? abstract : existing.abstract,
        thumbnail,
      },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    return successResponse(res, 'Artikel berhasil diubah.', { article });
  } catch (error) {
    console.error('UpdateArticle error:', error);
    return errorResponse(res, 'Gagal mengubah artikel.', 500);
  }
};

const deleteArticle = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.article.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse(res, 'Artikel tidak ditemukan.', 404);
    }
    if (existing.userId !== req.user.id) {
      return errorResponse(res, 'Anda tidak memiliki akses untuk menghapus artikel ini.', 403);
    }

    if (existing.thumbnail) {
      const thumbPath = path.join(__dirname, '../../uploads/article', existing.thumbnail);
      if (fs.existsSync(thumbPath)) fs.unlinkSync(thumbPath);
    }

    await prisma.article.delete({ where: { id } });

    return successResponse(res, 'Artikel berhasil dihapus.');
  } catch (error) {
    console.error('DeleteArticle error:', error);
    return errorResponse(res, 'Gagal menghapus artikel.', 500);
  }
};

module.exports = { getAllArticles, getArticleById, createArticle, updateArticle, deleteArticle };
