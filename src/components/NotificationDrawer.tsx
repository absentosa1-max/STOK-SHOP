import React from 'react';
import { NotificationItem } from '../types';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAllRead: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllRead,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex justify-end animate-fade-in font-sans">
      <div className="w-full max-w-sm bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-blue-600">
              notifications
            </span>
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Pemberitahuan Sistem</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-200 cursor-pointer transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Action bar */}
        <div className="px-5 py-2.5 bg-slate-100/70 border-b border-slate-200 flex items-center justify-between text-xs font-sans">
          <span className="text-slate-500 font-semibold text-[10px] uppercase tracking-wider font-mono">
            {notifications.filter((n) => !n.read).length} BELUM DIBACA
          </span>
          <button
            onClick={onMarkAllRead}
            className="text-blue-600 hover:text-blue-800 font-semibold cursor-pointer text-[10px] uppercase tracking-wider transition-colors"
          >
            Tandai Semua Dibaca
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 text-xs flex gap-3 transition-colors ${
                !n.read ? 'bg-blue-50/50' : 'hover:bg-slate-50'
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full mt-1 shrink-0 ${
                  n.type === 'warning'
                    ? 'bg-amber-500'
                    : n.type === 'success'
                    ? 'bg-emerald-500'
                    : 'bg-blue-500'
                }`}
              />
              <div className="flex-1">
                <div className="font-semibold text-slate-900">{n.title}</div>
                <div className="text-slate-600 text-[11px] mt-0.5">{n.message}</div>
                <div className="text-[10px] text-blue-600 mt-1.5 font-mono uppercase tracking-wider">{n.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
