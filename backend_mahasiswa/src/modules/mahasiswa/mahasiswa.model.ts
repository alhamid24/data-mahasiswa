
export type ProgramStudi =
    | 'Teknik Informatika'
    | 'Sistem Informasi'
    | 'Agroindustri';

export interface Mahasiswa {
    id: string;
    nim: string;
    nama_mahasiswa: string;
    jenis_kelamin: 'L' | 'P';
    tempat_lahir: string;
    tanggal_lahir: string;
    fakultas: string;
    prodi: ProgramStudi;
    semester: number | null;
    alamat: string;
    nama_ibu_kandung: string;
    nomor_hp_orang_tua: string;
    keterangan: string | null;
    created_at: Date;
    updated_at: Date;
    deleted_at: Date | null;
}

export interface CreateMahasiswaInput {
    nim: string;
    nama_mahasiswa: string;
    jenis_kelamin: 'L' | 'P';
    tempat_lahir: string;
    tanggal_lahir: string;
    fakultas: string;
    prodi: ProgramStudi;
    semester: number;
    alamat: string;
    nama_ibu_kandung: string;
    nomor_hp_orang_tua: string;
    keterangan?: string | null;
}

export interface UpdateMahasiswaInput {
    nim?: string;
    nama_mahasiswa?: string;
    jenis_kelamin?: 'L' | 'P';
    tempat_lahir?: string;
    tanggal_lahir?: string;
    fakultas?: string;
    prodi?: ProgramStudi;
    semester?: number;
    alamat?: string;
    nama_ibu_kandung?: string;
    nomor_hp_orang_tua?: string;
    keterangan?: string | null;
}