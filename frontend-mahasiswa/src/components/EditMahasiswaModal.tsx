
import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { X, Save } from "lucide-react";

import api from "../services/api";
import type { Mahasiswa, MahasiswaInput } from "../types/mahasiswa";

interface Props {
  mahasiswa: Mahasiswa;
  onClose: () => void;
  onSuccess: () => void;
}

function EditMahasiswaModal({
  mahasiswa,
  onClose,
  onSuccess,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState<MahasiswaInput>({
    nim: mahasiswa.nim,
    nama_mahasiswa: mahasiswa.nama_mahasiswa,
    jenis_kelamin: mahasiswa.jenis_kelamin,
    tempat_lahir: mahasiswa.tempat_lahir,
    tanggal_lahir: mahasiswa.tanggal_lahir.slice(0, 10),
    fakultas: mahasiswa.fakultas,
    prodi: mahasiswa.prodi,
    alamat: mahasiswa.alamat,
    nama_ibu_kandung: mahasiswa.nama_ibu_kandung,
    nomor_hp_orang_tua: mahasiswa.nomor_hp_orang_tua,
    keterangan: mahasiswa.keterangan ?? "",
    semester: mahasiswa.semester ?? 1,
  });

  const handleChange = (
    e: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: name === "semester" ? Number(value) :value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      await api.patch(`/mahasiswa/${mahasiswa.id}`, form);

      alert("Data mahasiswa berhasil diperbarui!");

      onSuccess();
      onClose();
    } catch (err: unknown) {
    console.error("Gagal memperbarui mahasiswa:", err);

    const errorData = (
        err as {
        response?: {
            data?: {
            message?: string;
            };
        };
        }
    );

    const responseMessage = errorData.response?.data?.message;

    setError(
        typeof responseMessage === "string"
        ? responseMessage
        : "Gagal memperbarui data. Periksa kembali data yang dimasukkan."
    );
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
              Edit Mahasiswa
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Perbarui informasi mahasiswa.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
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

            <div>
              <label className={labelClass}>NIM *</label>
              <input
                name="nim"
                value={form.nim}
                onChange={handleChange}
                maxLength={20}
                required
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Nama Mahasiswa *</label>
              <input
                name="nama_mahasiswa"
                value={form.nama_mahasiswa}
                onChange={handleChange}
                maxLength={150}
                required
                className={inputClass}
              />
            </div>

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

            <div>
              <label className={labelClass}>Tempat Lahir *</label>
              <input
                name="tempat_lahir"
                value={form.tempat_lahir}
                onChange={handleChange}
                maxLength={100}
                required
                className={inputClass}
              />
            </div>

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

            <div>
              <label className={labelClass}>Fakultas *</label>
              <input
                name="fakultas"
                value={form.fakultas}
                onChange={handleChange}
                maxLength={150}
                required
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Program Studi *</label>
              <input
                name="prodi"
                value={form.prodi}
                onChange={handleChange}
                maxLength={150}
                required
                className={inputClass}
              />
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
                <option value="">Pilih Semester</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((semester) => (
                  <option key={semester} value={semester}>
                    Semester {semester}
                  </option>
                ))}
              </select>
            </div>

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
                className={inputClass}
              />
            </div>

            <div className="md:col-span-2">
              <label className={labelClass}>Nama Ibu Kandung *</label>
              <input
                name="nama_ibu_kandung"
                value={form.nama_ibu_kandung}
                onChange={handleChange}
                maxLength={150}
                required
                className={inputClass}
              />
            </div>

            <div className="md:col-span-2">
              <label className={labelClass}>Alamat *</label>
              <textarea
                name="alamat"
                value={form.alamat}
                onChange={handleChange}
                rows={3}
                required
                className={inputClass}
              />
            </div>

            <div className="md:col-span-2">
              <label className={labelClass}>Keterangan (Opsional)</label>
              <textarea
                name="keterangan"
                value={form.keterangan ?? ""}
                onChange={handleChange}
                rows={3}
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
              {loading ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default EditMahasiswaModal;