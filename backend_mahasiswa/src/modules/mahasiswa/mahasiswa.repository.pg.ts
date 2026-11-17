
import { postgres } from '../../infrastructure/database/postgres.js';

import type {
    Mahasiswa,
    CreateMahasiswaInput,
    UpdateMahasiswaInput,
    ProgramStudi
} from './mahasiswa.model.js';

import type {
    MahasiswaRepository
} from './mahasiswa.repository.js';

export class MahasiswaRepositoryPg implements MahasiswaRepository {

    // CREATE: Menambahkan data mahasiswa
    async create(
        input: CreateMahasiswaInput
    ): Promise<Mahasiswa> {

        const result = await postgres.query(
            `
            INSERT INTO mahasiswa.teknik_informatika24(
                nim,
                nama_mahasiswa,
                jenis_kelamin,
                tempat_lahir,
                tanggal_lahir,
                fakultas,
                prodi,
                alamat,
                nama_ibu_kandung,
                nomor_hp_orang_tua,
                keterangan,
                semester
            )
            VALUES (
                $1, $2, $3, $4, $5, $6,
                $7, $8, $9, $10, $11,$12
            )
            RETURNING *
            `,
            [
                input.nim,
                input.nama_mahasiswa,
                input.jenis_kelamin,
                input.tempat_lahir,
                input.tanggal_lahir,
                input.fakultas,
                input.prodi,
                input.alamat,
                input.nama_ibu_kandung,
                input.nomor_hp_orang_tua,
                input.keterangan ?? null,
                input.semester
            ]
        );

        return result.rows[0] as Mahasiswa;
    }

    // READ: Mengambil mahasiswa berdasarkan UUID
    async findById(
        id: string
    ): Promise<Mahasiswa | null> {

        const result = await postgres.query(
            `
            SELECT *
            FROM mahasiswa.teknik_informatika24
            WHERE id = $1
            AND deleted_at IS NULL
            `,
            [id]
        );

        return (result.rows[0] as Mahasiswa) ?? null;
    }

    // READ ALL: Mengambil semua mahasiswa dengan pagination
    async findAll(
        limit: number,
        offset: number
    ): Promise<{
        data: Mahasiswa[];
        total: number;
    }> {

        const result = await postgres.query(
            `
            SELECT *
            FROM mahasiswa.teknik_informatika24
            WHERE deleted_at IS NULL
            ORDER BY created_at ASC
            LIMIT $1 OFFSET $2
            `,
            [limit, offset]
        );

        const countResult = await postgres.query(
            `
            SELECT COUNT(*) AS total
            FROM mahasiswa.teknik_informatika24
            WHERE deleted_at IS NULL
            `
        );

        return {
            data: result.rows as Mahasiswa[],
            total: Number(countResult.rows[0].total)
        };
    }

    // FILTER: Mengambil mahasiswa berdasarkan prodi dan semester
    async findByProdiAndSemester(
        prodi: ProgramStudi,
        semester: number,
        limit: number,
        offset: number
    ): Promise<{
        data: Mahasiswa[];
        total: number;
    }> {

        const result = await postgres.query(
            `
            SELECT *
            FROM mahasiswa.teknik_informatika24
            WHERE prodi = $1
            AND semester = $2
            AND deleted_at IS NULL
            ORDER BY nama_mahasiswa ASC
            LIMIT $3 OFFSET $4
            `,
            [prodi, semester, limit, offset]
        );

        const countResult = await postgres.query(
            `
            SELECT COUNT(*) AS total
            FROM mahasiswa.teknik_informatika24
            WHERE prodi = $1
            AND semester = $2
            AND deleted_at IS NULL
            `,
            [prodi, semester]
        );

        return {
            data: result.rows as Mahasiswa[],
            total: Number(countResult.rows[0].total)
        };
    }

    // UPDATE: Memperbarui data mahasiswa
    async update(
        id: string,
        input: UpdateMahasiswaInput
    ): Promise<Mahasiswa | null> {

        const fields: Array<{
            key: keyof UpdateMahasiswaInput;
            column: string;
        }> = [
            { key: 'nim', column: 'nim' },
            { key: 'nama_mahasiswa', column: 'nama_mahasiswa' },
            { key: 'jenis_kelamin', column: 'jenis_kelamin' },
            { key: 'tempat_lahir', column: 'tempat_lahir' },
            { key: 'tanggal_lahir', column: 'tanggal_lahir' },
            { key: 'fakultas', column: 'fakultas' },
            { key: 'prodi', column: 'prodi' },
            { key: 'semester', column: 'semester' },
            { key: 'alamat', column: 'alamat' },
            { key: 'nama_ibu_kandung', column: 'nama_ibu_kandung' },
            { key: 'nomor_hp_orang_tua', column: 'nomor_hp_orang_tua' },
            { key: 'keterangan', column: 'keterangan' }
        ];

        const values: (string | number | null)[] = [];
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
            return this.findById(id);
        }

        setClauses.push('updated_at = CURRENT_TIMESTAMP');

        values.push(id);

        const result = await postgres.query(
            `
            UPDATE mahasiswa.teknik_informatika24
            SET ${setClauses.join(', ')}
            WHERE id = $${values.length}
            AND deleted_at IS NULL
            RETURNING *
            `,
            values
        );

        return (result.rows[0] as Mahasiswa) ?? null;
    }

    async hardDelete(
        id: string
    ): Promise<boolean> {

        const result = await postgres.query(
            `
           DELETE FROM mahasiswa.teknik_informatika24
            WHERE id = $1
            RETURNING id
            `,
            [id]
        );

        return (result.rowCount ?? 0) > 0;
    }

}