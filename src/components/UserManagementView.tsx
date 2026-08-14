import React, { useState } from 'react';
import { UserAccount } from '../types';

interface UserManagementViewProps {
  currentUser: UserAccount;
  users: UserAccount[];
  onAddUser: (userData: Omit<UserAccount, 'id' | 'createdAt'>) => void;
  onUpdateUser: (userId: string, updatedData: Partial<UserAccount>) => void;
  onDeleteUser: (userId: string) => void;
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({
  currentUser,
  users,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserAccount | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    roleLabel: 'Staf Operasional',
    department: 'Manajemen Gudang',
    password: '',
    status: 'active' as 'active' | 'inactive',
    isPrimaryAdmin: false,
  });

  const handleOpenAddModal = () => {
    setFormData({
      name: '',
      email: '',
      roleLabel: 'Staf Operasional',
      department: 'Manajemen Gudang',
      password: '',
      status: 'active',
      isPrimaryAdmin: false,
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (user: UserAccount) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      roleLabel: user.roleLabel,
      department: user.department,
      password: user.password,
      status: user.status,
      isPrimaryAdmin: user.isPrimaryAdmin,
    });
  };

  const handleSubmitUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      onUpdateUser(editingUser.id, {
        name: formData.name,
        email: formData.email,
        roleLabel: formData.roleLabel,
        department: formData.department,
        password: formData.password,
        status: formData.status,
        role: formData.isPrimaryAdmin ? 'primary_admin' : 'staff',
        isPrimaryAdmin: formData.isPrimaryAdmin,
      });
      setEditingUser(null);
    } else {
      onAddUser({
        name: formData.name,
        email: formData.email,
        role: formData.isPrimaryAdmin ? 'primary_admin' : 'staff',
        roleLabel: formData.roleLabel || 'Staf Operasional',
        password: formData.password || 'password123',
        isPrimaryAdmin: formData.isPrimaryAdmin,
        status: formData.status,
        department: formData.department || 'Manajemen Gudang',
      });
      setIsAddModalOpen(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in font-sans">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
            Akses & Otorisasi Akun
          </div>
          <h1 className="text-2xl font-display font-bold text-slate-900 tracking-tight">
            Manajemen Pengguna
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Pengelolaan otoritas akun personalia dan lisensi akses sistem.
          </p>
        </div>

        {/* Primary Admin Action */}
        {currentUser.isPrimaryAdmin && (
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-2 self-start md:self-auto cursor-pointer shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            <span>Tambah Pengguna Baru</span>
          </button>
        )}
      </div>

      {/* Role Authority Alert Banner */}
      {!currentUser.isPrimaryAdmin ? (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 flex items-start gap-3">
          <span className="material-symbols-outlined text-[24px] text-amber-600 shrink-0">
            lock
          </span>
          <div>
            <div className="font-bold text-amber-800 uppercase tracking-wide mb-1">
              Akses Terbatas — Hanya Administrator Utama
            </div>
            <p className="text-amber-800/90 leading-relaxed">
              Anda saat ini masuk sebagai <span className="text-slate-900 font-bold">{currentUser.name}</span> ({currentUser.roleLabel}). Hanya Administrator Utama (primary admin) yang memiliki otoritas resmi untuk menambah, mengubah, menonaktifkan, atau menghapus akun pengguna.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-4 text-xs text-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[20px] text-blue-600">
              verified_user
            </span>
            <div>
              <span className="text-slate-900 font-bold uppercase tracking-wider">
                Sesi Otoritas Administrator Utama Aktif
              </span>
              <span className="text-slate-500 block text-[11px] mt-0.5">
                Login sebagai: {currentUser.name} ({currentUser.email})
              </span>
            </div>
          </div>
          <span className="px-2.5 py-1 bg-blue-600 text-white font-semibold text-[10px] rounded uppercase tracking-wider shrink-0">
            OTORITAS_PENUH
          </span>
        </div>
      )}

      {/* Accounts List Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide">
            <span className="material-symbols-outlined text-[18px] text-blue-600">group</span>
            <span className="text-slate-900 font-bold">Daftar Akun Terdaftar ({users.length})</span>
          </div>
          <div className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
            SISTEM AKUN
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-sans">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3.5 px-4">PENGGUNA</th>
                <th className="py-3.5 px-4">ROLE & OTORITAS</th>
                <th className="py-3.5 px-4">DEPARTEMEN / UNIT</th>
                <th className="py-3.5 px-4 text-center">STATUS AKUN</th>
                <th className="py-3.5 px-4">DIBUAT PADA</th>
                <th className="py-3.5 px-4 text-center w-32">AKSI OTORITAS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {users.map((usr) => {
                const isPrimary = usr.isPrimaryAdmin;
                const isCurrent = usr.id === currentUser.id;

                return (
                  <tr
                    key={usr.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      isCurrent ? 'bg-blue-50/30' : ''
                    }`}
                  >
                    {/* User info */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs uppercase ${
                            isPrimary
                              ? 'bg-blue-600 text-white shadow-2xs'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {usr.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                            {usr.name}
                            {isCurrent && (
                              <span className="text-[10px] px-1.5 py-0.2 bg-blue-100 border border-blue-200 text-blue-700 rounded font-semibold">
                                (Anda)
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            {usr.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="py-3.5 px-4">
                      {isPrimary ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-600 text-white font-semibold text-[10px] rounded uppercase tracking-wide">
                          <span className="material-symbols-outlined text-[14px]">shield</span>
                          Administrator Utama
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-700 font-medium text-[10px] rounded uppercase tracking-wide">
                          <span className="material-symbols-outlined text-[14px] text-slate-400">badge</span>
                          {usr.roleLabel}
                        </span>
                      )}
                    </td>

                    {/* Department */}
                    <td className="py-3.5 px-4 text-slate-700">{usr.department}</td>

                    {/* Status */}
                    <td className="py-3.5 px-4 text-center">
                      {usr.status === 'active' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] uppercase tracking-wider font-semibold rounded">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-50 border border-rose-200 text-rose-700 text-[10px] uppercase tracking-wider font-semibold rounded">
                          Nonaktif
                        </span>
                      )}
                    </td>

                    {/* Created at */}
                    <td className="py-3.5 px-4 text-slate-400 text-xs">{usr.createdAt}</td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-center">
                      {currentUser.isPrimaryAdmin ? (
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenEditModal(usr)}
                            className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                            title="Edit Data Akun"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>

                          {!isPrimary && (
                            <>
                              <button
                                onClick={() =>
                                  onUpdateUser(usr.id, {
                                    status: usr.status === 'active' ? 'inactive' : 'active',
                                  })
                                }
                                className={`p-1.5 rounded transition-colors cursor-pointer ${
                                  usr.status === 'active'
                                    ? 'text-amber-600 hover:bg-amber-50'
                                    : 'text-emerald-600 hover:bg-emerald-50'
                                }`}
                                title={
                                  usr.status === 'active' ? 'Nonaktifkan Akun' : 'Aktifkan Akun'
                                }
                              >
                                <span className="material-symbols-outlined text-[18px]">
                                  {usr.status === 'active' ? 'block' : 'check_circle'}
                                </span>
                              </button>

                              <button
                                onClick={() => setDeletingUser(usr)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                                title="Hapus Akun Pengguna"
                              >
                                <span className="material-symbols-outlined text-[18px]">delete</span>
                              </button>
                            </>
                          )}
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-300 uppercase tracking-widest font-mono">
                          Terkunci
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit User Modal */}
      {(isAddModalOpen || editingUser) && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 font-sans animate-fade-in">
          <div className="bg-white w-full max-w-lg border border-slate-200 rounded-2xl shadow-2xl p-6 flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-0.5">
                  Akun & Otorisasi
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingUser ? 'Edit Data Pengguna' : 'Tambah Pengguna Baru'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingUser(null);
                }}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmitUser} className="flex flex-col gap-4 text-xs font-sans">
              <div>
                <label className="block text-slate-700 font-semibold mb-1 uppercase text-[11px] tracking-wider">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Ahmad Dahlan"
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:border-blue-600 focus:bg-white outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1 uppercase text-[11px] tracking-wider">
                  Email Kerja (Login Email) *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@company.com"
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:border-blue-600 focus:bg-white outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1 uppercase text-[11px] tracking-wider">
                    Label Peran / Jabatan
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.roleLabel}
                    onChange={(e) => setFormData({ ...formData, roleLabel: e.target.value })}
                    placeholder="Staf Operasional"
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:border-blue-600 focus:bg-white outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1 uppercase text-[11px] tracking-wider">
                    Departemen / Unit Kerja
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="Gudang Lantai 1"
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:border-blue-600 focus:bg-white outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1 uppercase text-[11px] tracking-wider">
                    Kata Sandi (Security Key) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Minimal 6 karakter"
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-900 focus:border-blue-600 focus:bg-white outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1 uppercase text-[11px] tracking-wider">
                    Status Aktivasi
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })
                    }
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:border-blue-600 focus:bg-white outline-none cursor-pointer"
                  >
                    <option value="active">Aktif (Dapat Login)</option>
                    <option value="inactive">Nonaktif (Ditolak Login)</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-xl mt-1 flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="isPrimaryAdmin"
                  checked={formData.isPrimaryAdmin}
                  onChange={(e) => setFormData({ ...formData, isPrimaryAdmin: e.target.checked })}
                  className="mt-0.5 accent-blue-600 rounded cursor-pointer"
                />
                <label htmlFor="isPrimaryAdmin" className="text-xs text-slate-700 cursor-pointer">
                  <span className="font-bold text-blue-700 uppercase block">
                    Berikan Akses Administrator Utama (Primary Admin)
                  </span>
                  <span className="text-slate-500 text-[11px] block mt-0.5">
                    Memungkinkan akun ini memiliki otoritas penuh untuk mengelola akun pengguna lainnya.
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingUser(null);
                  }}
                  className="px-4 py-2 bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer shadow-xs"
                >
                  {editingUser ? 'Simpan Perubahan' : 'Buat Akun Sekarang'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 font-sans animate-fade-in">
          <div className="bg-white w-full max-w-md border border-slate-200 rounded-2xl shadow-2xl p-6 flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl">
                <span className="material-symbols-outlined text-[24px]">person_remove</span>
              </div>
              <div>
                <div className="text-xs font-bold text-rose-600 uppercase tracking-wider">
                  Konfirmasi Hapus Akun
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  Hapus Akun Pengguna?
                </h3>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Apakah Anda yakin ingin menghapus akun <span className="text-slate-900 font-semibold">&quot;{deletingUser.name}&quot;</span> ({deletingUser.email})? Pengguna ini tidak akan lagi memiliki hak akses ke sistem.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                onClick={() => setDeletingUser(null)}
                className="px-4 py-2 bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  onDeleteUser(deletingUser.id);
                  setDeletingUser(null);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer shadow-xs"
              >
                Ya, Hapus Akun
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
