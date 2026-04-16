import express from 'express';
import { AuthController } from './auth.controller.js';
import { validate } from '../../middleware/validate.middleware.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { authRateLimiter } from '../../middleware/rateLimiter.js';
import { signupSchema, loginSchema } from '../../validations/auth.validation.js';

const authRouter = express.Router();

authRouter.post('/signup', authRateLimiter, validate(signupSchema), AuthController.signup);
authRouter.post('/login',  authRateLimiter, validate(loginSchema),  AuthController.login);
authRouter.post('/logout', authenticate,    AuthController.logout);
authRouter.get('/me',      authenticate,    AuthController.me);

export default authRouter;
