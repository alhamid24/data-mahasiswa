
import { AuthLogoutRepository } from '../../modules/auth/auth.logout.repository.js';

const logoutRepository = new AuthLogoutRepository();

const ONE_HOUR = 60 * 60 * 1000;

export const startTokenBlacklistCleanup = (): void => {
    const cleanup = async (): Promise<void> => {
        try {
            const deletedCount = await logoutRepository.cleanupExpired();

            console.log(
                `[Token Cleanup] ${deletedCount} expired token records removed`
            );
        } catch (error) {
            console.error('[Token Cleanup] Failed:', error);
        }
    };

    // Bersihkan saat aplikasi mulai
    void cleanup();

    // Bersihkan kembali setiap satu jam
    const interval = setInterval(() => {
        void cleanup();
    }, ONE_HOUR);

    // Timer tidak menghalangi proses Node.js untuk berhenti
    interval.unref();
};
