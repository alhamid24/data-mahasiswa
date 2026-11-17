
import type {
    User,
    CreateUserInput,
    UpdateUserInput
} from './users.model.js';

export interface UsersRepository {

    // Mengambil seluruh akun pengguna
    findAll(
        limit: number,
        offset: number
    ): Promise<{
        data: Omit<User, 'password'>[];
        total: number;
    }>;

    // Mengambil akun berdasarkan UUID
    findById(
        uuid: string
    ): Promise<Omit<User, 'password'> | null>;

    // Memeriksa akun berdasarkan email
    findByEmail(
        email: string
    ): Promise<User | null>;

    // Membuat akun baru
    create(
        input: CreateUserInput,
        createdBy: string
    ): Promise<Omit<User, 'password'>>;

    // Memperbarui akun
    update(
        uuid: string,
        input: UpdateUserInput,
        updatedBy: string
    ): Promise<Omit<User, 'password'> | null>;

    // Menghapus akun secara permanen
    hardDelete(
        uuid: string
    ): Promise<boolean>;
}
