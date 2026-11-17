
import { Router } from 'express';

import { usersHandler } from './users.handler.js';
import { usersProfileHandler } from './users.profile.handler.js';

import { authMiddleware } from '../../shared/middlewares/auth.middleware.js';
import { authorizeRoles } from '../../shared/middlewares/role.middleware.js';

const router = Router();

// Semua endpoint wajib memiliki token login yang valid.
router.use(authMiddleware);

// PROFIL PRIBADI
// Dapat diakses oleh semua role yang sudah login.
router.get(
    '/me/profile',
    authorizeRoles('superadmin', 'admin', 'user'),
    usersProfileHandler.getMyProfile
);

// MANAJEMEN AKUN
// Bagian di bawah ini khusus superadmin.
router.use(authorizeRoles('superadmin'));

// GET /api/users?page=1&limit=10
router.get('/', usersHandler.getAll);

// GET /api/users/:uuid
router.get('/:uuid', usersHandler.getById);

// POST /api/users
router.post('/', usersHandler.create);

// PATCH /api/users/:uuid
router.patch('/:uuid', usersHandler.update);

// DELETE /api/users/:uuid
router.delete('/:uuid', usersHandler.delete);

export default router;
