import React, { useMemo } from 'react';
import { Product } from '../types';

interface ReportsViewProps {
  products: Product[];
  onOpenExportModal: () => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ products, onOpenExportModal }) => {
  const totalValuation = products.reduce((acc, p) => acc + (p.stock || 0) * (p.price || 0), 0);
  const totalItems = products.reduce((acc, p) => acc + (p.stock || 0), 0);

  const sortedByValue = useMemo(() => {
    return [...products].sort((a, b) => (b.stock || 0) * (b.price || 0) - (a.stock || 0) * (a.price || 0));
  }, [products]);

  // Aggregate stats grouped per category
  const categoryAnalytics = useMemo(() => {
    const map = new Map<string, { skuCount: number; totalStock: number; totalValue: number }>();
    products.forEach((p) => {
      const cat = p.category?.trim() || 'Tanpa Kategori';
      const cur = map.get(cat) || { skuCount: 0, totalStock: 0, totalValue: 0 };
      cur.skuCount += 1;
      cur.totalStock += p.stock || 0;
      cur.totalValue += (p.stock || 0) * (p.price || 0);
      map.set(cat, cur);
    });

    return Array.from(map.entries())
      .map(([category, stats]) => ({
        category,
        skuCount: stats.skuCount,
        totalStock: stats.totalStock,
        totalValue: stats.totalValue,
        stockPercentage: totalItems > 0 ? (stats.totalStock / totalItems) * 100 : 0,
        valuePercentage: totalValuation > 0 ? (stats.totalValue / totalValuation) * 100 : 0,
      }))
      .sort((a, b) => b.totalValue - a.totalValue);
  }, [products, totalItems, totalValuation]);

  return (
    <div className="flex flex-col gap-6 animate-fade-in font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
            Laporan & Audit Persediaan
          </div>
          <h1 className="text-2xl font-display font-bold text-slate-900 tracking-tight">
            Laporan Persediaan & Valuasi per Kategori
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Analisis rinci komposisi aset, nilai pasar stok per kategori, dan evaluasi persediaan.
          </p>
        </div>

        <button
          onClick={onOpenExportModal}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-2 cursor-pointer shadow-sm self-start md:self-auto"
        >
          <span className="material-symbols-outlined text-[18px]">download</span>
          <span>Unduh Laporan Lengkap (.XLSX)</span>
        </button>
      </div>

      {/* Summary KPI Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 border border-slate-200 rounded-xl shadow-xs border-l-4 border-l-blue-600">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">ESTIMASI TOTAL VALUASI</div>
          <div className="text-2xl font-mono font-bold text-blue-600 mt-2">
            Rp {new Intl.NumberFormat('id-ID').format(totalValuation)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Akumulasi seluruh kategori</div>
        </div>

        <div className="bg-white p-5 border border-slate-200 rounded-xl shadow-xs border-l-4 border-l-slate-800">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">TOTAL UNIT FISIK</div>
          <div className="text-2xl font-bold text-slate-900 mt-2">
            {totalItems} <span className="text-xs font-normal text-slate-500">Unit</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Dari {products.length} SKU terdaftar</div>
        </div>

        <div className="bg-white p-5 border border-slate-200 rounded-xl shadow-xs border-l-4 border-l-purple-600">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">JUMLAH KATEGORI AKTIF</div>
          <div className="text-2xl font-bold text-slate-900 mt-2">
            {categoryAnalytics.length} <span className="text-xs font-normal text-slate-500">Kategori</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Pengelompokan inventaris</div>
        </div>

        <div className="bg-white p-5 border border-slate-200 rounded-xl shadow-xs border-l-4 border-l-emerald-600">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">RATA-RATA HARGA PER UNIT</div>
          <div className="text-2xl font-mono font-bold text-slate-900 mt-2">
            Rp {new Intl.NumberFormat('id-ID').format(Math.round(totalValuation / (totalItems || 1)))}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Weighted average price</div>
        </div>
      </div>

      {/* Category Breakdown Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <h2 className="text-xs font-bold text-slate-900 mb-4 uppercase tracking-wider flex items-center justify-between border-b border-slate-200 pb-3">
          <span className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-blue-600">category</span>
            Ringkasan Persediaan per Kategori
          </span>
          <span className="text-xs font-semibold text-slate-500 font-normal normal-case">
            Dikelompokkan berdasarkan Valuasi & Unit
          </span>
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse font-sans">
            <thead>
              <tr className="bg-slate-50 font-bold text-slate-600 text-[11px] uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-4">KATEGORI</th>
                <th className="py-3 px-4 text-center">TOTAL SKU</th>
                <th className="py-3 px-4 text-center">TOTAL STOK</th>
                <th className="py-3 px-4 text-right">TOTAL VALUASI (IDR)</th>
                <th className="py-3 px-4 text-right">% DARI TOTAL ASET</th>
                <th className="py-3 px-4 min-w-[140px]">DISTRIBUSI NILAI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {categoryAnalytics.map((cat) => (
                <tr key={cat.category} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-blue-600">folder</span>
                    <span>{cat.category}</span>
                  </td>
                  <td className="py-3.5 px-4 text-center font-semibold text-slate-700">
                    {cat.skuCount} SKU
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-slate-900">
                    {cat.totalStock} Unit
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-blue-600">
                    Rp {new Intl.NumberFormat('id-ID').format(cat.totalValue)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-700">
                    {cat.valuePercentage.toFixed(1)}%
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-600 h-full rounded-full transition-all duration-300"
                        style={{ width: `${Math.max(4, cat.valuePercentage)}%` }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Value Individual Inventory Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <h2 className="text-xs font-bold text-slate-900 mb-4 uppercase tracking-wider flex items-center justify-between border-b border-slate-200 pb-3">
          <span>Peringkat Aset Persediaan Tertinggi</span>
          <span className="text-xs font-semibold text-blue-600 normal-case font-sans">Diurutkan berdasarkan Total Nilai (IDR)</span>
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse font-sans">
            <thead>
              <tr className="bg-slate-50 font-bold text-slate-600 text-[11px] uppercase tracking-wider border-b border-slate-200">
                <th className="py-3.5 px-4">SKU</th>
                <th className="py-3.5 px-4">Nama Produk</th>
                <th className="py-3.5 px-4">Kategori</th>
                <th className="py-3.5 px-4 text-center">Jumlah Stok</th>
                <th className="py-3.5 px-4 text-right">Harga Satuan</th>
                <th className="py-3.5 px-4 text-right">Total Nilai (IDR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {sortedByValue.map((p) => {
                const totalRowVal = (p.stock || 0) * (p.price || 0);
                return (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-slate-500 text-xs">{p.sku}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">{p.name}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-semibold rounded">
                        {p.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-semibold text-slate-900">{p.stock}</td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-700">
                      Rp {new Intl.NumberFormat('id-ID').format(p.price)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-blue-600">
                      Rp {new Intl.NumberFormat('id-ID').format(totalRowVal)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
