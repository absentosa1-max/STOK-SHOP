import React from 'react';
import { Product, StockLog } from '../types';

interface StockHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  logs: StockLog[];
}

export const StockHistoryModal: React.FC<StockHistoryModalProps> = ({
  isOpen,
  onClose,
  product,
  logs,
}) => {
  if (!isOpen || !product) return null;

  const productLogs = logs.filter((l) => l.productId === product.id);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in font-sans">
      <div className="bg-white w-full max-w-xl border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-0.5">
              Audit Pergerakan Stok
            </div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-blue-600">history</span>
              Riwayat Pergerakan Stok
            </h2>
            <div className="text-xs text-slate-500 mt-0.5 font-medium">
              {product.name} ({product.sku})
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-200 cursor-pointer transition-colors">
            ✕
          </button>
        </div>

        {/* Logs Timeline */}
        <div className="p-6 max-h-96 overflow-y-auto flex flex-col gap-3 text-xs font-sans">
          {productLogs.length === 0 ? (
            <div className="text-center py-8 text-slate-400 uppercase font-mono">
              <span className="material-symbols-outlined text-[32px] block mb-1 text-blue-500 opacity-60">
                assignment
              </span>
              Belum ada riwayat perubahan manual untuk barang ini.
            </div>
          ) : (
            productLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 bg-slate-50/70 border border-slate-200 rounded-xl flex items-start justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`w-7 h-7 rounded-lg border flex items-center justify-center text-xs font-bold shrink-0 ${
                      log.type === 'IN'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        : log.type === 'OUT'
                        ? 'bg-rose-50 border-rose-200 text-rose-700'
                        : 'bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    {log.type === 'IN' ? '+' : log.type === 'OUT' ? '-' : '•'}
                  </span>
                  <div>
                    <div className="font-semibold text-slate-900">
                      {log.type === 'IN'
                        ? 'Penambahan Stok Masuk'
                        : log.type === 'OUT'
                        ? 'Pengurangan Stok Keluar'
                        : 'Penyesuaian Manual'}
                    </div>
                    {log.note && <div className="text-slate-600 mt-0.5 text-[11px]">{log.note}</div>}
                    <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-2 uppercase tracking-wider font-mono">
                      <span>Oleh: {log.user}</span>
                      <span>•</span>
                      <span>{log.timestamp}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right font-mono">
                  <div
                    className={`font-bold ${
                      log.delta > 0 ? 'text-emerald-600' : log.delta < 0 ? 'text-rose-600' : 'text-slate-600'
                    }`}
                  >
                    {log.delta > 0 ? `+${log.delta}` : log.delta} unit
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {log.previousStock} → {log.newStock}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end font-sans">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
