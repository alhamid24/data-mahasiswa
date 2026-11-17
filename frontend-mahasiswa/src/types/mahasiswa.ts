
export interface Mahasiswa {
  semester: number;
  id: string;
  nim: string;
  nama_mahasiswa: string;
  jenis_kelamin: 'L' | 'P';
  tempat_lahir: string;
  tanggal_lahir: string;
  fakultas: string;
  prodi: string;
  alamat: string;
  nama_ibu_kandung: string;
  nomor_hp_orang_tua: string;
  keterangan: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface MahasiswaResponse {
  success: boolean;
  message: string;
  data: Mahasiswa[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface MahasiswaDetailResponse {
  success: boolean;
  message: string;
  data: Mahasiswa;
}

export interface MahasiswaInput {
  semester: string | number | readonly string[] | undefined;
  nim: string;
  nama_mahasiswa: string;
  jenis_kelamin: 'L' | 'P';
  tempat_lahir: string;
  tanggal_lahir: string;
  fakultas: string;
  prodi: string;
  alamat: string;
  nama_ibu_kandung: string;
  nomor_hp_orang_tua: string;
  keterangan?: string | null;
}