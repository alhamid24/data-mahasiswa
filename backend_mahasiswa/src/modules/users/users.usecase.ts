
import bcrypt from 'bcrypt';
import type {
    CreateUserInput,
    UpdateUserInput,
    UserRole
} from './users.model.js';
import type { UsersRepository } from './users.repository.js';

export class UsersUseCase {
    constructor(
        private readonly usersRepository: UsersRepository
    ) {}

    async getAll(page = 1, limit = 10) {
        const safePage = Math.max(1, page);
        const safeLimit = Math.min(Math.max(1, limit), 100);
        const offset = (safePage - 1) * safeLimit;

        const result = await this.usersRepository.findAll(
            safeLimit,
            offset
        );

        return {
            data: result.data,
            total: result.total,
            page: safePage,
            limit: safeLimit,
            totalPages: Math.ceil(result.total / safeLimit)
        };
    }

    async getById(uuid: string) {
        const user = await this.usersRepository.findById(uuid);

        if (!user) {
            throw new Error('Akun tidak ditemukan');
        }

        return user;
    }

    async create(input: CreateUserInput, createdBy: string) {
        const email = input.email.trim().toLowerCase();

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            throw new Error('Format email tidak valid');
        }

        if (input.password.length < 8) {
            throw new Error('Password minimal 8 karakter');
        }

        const allowedRoles: UserRole[] = [
            'superadmin',
            'admin',
            'user'
        ];

        if (!allowedRoles.includes(input.role_level)) {
            throw new Error('Role akun tidak valid');
        }

        const existingUser = await this.usersRepository.findByEmail(email);

        if (existingUser) {
            throw new Error('Email sudah digunakan');
        }

        const hashedPassword = await bcrypt.hash(input.password, 12);

        return this.usersRepository.create(
            {
                ...input,
                email,
                password: hashedPassword
            },
            createdBy
        );
    }

    async update(
        uuid: string,
        input: UpdateUserInput,
        updatedBy: string
    ) {
        const updateData: UpdateUserInput = { ...input };

        if (updateData.email !== undefined) {
            const email = updateData.email.trim().toLowerCase();

            if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                throw new Error('Format email tidak valid');
            }

            const existingUser = await this.usersRepository.findByEmail(email);

            if (existingUser && existingUser.uuid !== uuid) {
                throw new Error('Email sudah digunakan');
            }

            updateData.email = email;
        }

        if (updateData.password !== undefined) {
            if (updateData.password.length < 8) {
                throw new Error('Password minimal 8 karakter');
            }

            updateData.password = await bcrypt.hash(
                updateData.password,
                12
            );
        }

        if (updateData.role_level !== undefined) {
            const allowedRoles: UserRole[] = [
                'superadmin',
                'admin',
                'user'
            ];

            if (!allowedRoles.includes(updateData.role_level)) {
                throw new Error('Role akun tidak valid');
            }
        }

        const updatedUser = await this.usersRepository.update(
            uuid,
            updateData,
            updatedBy
        );

        if (!updatedUser) {
            throw new Error('Akun tidak ditemukan');
        }

        return updatedUser;
    }

    async delete(uuid: string) {
        const deleted = await this.usersRepository.hardDelete(uuid);

        if (!deleted) {
            throw new Error('Akun tidak ditemukan');
        }

        return {
            message: 'Akun berhasil dihapus permanen'
        };
    }
}