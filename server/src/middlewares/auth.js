const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config');
const prisma = require('../config/database');
const { errorResponse } = require('../utils/response');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'Akses ditolak. Token tidak ditemukan.', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, jwtSecret);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, name: true, email: true },
    });

    if (!user) {
      return errorResponse(res, 'User tidak ditemukan.', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return errorResponse(res, 'Token tidak valid.', 401);
    }
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 'Token sudah expired.', 401);
    }
    return errorResponse(res, 'Terjadi kesalahan server.', 500);
  }
};

module.exports = authMiddleware;
