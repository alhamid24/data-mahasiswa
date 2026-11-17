
import { useEffect, useState } from 'react';

import Sidebar from './components/Sidebar';
import type { PageType } from './components/Sidebar';

import Navbar from './components/Navbar';
import UsersPage from './pages/Users';
import MahasiswaPage from './pages/mahasiswa';
import PortalMahasiswa from './pages/PortalMahasiswa';
import Login from './pages/Login';

import api from './services/api';

type UserRole = 'superadmin' | 'admin' | 'user';

interface AuthUser {
  uuid: string;
  email: string;
  role_level: UserRole;
}

function App() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  const [activePage, setActivePage] =
    useState<PageType>('dashboard');

  // Periksa sesi ketika aplikasi pertama kali dibuka
  useEffect(() => {
    const checkSession = async () => {
      const token = sessionStorage.getItem('accessToken');

      if (!token) {
        setCheckingSession(false);
        return;
      }

      try {
        const response = await api.get('/auth/me');

        const loggedInUser: AuthUser = {
          uuid: response.data.data.uuid,
          email: response.data.data.email ?? '',
          role_level: response.data.data.role_level,
        };

        setUser(loggedInUser);

        // Arahkan berdasarkan role
        setActivePage('dashboard');

      } catch (error) {
        console.error('Sesi login tidak valid:', error);
        sessionStorage.removeItem('accessToken');
        setUser(null);
      } finally {
        setCheckingSession(false);
      }
    };

    void checkSession();
  }, []);

  // Dipanggil ketika login berhasil
  const handleLoginSuccess = (
    loggedInUser: AuthUser,
    token: string
  ) => {
    sessionStorage.setItem('accessToken', token);
    setUser(loggedInUser);
    setActivePage('dashboard');
  };

  // Logout melalui backend
  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Permintaan logout gagal:', error);
    } finally {
      sessionStorage.removeItem('accessToken');
      setUser(null);
      setActivePage('dashboard');
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-500 font-medium">
          Memeriksa sesi login...
        </p>
      </div>
    );
  }

  // Belum login
  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // PORTAL KHUSUS MAHASISWA
  if (user.role_level === 'user') {
    return (
      <PortalMahasiswa
        user={user}
        onLogout={handleLogout}
      />
    );
  }

  // Menentukan halaman dashboard admin
  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return (
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              Dashboard
            </h2>
            <p className="text-slate-500 mt-2">
              Selamat datang di Dashboard MahasiswaHub.
            </p>
          </div>
        );

      case 'mahasiswa':
        return <MahasiswaPage />;

      case 'users':
        return user.role_level === 'superadmin'
          ? <UsersPage />
          : (
            <p className="text-red-500">
              Anda tidak memiliki akses ke halaman ini.
            </p>
          );

      default:
        return null;
    }
  };

  const pageTitles: Record<PageType, string> = {
    dashboard: 'Dashboard',
    mahasiswa: 'Data Mahasiswa',
    users: 'Manajemen Users',
  };

  return (
    <div className="min-h-screen flex bg-slate-50">

      <Sidebar
        onLogout={handleLogout}
        activePage={activePage}
        onPageChange={setActivePage}
      />

      <main className="flex-1 min-w-0">

        <Navbar user={user} />

        <section className="p-8">

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800">
              {pageTitles[activePage]}
            </h2>
          </div>

          {renderPage()}

        </section>

      </main>

    </div>
  );
}

export default App;
