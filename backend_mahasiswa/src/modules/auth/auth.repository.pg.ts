
import { postgres } from '../../infrastructure/database/postgres.js';

import type {
    AuthUser
} from './auth.model.js';

import type {
    AuthRepository
} from './auth.repository.js';

export class AuthRepositoryPg implements AuthRepository {

    // Mencari pengguna berdasarkan email
    async findByEmail(
        email: string
    ): Promise<AuthUser | null> {

        const result = await postgres.query(
            `
            SELECT
                uuid,
                id_mhs,
                email,
                password,
                role_level
            FROM mahasiswa.users
            WHERE LOWER(email) = LOWER($1)
            AND deleted_at IS NULL
            LIMIT 1
            `,
            [email]
        );

        return (result.rows[0] as AuthUser) ?? null;

    }

}