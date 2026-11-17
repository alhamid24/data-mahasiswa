
import { useCallback, useEffect, useState } from 'react';
import {
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  BookOpen,
  LoaderCircle,
} from 'lucide-react';

import api from '../services/api';
import type { Mahasiswa } from '../types/mahasiswa';

import TambahMahasiswaModal from '../components/TambahMahasiswaModal';
import EditMahasiswaModal from '../components/EditMahasiswaModal';
import DetailMahasiswaModal from '../components/DetailMahasiswaModal';

type ProgramStudi =
  | 'Teknik Informatika'
  | 'Sistem Informasi'
  | 'Agroindustri';

interface FilterResponse {
  success: boolean;
  message: string;
  data: Mahasiswa[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const programStudi: ProgramStudi[] = [
  'Teknik Informatika',
  'Sistem Informasi',
  'Agroindustri',
];

const semesters = [1, 2, 3, 4, 5, 6, 7, 8];

function MahasiswaPage() {
  const [selectedProdi, setSelectedProdi] =
    useState<ProgramStudi | null>(null);

  const [selectedSemester, setSelectedSemester] =
    useState<number | null>(null);

  const [mahasiswa, setMahasiswa] = useState<Mahasiswa[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const [page, setPage] = useState(1);
  const limit = 10;

  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  const [showTambahModal, setShowTambahModal] = useState(false);
  const [selectedMahasiswa, setSelectedMahasiswa] =
    useState<Mahasiswa | null>(null);
  const [detailMahasiswaId, setDetailMahasiswaId] =
    useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Mengambil mahasiswa berdasarkan prodi dan semester
  const fetchMahasiswa = useCallback(async () => {
    if (!selectedProdi || !selectedSemester) return;

    try {
      setLoading(true);
      setError('');

      const response = await api.get<FilterResponse>(
        '/mahasiswa/filter',
        {
          params: {
            prodi: selectedProdi,
            semester: selectedSemester,
            page,
            limit,
          },
        }
      );

      setMahasiswa(response.data.data);
      setTotal(response.data.total);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      console.error('Gagal mengambil data mahasiswa:', err);
      setMahasiswa([]);
      setTotal(0);
      setTotalPages(0);
      setError('Gagal mengambil data mahasiswa. Silakan coba kembali.');
    } finally {
      setLoading(false);
    }
  }, [selectedProdi, selectedSemester, page]);

  useEffect(() => {
    if (selectedProdi && selectedSemester) {
      void fetchMahasiswa();
    } else {
      setMahasiswa([]);
      setTotal(0);
      setTotalPages(0);
    }
  }, [selectedProdi, selectedSemester, fetchMahasiswa, refreshKey]);

  const handleSelectProdi = (prodi: ProgramStudi) => {
    setSelectedProdi(prodi);
    setSelectedSemester(null);
    setPage(1);
    setSearch('');
  };

  const handleSelectSemester = (semester: number) => {
    setSelectedSemester(semester);
    setPage(1);
    setSearch('');
  };

  const handleTambahSuccess = async () => {
    setShowTambahModal(false);
    setPage(1);
    setRefreshKey((prev) => prev + 1);
  };

  const handleEditSuccess = async () => {
    setSelectedMahasiswa(null);
    setRefreshKey((prev) => prev + 1);
  };

  // Menghapus mahasiswa secara permanen
  const handleDelete = async (item: Mahasiswa) => {
    const konfirmasi = window.confirm(
      `Apakah kamu yakin ingin menghapus mahasiswa ${item.nama_mahasiswa} dengan NIM ${item.nim}?\n\nData yang dihapus tidak dapat dikembalikan.`
    );

    if (!konfirmasi) return;

    try {
      setDeletingId(item.id);

      await api.delete(`/mahasiswa/${item.id}`);

      alert('Data mahasiswa berhasil dihapus!');

      if (mahasiswa.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
      } else {
        setRefreshKey((prev) => prev + 1);
      }
    } catch (err) {
      console.error('Gagal menghapus mahasiswa:', err);
      alert('Gagal menghapus mahasiswa. Silakan coba kembali.');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredMahasiswa = mahasiswa.filter((item) => {
    const keyword = search.toLowerCase();

    return (
      item.nim.toLowerCase().includes(keyword) ||
      item.nama_mahasiswa.toLowerCase().includes(keyword) ||
      item.prodi.toLowerCase().includes(keyword) ||
      item.fakultas.toLowerCase().includes(keyword)
    );
  });

  const firstData = total === 0 ? 0 : (page - 1) * limit + 1;
  const lastData = Math.min(page * limit, total);

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Data Mahasiswa
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Pilih program studi dan semester untuk mengelola data mahasiswa.
        </p>
      </div>

      {/* PILIH PROGRAM STUDI */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {programStudi.map((prodi) => (
          <button
            key={prodi}
            type="button"
            onClick={() => handleSelectProdi(prodi)}
            className={`rounded-xl border bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md ${
              selectedProdi === prodi
                ? 'border-blue-600 ring-2 ring-blue-100'
                : 'border-slate-200'
            }`}
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
              <GraduationCap size={26} />
            </div>

            <h2 className="text-lg font-semibold text-slate-800">
              {prodi}
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Program Studi
            </p>

            <p className="mt-4 text-sm font-medium text-blue-600">
              Lihat Semester →
            </p>
          </button>
        ))}
      </div>

      {/* PILIH SEMESTER */}
      {selectedProdi && (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              {selectedProdi}
            </h2>
            <p className="text-sm text-slate-500">
              Silakan pilih semester.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {semesters.map((semester) => (
              <button
                key={semester}
                type="button"
                onClick={() => handleSelectSemester(semester)}
                className={`rounded-xl border p-5 font-semibold transition ${
                  selectedSemester === semester
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-blue-400 hover:bg-blue-50'
                }`}
              >
                Semester {semester}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* TABEL MAHASISWA */}
      {selectedProdi && selectedSemester && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">

          {/* HEADER TABEL */}
          <div className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                Daftar Mahasiswa
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                {selectedProdi} - Semester {selectedSemester}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex items-center border border-slate-200 rounded-xl px-4 py-3">
                <Search size={18} className="text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari mahasiswa..."
                  className="ml-2 outline-none text-sm w-full"
                />
              </div>

              <button
                type="button"
                onClick={() => setShowTambahModal(true)}
                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl transition"
              >
                <Plus size={18} />
                Tambah Mahasiswa
              </button>
            </div>
          </div>

          {/* TABEL */}
          <div className="overflow-x-auto px-6">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-600 text-sm">
                  <th className="p-4 rounded-l-xl">No.</th>
                  <th className="p-4">NIM</th>
                  <th className="p-4">Nama Mahasiswa</th>
                  <th className="p-4">Program Studi</th>
                  <th className="p-4">Fakultas</th>
                  <th className="p-4">Jenis Kelamin</th>
                  <th className="p-4 rounded-r-xl text-center">Action</th>
                </tr>
              </thead>

              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500">
                      <LoaderCircle className="inline animate-spin mr-2" size={18} />
                      Memuat data mahasiswa...
                    </td>
                  </tr>
                )}

                {!loading && error && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-red-500">
                      <p>{error}</p>
                      <button
                        onClick={() => setRefreshKey((prev) => prev + 1)}
                        className="mt-3 text-blue-600 font-semibold hover:underline"
                      >
                        Coba Lagi
                      </button>
                    </td>
                  </tr>
                )}

                {!loading && !error && filteredMahasiswa.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500">
                      {search
                        ? 'Mahasiswa tidak ditemukan.'
                        : 'Belum ada mahasiswa pada program studi dan semester ini.'}
                    </td>
                  </tr>
                )}

                {!loading && !error && filteredMahasiswa.map((item, index) => (
                  <tr
                    key={item.id}
                    className="border-b border-slate-100 hover:bg-slate-50 transition"
                  >
                    <td className="p-4 text-sm text-slate-600">
                      {(page - 1) * limit + index + 1}
                    </td>

                    <td className="p-4 text-sm font-medium text-slate-700">
                      {item.nim}
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                          {item.nama_mahasiswa.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-semibold text-slate-800">
                          {item.nama_mahasiswa}
                        </span>
                      </div>
                    </td>

                    <td className="p-4 text-sm text-slate-600">
                      {item.prodi}
                    </td>

                    <td className="p-4 text-sm text-slate-600">
                      {item.fakultas}
                    </td>

                    <td className="p-4">
                      <span className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full">
                        {item.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                      </span>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">

                        <button
                          type="button"
                          title="Lihat detail"
                          onClick={() => setDetailMahasiswaId(item.id)}
                          className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"
                        >
                          <Eye size={17} />
                        </button>

                        <button
                          type="button"
                          title="Edit mahasiswa"
                          onClick={() => setSelectedMahasiswa(item)}
                          className="p-2 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100"
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          type="button"
                          title="Hapus mahasiswa"
                          onClick={() => handleDelete(item)}
                          disabled={deletingId === item.id}
                          className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50"
                        >
                          <Trash2 size={17} />
                        </button>

                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* FOOTER PAGINATION */}
          <div className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500">
              Menampilkan {firstData} - {lastData} dari {total} mahasiswa
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page <= 1 || loading}
                className="p-2 border border-slate-200 rounded-lg text-slate-500 disabled:opacity-40"
              >
                <ChevronLeft size={18} />
              </button>

              <span className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                {page}
              </span>

              <button
                type="button"
                onClick={() => setPage((prev) => prev + 1)}
                disabled={page >= totalPages || loading}
                className="p-2 border border-slate-200 rounded-lg text-slate-500 disabled:opacity-40"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PETUNJUK */}
      {!selectedProdi && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 text-center">
          <BookOpen className="mx-auto text-blue-600 mb-3" size={30} />
          <p className="font-semibold text-slate-800">
            Pilih Program Studi
          </p>
          <p className="text-sm text-slate-500 mt-1">
            Pilih salah satu program studi untuk melihat semester.
          </p>
        </div>
      )}

      {/* MODAL TAMBAH */}
      {showTambahModal && (
        <TambahMahasiswaModal
          onClose={() => setShowTambahModal(false)}
          onSuccess={handleTambahSuccess}
        />
      )}

      {/* MODAL EDIT */}
      {selectedMahasiswa && (
        <EditMahasiswaModal
          mahasiswa={selectedMahasiswa}
          onClose={() => setSelectedMahasiswa(null)}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* MODAL DETAIL */}
      {detailMahasiswaId && (
        <DetailMahasiswaModal
          mahasiswaId={detailMahasiswaId}
          onClose={() => setDetailMahasiswaId(null)}
        />
      )}

    </div>
  );
}

export default MahasiswaPage;
