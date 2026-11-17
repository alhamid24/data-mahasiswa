
import { z } from 'zod';

// Validasi tanggal lahir
const tanggalLahirSchema = z.string()
    .regex(
        /^\d{4}-\d{2}-\d{2}$/,
        'Tanggal lahir harus menggunakan format YYYY-MM-DD'
    )
    .refine(
        (value) => {
            const date = new Date(`${value}T00:00:00.000Z`);

            return !Number.isNaN(date.getTime()) &&
                date.toISOString().slice(0, 10) === value;
        },
        'Tanggal lahir tidak valid'
    );

// Validasi nomor HP orang tua
const nomorHpSchema = z.string()
    .min(8, 'Nomor HP minimal 8 karakter')
    .max(20, 'Nomor HP maksimal 20 karakter')
    .regex(
        /^[0-9+()\-\s]+$/,
        'Format nomor HP tidak valid'
    );

// Validasi data mahasiswa saat CREATE

export const createMahasiswaSchema = z.object({
    nim: z.string()
        .min(1, 'NIM wajib diisi')
        .max(20, 'NIM maksimal 20 karakter'),

    nama_mahasiswa: z.string()
        .min(1, 'Nama mahasiswa wajib diisi')
        .max(150, 'Nama maksimal 150 karakter'),

    jenis_kelamin: z.enum(
        ['L', 'P'],
        'Jenis kelamin hanya boleh L atau P'
    ),

    tempat_lahir: z.string()
        .min(1, 'Tempat lahir wajib diisi')
        .max(100),

    tanggal_lahir: tanggalLahirSchema,

    fakultas: z.string()
        .min(1, 'Fakultas wajib diisi')
        .max(150),

    prodi: z.enum([
        'Teknik Informatika',
        'Sistem Informasi',
        'Agroindustri'
    ]),

    semester: z.number()
        .int('Semester harus berupa bilangan bulat')
        .min(1, 'Semester minimal 1')
        .max(8, 'Semester maksimal 8'),

    alamat: z.string()
        .min(1, 'Alamat wajib diisi'),

    nama_ibu_kandung: z.string()
        .min(1, 'Nama ibu kandung wajib diisi')
        .max(150),

    nomor_hp_orang_tua: nomorHpSchema,

    keterangan: z.string()
        .nullable()
        .optional()
}).strict();

export const filterMahasiswaSchema = z.object({
    prodi: z.enum([
        'Teknik Informatika',
        'Sistem Informasi',
        'Agroindustri'
    ]),
    semester: z.coerce.number()
        .int('Semester harus berupa bilangan bulat')
        .min(1, 'Semester minimal 1')
        .max(8, 'Semester maksimal 8')
});

export const updateMahasiswaSchema =
    createMahasiswaSchema.partial()
        .strict()
        .refine(
            (data) => Object.keys(data).length > 0,
            'Minimal satu data harus diisi untuk diperbarui'
        );