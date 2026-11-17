# Backend Mahasiswa

Dokumentasi ini merangkum proses dan keputusan teknis proyek **Backend
Mahasiswa** dari tahap persiapan database sampai pengembangan API.
Proyek dibuat menggunakan **Node.js, TypeScript, Express, PostgreSQL**,
dan diuji menggunakan **Insomnia**. Database dapat dikelola melalui
**DBeaver**, sedangkan kode dikembangkan di **Visual Studio Code**.

> **Status terakhir:** Database `db_mahasiswa`, tabel `mahasiswa`,
> konfigurasi TypeScript/Node, koneksi PostgreSQL, endpoint health
> check, serta lapisan utama modul mahasiswa telah disiapkan. File-file
> middleware penanganan error global juga sudah dibuat/dipasang. Langkah
> berikutnya adalah memastikan integrasi route, menjalankan build, lalu
> menguji endpoint CRUD melalui Insomnia.

------------------------------------------------------------------------

## 1. Tujuan proyek

Membangun REST API untuk mengelola data mahasiswa dengan struktur kode
berlapis, mengikuti pola proyek referensi dosen `Hari-7.zip`, dengan
beberapa perbaikan agar lebih konsisten dan aman.

Fitur yang dituju:

-   Menambahkan data mahasiswa.
-   Melihat daftar mahasiswa dengan pagination.
-   Melihat detail mahasiswa berdasarkan UUID.
-   Memperbarui data mahasiswa.
-   Menghapus data mahasiswa secara **soft delete**.
-   Validasi input menggunakan Zod.
-   Penanganan error secara terpusat.
-   Penyimpanan data menggunakan PostgreSQL.

## 2. Teknologi

  Teknologi    Kegunaan
  ------------ --------------------------------------------
  Node.js      Runtime JavaScript
  TypeScript   Bahasa pemrograman dengan pemeriksaan tipe
  Express      Framework HTTP/API
  PostgreSQL   Database relasional
  DBeaver      GUI untuk mengelola PostgreSQL
  Insomnia     Mengirim dan menguji HTTP request
  Zod          Validasi data request
  `pg`         Koneksi PostgreSQL dari Node.js
  `tsx`        Menjalankan TypeScript saat development
  Helmet       Security-related HTTP headers
  CORS         Mengatur akses lintas origin
  dotenv       Membaca konfigurasi dari `.env`

## 3. Struktur folder yang dituju

Struktur berikut menggambarkan pemisahan tanggung jawab yang digunakan.
Nama file dapat disesuaikan dengan file yang sudah dibuat di proyek.

``` text
backend_mahasiswa/
├── src/
│   ├── config/
│   │   └── env.ts
│   ├── infrastructure/
│   │   └── database/
│   │       └── postgres.ts
│   ├── middleware/
│   │   ├── error.middleware.ts
│   │   └── not-found.middleware.ts
│   ├── modules/
│   │   └── mahasiswa/
│   │       ├── mahasiswa.model.ts
│   │       ├── mahasiswa.repository.ts
│   │       ├── mahasiswa.repository.pg.ts
│   │       ├── mahasiswa.usecase.ts
│   │       ├── mahasiswa.validation.ts
│   │       ├── mahasiswa.handler.ts
│   │       └── mahasiswa.route.ts
│   ├── app.ts
│   └── server.ts
├── .env
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
└── tsconfig.json
```

Tanggung jawab setiap lapisan:

-   **Model:** mendefinisikan bentuk data dan tipe input.
-   **Repository interface:** mendefinisikan kontrak operasi data.
-   **PostgreSQL repository:** menjalankan query SQL.
-   **Use case:** mengatur alur/aturan aplikasi.
-   **Validation:** memeriksa bentuk dan isi request.
-   **Handler:** menerima request, memanggil use case, dan mengirim
    response.
-   **Route:** memasangkan URL dan HTTP method ke handler.
-   **Middleware:** menangani 404 dan error secara terpusat.
-   **App:** menyusun middleware dan route Express.
-   **Server:** menguji koneksi database dan menjalankan HTTP server.

## 4. Persiapan database PostgreSQL

### 4.1 Membuat database

Database yang digunakan:

``` sql
CREATE DATABASE db_mahasiswa;
```

Database tersebut sudah berhasil dibuat melalui PostgreSQL/DBeaver.

### 4.2 Membuat tabel `mahasiswa`

Pilih database `db_mahasiswa`, lalu jalankan SQL berikut:

``` sql
CREATE TABLE mahasiswa (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nim VARCHAR(20) NOT NULL UNIQUE,
    nama_mahasiswa VARCHAR(150) NOT NULL,
    jenis_kelamin CHAR(1) NOT NULL
        CHECK (jenis_kelamin IN ('L', 'P')),
    tempat_lahir VARCHAR(100) NOT NULL,
    tanggal_lahir DATE NOT NULL,
    fakultas VARCHAR(150) NOT NULL,
    prodi VARCHAR(150) NOT NULL,
    alamat TEXT NOT NULL,
    nama_ibu_kandung VARCHAR(150) NOT NULL,
    nomor_hp_orang_tua VARCHAR(20) NOT NULL,
    keterangan TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ DEFAULT NULL
);
```

**Catatan kolom:**

  Kolom                  Fungsi
  ---------------------- ----------------------------------------------------
  `id`                   UUID unik yang dibuat otomatis oleh PostgreSQL
  `nim`                  Nomor Induk Mahasiswa, wajib dan unik
  `nama_mahasiswa`       Nama mahasiswa
  `jenis_kelamin`        `L` untuk laki-laki atau `P` untuk perempuan
  `tempat_lahir`         Tempat lahir
  `tanggal_lahir`        Tanggal lahir dengan format tanggal
  `fakultas`             Nama fakultas
  `prodi`                Nama program studi
  `alamat`               Alamat mahasiswa
  `nama_ibu_kandung`     Nama ibu kandung
  `nomor_hp_orang_tua`   Nomor HP/WhatsApp orang tua atau wali
  `keterangan`           Keterangan tambahan, boleh kosong
  `created_at`           Waktu data dibuat
  `updated_at`           Waktu data terakhir diperbarui
  `deleted_at`           Waktu penghapusan; `NULL` berarti data masih aktif

Jika `gen_random_uuid()` tidak dikenali pada versi/konfigurasi
PostgreSQL yang digunakan, aktifkan ekstensi berikut:

``` sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;
```

### 4.3 Konsep soft delete

Data tidak langsung dihapus secara permanen. Saat endpoint DELETE
dipanggil, aplikasi mengisi `deleted_at` dengan waktu saat itu. Query
daftar dan detail hanya mengambil data dengan kondisi:

``` sql
WHERE deleted_at IS NULL
```

Dengan demikian, data yang sudah dihapus tidak tampil pada API normal,
tetapi masih tersimpan di database.

## 5. Persiapan project Node.js

Buka terminal di folder proyek:

``` powershell
cd C:\Users\hamid\Desktop\mahasiswa\backend_mahasiswa
```

Inisialisasi project:

``` bash
npm init -y
```

Install dependency utama:

``` bash
npm install express cors helmet dotenv pg zod
```

Install dependency development:

``` bash
npm install -D typescript tsx @types/node @types/express @types/cors @types/pg
```

### 5.1 `package.json`

Pastikan properti `"type"` dan scripts kurang lebih seperti ini. Jangan
menghapus `dependencies` atau `devDependencies` yang dibuat oleh npm.

``` json
{
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js"
  }
}
```

### 5.2 `tsconfig.json`

Konfigurasi TypeScript menggunakan NodeNext/ES Modules:

``` json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "rootDir": "./src",
    "outDir": "./dist",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

### 5.3 File `.env`

Buat `.env` di root proyek, sejajar dengan `package.json`:

``` env
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=db_mahasiswa
DB_USER=postgres
DB_PASSWORD=ISI_PASSWORD_POSTGRES_KAMU
```

Ganti `ISI_PASSWORD_POSTGRES_KAMU` dengan password PostgreSQL lokal yang
benar. Jangan menambahkan tanda kutip jika tidak diperlukan.

Buat `.env.example` dengan bentuk yang sama, tetapi tanpa password asli:

``` env
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=db_mahasiswa
DB_USER=postgres
DB_PASSWORD=
```

### 5.4 `.gitignore`

``` gitignore
node_modules/
dist/
.env
```

Jangan mengunggah `.env` yang berisi password ke GitHub.

## 6. Konfigurasi dan koneksi database

### `src/config/env.ts`

File ini membaca dan memvalidasi konfigurasi environment menggunakan
dotenv dan Zod. Pastikan file memuat `dotenv/config` sebelum membaca
`process.env`.

Bentuk konfigurasi yang diperlukan:

-   `NODE_ENV`
-   `PORT`
-   `DB_HOST`
-   `DB_PORT`
-   `DB_NAME`
-   `DB_USER`
-   `DB_PASSWORD`

### `src/infrastructure/database/postgres.ts`

File ini membuat PostgreSQL connection pool dari package `pg`,
menggunakan konfigurasi pada `env.ts`.

Konfigurasi pool yang telah digunakan:

``` ts
max: 10,
idleTimeoutMillis: 30000,
connectionTimeoutMillis: 5000
```

Pool juga memasang event listener `error` untuk mencatat error koneksi
yang tidak terduga.

### `src/server.ts`

Server melakukan query sederhana `SELECT 1` sebelum mulai menerima
request. Jika database tidak dapat dihubungi, server seharusnya tidak
melanjutkan startup seolah-olah koneksi berhasil. Server juga menyiapkan
graceful shutdown ketika proses menerima sinyal penghentian.

## 7. Model data TypeScript

File `mahasiswa.model.ts` mendefinisikan tiga tipe utama:

-   `Mahasiswa`: data lengkap dari database, termasuk UUID dan
    timestamp.
-   `CreateMahasiswaInput`: field yang diperlukan saat membuat data.
-   `UpdateMahasiswaInput`: field opsional untuk proses pembaruan.

Jenis kelamin dibatasi menjadi:

``` ts
'L' | 'P'
```

Field `keterangan` boleh bernilai `string` atau `null`. Field tanggal
lahir diterima dari API dalam bentuk string `YYYY-MM-DD`.

## 8. Repository dan query database

Interface `MahasiswaRepository` mendefinisikan operasi:

``` ts
create(input)
findById(id)
findAll(limit, offset)
update(id, input)
softDelete(id)
```

Implementasi PostgreSQL berada di `mahasiswa.repository.pg.ts`.

Perilaku query yang direncanakan:

-   `create`: INSERT data mahasiswa dan mengembalikan baris yang dibuat.
-   `findById`: SELECT berdasarkan UUID dan hanya mengambil data aktif.
-   `findAll`: SELECT data aktif dengan `LIMIT` dan `OFFSET`, serta
    query COUNT untuk total data.
-   `update`: UPDATE hanya field yang dikirim, memperbarui `updated_at`,
    dan hanya mengubah data aktif.
-   `softDelete`: mengisi `deleted_at` dan `updated_at`, bukan
    menjalankan DELETE permanen.

Query harus menggunakan parameter seperti `$1`, `$2`, dan seterusnya,
bukan menggabungkan input pengguna langsung ke SQL.

**Penting:** `mahasiswa.repository.pg.ts` yang telah diberikan pada
tahap sebelumnya mengimpor singleton `postgres` secara langsung. Karena
itu, route saat ini menggunakan `new MahasiswaRepositoryPg()` tanpa
argumen constructor. Jangan menambahkan argumen `postgres` kecuali
implementasi repository diubah menjadi dependency injection.

## 9. Use case dan pagination

`MahasiswaUseCase` menjadi perantara antara handler dan repository.

Untuk daftar mahasiswa, pagination menggunakan:

-   `page`: halaman yang diminta, default `1`.
-   `limit`: jumlah data per halaman, default `10`.
-   Maksimum `limit`: `100`.
-   `offset`: `(page - 1) * limit`.
-   `total`: jumlah seluruh data aktif.
-   `totalPages`: jumlah halaman berdasarkan total data dan limit.

Contoh request:

``` http
GET /api/mahasiswa?page=1&limit=10
```

## 10. Validasi request

Validasi dilakukan menggunakan Zod di `mahasiswa.validation.ts`.

Aturan validasi yang telah disusun:

-   NIM wajib, maksimal 20 karakter.
-   Nama mahasiswa wajib, maksimal 150 karakter.
-   Jenis kelamin hanya `L` atau `P`.
-   Tempat lahir wajib, maksimal 100 karakter.
-   Tanggal lahir wajib dengan format `YYYY-MM-DD` dan harus merupakan
    tanggal kalender yang valid.
-   Fakultas dan prodi wajib.
-   Alamat wajib.
-   Nama ibu kandung wajib.
-   Nomor HP orang tua/wali terdiri dari 8--20 karakter dan dibatasi ke
    karakter nomor telepon yang umum (`0-9`, `+`, `(`, `)`, `-`, spasi).
-   Keterangan boleh tidak dikirim atau bernilai `null`.
-   Request yang mengandung field yang tidak dikenal ditolak (`strict`).
-   Update harus mengirim minimal satu field.

## 11. Handler, route, dan middleware

### Handler

`mahasiswa.handler.ts` menangani request dan response untuk operasi
create, get all, get by ID, update, dan delete. Handler melakukan
validasi input, memanggil use case, lalu meneruskan error ke middleware
global melalui `next(error)`.

Kode status yang digunakan:

  Kondisi                  HTTP status
  ---------------------- -------------
  Data berhasil dibuat             201
  Request berhasil                 200
  Validasi gagal                   400
  Data tidak ditemukan             404
  Error tak terduga                500

### Route

Route modul mahasiswa dipasang di prefix:

``` text
/api/mahasiswa
```

Pola endpoint yang digunakan:

  Method   Path                   Fungsi
  -------- ---------------------- ----------------------------
  POST     `/api/mahasiswa`       Membuat mahasiswa
  GET      `/api/mahasiswa`       Melihat daftar mahasiswa
  GET      `/api/mahasiswa/:id`   Melihat detail mahasiswa
  PATCH    `/api/mahasiswa/:id`   Memperbarui sebagian field
  DELETE   `/api/mahasiswa/:id`   Soft delete mahasiswa

Untuk update sebagian field, gunakan `PATCH`. Jika file route saat ini
masih memakai `router.put('/:id', ...)`, ubah menjadi:

``` ts
router.patch('/:id', mahasiswaHandler.update);
```

### Urutan middleware di `app.ts`

Urutan yang perlu dijaga:

1.  Security middleware seperti Helmet.
2.  CORS.
3.  Parser JSON dan URL-encoded.
4.  Health check.
5.  Route API mahasiswa.
6.  Middleware 404.
7.  Error handler global.

Error handler harus dipasang setelah route dan middleware 404 agar dapat
menangani error yang diteruskan oleh handler.

Health check yang sudah berhasil diuji:

``` http
GET /health
```

Response:

``` json
{
  "success": true,
  "message": "API is running"
}
```

## 12. Menjalankan dan memeriksa project

### 12.1 Periksa TypeScript

Dari root proyek:

``` bash
npm run build
```

Build TypeScript telah berhasil pada beberapa tahap penulisan file
sebelumnya. Jalankan kembali setelah perubahan terakhir untuk memastikan
tidak ada error baru.

### 12.2 Jalankan server development

``` bash
npm run dev
```

Server diharapkan berjalan pada:

``` text
http://localhost:3000
```

Periksa health check melalui browser atau Insomnia:

``` http
GET http://localhost:3000/health
```

Response sukses:

``` json
{
  "success": true,
  "message": "API is running"
}
```

## 13. Pengujian API menggunakan Insomnia

Setelah server berjalan, buat request berikut di Insomnia.

### 13.1 Create mahasiswa

``` http
POST http://localhost:3000/api/mahasiswa
Content-Type: application/json
```

Body JSON contoh:

``` json
{
  "nim": "230001",
  "nama_mahasiswa": "Budi Santoso",
  "jenis_kelamin": "L",
  "tempat_lahir": "Jakarta",
  "tanggal_lahir": "2004-05-20",
  "fakultas": "Fakultas Teknik",
  "prodi": "Informatika",
  "alamat": "Jakarta",
  "nama_ibu_kandung": "Siti Aminah",
  "nomor_hp_orang_tua": "081234567890",
  "keterangan": "Mahasiswa aktif"
}
```

Hasil yang diharapkan: HTTP `201`, response berisi data mahasiswa
termasuk `id` UUID yang dibuat otomatis oleh PostgreSQL.

Simpan UUID dari response untuk pengujian berikutnya.

### 13.2 Get all mahasiswa

``` http
GET http://localhost:3000/api/mahasiswa
```

Dengan pagination:

``` http
GET http://localhost:3000/api/mahasiswa?page=1&limit=10
```

Hasil yang diharapkan: HTTP `200`, berisi array data dan informasi
pagination. Data yang sudah soft delete tidak boleh muncul.

### 13.3 Get mahasiswa by ID

Ganti `{UUID}` dengan nilai `id` dari response create:

``` http
GET http://localhost:3000/api/mahasiswa/{UUID}
```

Hasil yang diharapkan: HTTP `200` jika data aktif ditemukan, atau `404`
jika tidak ditemukan/tidak aktif.

### 13.4 Update mahasiswa

``` http
PATCH http://localhost:3000/api/mahasiswa/{UUID}
Content-Type: application/json
```

Body contoh:

``` json
{
  "alamat": "Bandung, Jawa Barat",
  "nomor_hp_orang_tua": "081298765432"
}
```

Hasil yang diharapkan: HTTP `200`; hanya field yang dikirim yang berubah
dan `updated_at` diperbarui.

### 13.5 Soft delete mahasiswa

``` http
DELETE http://localhost:3000/api/mahasiswa/{UUID}
```

Hasil yang diharapkan: HTTP `200`. Kolom `deleted_at` terisi. Data tidak
lagi muncul di daftar dan endpoint detail.

### 13.6 Uji validasi

Coba beberapa kondisi berikut:

-   `jenis_kelamin` diisi `X`.
-   `tanggal_lahir` diisi `2024-02-30`.
-   NIM tidak diisi.
-   Nomor HP terlalu pendek.
-   UUID pada URL tidak valid.
-   Body PATCH kosong.

Hasil yang diharapkan: HTTP `400` dengan pesan validasi yang jelas.

## 14. Pengecekan langsung di DBeaver

Untuk memeriksa data:

``` sql
SELECT *
FROM mahasiswa
ORDER BY created_at DESC;
```

Untuk melihat hanya data aktif:

``` sql
SELECT *
FROM mahasiswa
WHERE deleted_at IS NULL
ORDER BY created_at DESC;
```

Untuk melihat data yang sudah di-soft-delete:

``` sql
SELECT *
FROM mahasiswa
WHERE deleted_at IS NOT NULL
ORDER BY deleted_at DESC;
```

Untuk memeriksa jumlah data aktif:

``` sql
SELECT COUNT(*)
FROM mahasiswa
WHERE deleted_at IS NULL;
```

## 15. Catatan perbaikan dan hal yang perlu diverifikasi

Beberapa hal perlu diperiksa saat integrasi akhir:

1.  Pastikan `.env` berada di root proyek, sejajar dengan
    `package.json`.
2.  Pastikan `DB_PASSWORD` benar dan server PostgreSQL sedang berjalan.
3.  Pastikan `app.ts` memasang `mahasiswaRouter` pada `/api/mahasiswa`.
4.  Pastikan route update menggunakan `PATCH` jika mengikuti pola update
    sebagian field.
5.  Pastikan middleware 404 dan error handler berada setelah semua
    route.
6.  Pastikan `mahasiswa.repository.pg.ts` dan route konsisten:
    implementasi repository saat ini menggunakan singleton `postgres`,
    sehingga `new MahasiswaRepositoryPg()` tidak menerima argumen.
7.  Pastikan pelanggaran unique constraint NIM (`23505`) ditangani
    sebagai konflik, idealnya HTTP `409`, bukan error server umum `500`.
8.  `updated_at` saat ini diperbarui oleh query UPDATE aplikasi. Jika
    ada perubahan data langsung melalui DBeaver, timestamp tidak
    otomatis berubah kecuali ditambahkan trigger database.
9.  Soft delete berarti data tetap ada di database. Jika suatu saat
    dibutuhkan penghapusan permanen, buat prosedur terpisah dan jangan
    mengubah perilaku soft delete tanpa pertimbangan.

## 16. Urutan pekerjaan selanjutnya

Checklist untuk melanjutkan proyek:

-   [x] Membuat database `db_mahasiswa`.
-   [x] Membuat tabel `mahasiswa`.
-   [x] Memastikan UUID dibuat otomatis oleh PostgreSQL.
-   [x] Inisialisasi project Node.js dan instalasi dependency.
-   [x] Menyiapkan konfigurasi TypeScript dan environment.
-   [x] Menghubungkan backend ke PostgreSQL.
-   [x] Menjalankan health check dan memperoleh HTTP 200.
-   [x] Menulis model, repository interface, repository PostgreSQL, use
    case, validation, handler, dan route.
-   [x] Menjalankan build TypeScript pada tahap-tahap sebelumnya.
-   [x] Menyiapkan middleware error global.
-   [ ] Memastikan route terpasang di `app.ts` dan urutan middleware
    benar.
-   [ ] Mengubah route update menjadi PATCH jika masih PUT.
-   [ ] Jalankan `npm run build` kembali.
-   [ ] Jalankan `npm run dev`.
-   [ ] Uji POST, GET list, GET by ID, PATCH, dan DELETE di Insomnia.
-   [ ] Verifikasi hasil create/update/soft delete di DBeaver.
-   [ ] Tangani NIM duplikat dengan response HTTP 409.
-   [ ] Rapikan dokumentasi dan finalisasi proyek.

------------------------------------------------------------------------

## 17. Ringkasan endpoint

  Method   Endpoint               Keterangan
  -------- ---------------------- --------------------
  GET      `/health`              Memeriksa API
  POST     `/api/mahasiswa`       Tambah mahasiswa
  GET      `/api/mahasiswa`       Daftar mahasiswa
  GET      `/api/mahasiswa/:id`   Detail mahasiswa
  PATCH    `/api/mahasiswa/:id`   Ubah sebagian data
  DELETE   `/api/mahasiswa/:id`   Soft delete

## 18. Prinsip kerja selama pengembangan

Agar proses belajar mudah diikuti dan setiap kesalahan bisa ditemukan:

1.  Kerjakan satu tahap terlebih dahulu.
2.  Salin kode ke file yang sesuai.
3.  Simpan file.
4.  Jalankan `npm run build` untuk memeriksa TypeScript.
5.  Jika build berhasil, lanjutkan ke tahap berikutnya.
6.  Jalankan server dan uji request di Insomnia.
7.  Periksa perubahan data melalui DBeaver.
8.  Jika muncul error, catat pesan error lengkap dan file/baris yang
    terkait sebelum mengubah kode.

**Dokumen ini merupakan catatan progres dan panduan kerja.** Status
checklist menandai tahapan yang telah dilaporkan berhasil selama
percakapan; item yang belum diuji end-to-end tetap ditandai sebagai
pekerjaan berikutnya.
