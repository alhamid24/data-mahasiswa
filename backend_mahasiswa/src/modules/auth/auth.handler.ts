
import type { RequestHandler } from 'express';

import { AuthUseCase } from './auth.usecase.js';
import { AuthRepositoryPg } from './auth.repository.pg.js';
import { AuthLogoutRepository } from './auth.logout.repository.js';

const authRepository = new AuthRepositoryPg();
const authUseCase = new AuthUseCase(authRepository);
const authLogoutRepository = new AuthLogoutRepository();

export const login: RequestHandler = async (req, res, next) => {

    try {

        const { email, password } = req.body ?? {};

        // Validasi input
        if (
            typeof email !== 'string' ||
            typeof password !== 'string' ||
            !email.trim() ||
            !password
        ) {
            res.status(400).json({
                success: false,
                message: 'Email dan password wajib diisi'
            });

            return;
        }

        // Menjalankan proses login
        const result = await authUseCase.login({
            email,
            password
        });

        res.status(200).json({
            success: true,
            message: 'Login berhasil',
            data: result
        });

    } catch (error) {

        if (error instanceof Error) {

            if (error.message === 'Email atau password salah') {
                res.status(401).json({
                    success: false,
                    message: 'Email atau password salah'
                });

                return;
            }

            if (error.message === 'Akun tidak memiliki akses dashboard') {
                res.status(403).json({
                    success: false,
                    message: 'Akun tidak memiliki akses dashboard'
                });

                return;
            }

        }

        next(error);

    }

};

export const me: RequestHandler = (req, res) => {
    const authUser = res.locals.authUser as {
        uuid: string;
        role_level: string;
    } | undefined;

    if (!authUser) {
        res.status(401).json({
            success: false,
            message: 'Autentikasi diperlukan'
        });
        return;
    }

    res.status(200).json({
        success: true,
        message: 'Data pengguna berhasil diambil',
        data: {
            uuid: authUser.uuid,
            role_level: authUser.role_level
        }
    });
};


export const logout: RequestHandler = async (req, res, next) => {
    try {
        const token = res.locals.authToken as string | undefined;
        const expiresAt = res.locals.tokenExpiresAt as Date | undefined;

        if (!token || !expiresAt) {
            res.status(401).json({
                success: false,
                message: 'Autentikasi diperlukan'
            });
            return;
        }

        await authLogoutRepository.add(token, expiresAt);

        res.status(200).json({
            success: true,
            message: 'Logout berhasil'
        });
    } catch (error) {
        next(error);
    }
};