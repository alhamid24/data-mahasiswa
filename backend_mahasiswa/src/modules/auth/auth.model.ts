
export type UserRole = 'superadmin' | 'admin' | 'user';

export interface AuthUser {

    uuid: string;

    id_mhs: string;

    email: string;

    password: string;

    role_level: UserRole;

}

export interface LoginInput {

    email: string;

    password: string;

}

export interface AuthUserResponse {

    uuid: string;

    email: string;

    role_level: UserRole;

}
