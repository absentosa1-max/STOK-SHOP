import React from 'react';
import { Product, StockLog } from '../types';

interface DashboardViewProps {
  products: Product[];
  logs: StockLog[];
  selectedWarehouse?: string;
  onNavigateToStock: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  products,
  logs,
  selectedWarehouse = 'Lantai 1',
  onNavigateToStock,
}) => {
  const totalStockCount = products.reduce((acc, p) => acc + p.stock, 0);
  const totalValueIDR = products.reduce((acc, p) => acc + p.stock * p.price, 0);
  const lowStockProducts = products.filter((p) => p.stock <= (p.minThreshold || 10));

  const formatIDR = (num: number) => {
    return 'Rp ' + new Intl.NumberFormat('id-ID').format(num);
  };

  const categories = Array.from(
    new Set(products.map((p) => p.category?.trim()).filter(Boolean) as string[])
  ).sort((a, b) => a.localeCompare(b));

  return (
    <div className="flex flex-col gap-6 animate-fade-in font-sans">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
            Ringkasan Analitik
          </div>
          <h1 className="text-2xl font-display font-bold text-slate-900 tracking-tight">
            Dashboard Utama
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Indikator utama persediaan, status nilai aset gudang, dan aktivitas pergerakan produk.
          </p>
        </div>

        <button
          onClick={onNavigateToStock}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg flex items-center gap-2 transition-colors cursor-pointer shadow-sm self-start md:self-auto"
        >
          <span className="material-symbols-outlined text-[18px]">inventory_2</span>
          <span>Buka Tabel Manajemen Stok</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Stock Value Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between border-l-4 border-l-blue-600">
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Total Nilai Aset Gudang
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2">
              {formatIDR(totalValueIDR)}
            </div>
          </div>
          <div className="mt-4 text-xs text-slate-500 flex items-center gap-1.5 font-medium">
            <span className="material-symbols-outlined text-[16px] text-blue-600">trending_up</span>
            <span>Est. Aset Aktif Gudang Utama</span>
          </div>
        </div>

        {/* Registered SKU Items */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between border-l-4 border-l-slate-800">
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Total Item SKU Aktif
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2">
              {products.length} <span className="text-xs font-normal text-slate-500">SKU</span>
            </div>
          </div>
          <div className="mt-4 text-xs text-slate-500 flex items-center gap-1.5 font-medium">
            <span className="material-symbols-outlined text-[16px] text-slate-700">layers</span>
            <span>Total fisik: {totalStockCount} unit</span>
          </div>
        </div>

        {/* Low Stock Items */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between border-l-4 border-l-amber-500">
          <div>
            <div className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">
              Peringatan Stok Kritis
            </div>
            <div className="text-2xl font-bold text-amber-600 mt-2">
              {lowStockProducts.length} <span className="text-xs font-normal text-slate-500">Produk</span>
            </div>
          </div>
          <div className="mt-4 text-xs text-amber-600 flex items-center gap-1.5 font-medium">
            <span className="material-symbols-outlined text-[16px]">warning</span>
            <span>Memerlukan Restok Segera</span>
          </div>
        </div>

        {/* Warehouse Status */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between border-l-4 border-l-emerald-500">
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Lokasi Gudang
            </div>
            <div className="text-base font-bold text-slate-900 mt-2">
              {selectedWarehouse}
            </div>
          </div>
          <div className="mt-4 text-xs text-slate-500 flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
            <span>Node Sinkronisasi Aktif</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Breakdown */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-5">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center justify-between border-b border-slate-100 pb-3">
            <span>Distribusi Stok per Kategori</span>
            <span className="material-symbols-outlined text-[18px] text-blue-600">pie_chart</span>
          </h2>

          <div className="flex flex-col gap-4">
            {categories.map((cat) => {
              const catProducts = products.filter((p) => p.category === cat);
              const catStock = catProducts.reduce((acc, p) => acc + p.stock, 0);
              const pct = Math.round((catStock / (totalStockCount || 1)) * 100);

              return (
                <div key={cat} className="flex flex-col gap-1.5 text-xs font-sans">
                  <div className="flex justify-between">
                    <span className="text-slate-800 font-medium">{cat}</span>
                    <span className="text-slate-500 font-mono text-[11px]">
                      {catStock} unit ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Low Stock Watchlist */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-5">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center justify-between border-b border-slate-100 pb-3">
            <span>Barang Perlu Diisi Ulang</span>
            <span className="material-symbols-outlined text-[18px] text-amber-600">running_with_errors</span>
          </h2>

          <div className="flex flex-col gap-3 divide-y divide-slate-100">
            {lowStockProducts.length === 0 ? (
              <div className="text-xs text-slate-400 py-4 text-center">
                Semua produk dalam batas aman.
              </div>
            ) : (
              lowStockProducts.map((p) => (
                <div key={p.id} className="pt-3 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-slate-800">{p.name}</div>
                    <div className="text-[11px] font-mono text-slate-400">{p.sku}</div>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-700 font-bold text-[11px] rounded font-mono">
                      Sisa {p.stock} unit
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Audit Movement Feed */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-5">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center justify-between border-b border-slate-100 pb-3">
            <span>Aktivitas Pergerakan Terbaru</span>
            <span className="material-symbols-outlined text-[18px] text-slate-500">history</span>
          </h2>

          <div className="flex flex-col gap-2.5">
            {logs.slice(0, 4).map((log) => (
              <div key={log.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-sans">
                <div className="flex justify-between font-semibold text-slate-800">
                  <span>{log.productName}</span>
                  <span
                    className={log.delta > 0 ? 'text-emerald-600 font-bold font-mono' : 'text-slate-600 font-bold font-mono'}
                  >
                    {log.delta > 0 ? `+${log.delta}` : log.delta}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1 flex justify-between">
                  <span>{log.user}</span>
                  <span className="font-mono text-[10px]">{log.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
