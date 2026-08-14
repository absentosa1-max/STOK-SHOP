import React from 'react';
import { NavigationTab, UserAccount } from '../types';

interface SidebarProps {
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  onLogout: () => void;
  unreadCount: number;
  currentUser?: UserAccount;
  isRealtimeConnected?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  onLogout,
  currentUser,
  isRealtimeConnected = true,
}) => {
  const navItems: { id: NavigationTab; label: string; icon: string; badge?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'grid_view' },
    { id: 'inventory', label: 'Manajemen Stok', icon: 'inventory_2' },
    { id: 'incoming_stock', label: 'Stok Masuk', icon: 'move_to_inbox' },
    { id: 'outgoing_stock', label: 'Stok Keluar', icon: 'outbox' },
    { id: 'reports', label: 'Laporan', icon: 'assessment' },
    {
      id: 'users',
      label: 'Kelola Akun',
      icon: 'manage_accounts',
      badge: currentUser?.isPrimaryAdmin ? 'ADMIN' : 'STAFF',
    },
    { id: 'settings', label: 'Pengaturan', icon: 'settings' },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col h-screen fixed left-0 top-0 z-30 border-r border-slate-800 select-none font-sans">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 gap-3 border-b border-slate-800 bg-slate-950">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-md">
          <span className="material-symbols-outlined text-[20px]">package_2</span>
        </div>
        <div>
          <span className="font-display font-bold text-base tracking-wide uppercase text-white block leading-none">
            STOCKMASTER
          </span>
          <span className="text-[10px] font-medium tracking-wider text-slate-400 block mt-1">
            Sistem Kelola Stok
          </span>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 py-6 px-3 flex flex-col gap-1.5">
        <div className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          Menu Utama
        </div>
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium tracking-wide transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white font-semibold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[18px]">
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {item.badge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : item.badge === 'ADMIN'
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </nav>

      {/* Footer / Quick Session Lock */}
      <div className="p-4 border-t border-slate-800 flex flex-col gap-3 bg-slate-950">
        <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 font-medium">
          <span className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isRealtimeConnected
                  ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse'
                  : 'bg-amber-500 animate-ping'
              }`}
            />
            <span>{isRealtimeConnected ? 'Realtime Server' : 'Connecting...'}</span>
          </span>
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase ${
              isRealtimeConnected
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
            }`}
          >
            {isRealtimeConnected ? 'LIVE' : 'SYNCING'}
          </span>
        </div>

        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-slate-800 hover:border-rose-500/30 transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">logout</span>
          <span>Keluar Sesi</span>
        </button>
      </div>
    </aside>
  );
};
