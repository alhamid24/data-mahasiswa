
import { postgres } from '../../infrastructure/database/postgres.js';

export interface MahasiswaProfile {
    id: string;
    nim: string;
    nama_mahasiswa: string;
    jenis_kelamin: string;
    tempat_lahir: string;
    tanggal_lahir: Date;
    fakultas: string;
    prodi: string;
    alamat: string;
    semester: number | null;
}

export class UsersProfileRepository {

    async findProfileByUserId(
        userUuid: string
    ): Promise<MahasiswaProfile | null> {

        const result = await postgres.query<MahasiswaProfile>(
            `
            SELECT
                m.id,
                m.nim,
                m.nama_mahasiswa,
                m.jenis_kelamin,
                m.tempat_lahir,
                m.tanggal_lahir,
                m.fakultas,
                m.prodi,
                m.alamat,
                m.semester
            FROM mahasiswa.users u
            INNER JOIN mahasiswa.teknik_informatika24 m
                ON m.id = u.id_mhs
            WHERE u.uuid = $1
              AND u.deleted_at IS NULL
              AND m.deleted_at IS NULL
            LIMIT 1
            `,
            [userUuid]
        );

        return result.rows[0] ?? null;
    }
}
