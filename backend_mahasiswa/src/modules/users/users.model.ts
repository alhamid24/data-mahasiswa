
export type UserRole = 'superadmin' | 'admin' | 'user';

// Data akun yang dibaca dari database
export interface User {
    uuid: string;
    id_mhs: string;
    email: string;
    password: string;
    role_level: UserRole;
    created_at: Date;
    created_by: string | null;
    updated_at: Date | null;
    updated_by: string | null;
    deleted_at: Date | null;
    deleted_by: string | null;
}

// Data untuk membuat akun baru
export interface CreateUserInput {
    id_mhs: string;
    email: string;
    password: string;
    role_level: UserRole;
}

// Data untuk memperbarui akun
export interface UpdateUserInput {
    email?: string;
    password?: string;
    role_level?: UserRole;
}