
import {
  Search,
  Bell,
  ChevronDown,
} from 'lucide-react';

interface NavbarProps {
  user: {
    email: string;
    role_level: string;
  };
}

function Navbar({ user }: NavbarProps) {
  const displayRole =
    user.role_level === 'superadmin' ? 'Superadmin' : 'Admin';

  const initials = user.email.slice(0, 2).toUpperCase();

  return (
    <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8">

      <div>
        <h1 className="text-xl font-bold text-slate-800">
          Users Management
        </h1>

        <p className="text-sm text-slate-400 mt-1">
          Kelola data mahasiswa kamu
        </p>
      </div>

      <div className="flex items-center gap-6">

        <div className="flex items-center bg-slate-100 rounded-xl px-4 py-2.5 w-64">
          <Search size={18} className="text-slate-400" />

          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent outline-none ml-2 w-full text-sm"
          />
        </div>

        <button type="button" className="relative text-slate-500">
          <Bell size={22} />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
            {initials}
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-800">
              {user.email}
            </p>

            <p className="text-xs text-slate-400">
              {displayRole}
            </p>
          </div>

          <ChevronDown size={16} className="text-slate-400" />
        </div>
      </div>
    </header>
  );
}

export default Navbar;