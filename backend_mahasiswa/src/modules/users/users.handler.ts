
import type { Request, Response, NextFunction } from 'express';
import { UsersRepositoryPg } from './users.repository.pg.js';
import { UsersUseCase } from './users.usecase.js';

const usersRepository = new UsersRepositoryPg();
const usersUseCase = new UsersUseCase(usersRepository);

export const usersHandler = {
    // GET /api/users
    getAll: async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;

            const result = await usersUseCase.getAll(page, limit);

            res.status(200).json({
                success: true,
                message: 'Data akun berhasil diambil',
                ...result
            });
        } catch (error) {
            next(error);
        }
    },

    // GET /api/users/:uuid
    getById: async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const uuid = String(req.params.uuid);
            const user = await usersUseCase.getById(uuid);

            res.status(200).json({
                success: true,
                message: 'Detail akun berhasil diambil',
                data: user
            });
        } catch (error) {
            next(error);
        }
    },

    // POST /api/users
    create: async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const { id_mhs, email, password, role_level } = req.body;

            const createdBy = res.locals.authUser.uuid;

            const user = await usersUseCase.create(
                {
                    id_mhs,
                    email,
                    password,
                    role_level
                },
                createdBy
            );

            res.status(201).json({
                success: true,
                message: 'Akun berhasil dibuat',
                data: user
            });
        } catch (error) {
            next(error);
        }
    },

    // PATCH /api/users/:uuid
    update: async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const { email, password, role_level } = req.body;

            const updatedBy = res.locals.authUser.uuid;

            const uuid = String(req.params.uuid);

            const user = await usersUseCase.update(
                uuid,
                {
                    email,
                    password,
                    role_level
                },
                updatedBy
            );

            res.status(200).json({
                success: true,
                message: 'Akun berhasil diperbarui',
                data: user
            });
        } catch (error) {
            next(error);
        }
    },

    // DELETE /api/users/:uuid
    delete: async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const uuid = String(req.params.uuid);
            const result = await usersUseCase.delete(uuid);

            res.status(200).json({
                success: true,
                ...result
            });
        } catch (error) {
            next(error);
        }
    }
};