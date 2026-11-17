
import { Router } from 'express';
import { login, me, logout } from './auth.handler.js';
import { authMiddleware } from '../../shared/middlewares/auth.middleware.js';

const router = Router();

router.post('/login', login);
router.get('/me', authMiddleware, me);
router.post('/logout', authMiddleware, logout);

export default router;