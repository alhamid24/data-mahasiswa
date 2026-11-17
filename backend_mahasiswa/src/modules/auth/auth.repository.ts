
import type {
    AuthUser
} from './auth.model.js';

export interface AuthRepository {

    findByEmail(
        email: string
    ): Promise<AuthUser | null>;

}
