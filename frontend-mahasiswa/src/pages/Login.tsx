
import { useState, type FormEvent } from 'react';
import { Eye, EyeOff, LockKeyhole, Mail, GraduationCap } from 'lucide-react';
import axios from 'axios';
import api from '../services/api';

interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    user: {
      uuid: string;
      email: string;
      role_level: string;
    };
  };
}

type UserRole = 'superadmin' | 'admin' | 'user';

interface LoginProps {
  onLoginSuccess: (
    user: {
      uuid: string;
      email: string;
      role_level: UserRole;
    },
    token: string
  ) => void;
}

function Login({ onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    try {
      setLoading(true);

      const response = await api.post<LoginResponse>('/auth/login', {
        email: email.trim(),
        password,
      });

      const { accessToken, user } = response.data.data;

      if (
        user.role_level !== 'superadmin' &&
        user.role_level !== 'admin' &&
        user.role_level !== 'user'
      ) {
        throw new Error('Role pengguna tidak valid.');
      }

      onLoginSuccess(
        {
          uuid: user.uuid,
          email: user.email,
          role_level: user.role_level,
        },
        accessToken
      );
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Login gagal.');
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Terjadi kesalahan. Silakan coba kembali.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-5">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl overflow-hidden grid md:grid-cols-2">

        <div className="hidden md:flex flex-col justify-between bg-blue-600 text-white p-12">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white text-blue-600 flex items-center justify-center font-bold text-2xl">
              M
            </div>
            <span className="text-2xl font-bold">MahasiswaHub</span>
          </div>

          <div>
            <GraduationCap size={55} className="mb-8" />
            <h1 className="text-4xl font-bold leading-tight">
              Kelola Data Mahasiswa dengan Lebih Mudah
            </h1>
            <p className="mt-5 text-blue-100 leading-relaxed">
              Sistem manajemen mahasiswa untuk pengelolaan data akademik
              yang praktis dan terorganisir.
            </p>
          </div>

          <p className="text-sm text-blue-100">
            © {new Date().getFullYear()} MahasiswaHub
          </p>
        </div>

        <div className="p-8 sm:p-12 flex flex-col justify-center">
          <div className="mb-8">
            <p className="text-sm font-semibold text-blue-600 mb-2">
              SELAMAT DATANG
            </p>
            <h2 className="text-3xl font-bold text-slate-800">
              Login Administrator
            </h2>
            <p className="text-slate-500 mt-2">
              Masukkan akun kamu untuk masuk ke dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Email
              </label>
              <div className="flex items-center border border-slate-200 rounded-xl px-4">
                <Mail size={19} className="text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Masukkan email"
                  autoComplete="username"
                  className="w-full py-3.5 px-3 outline-none text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Password
              </label>
              <div className="flex items-center border border-slate-200 rounded-xl px-4">
                <LockKeyhole size={19} className="text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  autoComplete="current-password"
                  className="w-full py-3.5 px-3 outline-none text-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Tampilkan atau sembunyikan password"
                  className="text-slate-400 hover:text-blue-600"
                >
                  {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 rounded-xl p-3 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-3.5 rounded-xl transition"
            >
              {loading ? 'Sedang masuk...' : 'Login ke Dashboard'}
            </button>
          </form>

          <p className="text-xs text-slate-400 text-center mt-8">
            Akses khusus administrator MahasiswaHub.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;