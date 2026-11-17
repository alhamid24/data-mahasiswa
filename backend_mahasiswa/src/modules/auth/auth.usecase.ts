
import bcrypt from 'bcryptjs';
import jwt, { type SignOptions } from 'jsonwebtoken';

import { env } from '../../config/env.js';

import type {
    LoginInput,
    AuthUserResponse
} from './auth.model.js';

import type {
    AuthRepository
} from './auth.repository.js';

export class AuthUseCase {

    constructor(
        private readonly authRepository: AuthRepository
    ) {}

    // LOGIN: Memverifikasi akun dan menghasilkan JWT
    async login(
        input: LoginInput
    ): Promise<{
        accessToken: string;
        user: AuthUserResponse;
    }> {

        // 1. Mencari akun berdasarkan email
        const user = await this.authRepository.findByEmail(
            input.email.trim()
        );

        // 2. Memeriksa apakah akun ditemukan
        if (!user) {
            throw new Error('Email atau password salah');
        }

        // 3. Memverifikasi password menggunakan bcrypt
        const passwordValid = await bcrypt.compare(
            input.password,
            user.password
        );

        if (!passwordValid) {
            throw new Error('Email atau password salah');
        }

        // 4. Memastikan role akun valid
        const allowedRoles = [
            'superadmin',
            'admin',
            'user'
        ] as const;

        if (!allowedRoles.includes(user.role_level)) {
            throw new Error('Role akun tidak valid');
        }

        // 5. Membuat JWT Access Token
        const options: SignOptions = {
            subject: user.uuid,
            expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn']
        };

        const accessToken = jwt.sign(
            {
                role_level: user.role_level
            },
            env.JWT_SECRET,
            options
        );

        // 6. Menyiapkan informasi pengguna yang aman
        const safeUser: AuthUserResponse = {
            uuid: user.uuid,
            email: user.email,
            role_level: user.role_level
        };

        return {
            accessToken,
            user: safeUser
        };
    }
}
