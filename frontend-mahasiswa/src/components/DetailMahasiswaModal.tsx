
import { useEffect, useState } from "react";
import { X, UserRound, LoaderCircle } from "lucide-react";

import api from "../services/api";
import type { MahasiswaDetailResponse, Mahasiswa } from "../types/mahasiswa";

interface Props {
  mahasiswaId: string;
  onClose: () => void;
}

function DetailMahasiswaModal({ mahasiswaId, onClose }: Props) {
  const [mahasiswa, setMahasiswa] = useState<Mahasiswa | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Mengambil detail mahasiswa berdasarkan UUID
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get<MahasiswaDetailResponse>(
          `/mahasiswa/${mahasiswaId}`
        );

        setMahasiswa(response.data.data);
      } catch (err) {
        console.error("Gagal mengambil detail mahasiswa:", err);
        setError("Gagal mengambil detail mahasiswa.");
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [mahasiswaId]);

  const formatTanggal = (tanggal: string) => {
    if (!tanggal) return "-";

    return new Date(`${tanggal.slice(0, 10)}T00:00:00`).toLocaleDateString(
      "id-ID",
      {
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    );
  };

  const detailItem = (label: string, value: string | null | undefined) => (
    <div className="border-b border-slate-100 py-3">
      <p className="text-xs font-medium text-slate-400 mb-1">{label}</p>
      <p className="text-sm font-semibold text-slate-700 break-words">
        {value || "-"}
      </p>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-xl">

        {/* HEADER */}
        <div className="sticky top-0 bg-white border-b border-slate-100 p-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
              <UserRound size={22} />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-800">
                Detail Mahasiswa
              </h2>
              <p className="text-sm text-slate-500">
                Informasi lengkap mahasiswa
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"
          >
            <X size={22} />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-6">

          {loading && (
            <div className="py-12 flex flex-col items-center gap-3 text-slate-500">
              <LoaderCircle size={30} className="animate-spin text-blue-600" />
              <p className="text-sm">Memuat detail mahasiswa...</p>
            </div>
          )}

          {!loading && error && (
            <div className="p-5 bg-red-50 text-red-600 rounded-xl text-sm text-center">
              {error}
            </div>
          )}

          {!loading && !error && mahasiswa && (
            <>
              {/* IDENTITAS */}
              <div className="bg-blue-50 rounded-2xl p-5 mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold">
                    {mahasiswa.nama_mahasiswa.charAt(0).toUpperCase()}
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-800">
                      {mahasiswa.nama_mahasiswa}
                    </h3>
                    <p className="text-sm text-blue-700 font-medium">
                      NIM: {mahasiswa.nim}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {mahasiswa.prodi}
                    </p>
                  </div>
                </div>
              </div>

              {/* DATA MAHASISWA */}
              <h3 className="font-bold text-slate-800 mb-2">
                Informasi Akademik
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                {detailItem("NIM", mahasiswa.nim)}
                {detailItem("Nama Mahasiswa", mahasiswa.nama_mahasiswa)}
                {detailItem(
                  "Jenis Kelamin",
                  mahasiswa.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan"
                )}
                {detailItem("Fakultas", mahasiswa.fakultas)}
                {detailItem("Program Studi", mahasiswa.prodi)}
              </div>

              {/* DATA PRIBADI */}
              <h3 className="font-bold text-slate-800 mt-6 mb-2">
                Informasi Pribadi
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                {detailItem("Tempat Lahir", mahasiswa.tempat_lahir)}
                {detailItem(
                  "Tanggal Lahir",
                  formatTanggal(mahasiswa.tanggal_lahir)
                )}
                {detailItem("Alamat", mahasiswa.alamat)}
                {detailItem("Nama Ibu Kandung", mahasiswa.nama_ibu_kandung)}
                {detailItem(
                  "Nomor HP Orang Tua",
                  mahasiswa.nomor_hp_orang_tua
                )}
                {detailItem("Keterangan", mahasiswa.keterangan)}
              </div>

              {/* WAKTU DATA */}
              <h3 className="font-bold text-slate-800 mt-6 mb-2">
                Informasi Data
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                {detailItem(
                  "Tanggal Ditambahkan",
                  mahasiswa.created_at
                    ? new Date(mahasiswa.created_at).toLocaleString("id-ID")
                    : "-"
                )}
                {detailItem(
                  "Terakhir Diperbarui",
                  mahasiswa.updated_at
                    ? new Date(mahasiswa.updated_at).toLocaleString("id-ID")
                    : "-"
                )}
              </div>
            </>
          )}

        </div>

        {/* FOOTER */}
        <div className="border-t border-slate-100 p-5 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-3 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
}

export default DetailMahasiswaModal;