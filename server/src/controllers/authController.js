const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/database');
const { jwtSecret } = require('../config');
const { successResponse, errorResponse } = require('../utils/response');

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return errorResponse(res, 'Semua field wajib diisi.');
    }

    if (password.length < 6) {
      return errorResponse(res, 'Password harus minimal 6 karakter.');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return errorResponse(res, 'Format email tidak valid.');
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return errorResponse(res, 'Email sudah terdaftar.');
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
      select: { id: true, name: true, email: true },
    });

    return successResponse(res, 'Registrasi berhasil.', { user }, 201);
  } catch (error) {
    console.error('Register error:', error);
    return errorResponse(res, 'Terjadi kesalahan saat registrasi.', 500);
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, 'Email dan password wajib diisi.');
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return errorResponse(res, 'Email atau password salah.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return errorResponse(res, 'Email atau password salah.');
    }

    const token = jwt.sign({ userId: user.id }, jwtSecret, { expiresIn: '7d' });

    return successResponse(res, 'Login berhasil.', {
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error('Login error:', error);
    return errorResponse(res, 'Terjadi kesalahan saat login.', 500);
  }
};

const getMe = async (req, res) => {
  try {
    return successResponse(res, 'User ditemukan.', { user: req.user });
  } catch (error) {
    console.error('GetMe error:', error);
    return errorResponse(res, 'Terjadi kesalahan.', 500);
  }
};

const logout = async (req, res) => {
  try {
    return successResponse(res, 'Logout berhasil.');
  } catch (error) {
    console.error('Logout error:', error);
    return errorResponse(res, 'Terjadi kesalahan saat logout.', 500);
  }
};

module.exports = { register, login, getMe, logout };
