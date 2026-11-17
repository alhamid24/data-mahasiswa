
import type { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';
import { AuthLogoutRepository } from '../../modules/auth/auth.logout.repository.js';

const logoutRepository = new AuthLogoutRepository();

export const authMiddleware: RequestHandler = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        res.status(401).json({
            success: false,
            message: 'Token autentikasi tidak ditemukan'
        });
        return;
    }

    const match = authHeader.match(/^Bearer\s+(.+)$/i);

    if (!match || !match[1].trim()) {
        res.status(401).json({
            success: false,
            message: 'Format token tidak valid'
        });
        return;
    }

    const token = match[1].trim();

    let decoded: jwt.JwtPayload & { exp: number };

    try {
        const verified = jwt.verify(token, env.JWT_SECRET, {
            algorithms: ['HS256']
        });

        if (
            typeof verified === 'string' ||
            typeof verified.sub !== 'string' ||
            !['superadmin', 'admin', 'user'].includes(
                verified.role_level as string
            ) ||
            typeof verified.exp !== 'number'
        ) {
            res.status(401).json({
                success: false,
                message: 'Token tidak valid'
            });
            return;
        }

        decoded = verified as jwt.JwtPayload & { exp: number };

    } catch {
        res.status(401).json({
            success: false,
            message: 'Token tidak valid atau sudah kedaluwarsa'
        });
        return;
    }

    try {
        const isBlacklisted = await logoutRepository.exists(token);

        if (isBlacklisted) {
            res.status(401).json({
                success: false,
                message: 'Token sudah logout dan tidak dapat digunakan'
            });
            return;
        }

        const expiresAt = new Date(decoded.exp * 1000);

        res.locals.authUser = {
            uuid: decoded.sub,
            role_level: decoded.role_level
        };

        res.locals.authToken = token;
        res.locals.tokenExpiresAt = expiresAt;

        next();

    } catch (error) {
        next(error);
    }
};
