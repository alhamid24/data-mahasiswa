import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  Search,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Users,
  UserPlus,
  LoaderCircle,
  X,
} from 'lucide-react';
import axios from 'axios';

import api from '../services/api';
import type { Mahasiswa, MahasiswaResponse } from '../types/mahasiswa';

type UserRole = 'superadmin' | 'admin' | 'user';

interface UserAccount {
  uuid: string;
  id_mhs: string;
  email: string;
  role_level: UserRole;
  created_at?: string;
}

interface UsersResponse {
  success: boolean;
  message: string;
  data: UserAccount[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  total?: number;
}

interface UserForm {
  id_mhs: string;
  email: string;
  password: string;
  role_level: UserRole;
}

const initialForm: UserForm = {
  id_mhs: '',
  email: '',
  password: '',
  role_level: 'user',
};

function UsersPage() {
  const [accounts, setAccounts] = useState<UserAccount[]>([]);
  const [mahasiswa, setMahasiswa] = useState<Mahasiswa[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMahasiswa, setLoadingMahasiswa] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const [page, setPage] = useState(1);
  const limit = 10;
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [showForm, setShowForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<UserAccount | null>(null);
  const [form, setForm] = useState<UserForm>(initialForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formError, setFormError] = useState('');

  const fetchAccounts = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const response = await api.get<UsersResponse>('/users', {
        params: { page, limit },
      });

      setAccounts(response.data.data ?? []);
      setTotal(response.data.pagination?.total ?? response.data.total ?? 0);
      setTotalPages(response.data.pagination?.totalPages ?? 1);
    } catch (err: unknown) {
      console.error('Gagal mengambil akun:', err);
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Gagal mengambil daftar akun.');
      } else {
        setError('Terjadi kesalahan saat mengambil daftar akun.');
      }
    } finally {
      setLoading(false);
    }
  }, [page]);

  const fetchMahasiswa = useCallback(async () => {
    try {
      setLoadingMahasiswa(true);

      const response = await api.get<MahasiswaResponse>('/mahasiswa', {
        params: { page: 1, limit: 100 },
      });

      setMahasiswa(response.data.data ?? []);
    } catch (err) {
      console.error('Gagal mengambil pilihan mahasiswa:', err);
    } finally {
      setLoadingMahasiswa(false);
    }
  }, []);

  useEffect(() => {
    void fetchAccounts();
  }, [fetchAccounts]);

  useEffect(() => {
    void fetchMahasiswa();
  }, [fetchMahasiswa]);

  const usedMahasiswaIds = useMemo(
    () => new Set(accounts.map((account) => account.id_mhs)),
    [accounts]
  );

  const availableMahasiswa = useMemo(
    () => mahasiswa.filter((item) => !usedMahasiswaIds.has(item.id)),
    [mahasiswa, usedMahasiswaIds]
  );

  const filteredAccounts = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return accounts;

    return accounts.filter((account) =>
      account.email.toLowerCase().includes(keyword) ||
      account.role_level.toLowerCase().includes(keyword) ||
      account.id_mhs.toLowerCase().includes(keyword)
    );
  }, [accounts, search]);

  const openCreateForm = () => {
    setEditingAccount(null);
    setForm(initialForm);
    setFormError('');
    setShowForm(true);
  };

  const openEditForm = (account: UserAccount) => {
    setEditingAccount(account);
    setForm({
      id_mhs: account.id_mhs,
      email: account.email,
      password: '',
      role_level: account.role_level,
    });
    setFormError('');
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingAccount(null);
    setForm(initialForm);
    setFormError('');
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError('');

    if (!editingAccount && !form.id_mhs) {
      setFormError('Pilih mahasiswa yang akan dibuatkan akun.');
      return;
    }

    if (!editingAccount && form.password.length < 8) {
      setFormError('Password minimal 8 karakter.');
      return;
    }

    if (editingAccount && form.password && form.password.length < 8) {
      setFormError('Password baru minimal 8 karakter.');
      return;
    }

    try {
      setSaving(true);

      if (editingAccount) {
        const payload: {
          email: string;
          role_level: UserRole;
          password?: string;
        } = {
          email: form.email.trim(),
          role_level: form.role_level,
        };

        if (form.password) {
          payload.password = form.password;
        }

        await api.patch(`/users/${editingAccount.uuid}`, payload);
        alert('Akun berhasil diperbarui.');
      } else {
        await api.post('/users', {
          id_mhs: form.id_mhs,
          email: form.email.trim(),
          password: form.password,
          role_level: form.role_level,
        });
        alert('Akun berhasil dibuat.');
      }

      closeForm();
      await fetchAccounts();
      await fetchMahasiswa();
    } catch (err: unknown) {
      console.error('Gagal menyimpan akun:', err);

      if (axios.isAxiosError(err)) {
        setFormError(
          err.response?.data?.message || 'Gagal menyimpan akun. Periksa kembali data.'
        );
      } else {
        setFormError('Terjadi kesalahan saat menyimpan akun.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (account: UserAccount) => {
    const confirmed = window.confirm(
      `Yakin ingin menghapus akun ${account.email}?\n\nAkun akan dihapus secara permanen.`
    );

    if (!confirmed) return;

    try {
      setDeletingId(account.uuid);
      await api.delete(`/users/${account.uuid}`);
      alert('Akun berhasil dihapus.');

      if (accounts.length === 1 && page > 1) {
        setPage((current) => current - 1);
      } else {
        await fetchAccounts();
      }

      await fetchMahasiswa();
    } catch (err: unknown) {
      console.error('Gagal menghapus akun:', err);

      if (axios.isAxiosError(err)) {
        alert(err.response?.data?.message || 'Gagal menghapus akun.');
      } else {
        alert('Terjadi kesalahan saat menghapus akun.');
      }
    } finally {
      setDeletingId(null);
    }
  };

  const firstData = total === 0 ? 0 : (page - 1) * limit + 1;
  const lastData = Math.min(page * limit, total);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            Manajemen Users
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Kelola akun login mahasiswa, admin, dan superadmin.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateForm}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
        >
          <UserPlus size={18} />
          Buat Akun
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Total akun</p>
              <p className="mt-2 text-3xl font-bold text-slate-800">{total}</p>
            </div>
            <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
              <Users size={25} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Mahasiswa belum memiliki akun</p>
              <p className="mt-2 text-3xl font-bold text-slate-800">
                {availableMahasiswa.length}
              </p>
            </div>
            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
              <UserPlus size={25} />
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Daftar Akun</h3>
            <p className="mt-1 text-sm text-slate-500">
              Data akun yang terdaftar di sistem.
            </p>
          </div>

          <div className="flex items-center rounded-xl border border-slate-200 px-4 py-3 sm:w-80">
            <Search size={18} className="shrink-0 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari email, role, atau ID mahasiswa..."
              className="ml-2 w-full text-sm outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto px-6">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-sm text-slate-600">
                <th className="rounded-l-xl p-4">No.</th>
                <th className="p-4">Email</th>
                <th className="p-4">ID Mahasiswa</th>
                <th className="p-4">Role</th>
                <th className="rounded-r-xl p-4 text-center">Aksi</th>
              </tr>
            </thead>

            <tbody>
              {loading && (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-slate-500">
                    <LoaderCircle className="mr-2 inline animate-spin" size={18} />
                    Memuat daftar akun...
                  </td>
                </tr>
              )}

              {!loading && error && (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-red-600">
                    <p>{error}</p>
                    <button
                      type="button"
                      onClick={() => void fetchAccounts()}
                      className="mt-3 font-semibold text-blue-600 hover:underline"
                    >
                      Coba lagi
                    </button>
                  </td>
                </tr>
              )}

              {!loading && !error && filteredAccounts.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-slate-500">
                    {search ? 'Akun tidak ditemukan.' : 'Belum ada akun.'}
                  </td>
                </tr>
              )}

              {!loading && !error && filteredAccounts.map((account, index) => (
                <tr
                  key={account.uuid}
                  className="border-b border-slate-100 transition hover:bg-slate-50"
                >
                  <td className="p-4 text-sm text-slate-500">
                    {(page - 1) * limit + index + 1}
                  </td>
                  <td className="p-4">
                    <div className="font-semibold text-slate-800">
                      {account.email}
                    </div>
                    <div className="mt-1 text-xs text-slate-400">
                      ID: {account.uuid}
                    </div>
                  </td>
                  <td className="p-4 text-sm text-slate-600">
                    {account.id_mhs}
                  </td>
                  <td className="p-4">
                    <span
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                        account.role_level === 'superadmin'
                          ? 'bg-purple-50 text-purple-700'
                          : account.role_level === 'admin'
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-emerald-50 text-emerald-700'
                      }`}
                    >
                      {account.role_level}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        title="Edit akun"
                        onClick={() => openEditForm(account)}
                        className="rounded-lg bg-amber-50 p-2 text-amber-600 hover:bg-amber-100"
                      >
                        <Pencil size={17} />
                      </button>

                      <button
                        type="button"
                        title="Hapus akun"
                        onClick={() => void handleDelete(account)}
                        disabled={deletingId === account.uuid}
                        className="rounded-lg bg-red-50 p-2 text-red-600 hover:bg-red-100 disabled:opacity-50"
                      >
                        {deletingId === account.uuid ? (
                          <LoaderCircle size={17} className="animate-spin" />
                        ) : (
                          <Trash2 size={17} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 p-6 sm:flex-row">
          <p className="text-sm text-slate-500">
            Menampilkan {firstData}–{lastData} dari {total} akun
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page <= 1 || loading}
              className="rounded-lg border border-slate-200 p-2 text-slate-600 disabled:opacity-40"
            >
              <ChevronLeft size={18} />
            </button>

            <span className="rounded-lg bg-blue-600 px-4 py-2 text-white">
              {page}
            </span>

            <button
              type="button"
              onClick={() => setPage((current) => current + 1)}
              disabled={page >= totalPages || loading}
              className="rounded-lg border border-slate-200 p-2 text-slate-600 disabled:opacity-40"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 p-6">
              <div>
                <h3 className="text-xl font-bold text-slate-800">
                  {editingAccount ? 'Edit Akun' : 'Buat Akun Baru'}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  {editingAccount
                    ? 'Perbarui informasi akun pengguna.'
                    : 'Buat akun login untuk mahasiswa yang terdaftar.'}
                </p>
              </div>
              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-6">
              {!editingAccount && (
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Pilih Mahasiswa
                  </label>
                  <select
                    value={form.id_mhs}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, id_mhs: event.target.value }))
                    }
                    required
                    disabled={loadingMahasiswa}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
                  >
                    <option value="">
                      {loadingMahasiswa ? 'Memuat mahasiswa...' : 'Pilih mahasiswa'}
                    </option>
                    {availableMahasiswa.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.nim} — {item.nama_mahasiswa}
                      </option>
                    ))}
                  </select>
                  {!loadingMahasiswa && availableMahasiswa.length === 0 && (
                    <p className="mt-2 text-xs text-amber-600">
                      Tidak ada mahasiswa yang tersedia. Mahasiswa mungkin sudah memiliki akun.
                    </p>
                  )}
                </div>
              )}

              {editingAccount && (
                <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
                  Akun terhubung ke mahasiswa dengan ID:
                  <p className="mt-1 break-all font-semibold text-slate-800">
                    {editingAccount.id_mhs}
                  </p>
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Email
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, email: event.target.value }))
                  }
                  placeholder="contoh@kampus.ac.id"
                  required
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  {editingAccount ? 'Password Baru (opsional)' : 'Password'}
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, password: event.target.value }))
                  }
                  placeholder={editingAccount ? 'Kosongkan jika tidak diubah' : 'Minimal 8 karakter'}
                  required={!editingAccount}
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Role Akun
                </label>
                <select
                  value={form.role_level}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      role_level: event.target.value as UserRole,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  <option value="superadmin">Superadmin</option>
                </select>
              </div>

              {formError && (
                <div className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-600">
                  {formError}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving || (!editingAccount && (loadingMahasiswa || availableMahasiswa.length === 0))}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving && <LoaderCircle size={17} className="animate-spin" />}
                  {saving ? 'Menyimpan...' : editingAccount ? 'Simpan Perubahan' : 'Buat Akun'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default UsersPage;