import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Product } from '../types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, products }) => {
  const [format, setFormat] = useState<'csv' | 'xlsx'>('xlsx');
  const [includeVariants, setIncludeVariants] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'lowStock'>('all');

  if (!isOpen) return null;

  const handleDownload = () => {
    let exportItems = products;
    if (filterType === 'lowStock') {
      exportItems = products.filter((p) => p.stock <= (p.minThreshold || 10));
    }

    const headers = [
      'ID',
      'Nama Produk',
      'Deskripsi',
      'SKU',
      'Kategori',
      'Ukuran',
      'Warna',
      'Stok',
      'Harga (IDR)',
      'Total Nilai (IDR)',
    ];
    const rows: (string | number)[][] = [headers];

    exportItems.forEach((p) => {
      rows.push([
        p.id,
        p.name,
        p.description,
        p.sku,
        p.category,
        p.size,
        p.color,
        p.stock,
        p.price,
        p.stock * p.price,
      ]);

      if (includeVariants && p.variants) {
        p.variants.forEach((v) => {
          rows.push([
            `${p.id}-v`,
            `${p.name} (${v.size}/${v.color})`,
            `Variasi ${v.size} - ${v.color}`,
            v.sku,
            p.category,
            v.size,
            v.color,
            v.stock,
            v.price,
            v.stock * v.price,
          ]);
        });
      }
    });

    const worksheet = XLSX.utils.aoa_to_sheet(rows);

    // Auto column widths for clean formatting in Excel
    worksheet['!cols'] = [
      { wch: 10 },
      { wch: 32 },
      { wch: 38 },
      { wch: 18 },
      { wch: 18 },
      { wch: 10 },
      { wch: 12 },
      { wch: 10 },
      { wch: 16 },
      { wch: 18 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan Inventory');

    const filename = `StockMaster_Laporan_Inventory_${new Date().toISOString().slice(0, 10)}.${format}`;

    if (format === 'xlsx') {
      XLSX.writeFile(workbook, filename, { bookType: 'xlsx' });
    } else {
      XLSX.writeFile(workbook, filename, { bookType: 'csv' });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in font-sans">
      <div className="bg-white w-full max-w-md border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-0.5">
              Ekspor Data
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-blue-600">file_download</span>
              <h2 className="text-base font-bold text-slate-900">Unduh Laporan Inventory</h2>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-200 cursor-pointer transition-colors">
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col gap-5 text-xs font-sans">
          <div>
            <label className="block text-slate-700 font-semibold mb-2 uppercase text-[11px] tracking-wider">Format Berkas</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormat('xlsx')}
                className={`p-3 border rounded-xl text-left flex items-center gap-2.5 cursor-pointer transition-all ${
                  format === 'xlsx'
                    ? 'border-blue-600 bg-blue-50/80 text-blue-900 font-semibold shadow-2xs'
                    : 'border-slate-200 bg-slate-50/50 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <span className="material-symbols-outlined text-[20px] text-blue-600">table_chart</span>
                <div>
                  <div className="text-xs uppercase font-bold text-slate-900">Excel (.xlsx)</div>
                  <div className="text-[10px] text-slate-500">Format spreadsheet</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormat('csv')}
                className={`p-3 border rounded-xl text-left flex items-center gap-2.5 cursor-pointer transition-all ${
                  format === 'csv'
                    ? 'border-blue-600 bg-blue-50/80 text-blue-900 font-semibold shadow-2xs'
                    : 'border-slate-200 bg-slate-50/50 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <span className="material-symbols-outlined text-[20px] text-blue-600">description</span>
                <div>
                  <div className="text-xs uppercase font-bold text-slate-900">CSV (.csv)</div>
                  <div className="text-[10px] text-slate-500">Teks koma terpisah</div>
                </div>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-2 uppercase text-[11px] tracking-wider">Cakupan Data</label>
            <div className="flex flex-col gap-2.5">
              <label className="flex items-center gap-2 text-slate-800 cursor-pointer text-xs">
                <input
                  type="radio"
                  name="filterType"
                  checked={filterType === 'all'}
                  onChange={() => setFilterType('all')}
                  className="accent-blue-600"
                />
                <span>Semua Item ({products.length} produk terdaftar)</span>
              </label>

              <label className="flex items-center gap-2 text-slate-800 cursor-pointer text-xs">
                <input
                  type="radio"
                  name="filterType"
                  checked={filterType === 'lowStock'}
                  onChange={() => setFilterType('lowStock')}
                  className="accent-blue-600"
                />
                <span className="text-rose-600 font-semibold">
                  Khusus Produk Stok Kritis / Rendah Saja
                </span>
              </label>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <label className="flex items-center gap-2 text-slate-800 cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={includeVariants}
                onChange={(e) => setIncludeVariants(e.target.checked)}
                className="accent-blue-600 rounded"
              />
              <span>Sertakan rincian sub-variasi (Ukuran & Warna)</span>
            </label>
          </div>

          <div className="mt-2 pt-4 border-t border-slate-200 flex justify-end gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg shadow-xs flex items-center gap-2 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              <span>Unduh Berkas</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
