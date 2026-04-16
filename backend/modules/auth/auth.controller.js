import { AuthService } from './auth.service.js';
import { ApiResponse } from '../../utils/ApiResponse.js';

export const AuthController = {
  async signup(req, res, next) {
    try {
      const { name, email, password } = req.body;
      const result = await AuthService.signup(name, email, password);
      return ApiResponse.created(res, 'Account created successfully', result);
    } catch (err) {
      next(err);
    }
  },

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password);
      return ApiResponse.ok(res, 'Login successful', result);
    } catch (err) {
      next(err);
    }
  },

  async me(req, res, next) {
    try {
      const user = await AuthService.getProfile(req.user.id);
      return ApiResponse.ok(res, 'Profile fetched', user);
    } catch (err) {
      next(err);
    }
  },

  logout(req, res) {
    // Stateless — client discards the token
    return ApiResponse.ok(res, 'Logged out successfully');
  },
};
