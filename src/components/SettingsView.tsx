import React from 'react';
import { UserAccount } from '../types';

interface SettingsViewProps {
  userEmail: string;
  currentUser?: UserAccount;
  selectedWarehouse: string;
  onSelectWarehouse: (wh: string) => void;
  onLogout: () => void;
  onNavigateToUsers?: () => void;
  onClearStock?: () => void;
  onClearIncomingRecords?: () => void;
  onClearOutgoingRecords?: () => void;
  onClearLogs?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  userEmail,
  currentUser,
  selectedWarehouse,
  onSelectWarehouse,
  onLogout,
  onNavigateToUsers,
  onClearStock,
  onClearIncomingRecords,
  onClearOutgoingRecords,
  onClearLogs,
}) => {
  return (
    <div className="flex flex-col gap-6 animate-fade-in max-w-4xl font-sans">
      <div>
        <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
          Konfigurasi Sistem
        </div>
        <h1 className="text-2xl font-display font-bold text-slate-900 tracking-tight">
          Pengaturan Sistem
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Konfigurasi node server, pembersihan riwayat laporan, dan akun penanggung jawab.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col gap-6 shadow-xs">
        {/* Node & System Info */}
        <div className="border-b border-slate-200 pb-6">
          <h2 className="text-xs font-bold text-slate-900 mb-4 uppercase tracking-wider flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-blue-600">dns</span>
            Informasi Node Server & Status Sistem
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-sans">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider font-mono">SISTEM VERSI</div>
              <div className="font-bold text-slate-900 mt-1">Ver. 2.4.1</div>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider font-mono">WILAYAH NODE</div>
              <div className="font-bold text-slate-900 mt-1">US-EAST (Cloud Run)</div>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider font-mono">STATUS DATABASE</div>
              <div className="font-semibold text-emerald-700 mt-1 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Terhubung (Active)
              </div>
            </div>
          </div>
        </div>

        {/* Warehouse Selection */}
        <div className="border-b border-slate-200 pb-6">
          <h2 className="text-xs font-bold text-slate-900 mb-2 uppercase tracking-wider flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-blue-600">warehouse</span>
            Lokasi Gudang Aktif
          </h2>
          <p className="text-xs text-slate-500 mb-4">
            Pilih titik distribusi gudang yang ingin Anda kelola data persediaannya saat ini.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            {['Lantai 1', 'West Hub Jakarta', 'East Hub Surabaya'].map((wh) => (
              <button
                key={wh}
                onClick={() => onSelectWarehouse(wh)}
                className={`p-4 border rounded-xl text-left flex-1 transition-all cursor-pointer font-sans ${
                  selectedWarehouse === wh
                    ? 'border-blue-600 bg-blue-50/80 text-blue-900 font-semibold shadow-2xs'
                    : 'border-slate-200 bg-slate-50/50 hover:border-slate-300 text-slate-700'
                }`}
              >
                <div className="text-xs font-bold uppercase tracking-wider">{wh}</div>
                <div className="text-[11px] mt-1 text-blue-600 font-semibold">
                  {selectedWarehouse === wh ? '● Terpilih Saat Ini' : 'Klik untuk Beralih'}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Data Maintenance & Reset Section */}
        <div className="border-b border-slate-200 pb-6">
          <h2 className="text-xs font-bold text-slate-900 mb-2 uppercase tracking-wider flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-rose-600">cleaning_services</span>
            Pengelolaan Data & Reset Riwayat Laporan
          </h2>
          <p className="text-xs text-slate-500 mb-4">
            Fitur untuk mengosongkan stok atau menghapus riwayat transaksi dan audit log persediaan.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {onClearStock && (
              <button
                onClick={() => {
                  if (confirm('Apakah Anda yakin ingin mengosongkan SELURUH stok produk menjadi 0?')) {
                    onClearStock();
                  }
                }}
                className="p-3 border border-amber-200 bg-amber-50/60 hover:bg-amber-100/80 rounded-lg text-left text-xs font-semibold text-amber-900 transition-colors flex items-center justify-between cursor-pointer"
              >
                <div>
                  <div className="font-bold">Kosongkan Semua Stok Barang</div>
                  <div className="text-[10px] text-amber-700 font-normal">Mengubah jumlah stok semua produk menjadi 0</div>
                </div>
                <span className="material-symbols-outlined text-amber-600">inventory_2</span>
              </button>
            )}

            {onClearIncomingRecords && (
              <button
                onClick={() => {
                  if (confirm('Apakah Anda yakin ingin menghapus SEMUA riwayat stok masuk?')) {
                    onClearIncomingRecords();
                  }
                }}
                className="p-3 border border-blue-200 bg-blue-50/60 hover:bg-blue-100/80 rounded-lg text-left text-xs font-semibold text-blue-900 transition-colors flex items-center justify-between cursor-pointer"
              >
                <div>
                  <div className="font-bold">Hapus Riwayat Stok Masuk</div>
                  <div className="text-[10px] text-blue-700 font-normal">Membersihkan seluruh log penerimaan barang</div>
                </div>
                <span className="material-symbols-outlined text-blue-600">move_to_inbox</span>
              </button>
            )}

            {onClearOutgoingRecords && (
              <button
                onClick={() => {
                  if (confirm('Apakah Anda yakin ingin menghapus SEMUA riwayat stok keluar?')) {
                    onClearOutgoingRecords();
                  }
                }}
                className="p-3 border border-rose-200 bg-rose-50/60 hover:bg-rose-100/80 rounded-lg text-left text-xs font-semibold text-rose-900 transition-colors flex items-center justify-between cursor-pointer"
              >
                <div>
                  <div className="font-bold">Hapus Riwayat Stok Keluar</div>
                  <div className="text-[10px] text-rose-700 font-normal">Membersihkan seluruh log pengeluaran barang</div>
                </div>
                <span className="material-symbols-outlined text-rose-600">outbox</span>
              </button>
            )}

            {onClearLogs && (
              <button
                onClick={() => {
                  if (confirm('Apakah Anda yakin ingin menghapus SEMUA riwayat laporan & audit log?')) {
                    onClearLogs();
                  }
                }}
                className="p-3 border border-slate-300 bg-slate-100/80 hover:bg-slate-200 rounded-lg text-left text-xs font-semibold text-slate-900 transition-colors flex items-center justify-between cursor-pointer"
              >
                <div>
                  <div className="font-bold">Hapus Riwayat Laporan & Audit Log</div>
                  <div className="text-[10px] text-slate-600 font-normal">Membersihkan seluruh riwayat aktivitas laporan</div>
                </div>
                <span className="material-symbols-outlined text-slate-700">delete_sweep</span>
              </button>
            )}
          </div>
        </div>

        {/* Account Info */}
        <div>
          <h2 className="text-xs font-bold text-slate-900 mb-4 uppercase tracking-wider flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-blue-600">badge</span>
            Akun Personil Terotorisasi
          </h2>
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs font-sans">
            <div>
              <div className="font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                {currentUser?.name || 'Ops Manager'}
                {currentUser?.isPrimaryAdmin ? (
                  <span className="px-2 py-0.5 bg-blue-600 text-white font-semibold text-[10px] rounded uppercase tracking-wider">
                    PRIMARY ADMIN
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-slate-200 text-slate-700 font-semibold text-[10px] rounded uppercase tracking-wider">
                    STAFF
                  </span>
                )}
              </div>
              <div className="text-slate-600 mt-1">{currentUser?.email || userEmail}</div>
              <div className="text-slate-500 text-[11px] mt-0.5">
                Departemen: {currentUser?.department || 'Manajemen Gudang'}
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              {onNavigateToUsers && (
                <button
                  onClick={onNavigateToUsers}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-2 shadow-xs"
                >
                  <span className="material-symbols-outlined text-[16px]">manage_accounts</span>
                  <span>Kelola Akun</span>
                </button>
              )}
              <button
                onClick={onLogout}
                className="px-4 py-2 bg-slate-200 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 border border-slate-300 text-slate-800 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
              >
                Keluar Sesi
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
