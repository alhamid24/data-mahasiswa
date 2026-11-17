
import { postgres } from '../../infrastructure/database/postgres.js';

import type {
    User,
    CreateUserInput,
    UpdateUserInput
} from './users.model.js';

import type {
    UsersRepository
} from './users.repository.js';

type SafeUser = Omit<User, 'password'>;

export class UsersRepositoryPg implements UsersRepository {

    // Mengambil seluruh akun pengguna
    async findAll(
        limit: number,
        offset: number
    ): Promise<{
        data: SafeUser[];
        total: number;
    }> {

        const result = await postgres.query(
            `
            SELECT
                uuid,
                id_mhs,
                email,
                role_level,
                created_at,
                created_by,
                updated_at,
                updated_by,
                deleted_at,
                deleted_by
            FROM mahasiswa.users
            WHERE deleted_at IS NULL
            ORDER BY created_at DESC
            LIMIT $1 OFFSET $2
            `,
            [limit, offset]
        );

        const countResult = await postgres.query(
            `
            SELECT COUNT(*) AS total
            FROM mahasiswa.users
            WHERE deleted_at IS NULL
            `
        );

        return {
            data: result.rows as SafeUser[],
            total: Number(countResult.rows[0].total)
        };
    }

    // Mengambil akun berdasarkan UUID
    async findById(
        uuid: string
    ): Promise<SafeUser | null> {

        const result = await postgres.query(
            `
            SELECT
                uuid,
                id_mhs,
                email,
                role_level,
                created_at,
                created_by,
                updated_at,
                updated_by,
                deleted_at,
                deleted_by
            FROM mahasiswa.users
            WHERE uuid = $1
            AND deleted_at IS NULL
            `,
            [uuid]
        );

        return (result.rows[0] as SafeUser) ?? null;
    }

    // Memeriksa akun berdasarkan email
    async findByEmail(
        email: string
    ): Promise<User | null> {

        const result = await postgres.query(
            `
            SELECT
                uuid,
                id_mhs,
                email,
                password,
                role_level,
                created_at,
                created_by,
                updated_at,
                updated_by,
                deleted_at,
                deleted_by
            FROM mahasiswa.users
            WHERE LOWER(email) = LOWER($1)
            AND deleted_at IS NULL
            LIMIT 1
            `,
            [email]
        );

        return (result.rows[0] as User) ?? null;
    }

    // Membuat akun baru
    async create(
        input: CreateUserInput,
        createdBy: string
    ): Promise<SafeUser> {

        const result = await postgres.query(
            `
            INSERT INTO mahasiswa.users (
                id_mhs,
                email,
                password,
                role_level,
                created_by
            )
            VALUES ($1, $2, $3, $4, $5)
            RETURNING
                uuid,
                id_mhs,
                email,
                role_level,
                created_at,
                created_by,
                updated_at,
                updated_by,
                deleted_at,
                deleted_by
            `,
            [
                input.id_mhs,
                input.email,
                input.password,
                input.role_level,
                createdBy
            ]
        );

        return result.rows[0] as SafeUser;
    }

    // Memperbarui akun
    async update(
        uuid: string,
        input: UpdateUserInput,
        updatedBy: string
    ): Promise<SafeUser | null> {

        const fields: Array<{
            key: keyof UpdateUserInput;
            column: string;
        }> = [
            { key: 'email', column: 'email' },
            { key: 'password', column: 'password' },
            { key: 'role_level', column: 'role_level' }
        ];

        const values: (string | null)[] = [];
        const setClauses: string[] = [];

        for (const field of fields) {
            const value = input[field.key];

            if (value !== undefined) {
                values.push(value);
                setClauses.push(
                    `${field.column} = $${values.length}`
                );
            }
        }

        if (setClauses.length === 0) {
            return this.findById(uuid);
        }

        values.push(updatedBy);

        setClauses.push(
            `updated_by = $${values.length}`
        );

        setClauses.push(
            'updated_at = CURRENT_TIMESTAMP'
        );

        values.push(uuid);

        const result = await postgres.query(
            `
            UPDATE mahasiswa.users
            SET ${setClauses.join(', ')}
            WHERE uuid = $${values.length}
            AND deleted_at IS NULL
            RETURNING
                uuid,
                id_mhs,
                email,
                role_level,
                created_at,
                created_by,
                updated_at,
                updated_by,
                deleted_at,
                deleted_by
            `,
            values
        );

        return (result.rows[0] as SafeUser) ?? null;
    }

    // Menghapus akun secara permanen
    async hardDelete(
        uuid: string
    ): Promise<boolean> {

        const result = await postgres.query(
            `
            DELETE FROM mahasiswa.users
            WHERE uuid = $1
            RETURNING uuid
            `,
            [uuid]
        );

        return (result.rowCount ?? 0) > 0;
    }
}