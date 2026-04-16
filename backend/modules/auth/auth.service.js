import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AuthRepository } from './auth.repository.js';
import { ApiError } from '../../utils/ApiError.js';

const SALT_ROUNDS = 12;
const TOKEN_TTL   = '7d';

function signToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: TOKEN_TTL });
}

export const AuthService = {
  async signup(name, email, password) {
    if (!name || !email || !password) {
      throw ApiError.badRequest('name, email, and password are required');
    }

    const existing = await AuthRepository.findByEmail(email);
    if (existing) throw ApiError.conflict('Email is already registered');

    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    const user   = await AuthRepository.create(name, email, hashed);
    const token  = signToken(user.id);

    return { token, user };
  },

  async login(email, password) {
    if (!email || !password) {
      throw ApiError.badRequest('email and password are required');
    }

    const user = await AuthRepository.findByEmail(email);
    // Same error message for both cases — prevents user enumeration
    if (!user) throw ApiError.unauthorized('Invalid email or password');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw ApiError.unauthorized('Invalid email or password');

    const token = signToken(user.id);
    // Never return the hashed password
    const { password: _pw, ...safeUser } = user;
    return { token, user: safeUser };
  },

  async getProfile(userId) {
    const user = await AuthRepository.findById(userId);
    if (!user) throw ApiError.notFound('User not found');
    return user;
  },
};
