
import {
    UsersProfileRepository
} from './users.profile.repository.js';

export class UsersProfileUseCase {

    constructor(
        private readonly profileRepository: UsersProfileRepository
    ) {}

    async getMyProfile(userUuid: string) {

        const profile = await this.profileRepository.findProfileByUserId(
            userUuid
        );

        if (!profile) {
            throw new Error('Profil mahasiswa tidak ditemukan');
        }

        return profile;
    }
}
