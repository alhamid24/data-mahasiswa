
import type {
    Mahasiswa,
    CreateMahasiswaInput,
    UpdateMahasiswaInput,
    ProgramStudi
} from './mahasiswa.model.js';

export interface MahasiswaRepository {

    create(
        input: CreateMahasiswaInput
    ): Promise<Mahasiswa>;

    findById(
        id: string
    ): Promise<Mahasiswa | null>;

    findAll(
        limit: number,
        offset: number
    ): Promise<{
        data: Mahasiswa[];
        total: number;
    }>;

    findByProdiAndSemester(
        prodi: ProgramStudi,
        semester: number,
        limit: number,
        offset: number
    ): Promise<{
        data: Mahasiswa[];
        total: number;
    }>;

    update(
        id: string,
        input: UpdateMahasiswaInput
    ): Promise<Mahasiswa | null>;

    // HARD DELETE
    hardDelete(
        id: string
    ): Promise<boolean>;
}