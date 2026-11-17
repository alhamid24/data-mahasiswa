
import type { Request, Response, NextFunction } from 'express';

import {
    UsersProfileRepository
} from './users.profile.repository.js';

import {
    UsersProfileUseCase
} from './users.profile.usecase.js';

const profileRepository = new UsersProfileRepository();

const profileUseCase = new UsersProfileUseCase(
    profileRepository
);

export const usersProfileHandler = {

    // GET /api/users/me/profile
    getMyProfile: async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            // UUID akun berasal dari JWT yang sudah diverifikasi
            const userUuid = res.locals.authUser.uuid;

            const profile = await profileUseCase.getMyProfile(
                userUuid
            );

            res.status(200).json({
                success: true,
                message: 'Profil mahasiswa berhasil diambil',
                data: profile
            });

        } catch (error) {
            next(error);
        }
    }
};