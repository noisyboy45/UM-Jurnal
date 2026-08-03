const prisma = require('../config/database');
const { successResponse, errorResponse } = require('../utils/response');
const fs = require('fs');
const path = require('path');

const getAllScientificWorks = async (req, res) => {
  try {
    const works = await prisma.scientificWork.findMany({
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return successResponse(res, 'Karya ilmiah berhasil diambil.', { works });
  } catch (error) {
    console.error('GetScientificWorks error:', error);
    return errorResponse(res, 'Gagal mengambil data karya ilmiah.', 500);
  }
};

const getScientificWorkById = async (req, res) => {
  try {
    const { id } = req.params;
    const work = await prisma.scientificWork.findUnique({
      where: { id },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    if (!work) {
      return errorResponse(res, 'Karya ilmiah tidak ditemukan.', 404);
    }
    return successResponse(res, 'Karya ilmiah berhasil diambil.', { work });
  } catch (error) {
    console.error('GetScientificWork error:', error);
    return errorResponse(res, 'Gagal mengambil data karya ilmiah.', 500);
  }
};

const createScientificWork = async (req, res) => {
  try {
    const { title, abstract, doi, scholarLink } = req.body;
    if (!title) {
      return errorResponse(res, 'Judul wajib diisi.');
    }

    const pdfFile = req.file ? req.file.filename : null;

    const work = await prisma.scientificWork.create({
      data: {
        title,
        abstract: abstract || null,
        doi: doi || null,
        scholarLink: scholarLink || null,
        pdfFile,
        userId: req.user.id,
      },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    return successResponse(res, 'Karya ilmiah berhasil dibuat.', { work }, 201);
  } catch (error) {
    console.error('CreateScientificWork error:', error);
    return errorResponse(res, 'Gagal membuat karya ilmiah.', 500);
  }
};

const updateScientificWork = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, abstract, doi, scholarLink } = req.body;

    const existing = await prisma.scientificWork.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse(res, 'Karya ilmiah tidak ditemukan.', 404);
    }
    if (existing.userId !== req.user.id) {
      return errorResponse(res, 'Anda tidak memiliki akses untuk mengubah karya ilmiah ini.', 403);
    }

    let pdfFile = existing.pdfFile;
    if (req.file) {
      if (existing.pdfFile) {
        const oldPath = path.join(__dirname, '../../uploads/scientific', existing.pdfFile);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      pdfFile = req.file.filename;
    }

    const work = await prisma.scientificWork.update({
      where: { id },
      data: {
        title: title || existing.title,
        abstract: abstract !== undefined ? abstract : existing.abstract,
        doi: doi !== undefined ? doi : existing.doi,
        scholarLink: scholarLink !== undefined ? scholarLink : existing.scholarLink,
        pdfFile,
      },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    return successResponse(res, 'Karya ilmiah berhasil diubah.', { work });
  } catch (error) {
    console.error('UpdateScientificWork error:', error);
    return errorResponse(res, 'Gagal mengubah karya ilmiah.', 500);
  }
};

const deleteScientificWork = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.scientificWork.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse(res, 'Karya ilmiah tidak ditemukan.', 404);
    }
    if (existing.userId !== req.user.id) {
      return errorResponse(res, 'Anda tidak memiliki akses untuk menghapus karya ilmiah ini.', 403);
    }

    if (existing.pdfFile) {
      const pdfPath = path.join(__dirname, '../../uploads/scientific', existing.pdfFile);
      if (fs.existsSync(pdfPath)) fs.unlinkSync(pdfPath);
    }

    await prisma.scientificWork.delete({ where: { id } });

    return successResponse(res, 'Karya ilmiah berhasil dihapus.');
  } catch (error) {
    console.error('DeleteScientificWork error:', error);
    return errorResponse(res, 'Gagal menghapus karya ilmiah.', 500);
  }
};

module.exports = { getAllScientificWorks, getScientificWorkById, createScientificWork, updateScientificWork, deleteScientificWork };
