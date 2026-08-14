import React, { useState } from 'react';
import { NotificationItem, UserAccount } from '../types';

interface HeaderProps {
  userEmail: string;
  currentUser?: UserAccount;
  notifications: NotificationItem[];
  onOpenSearch: () => void;
  onToggleNotifs: () => void;
  showNotifDrawer: boolean;
  selectedWarehouse: string;
  onSelectWarehouse: (wh: string) => void;
  onLogout: () => void;
  isRealtimeConnected?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  userEmail,
  currentUser,
  notifications,
  onOpenSearch,
  onToggleNotifs,
  selectedWarehouse,
  onSelectWarehouse,
  onLogout,
  isRealtimeConnected = true,
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const displayName = currentUser?.name || 'Ops Manager';
  const displayRole = currentUser?.roleLabel || 'Staf Operasional';
  const displayEmail = currentUser?.email || userEmail;
  const initialLetter = displayName.charAt(0).toUpperCase();

  return (
    <header className="h-16 bg-white/90 backdrop-blur-md border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-20 font-sans">
      {/* Search Bar Input Trigger */}
      <div className="flex-1 max-w-md">
        <button
          type="button"
          onClick={onOpenSearch}
          className="w-full h-10 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 rounded-lg px-3.5 flex items-center justify-between text-xs text-slate-500 transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-2.5 font-sans">
            <span className="material-symbols-outlined text-[18px] text-blue-600 group-hover:scale-110 transition-transform">
              search
            </span>
            <span className="text-slate-600 font-medium text-xs">
              Cari stok / SKU (Cmd+K)
            </span>
          </div>
          <kbd className="hidden sm:inline-block bg-white text-slate-500 border border-slate-300 rounded px-2 py-0.5 text-[10px] font-mono shadow-2xs">
            /
          </kbd>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Realtime Live Status Pill */}
        <div
          className={`px-2.5 py-1 rounded-full border text-[11px] font-semibold flex items-center gap-1.5 transition-all shadow-2xs ${
            isRealtimeConnected
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}
          title={isRealtimeConnected ? 'Terhubung dengan Realtime Server' : 'Menghubungkan ke Server...'}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isRealtimeConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500 animate-ping'
            }`}
          />
          <span className="hidden md:inline">
            {isRealtimeConnected ? 'Realtime Aktif' : 'Syncing...'}
          </span>
        </div>
        {/* Notifications Icon Button */}
        <button
          onClick={onToggleNotifs}
          className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors cursor-pointer"
          title="Notifikasi Stok"
          aria-label="Notifikasi Stok"
        >
          <span className="material-symbols-outlined text-[20px]">notifications</span>
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600" />
          )}
        </button>

        <div className="h-5 w-px bg-slate-200" />

        {/* User Profile Info & Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-3 hover:opacity-90 transition-opacity cursor-pointer focus:outline-none"
          >
            <div className="text-right hidden sm:block">
              <div className="text-xs font-semibold text-slate-800 flex items-center justify-end gap-1.5">
                {displayName}
                {currentUser?.isPrimaryAdmin && (
                  <span className="text-[9px] px-1.5 py-0.5 bg-blue-100 text-blue-700 font-bold rounded">
                    ADMIN
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-500 font-medium">{displayRole}</div>
            </div>
            <div className={`w-9 h-9 font-bold text-sm rounded-lg flex items-center justify-center ${currentUser?.isPrimaryAdmin ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-200 text-slate-800 border border-slate-300'}`}>
              {initialLetter}
            </div>
          </button>

          {/* Profile Popover Menu */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-3 w-64 bg-white border border-slate-200 rounded-xl p-1 z-50 animate-fade-in shadow-xl text-xs font-sans">
              <div className="px-4 py-3 border-b border-slate-100">
                <div className="font-bold text-slate-900 flex items-center gap-2">
                  {displayName}
                  {currentUser?.isPrimaryAdmin ? (
                    <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[9px] font-bold rounded">PRIMARY</span>
                  ) : (
                    <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 text-[9px] rounded">STAFF</span>
                  )}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">{displayEmail}</div>
                <div className="text-[11px] text-blue-600 font-medium mt-1">
                  Gudang: {selectedWarehouse}
                </div>
              </div>
              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  alert(`User: ${displayName}\nRole: ${displayRole}\nEmail: ${displayEmail}\nStatus: ${currentUser?.status || 'Active'}`);
                }}
                className="w-full text-left px-4 py-2.5 text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer text-xs font-medium rounded-md"
              >
                <span className="material-symbols-outlined text-[16px] text-blue-600">account_box</span>
                Profil Pengguna
              </button>
              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  onLogout();
                }}
                className="w-full text-left px-4 py-2.5 text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 cursor-pointer border-t border-slate-100 text-xs font-bold rounded-md"
              >
                <span className="material-symbols-outlined text-[16px]">logout</span>
                Keluar (Logout)
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
