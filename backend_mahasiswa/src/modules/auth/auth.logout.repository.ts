
import { createHash } from 'node:crypto';
import { postgres } from '../../infrastructure/database/postgres.js';

export class AuthLogoutRepository {
    private hashToken(token: string): string {
        return createHash('sha256')
            .update(token)
            .digest('hex');
    }

    async add(token: string, expiresAt: Date): Promise<void> {
        const tokenHash = this.hashToken(token);

        await postgres.query(
            `
            INSERT INTO mahasiswa.token_blacklist (
                token_hash,
                expires_at
            )
            VALUES ($1, $2)
            ON CONFLICT (token_hash) DO NOTHING
            `,
            [tokenHash, expiresAt]
        );
    }

    async exists(token: string): Promise<boolean> {
        const tokenHash = this.hashToken(token);

        const result = await postgres.query(
            `
            SELECT 1
            FROM mahasiswa.token_blacklist
            WHERE token_hash = $1
            AND expires_at > CURRENT_TIMESTAMP
            LIMIT 1
            `,
            [tokenHash]
        );

        
        return (result.rowCount ?? 0) > 0;
    }

        async cleanupExpired(): Promise<number> {
        const result = await postgres.query(
            `
            DELETE FROM mahasiswa.token_blacklist
            WHERE expires_at <= CURRENT_TIMESTAMP
            `
        );
        return result.rowCount ?? 0;
    }
}
