# Backend Mahasiswa

Dokumentasi rangkuman pengembangan proyek **Backend Mahasiswa**
berdasarkan percakapan dan kode yang telah dibahas. Dokumen ini
merangkum teknologi, struktur, fitur, pengujian API, serta perbaikan
yang sudah dilakukan.

> **Status terakhir:** Backend berhasil dikompilasi dengan
> `npm run build`, berhasil dijalankan dengan `npm run dev`, dan
> pengujian fitur penghapusan serta pemulihan data telah berhasil.
> Pengembangan frontend direncanakan sebagai tahap berikutnya.

------------------------------------------------------------------------

## Daftar Isi

1.  [Gambaran Proyek](#gambaran-proyek)
2.  [Teknologi](#teknologi)
3.  [Struktur dan Arsitektur](#struktur-dan-arsitektur)
4.  [Database](#database)
5.  [Menjalankan Backend](#menjalankan-backend)
6.  [Endpoint API](#endpoint-api)
7.  [Pengujian dengan Insomnia](#pengujian-dengan-insomnia)
8.  [Soft Delete, Restore, dan Hard
    Delete](#soft-delete-restore-dan-hard-delete)
9.  [Error Handling](#error-handling)
10. [Masalah yang Pernah Ditemui dan
    Solusinya](#masalah-yang-pernah-ditemui-dan-solusinya)
11. [Status Pengerjaan](#status-pengerjaan)
12. [Rencana Pengembangan Frontend](#rencana-pengembangan-frontend)

------------------------------------------------------------------------

## Gambaran Proyek

Proyek ini merupakan aplikasi pengelolaan data mahasiswa. Backend
menyediakan API untuk menambah, membaca, memperbarui, menghapus
sementara, memulihkan, dan menghapus permanen data mahasiswa.

Backend terhubung ke PostgreSQL. API diuji menggunakan Insomnia,
sedangkan isi tabel dan query database diperiksa menggunakan DBeaver.

## Teknologi

Teknologi yang sudah terlihat digunakan dalam proyek:

-   **Node.js** --- runtime JavaScript.
-   **TypeScript** --- bahasa pemrograman backend.
-   **Express** --- framework HTTP dan routing.
-   **PostgreSQL** --- database relasional.
-   **node-postgres (`pg`)** --- koneksi dan query PostgreSQL.
-   **Zod** --- validasi input.
-   **tsx** --- menjalankan TypeScript saat development.
-   **Insomnia** --- pengujian endpoint HTTP.
-   **DBeaver** --- pengelolaan dan pemeriksaan database.

Perintah yang tersedia:

``` bash
npm run build
npm run dev
```

`npm run build` menjalankan TypeScript Compiler (`tsc`), sedangkan
`npm run dev` menjalankan `tsx watch src/server.ts`.

------------------------------------------------------------------------

## Struktur dan Arsitektur

Bagian proyek yang telah muncul selama pengembangan:

``` text
backend_mahasiswa/
├── src/
│   ├── app.ts
│   ├── server.ts
│   ├── infrastructure/
│   │   └── database/
│   │       └── postgres.ts
│   ├── modules/
│   │   └── mahasiswa/
│   │       ├── mahasiswa.model.ts
│   │       ├── mahasiswa.repository.ts
│   │       ├── mahasiswa.repository.pg.ts
│   │       ├── mahasiswa.usecase.ts
│   │       ├── mahasiswa.handler.ts
│   │       └── mahasiswa.route.ts
│   └── shared/
│       └── middlewares/
│           └── error.middleware.ts
├── package.json
└── tsconfig.json
```

Struktur di atas merangkum file yang telah disebutkan dalam percakapan.
Nama atau lokasi file lain dapat berbeda pada kondisi proyek sebenarnya.

### Tanggung jawab tiap lapisan

  Lapisan                 Tanggung jawab
  ----------------------- -----------------------------------------------------
  Model                   Mendefinisikan bentuk data dan tipe input mahasiswa
  Repository interface    Mendefinisikan kontrak operasi data
  PostgreSQL repository   Menjalankan query SQL
  Use Case                Menjalankan aturan/alur bisnis
  Handler                 Menerima request dan mengirim response
  Route                   Menghubungkan URL dan HTTP method ke handler
  Middleware              Menangani error dan kebutuhan lintas-route
  `app.ts`                Mendaftarkan middleware dan route
  `server.ts`             Memeriksa koneksi database dan menjalankan server

------------------------------------------------------------------------

## Database

Tabel yang digunakan pada kode repository adalah:

``` sql
mahasiswa.teknik_informatika24
```

Artinya, pada konteks query PostgreSQL, `mahasiswa` adalah schema dan
`teknik_informatika24` adalah nama tabel. Pastikan schema dan tabel
tersebut memang sesuai dengan database yang dipakai backend.

### Kolom data mahasiswa

Berdasarkan struktur tabel yang dibahas, kolom data mahasiswa meliputi:

  -----------------------------------------------------------------------
  Kolom                               Keterangan
  ----------------------------------- -----------------------------------
  `id`                                Identitas mahasiswa; UUID dibuat
                                      oleh database jika default telah
                                      dikonfigurasi

  `nim`                               Nomor induk mahasiswa

  `nama_mahasiswa`                    Nama mahasiswa

  `jenis_kelamin`                     Jenis kelamin, misalnya `L` atau
                                      `P`

  `tempat_lahir`                      Tempat lahir

  `tanggal_lahir`                     Tanggal lahir

  `fakultas`                          Fakultas

  `prodi`                             Program studi

  `alamat`                            Alamat

  `nama_ibu_kandung`                  Nama ibu kandung

  `nomor_hp_orang_tua`                Nomor telepon orang tua

  `keterangan`                        Keterangan tambahan

  `created_at`                        Waktu pembuatan data

  `updated_at`                        Waktu pembaruan data

  `deleted_at`                        Penanda Soft Delete; `NULL` berarti
                                      belum di-soft-delete
  -----------------------------------------------------------------------

**Catatan:** Pastikan tipe data, batas panjang, constraint, dan nilai
default melalui DBeaver atau definisi tabel aktual. Jangan menganggap
UUID atau timestamp otomatis tersedia sebelum default database
dikonfirmasi.

### Melihat seluruh data

Di DBeaver, buka SQL Editor pada database yang digunakan backend, lalu
jalankan:

``` sql
SELECT *
FROM mahasiswa.teknik_informatika24
ORDER BY created_at DESC;
```

Melihat data yang masih aktif:

``` sql
SELECT *
FROM mahasiswa.teknik_informatika24
WHERE deleted_at IS NULL
ORDER BY created_at DESC;
```

Melihat data yang sudah di-soft-delete:

``` sql
SELECT *
FROM mahasiswa.teknik_informatika24
WHERE deleted_at IS NOT NULL
ORDER BY deleted_at DESC;
```

Memeriksa satu data berdasarkan UUID:

``` sql
SELECT *
FROM mahasiswa.teknik_informatika24
WHERE id = 'UUID_MAHASISWA';
```

Ganti `UUID_MAHASISWA` dengan UUID yang sebenarnya.

------------------------------------------------------------------------

## Menjalankan Backend

### 1. Instal dependencies

Jika dependencies belum terpasang:

``` bash
npm install
```

### 2. Periksa konfigurasi environment

Pastikan file `.env` berisi konfigurasi koneksi yang sesuai dengan
implementasi `src/infrastructure/database/postgres.ts`.

Contoh nama variabel berikut hanya ilustrasi. Gunakan nama variabel yang
benar-benar dibaca oleh kode proyek:

``` env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=nama_database
DB_USER=postgres
DB_PASSWORD=isi_password_lokal
```

Jangan mengunggah `.env` yang berisi password atau rahasia ke repository
publik. Masukkan `.env` ke `.gitignore`.

### 3. Build TypeScript

``` bash
npm run build
```

Hasil yang diharapkan adalah TypeScript selesai tanpa pesan error dan
terminal kembali ke prompt.

### 4. Jalankan server development

``` bash
npm run dev
```

Pesan yang pernah ditampilkan ketika koneksi berhasil:

``` text
PostgreSQL connected successfully
Server running at http://localhost:3000
```

Jika port atau pesan log berbeda pada konfigurasi lokal, ikuti nilai
aktual dari aplikasi.

------------------------------------------------------------------------

## Endpoint API

Base URL yang digunakan selama pengujian:

``` text
http://localhost:3000
```

Route mahasiswa yang dibahas:

``` text
/api/mahasiswa
```

Perhatikan bahwa salah satu pesan Insomnia menampilkan `/api/Mahasiswa`
dengan huruf `M` kapital. Gunakan path yang benar-benar didaftarkan pada
`mahasiswa.route.ts` dan `app.ts`. Sebaiknya konsisten menggunakan huruf
kecil: `/api/mahasiswa`.

  ------------------------------------------------------------------------------------
  Operasi           Method            Path                           Kegunaan
  ----------------- ----------------- ------------------------------ -----------------
  Create            POST              `/api/mahasiswa`               Menambahkan
                                                                     mahasiswa

  Read all          GET               `/api/mahasiswa`               Menampilkan
                                                                     mahasiswa aktif

  Read by ID        GET               `/api/mahasiswa/:id`           Mengambil
                                                                     mahasiswa
                                                                     berdasarkan UUID

  Update            PATCH             `/api/mahasiswa/:id`           Memperbarui
                                                                     sebagian data

  Soft Delete       Sesuai route yang Sesuai route                   Menandai data
                    didaftarkan                                      terhapus

  Restore           Belum dipastikan  Rencana:                       Memulihkan data
                    terdaftar sebagai `/api/mahasiswa/:id/restore`   
                    route                                            

  Hard Delete       DELETE            `/api/mahasiswa/:id`           Menghapus baris
                                                                     secara permanen
  ------------------------------------------------------------------------------------

Tidak semua route tambahan (khususnya Soft Delete dan Restore) telah
diverifikasi dari file route. Cocokkan tabel ini dengan
`mahasiswa.route.ts` sebelum menggunakannya.

------------------------------------------------------------------------

## Pengujian dengan Insomnia

Buat collection bernama `Backend Mahasiswa`. Untuk request yang mengirim
data, pilih **Body → JSON**. Untuk GET dan DELETE, umumnya tidak perlu
body.

### 1. POST --- Tambah mahasiswa

``` http
POST http://localhost:3000/api/mahasiswa
Content-Type: application/json
```

Contoh body:

``` json
{
  "nim": "230001",
  "nama_mahasiswa": "Ahmad Fauzi",
  "jenis_kelamin": "L",
  "tempat_lahir": "Jakarta",
  "tanggal_lahir": "2004-05-15",
  "fakultas": "Fakultas Teknik",
  "prodi": "Informatika",
  "alamat": "Jl. Merdeka No. 10, Jakarta",
  "nama_ibu_kandung": "Siti Aminah",
  "nomor_hp_orang_tua": "081234567890",
  "keterangan": "Mahasiswa aktif"
}
```

Jangan kirim `id`, `created_at`, `updated_at`, atau `deleted_at` jika
kolom-kolom tersebut dikelola oleh database.

Status sukses yang umum digunakan adalah `201 Created`, tetapi ikuti
status yang ditetapkan handler.

Simpan UUID dari response untuk pengujian berdasarkan ID.

### 2. GET --- Tampilkan seluruh mahasiswa

``` http
GET http://localhost:3000/api/mahasiswa
```

Body: kosong.

Implementasi `findAll` menggunakan pagination dengan parameter `limit`
dan `offset`. Use Case memiliki default halaman 1 dan limit 10, dengan
batas maksimum limit 100. Bentuk parameter URL yang diterima handler
perlu diperiksa di `mahasiswa.handler.ts`.

### 3. GET --- Tampilkan satu mahasiswa

``` http
GET http://localhost:3000/api/mahasiswa/UUID_MAHASISWA
```

Ganti UUID dengan ID dari hasil POST. Repository `findById` hanya
mengambil data dengan `deleted_at IS NULL`.

### 4. PATCH --- Perbarui sebagian data

``` http
PATCH http://localhost:3000/api/mahasiswa/UUID_MAHASISWA
Content-Type: application/json
```

Contoh body:

``` json
{
  "nama_mahasiswa": "Ahmad Fauzi Pratama",
  "alamat": "Jl. Sudirman No. 25, Jakarta",
  "keterangan": "Mahasiswa aktif semester 5"
}
```

PATCH hanya memperbarui field yang dikirim. Repository membuat klausa
`SET` dari properti input yang tidak `undefined`, lalu memperbarui
`updated_at`.

Pastikan route PATCH benar-benar didaftarkan. Pernah terjadi response
`404 Cannot PATCH` karena Express tidak menemukan route PATCH pada path
yang diminta. Jika route yang tersedia masih PUT, tambahkan route PATCH
dan pastikan validasi Zod serta handler menerima input parsial.

### 5. DELETE --- Hard Delete

``` http
DELETE http://localhost:3000/api/mahasiswa/UUID_MAHASISWA
```

Body: kosong.

Endpoint DELETE diarahkan ke Use Case `delete()`, yang memanggil
repository `hardDelete()`. Operasi ini menghapus baris dari database
secara permanen.

Setelah request berhasil, verifikasi di DBeaver:

``` sql
SELECT *
FROM mahasiswa.teknik_informatika24
WHERE id = 'UUID_MAHASISWA';
```

Jika query tidak mengembalikan baris, data tersebut sudah tidak ada di
tabel.

**Peringatan:** Hard Delete bersifat permanen dalam penggunaan normal.
Pastikan UUID benar dan pertimbangkan backup sebelum menghapus data
penting.

------------------------------------------------------------------------

## Soft Delete, Restore, dan Hard Delete

Ketiga operasi ini memiliki perilaku berbeda.

### Soft Delete

Data tidak dihapus dari tabel. Kolom `deleted_at` diisi timestamp saat
penghapusan.

Contoh SQL:

``` sql
UPDATE mahasiswa.teknik_informatika24
SET deleted_at = CURRENT_TIMESTAMP,
    updated_at = CURRENT_TIMESTAMP
WHERE id = 'UUID_MAHASISWA'
  AND deleted_at IS NULL
RETURNING id;
```

Repository memiliki fungsi `softDelete(id)` untuk operasi ini.

### Restore

Data yang telah di-soft-delete dapat dipulihkan dengan mengubah
`deleted_at` menjadi `NULL`.

Contoh SQL yang pernah digunakan:

``` sql
UPDATE mahasiswa.teknik_informatika24
SET deleted_at = NULL,
    updated_at = CURRENT_TIMESTAMP
WHERE id = 'UUID_MAHASISWA'
  AND deleted_at IS NOT NULL
RETURNING *;
```

Pemulihan data telah berhasil dilakukan melalui SQL di DBeaver. Endpoint
Restore melalui API masih perlu dipastikan implementasinya.

### Hard Delete

Data dihapus permanen dari tabel:

``` sql
DELETE FROM mahasiswa.teknik_informatika24
WHERE id = 'UUID_MAHASISWA'
RETURNING id;
```

Repository memiliki fungsi `hardDelete(id)` untuk operasi ini.

### Catatan constraint UNIQUE

Jika `nim` memiliki constraint `UNIQUE`, data yang sudah di-soft-delete
tetap menyimpan nilai NIM tersebut. Akibatnya, NIM yang sama mungkin
tidak dapat digunakan untuk mahasiswa baru sebelum data lama dipulihkan
atau dihapus permanen.

Jika ingin NIM bisa digunakan kembali setelah Soft Delete, desain
constraint perlu dipertimbangkan, misalnya unique index parsial untuk
baris aktif. Perubahan ini harus direncanakan dan diuji pada database.

------------------------------------------------------------------------

## Error Handling

Middleware error berada di:

``` text
src/shared/middlewares/error.middleware.ts
```

Middleware didaftarkan setelah seluruh route di `app.ts`, sebelum
`export default app`, agar dapat menangani error dari route.

Error PostgreSQL yang pernah ditangani:

  -----------------------------------------------------------------------------
  Kode PostgreSQL         Arti                    Respons yang direncanakan
  ----------------------- ----------------------- -----------------------------
  `23505`                 Duplicate key / UNIQUE  `409 Conflict`
                          violation               

  `22P02`                 Invalid text            `400 Bad Request`
                          representation,         
                          misalnya UUID tidak     
                          valid                   

  `23502`                 NOT NULL violation      `400 Bad Request`

  Error lainnya           Kesalahan server        `500 Internal Server Error`
  -----------------------------------------------------------------------------

Contoh response umum:

``` json
{
  "success": false,
  "message": "Terjadi kesalahan pada server"
}
```

Untuk debugging, periksa log terminal backend. Jangan menampilkan detail
internal database atau stack trace kepada pengguna API pada lingkungan
produksi.

------------------------------------------------------------------------

## Masalah yang Pernah Ditemui dan Solusinya

### 1. `relation "mahasiswa" does not exist`

**Kode:** `42P01`

Penyebab: query mencari tabel pada nama/schema yang tidak sesuai atau
koneksi mengarah ke database berbeda.

Pemeriksaan yang digunakan:

``` sql
SELECT current_database();

SELECT
    table_schema,
    table_name
FROM information_schema.tables
WHERE table_type = 'BASE TABLE'
ORDER BY table_schema, table_name;
```

Solusi pada proyek: memastikan target query dan database sesuai. Query
repository yang dibagikan kemudian menggunakan:

``` sql
mahasiswa.teknik_informatika24
```

### 2. `Cannot PATCH`

Penyebab: route PATCH tidak terdaftar pada Express untuk path yang
diminta.

Solusi: periksa `mahasiswa.route.ts`, daftarkan
`router.patch('/:id', ...)`, dan pastikan handler serta validator
mendukung input parsial.

### 3. SQL syntax error saat DELETE

**Kode:** `42601`

Kode lama memiliki kesalahan:

``` sql
DELETE FORM ...
SET deleted_at = CURRENT_TIMESTAMP
```

Kesalahan: - `FORM` seharusnya `FROM`. - `DELETE` tidak menggunakan
`SET`. - Mengisi `deleted_at` adalah operasi `UPDATE`, bukan Hard
Delete.

Solusi: pisahkan query Soft Delete dan Hard Delete.

Soft Delete:

``` sql
UPDATE mahasiswa.teknik_informatika24
SET deleted_at = CURRENT_TIMESTAMP,
    updated_at = CURRENT_TIMESTAMP
WHERE id = $1
  AND deleted_at IS NULL
RETURNING id;
```

Hard Delete:

``` sql
DELETE FROM mahasiswa.teknik_informatika24
WHERE id = $1
RETURNING id;
```

### 4. Ketidaksesuaian Interface dan Use Case

Interface awal hanya mendefinisikan `softDelete()`, sedangkan Use Case
sempat memanggil method `delete_at()` yang tidak sesuai dengan
interface.

Perbaikannya adalah menambahkan kontrak `hardDelete()` ke interface dan
mengarahkan Use Case `delete()` ke repository `hardDelete()`.

Kontrak repository yang dibahas:

``` typescript
softDelete(id: string): Promise<boolean>;
hardDelete(id: string): Promise<boolean>;
```

Use Case:

``` typescript
async softDelete(id: string): Promise<boolean> {
    return await this.mahasiswaRepository.softDelete(id);
}

async delete(id: string): Promise<boolean> {
    return await this.mahasiswaRepository.hardDelete(id);
}
```

### 5. PostgreSQL connection timeout saat `npm run dev`

Pesan error:

``` text
Connection terminated due to connection timeout
```

Build TypeScript tetap berhasil, tetapi server gagal dimulai karena
koneksi database tidak berhasil.

Pemeriksaan yang disarankan: - Pastikan service PostgreSQL berjalan jika
database lokal. - Pastikan konfigurasi host, port, database, user, dan
password sesuai. - Uji koneksi melalui DBeaver. - Pastikan database
dapat menerima koneksi.

Masalah koneksi ini kemudian berhasil diselesaikan dan backend dapat
dijalankan kembali.

------------------------------------------------------------------------

## Status Pengerjaan

Status berdasarkan percakapan terakhir:

  -----------------------------------------------------------------------
  Bagian                              Status
  ----------------------------------- -----------------------------------
  Setup PostgreSQL                    Selesai

  Setup TypeScript                    Selesai

  Model Mahasiswa                     Selesai

  Repository PostgreSQL               Selesai

  Use Case                            Selesai

  Validasi Zod                        Selesai

  Handler                             Selesai

  Route dan integrasi `app.ts`        Selesai

  Error handling middleware           Dibuat dan build berhasil

  Build TypeScript                    Berhasil

  Menjalankan backend                 Berhasil setelah masalah koneksi
                                      diselesaikan

  POST                                Sudah diuji sebelumnya

  GET                                 Endpoint dan query repository
                                      tersedia; pengujian akhir perlu
                                      dicatat

  PATCH                               Pernah mengalami `Cannot PATCH`;
                                      pastikan route PATCH sudah
                                      diperbaiki dan diuji

  Soft Delete                         Fitur tersedia/dibahas

  Restore melalui SQL                 Berhasil diuji melalui DBeaver

  Hard Delete                         Implementasi diperbaiki dan
                                      pengguna melaporkan semuanya
                                      berhasil
  -----------------------------------------------------------------------

------------------------------------------------------------------------

## Rencana Pengembangan Frontend

Setelah backend selesai, rencana berikutnya adalah membangun frontend
yang terhubung ke API backend.

Pilihan teknologi yang sempat dibahas:

-   React + Vite (rekomendasi awal).
-   HTML, CSS, dan JavaScript.
-   Next.js.

Rencana fitur frontend:

1.  Dashboard aplikasi mahasiswa.
2.  Tabel daftar mahasiswa dengan pagination.
3.  Form tambah mahasiswa.
4.  Detail mahasiswa.
5.  Edit data mahasiswa.
6.  Soft Delete.
7.  Halaman Trash untuk melihat data terhapus.
8.  Restore data.
9.  Hard Delete dengan konfirmasi.
10. Integrasi ke API backend.

Pilihan framework dan desain frontend belum ditetapkan. Diskusi frontend
akan dimulai sebagai tahap baru.

------------------------------------------------------------------------

## Catatan Penting untuk Melanjutkan Proyek

-   Pertahankan nama tabel yang benar: `mahasiswa.teknik_informatika24`,
    sesuai query repository yang dibagikan.
-   Periksa route aktual sebelum mengandalkan daftar endpoint dalam
    dokumentasi ini.
-   Jangan mengirim password database atau file `.env` ke publik.
-   Simpan backup database sebelum melakukan perubahan skema atau Hard
    Delete dalam jumlah besar.
-   Setelah mengubah kode TypeScript, jalankan:

``` bash
npm run build
```

-   Untuk menjalankan backend:

``` bash
npm run dev
```

**Dokumentasi ini merupakan rangkuman percakapan dan implementasi yang
telah dibahas, bukan pengganti pemeriksaan kode proyek terkini.** Jika
implementasi berubah, perbarui bagian endpoint, struktur folder, dan
status pengerjaan agar README tetap akurat.
