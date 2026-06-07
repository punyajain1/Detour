import { Router } from 'express';
import { AuthController, RegisterSchema, LoginSchema } from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';

export const authRouter = Router();

// POST /api/auth/register
authRouter.post('/register', validate(RegisterSchema), AuthController.register);

// POST /api/auth/login
authRouter.post('/login', validate(LoginSchema), AuthController.login);

// GET /api/auth/me — get current user (requires auth)
authRouter.get('/me', requireAuth, AuthController.me);
