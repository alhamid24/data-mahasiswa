
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Settings,
  LogOut,
} from 'lucide-react';

export type PageType = 'dashboard' | 'mahasiswa' | 'users';

interface SidebarProps {
  onLogout: () => void;
  activePage: PageType;
  onPageChange: (page: PageType) => void;
}

function Sidebar({
  onLogout,
  activePage,
  onPageChange,
}: SidebarProps) {

  const menuClass = (page: PageType) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl transition ${
      activePage === page
        ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
        : 'text-slate-600 hover:bg-blue-50 hover:text-blue-600'
    }`;

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-slate-200 flex flex-col shrink-0">

      <div className="h-20 flex items-center px-6 border-b border-slate-100">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
          M
        </div>

        <span className="ml-3 text-xl font-bold text-slate-800">
          Mahasiswa<span className="text-blue-600">Hub</span>
        </span>
      </div>

      <div className="p-5 flex-1">

        <p className="text-xs font-bold text-slate-400 mb-4">
          MENU UTAMA
        </p>

        <nav className="space-y-2">

          <button
            type="button"
            onClick={() => onPageChange('dashboard')}
            className={`w-full text-left ${menuClass('dashboard')}`}
          >
            <LayoutDashboard size={20} />
            Dashboard
          </button>

          <button
            type="button"
            onClick={() => onPageChange('mahasiswa')}
            className={`w-full text-left ${menuClass('mahasiswa')}`}
          >
            <GraduationCap size={20} />
            Data Mahasiswa
          </button>

          <button
            type="button"
            onClick={() => onPageChange('users')}
            className={`w-full text-left ${menuClass('users')}`}
          >
            <Users size={20} />
            Users
          </button>

        </nav>

        <p className="text-xs font-bold text-slate-400 mt-10 mb-4">
          PENGATURAN
        </p>

        <button
          type="button"
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition"
        >
          <Settings size={20} />
          Settings
        </button>

      </div>

      <div className="p-5 border-t border-slate-100">

        <button
          type="button"
          onClick={onLogout}
          className="flex items-center gap-3 text-red-500 hover:text-red-700 transition"
        >
          <LogOut size={20} />
          Logout
        </button>

      </div>

    </aside>
  );
}

export default Sidebar;
