const prisma = require('../config/database');
const { successResponse, errorResponse } = require('../utils/response');
const fs = require('fs');
const path = require('path');

const getAllBooks = async (req, res) => {
  try {
    const books = await prisma.book.findMany({
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return successResponse(res, 'Buku berhasil diambil.', { books });
  } catch (error) {
    console.error('GetBooks error:', error);
    return errorResponse(res, 'Gagal mengambil data buku.', 500);
  }
};

const getBookById = async (req, res) => {
  try {
    const { id } = req.params;
    const book = await prisma.book.findUnique({
      where: { id },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    if (!book) {
      return errorResponse(res, 'Buku tidak ditemukan.', 404);
    }
    return successResponse(res, 'Buku berhasil diambil.', { book });
  } catch (error) {
    console.error('GetBook error:', error);
    return errorResponse(res, 'Gagal mengambil data buku.', 500);
  }
};

const createBook = async (req, res) => {
  try {
    const { title, author, year, synopsis } = req.body;
    if (!title) {
      return errorResponse(res, 'Judul wajib diisi.');
    }

    const cover = req.files && req.files.cover ? req.files.cover[0].filename : null;
    const pdfFile = req.files && req.files.pdfFile ? req.files.pdfFile[0].filename : null;

    const book = await prisma.book.create({
      data: {
        title,
        author: author || null,
        year: year || null,
        synopsis: synopsis || null,
        cover,
        pdfFile,
        userId: req.user.id,
      },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    return successResponse(res, 'Buku berhasil dibuat.', { book }, 201);
  } catch (error) {
    console.error('CreateBook error:', error);
    return errorResponse(res, 'Gagal membuat buku.', 500);
  }
};

const updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, author, year, synopsis } = req.body;

    const existing = await prisma.book.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse(res, 'Buku tidak ditemukan.', 404);
    }
    if (existing.userId !== req.user.id) {
      return errorResponse(res, 'Anda tidak memiliki akses untuk mengubah buku ini.', 403);
    }

    let cover = existing.cover;
    let pdfFile = existing.pdfFile;

    if (req.files && req.files.cover) {
      if (existing.cover) {
        const oldPath = path.join(__dirname, '../../uploads/book', existing.cover);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      cover = req.files.cover[0].filename;
    }

    if (req.files && req.files.pdfFile) {
      if (existing.pdfFile) {
        const oldPath = path.join(__dirname, '../../uploads/book', existing.pdfFile);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      pdfFile = req.files.pdfFile[0].filename;
    }

    const book = await prisma.book.update({
      where: { id },
      data: {
        title: title || existing.title,
        author: author !== undefined ? author : existing.author,
        year: year !== undefined ? year : existing.year,
        synopsis: synopsis !== undefined ? synopsis : existing.synopsis,
        cover,
        pdfFile,
      },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    return successResponse(res, 'Buku berhasil diubah.', { book });
  } catch (error) {
    console.error('UpdateBook error:', error);
    return errorResponse(res, 'Gagal mengubah buku.', 500);
  }
};

const deleteBook = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.book.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse(res, 'Buku tidak ditemukan.', 404);
    }
    if (existing.userId !== req.user.id) {
      return errorResponse(res, 'Anda tidak memiliki akses untuk menghapus buku ini.', 403);
    }

    if (existing.cover) {
      const coverPath = path.join(__dirname, '../../uploads/book', existing.cover);
      if (fs.existsSync(coverPath)) fs.unlinkSync(coverPath);
    }
    if (existing.pdfFile) {
      const pdfPath = path.join(__dirname, '../../uploads/book', existing.pdfFile);
      if (fs.existsSync(pdfPath)) fs.unlinkSync(pdfPath);
    }

    await prisma.book.delete({ where: { id } });

    return successResponse(res, 'Buku berhasil dihapus.');
  } catch (error) {
    console.error('DeleteBook error:', error);
    return errorResponse(res, 'Gagal menghapus buku.', 500);
  }
};

module.exports = { getAllBooks, getBookById, createBook, updateBook, deleteBook };
