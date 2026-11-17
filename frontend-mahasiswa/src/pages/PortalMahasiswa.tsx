
import { useEffect, useState } from 'react';
import {
  GraduationCap,
  UserRound,
  IdCard,
  BookOpen,
  Building2,
  CalendarDays,
  LogOut,
  LoaderCircle,
} from 'lucide-react';

import api from '../services/api';

interface AuthUser {
  uuid: string;
  email: string;
  role_level: string;
}

interface MahasiswaProfile {
  id: string;
  nim: string;
  nama_mahasiswa: string;
  jenis_kelamin: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  fakultas: string;
  prodi: string;
  alamat: string;
  semester: number | null;
}

interface PortalMahasiswaProps {
  user: AuthUser;
  onLogout: () => void;
}

function PortalMahasiswa({
  user,
  onLogout,
}: PortalMahasiswaProps) {
  const [profile, setProfile] =
    useState<MahasiswaProfile | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await api.get('/users/me/profile');

        setProfile(response.data.data);
      } catch (err) {
        console.error('Gagal mengambil profil:', err);
        setError(
          'Profil mahasiswa gagal dimuat. Silakan coba kembali.'
        );
      } finally {
        setLoading(false);
      }
    };

    void fetchProfile();
  }, []);

  const formatTanggal = (tanggal: string) => {
    if (!tanggal) return '-';

    return new Date(tanggal).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    });
  };

  const InfoCard = ({
    icon: Icon,
    label,
    value,
  }: {
    icon: typeof UserRound;
    label: string;
    value: string;
  }) => (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
          <Icon size={20} className="text-blue-600" />
        </div>
        <p className="text-sm text-slate-500">{label}</p>
      </div>

      <p className="font-semibold text-slate-800 break-words">
        {value || '-'}
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">

      {/* HEADER */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-5 md:px-8 py-4 flex items-center justify-between">

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-blue-600 rounded-xl flex items-center justify-center">
              <GraduationCap className="text-white" size={26} />
            </div>

            <div>
              <h1 className="font-bold text-slate-800 text-lg">
                MahasiswaHub
              </h1>
              <p className="text-xs text-slate-500">
                Portal Akademik Mahasiswa
              </p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition"
          >
            <LogOut size={18} />
            <span className="hidden sm:inline">Keluar</span>
          </button>

        </div>
      </header>

      <main className="max-w-7xl mx-auto px-5 md:px-8 py-8">

        {/* WELCOME */}
        <section className="bg-gradient-to-r from-blue-700 to-indigo-600 rounded-3xl p-7 md:p-10 text-white mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
              <UserRound size={27} />
            </div>

            <div>
              <p className="text-blue-100 text-sm">
                Selamat datang di portal mahasiswa
              </p>
              <p className="font-semibold">
                {user.email}
              </p>
            </div>
          </div>

          <h2 className="text-2xl md:text-3xl font-bold">
            Halo, {profile?.nama_mahasiswa || 'Mahasiswa'}!
          </h2>

          <p className="text-blue-100 mt-2">
            Selamat datang di Sistem Informasi Akademik MahasiswaHub.
          </p>
        </section>

        {/* LOADING */}
        {loading && (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 flex flex-col items-center">
            <LoaderCircle
              size={36}
              className="text-blue-600 animate-spin mb-4"
            />
            <p className="text-slate-500">
              Memuat data profil mahasiswa...
            </p>
          </div>
        )}

        {/* ERROR */}
        {!loading && error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
            <p className="text-red-700 font-medium">{error}</p>

            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-5 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700"
            >
              Muat ulang
            </button>
          </div>
        )}

        {/* PROFILE */}
        {!loading && !error && profile && (
          <>
            {/* SUMMARY */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

              <InfoCard
                icon={IdCard}
                label="Nomor Induk Mahasiswa"
                value={profile.nim}
              />

              <InfoCard
                icon={BookOpen}
                label="Program Studi"
                value={profile.prodi}
              />

              <InfoCard
                icon={Building2}
                label="Fakultas"
                value={profile.fakultas}
              />

              <InfoCard
                icon={CalendarDays}
                label="Semester"
                value={
                  profile.semester
                    ? `Semester ${profile.semester}`
                    : 'Belum tersedia'
                }
              />

            </section>

            {/* DETAIL PROFIL */}
            <section className="bg-white rounded-3xl border border-slate-200 overflow-hidden">

              <div className="p-6 border-b border-slate-200 flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center">
                  <UserRound className="text-blue-600" size={23} />
                </div>

                <div>
                  <h3 className="font-bold text-lg text-slate-800">
                    Profil Saya
                  </h3>
                  <p className="text-sm text-slate-500">
                    Informasi pribadi dan akademik
                  </p>
                </div>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">

                <div>
                  <p className="text-sm text-slate-500 mb-1">
                    Nama Lengkap
                  </p>
                  <p className="font-semibold text-slate-800">
                    {profile.nama_mahasiswa}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500 mb-1">
                    NIM
                  </p>
                  <p className="font-semibold text-slate-800">
                    {profile.nim}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500 mb-1">
                    Jenis Kelamin
                  </p>
                  <p className="font-semibold text-slate-800">
                    {profile.jenis_kelamin === 'P'
                      ? 'Perempuan'
                      : profile.jenis_kelamin === 'L'
                        ? 'Laki-laki'
                        : profile.jenis_kelamin}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500 mb-1">
                    Tempat, Tanggal Lahir
                  </p>
                  <p className="font-semibold text-slate-800">
                    {profile.tempat_lahir}, {formatTanggal(profile.tanggal_lahir)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500 mb-1">
                    Fakultas
                  </p>
                  <p className="font-semibold text-slate-800">
                    {profile.fakultas}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500 mb-1">
                    Program Studi
                  </p>
                  <p className="font-semibold text-slate-800">
                    {profile.prodi}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500 mb-1">
                    Semester
                  </p>
                  <p className="font-semibold text-slate-800">
                    {profile.semester
                      ? `Semester ${profile.semester}`
                      : 'Belum tersedia'}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500 mb-1">
                    Email Akun
                  </p>
                  <p className="font-semibold text-slate-800 break-all">
                    {user.email}
                  </p>
                </div>

                <div className="md:col-span-2">
                  <p className="text-sm text-slate-500 mb-1">
                    Alamat
                  </p>
                  <p className="font-semibold text-slate-800">
                    {profile.alamat || '-'}
                  </p>
                </div>

              </div>
            </section>

            {/* FOOTER */}
            <div className="text-center mt-8 text-sm text-slate-400">
              MahasiswaHub © 2026 - Portal Akademik Mahasiswa
            </div>
          </>
        )}

      </main>
    </div>
  );
}

export default PortalMahasiswa;
