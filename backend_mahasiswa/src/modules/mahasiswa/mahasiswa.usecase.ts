
import type {
    Mahasiswa,
    CreateMahasiswaInput,
    UpdateMahasiswaInput,
    ProgramStudi
} from './mahasiswa.model.js';

import type {
    MahasiswaRepository
} from './mahasiswa.repository.js';

export class MahasiswaUseCase {

    constructor(
        private readonly mahasiswaRepository: MahasiswaRepository
    ) {}

    // CREATE: Menambahkan mahasiswa
    async create(
        input: CreateMahasiswaInput
    ): Promise<Mahasiswa> {

        return await this.mahasiswaRepository.create(input);

    }

    // READ: Mengambil mahasiswa berdasarkan UUID
    async getById(
        id: string
    ): Promise<Mahasiswa | null> {

        return await this.mahasiswaRepository.findById(id);

    }

    // READ ALL: Mengambil semua mahasiswa dengan pagination
    async getAll(
        page: number = 1,
        limit: number = 10
    ) {

        const currentPage = Math.max(1, Math.floor(page));

        const currentLimit = Math.min(
            100,
            Math.max(1, Math.floor(limit))
        );

        const offset = (currentPage - 1) * currentLimit;

        const result = await this.mahasiswaRepository.findAll(
            currentLimit,
            offset
        );

        const totalPages = Math.ceil(
            result.total / currentLimit
        );

        return {

            data: result.data,

            pagination: {
                page: currentPage,
                limit: currentLimit,
                total: result.total,
                totalPages
            }

        };

    }

    // FILTER: Mengambil mahasiswa berdasarkan prodi dan semester
    async getByProdiAndSemester(
        prodi: ProgramStudi,
        semester: number,
        page: number = 1,
        limit: number = 10
    ) {

        const currentPage = Math.max(1, Math.floor(page));

        const currentLimit = Math.min(
            100,
            Math.max(1, Math.floor(limit))
        );

        const offset = (currentPage - 1) * currentLimit;

        const result = await this.mahasiswaRepository.findByProdiAndSemester(
            prodi,
            semester,
            currentLimit,
            offset
        );

        const totalPages = Math.ceil(
            result.total / currentLimit
        );

        return {
            data: result.data,
            pagination: {
                page: currentPage,
                limit: currentLimit,
                total: result.total,
                totalPages
            }
        };
    }

    // UPDATE: Memperbarui mahasiswa
    async update(
        id: string,
        input: UpdateMahasiswaInput
    ): Promise<Mahasiswa | null> {

        return await this.mahasiswaRepository.update(
            id,
            input
        );

    }

    // DELETE: Menghapus mahasiswa secara soft delete
    async delete(
        id: string
    ): Promise<boolean> {

        return await this.mahasiswaRepository.hardDelete(id);

    }

}
