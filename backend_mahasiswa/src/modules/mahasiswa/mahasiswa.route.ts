
import { Router } from 'express';
import { MahasiswaHandler } from './mahasiswa.handler.js';
import { MahasiswaUseCase } from './mahasiswa.usecase.js';
import { MahasiswaRepositoryPg } from './mahasiswa.repository.pg.js';

import { authMiddleware } from '../../shared/middlewares/auth.middleware.js';
import { authorizeRoles } from '../../shared/middlewares/role.middleware.js';

const router = Router();

// Membuat hubungan antar-layer
const mahasiswaRepository = new MahasiswaRepositoryPg();
const mahasiswaUseCase = new MahasiswaUseCase(mahasiswaRepository);
const mahasiswaHandler = new MahasiswaHandler(mahasiswaUseCase);

// Semua endpoint mahasiswa wajib menggunakan JWT
router.use(authMiddleware);

// CREATE
router.post(
    '/',
    authorizeRoles('superadmin', 'admin'),
    mahasiswaHandler.create
);

// READ ALL
router.get(
    '/',
    authorizeRoles('superadmin', 'admin'),
    mahasiswaHandler.getAll
);

// FILTER berdasarkan program studi dan semester
router.get(
    '/filter',
    authorizeRoles('superadmin', 'admin'),
    mahasiswaHandler.getByProdiAndSemester
);

// READ berdasarkan UUID
router.get(
    '/:id',
    authorizeRoles('superadmin', 'admin'),
    mahasiswaHandler.getById
);

// UPDATE
router.patch(
    '/:id',
    authorizeRoles('superadmin', 'admin'),
    mahasiswaHandler.update
);

// HARD DELETE: hanya superadmin
router.delete(
    '/:id',
    authorizeRoles('superadmin'),
    mahasiswaHandler.delete
);

export default router;
