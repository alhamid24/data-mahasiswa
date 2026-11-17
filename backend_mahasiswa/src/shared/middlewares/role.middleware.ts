
import type { RequestHandler } from 'express';

import type {
    UserRole
} from '../../modules/auth/auth.model.js';

export const authorizeRoles = (
    ...allowedRoles: UserRole[]
): RequestHandler => {

    return (req, res, next) => {

        // Mengambil identitas dari authMiddleware
        const authUser = res.locals.authUser as {
            uuid: string;
            role_level: UserRole;
        } | undefined;

        // Memastikan pengguna sudah terautentikasi
        if (!authUser) {

            res.status(401).json({
                success: false,
                message: 'Autentikasi diperlukan'
            });

            return;
        }

        // Memeriksa hak akses pengguna
        if (!allowedRoles.includes(authUser.role_level)) {

            res.status(403).json({
                success: false,
                message: 'Kamu tidak memiliki izin untuk mengakses fitur ini'
            });

            return;
        }

        // Jika role sesuai, lanjutkan
        next();

    };

};