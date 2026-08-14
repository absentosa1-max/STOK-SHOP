import React from 'react';
import { Product } from '../types';

interface ReportsViewProps {
  products: Product[];
  onOpenExportModal: () => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ products, onOpenExportModal }) => {
  const totalValuation = products.reduce((acc, p) => acc + p.stock * p.price, 0);
  const totalItems = products.reduce((acc, p) => acc + p.stock, 0);

  const sortedByValue = [...products].sort((a, b) => b.stock * b.price - a.stock * a.price);

  return (
    <div className="flex flex-col gap-6 animate-fade-in font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
            Laporan & Audit Persediaan
          </div>
          <h1 className="text-2xl font-display font-bold text-slate-900 tracking-tight">
            Laporan Persediaan & Valuasi
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Analisis rinci komposisi aset, nilai pasar stok, dan evaluasi penyusutan.
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 border border-slate-200 rounded-xl shadow-xs border-l-4 border-l-blue-600">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">ESTIMASI TOTAL VALUASI</div>
          <div className="text-2xl font-mono font-bold text-blue-600 mt-2">
            Rp {new Intl.NumberFormat('id-ID').format(totalValuation)}
          </div>
        </div>

        <div className="bg-white p-5 border border-slate-200 rounded-xl shadow-xs border-l-4 border-l-slate-800">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">TOTAL UNIT FISIK</div>
          <div className="text-2xl font-bold text-slate-900 mt-2">
            {totalItems} <span className="text-xs font-normal text-slate-500">Unit</span>
          </div>
        </div>

        <div className="bg-white p-5 border border-slate-200 rounded-xl shadow-xs border-l-4 border-l-slate-400">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">RATA-RATA HARGA PER UNIT</div>
          <div className="text-2xl font-mono font-bold text-slate-900 mt-2">
            Rp {new Intl.NumberFormat('id-ID').format(Math.round(totalValuation / (totalItems || 1)))}
          </div>
        </div>
      </div>

      {/* Top Value Inventory Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <h2 className="text-xs font-bold text-slate-900 mb-5 uppercase tracking-wider flex items-center justify-between border-b border-slate-200 pb-3">
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
                const totalRowVal = p.stock * p.price;
                return (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-slate-500 text-xs">{p.sku}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">{p.name}</td>
                    <td className="py-3.5 px-4 text-slate-600 uppercase text-[11px] font-medium">{p.category}</td>
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
