
import { useState } from "react";
import { X, Save } from "lucide-react";
import api from "../services/api";
import type { MahasiswaInput } from "../types/mahasiswa";
import axios from 'axios';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

function TambahMahasiswaModal({ onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState<MahasiswaInput & { semester: number }>({
    nim: "",
    nama_mahasiswa: "",
    jenis_kelamin: "L",
    tempat_lahir: "",
    tanggal_lahir: "",
    fakultas: "",
    prodi: "",
    alamat: "",
    nama_ibu_kandung: "",
    nomor_hp_orang_tua: "",
    keterangan: "",
    semester : 1
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: name === "semester" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      await api.post("/mahasiswa", form);

      alert("Data mahasiswa berhasil ditambahkan!");

      onSuccess();
      onClose();
    } catch (err: unknown) {
      console.error("Gagal menambahkan mahasiswa:", err);

      if (axios.isAxiosError(err)) {
      const responseMessage = err.response?.data?.message;

        setError(
          typeof responseMessage === "string"
            ? responseMessage
            : "Gagal menyimpan data mahasiswa. Periksa kembali data yang dimasukkan."
        );
      } else {
        setError("Terjadi kesalahan saat menyimpan data.");
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  const labelClass =
    "block text-sm font-semibold text-slate-700 mb-2";

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/50 flex items-center justify-center p-4">

      <div className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-xl">

        {/* HEADER */}
        <div className="sticky top-0 bg-white border-b border-slate-100 p-6 flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              Tambah Mahasiswa
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Masukkan informasi mahasiswa baru.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"
          >
            <X size={22} />
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="p-6">

          {error && (
            <div className="mb-5 p-4 bg-red-50 text-red-600 rounded-xl text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* NIM */}
            <div>
              <label className={labelClass}>NIM *</label>
              <input
                name="nim"
                value={form.nim}
                onChange={handleChange}
                maxLength={20}
                required
                placeholder="Masukkan NIM"
                className={inputClass}
              />
            </div>

            {/* NAMA */}
            <div>
              <label className={labelClass}>Nama Mahasiswa *</label>
              <input
                name="nama_mahasiswa"
                value={form.nama_mahasiswa}
                onChange={handleChange}
                maxLength={150}
                required
                placeholder="Masukkan nama mahasiswa"
                className={inputClass}
              />
            </div>

            {/* JENIS KELAMIN */}
            <div>
              <label className={labelClass}>Jenis Kelamin *</label>
              <select
                name="jenis_kelamin"
                value={form.jenis_kelamin}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </select>
            </div>

            {/* TEMPAT LAHIR */}
            <div>
              <label className={labelClass}>Tempat Lahir *</label>
              <input
                name="tempat_lahir"
                value={form.tempat_lahir}
                onChange={handleChange}
                maxLength={100}
                required
                placeholder="Masukkan tempat lahir"
                className={inputClass}
              />
            </div>

            {/* TANGGAL LAHIR */}
            <div>
              <label className={labelClass}>Tanggal Lahir *</label>
              <input
                type="date"
                name="tanggal_lahir"
                value={form.tanggal_lahir}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </div>

            {/* FAKULTAS */}
            <div>
              <label className={labelClass}>Fakultas *</label>
              <input
                name="fakultas"
                value={form.fakultas}
                onChange={handleChange}
                maxLength={150}
                required
                placeholder="Masukkan fakultas"
                className={inputClass}
              />
            </div>

            {/* PRODI */}
            <div>
              <label className={labelClass}>Program Studi *</label>
              <select
                name="prodi"
                value={form.prodi}
                onChange={handleChange}
                required
                className={inputClass}
              >
                <option value="">Pilih Program Studi</option>
                <option value="Teknik Informatika">Teknik Informatika</option>
                <option value="Sistem Informasi">Sistem Informasi</option>
                <option value="Agroindustri">Agroindustri</option>
              </select>
            </div>


            {/* SEMESTER */}
          <div>
            <label className={labelClass}>Semester *</label>
            <select
              name="semester"
              value={form.semester}
              onChange={handleChange}
              required
              className={inputClass}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((semester) => (
                <option key={semester} value={semester}>
                  Semester {semester}
                </option>
              ))}
            </select>
          </div>


            {/* NOMOR HP */}
            <div>
              <label className={labelClass}>Nomor HP Orang Tua *</label>
              <input
                type="tel"
                name="nomor_hp_orang_tua"
                value={form.nomor_hp_orang_tua}
                onChange={handleChange}
                minLength={8}
                maxLength={20}
                required
                placeholder="Contoh: 081234567890"
                className={inputClass}
              />
            </div>

            {/* NAMA IBU */}
            <div className="md:col-span-2">
              <label className={labelClass}>Nama Ibu Kandung *</label>
              <input
                name="nama_ibu_kandung"
                value={form.nama_ibu_kandung}
                onChange={handleChange}
                maxLength={150}
                required
                placeholder="Masukkan nama ibu kandung"
                className={inputClass}
              />
            </div>

            {/* ALAMAT */}
            <div className="md:col-span-2">
              <label className={labelClass}>Alamat *</label>
              <textarea
                name="alamat"
                value={form.alamat}
                onChange={handleChange}
                required
                rows={3}
                placeholder="Masukkan alamat lengkap"
                className={inputClass}
              />
            </div>

            {/* KETERANGAN */}
            <div className="md:col-span-2">
              <label className={labelClass}>Keterangan (Opsional)</label>
              <textarea
                name="keterangan"
                value={form.keterangan ?? ""}
                onChange={handleChange}
                rows={3}
                placeholder="Tambahkan keterangan jika diperlukan"
                className={inputClass}
              />
            </div>

          </div>

          {/* FOOTER */}
          <div className="flex justify-end gap-3 mt-8 pt-5 border-t border-slate-100">

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
            >
              <Save size={18} />
              {loading ? "Menyimpan..." : "Simpan Mahasiswa"}
            </button>

          </div>

        </form>
      </div>
    </div>
  );
}

export default TambahMahasiswaModal;
