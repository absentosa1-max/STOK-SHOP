import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { OutgoingStockRecord, Product } from '../types';
import { AddEditOutgoingStockModal } from './AddEditOutgoingStockModal';

interface OutgoingStockViewProps {
  outgoingRecords: OutgoingStockRecord[];
  products: Product[];
  onAddRecord: (recordData: Partial<OutgoingStockRecord>) => void;
  onEditRecord: (recordId: string, updatedData: Partial<OutgoingStockRecord>) => void;
  onDeleteRecord: (recordId: string) => void;
}

export const OutgoingStockView: React.FC<OutgoingStockViewProps> = ({
  outgoingRecords,
  products,
  onAddRecord,
  onEditRecord,
  onDeleteRecord,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [reasonFilter, setReasonFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [recordToEdit, setRecordToEdit] = useState<OutgoingStockRecord | null>(null);
  const [recordToDelete, setRecordToDelete] = useState<OutgoingStockRecord | null>(null);

  // Filter records
  const filteredRecords = outgoingRecords.filter((rec) => {
    const query = searchTerm.toLowerCase();
    const matchesSearch =
      rec.productName.toLowerCase().includes(query) ||
      rec.sku.toLowerCase().includes(query) ||
      rec.customerOrDestination.toLowerCase().includes(query) ||
      rec.soNumber.toLowerCase().includes(query) ||
      rec.size.toLowerCase().includes(query) ||
      rec.color.toLowerCase().includes(query) ||
      rec.dateOut.includes(query) ||
      (rec.shippingCarrier && rec.shippingCarrier.toLowerCase().includes(query)) ||
      (rec.note && rec.note.toLowerCase().includes(query));

    const matchesReason = reasonFilter === 'ALL' || rec.reason === reasonFilter;

    return matchesSearch && matchesReason;
  });

  // Calculate KPI metrics
  const totalUnitsOut = filteredRecords.reduce((sum, r) => sum + r.quantity, 0);
  const totalValueOut = filteredRecords.reduce((sum, r) => sum + r.quantity * (r.unitPrice || 0), 0);
  const totalTransactions = filteredRecords.length;
  const uniqueDestinations = Array.from(new Set(outgoingRecords.map((r) => r.customerOrDestination).filter(Boolean)));

  const handleOpenAddModal = () => {
    setRecordToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (rec: OutgoingStockRecord) => {
    setRecordToEdit(rec);
    setIsModalOpen(true);
  };

  const handleSaveModal = (data: Partial<OutgoingStockRecord>, isEditing: boolean) => {
    if (isEditing && recordToEdit) {
      onEditRecord(recordToEdit.id, data);
    } else {
      onAddRecord(data);
    }
  };

  const handleConfirmDelete = () => {
    if (recordToDelete) {
      onDeleteRecord(recordToDelete.id);
      setRecordToDelete(null);
    }
  };

  // Export outgoing records to Excel
  const handleExportExcel = () => {
    const headers = [
      'ID Record',
      'Tanggal Keluar',
      'No. SO / Surat Jalan',
      'Nama Produk',
      'SKU',
      'Kategori',
      'Ukuran',
      'Warna',
      'Jumlah Keluar (Unit)',
      'Harga Per Unit (IDR)',
      'Total Nilai (IDR)',
      'Pelanggan / Tujuan',
      'Alasan Pengeluaran',
      'Ekspedisi / Kurir',
      'Pengolah / Petugas',
      'Catatan',
    ];

    const rows = filteredRecords.map((r) => [
      r.id,
      r.dateOut,
      r.soNumber,
      r.productName,
      r.sku,
      r.category,
      r.size,
      r.color,
      r.quantity,
      r.unitPrice,
      r.quantity * r.unitPrice,
      r.customerOrDestination,
      r.reason || 'Penjualan',
      r.shippingCarrier || 'Internal',
      r.processedBy,
      r.note || '—',
    ]);

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    worksheet['!cols'] = [
      { wch: 12 },
      { wch: 14 },
      { wch: 18 },
      { wch: 30 },
      { wch: 18 },
      { wch: 14 },
      { wch: 10 },
      { wch: 12 },
      { wch: 14 },
      { wch: 18 },
      { wch: 20 },
      { wch: 28 },
      { wch: 18 },
      { wch: 20 },
      { wch: 18 },
      { wch: 30 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Riwayat Stok Keluar');
    XLSX.writeFile(
      workbook,
      `Laporan_Stok_Keluar_${new Date().toISOString().slice(0, 10)}.xlsx`,
      { bookType: 'xlsx' }
    );
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in font-sans pb-12">
      {/* Top Title & Primary Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-rose-600 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px]">outbox</span>
            <span>Pencatatan Barang Keluar & Pengiriman</span>
          </div>
          <h1 className="text-2xl font-display font-bold text-slate-900 tracking-tight">
            Pencatatan & Riwayat Barang Keluar
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Pantau barang keluar (ukuran, warna, tanggal, tujuan) serta perbaiki entri jika terdapat kesalahan pencatatan.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition-colors flex items-center gap-2 cursor-pointer shadow-2xs"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span>Ekspor Excel</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>Catat Barang Keluar Baru</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Header */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 border border-slate-200 rounded-xl shadow-2xs border-l-4 border-l-rose-600">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            TOTAL UNIT KELUAR
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 flex items-baseline gap-2">
            <span>{totalUnitsOut}</span>
            <span className="text-xs font-normal text-slate-500">Unit</span>
          </div>
        </div>

        <div className="bg-white p-5 border border-slate-200 rounded-xl shadow-2xs border-l-4 border-l-amber-600">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            VALUASI BARANG KELUAR
          </div>
          <div className="text-2xl font-mono font-bold text-rose-700 mt-2">
            Rp {new Intl.NumberFormat('id-ID').format(totalValueOut)}
          </div>
        </div>

        <div className="bg-white p-5 border border-slate-200 rounded-xl shadow-2xs border-l-4 border-l-slate-800">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            TRANSAKSI PENGIRIMAN
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 flex items-baseline gap-2">
            <span>{totalTransactions}</span>
            <span className="text-xs font-normal text-slate-500">Batch Outbound</span>
          </div>
        </div>

        <div className="bg-white p-5 border border-slate-200 rounded-xl shadow-2xs border-l-4 border-l-blue-600">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            TUJUAN / PELANGGAN
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 flex items-baseline gap-2">
            <span>{uniqueDestinations.length}</span>
            <span className="text-xs font-normal text-slate-500">Destinasi</span>
          </div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="w-full md:w-96 relative">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[20px]">
            search
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari produk, SKU, tanggal, ukuran, warna, tujuan, SO..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 outline-none focus:border-rose-600 focus:bg-white"
          />
        </div>

        {/* Reason Filter */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <label className="text-xs text-slate-500 font-medium shrink-0">Alasan Outbound:</label>
          <select
            value={reasonFilter}
            onChange={(e) => setReasonFilter(e.target.value)}
            className="p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 outline-none focus:border-rose-600"
          >
            <option value="ALL">Semua Alasan Pengeluaran</option>
            <option value="Penjualan">Penjualan (Sales)</option>
            <option value="Transfer Cabang">Transfer Cabang</option>
            <option value="Penggunaan Internal">Penggunaan Internal</option>
            <option value="Sample/Hadiah">Sample / Hadiah</option>
            <option value="Retur Supplier">Retur Supplier</option>
          </select>
        </div>
      </div>

      {/* Main Records Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-rose-600">
              history_edu
            </span>
            <span>Daftar Riwayat Barang Keluar ({filteredRecords.length} Record)</span>
          </div>
          <span className="text-[11px] text-slate-500">
            Klik <strong>Edit</strong> untuk mengoreksi kesalahan input data pengeluaran stok.
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/70 text-slate-700 font-bold text-[11px] uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-4">Tanggal Keluar</th>
                <th className="py-3 px-4">No. SO / Surat Jalan</th>
                <th className="py-3 px-4">Nama Produk & SKU</th>
                <th className="py-3 px-4">Ukuran & Warna</th>
                <th className="py-3 px-4 text-center">Jumlah Keluar</th>
                <th className="py-3 px-4 text-right">Harga & Total (IDR)</th>
                <th className="py-3 px-4">Tujuan / Pelanggan</th>
                <th className="py-3 px-4">Alasan & Ekspedisi</th>
                <th className="py-3 px-4 text-center">Aksi / Koreksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <span className="material-symbols-outlined text-[36px] block mb-2 text-slate-300">
                      outbox
                    </span>
                    <span>Tidak ada catatan barang keluar yang sesuai kriteria pencarian.</span>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => {
                  const totalRowVal = rec.quantity * (rec.unitPrice || 0);

                  return (
                    <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Tanggal Keluar */}
                      <td className="py-3.5 px-4 font-mono text-slate-700 whitespace-nowrap">
                        <div className="font-semibold text-slate-900">{rec.dateOut}</div>
                        <div className="text-[10px] text-slate-400">ID: {rec.id}</div>
                      </td>

                      {/* No. SO */}
                      <td className="py-3.5 px-4 font-mono text-xs text-rose-700 font-semibold whitespace-nowrap">
                        {rec.soNumber || '—'}
                      </td>

                      {/* Produk & SKU */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{rec.productName}</div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                          SKU: {rec.sku}
                        </div>
                      </td>

                      {/* Ukuran & Warna */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-[10px] rounded">
                            Ukuran: {rec.size}
                          </span>
                          <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-[10px] rounded flex items-center gap-1">
                            {rec.colorHex && (
                              <span
                                className="w-2 h-2 rounded-full border border-slate-300"
                                style={{ backgroundColor: rec.colorHex }}
                              />
                            )}
                            {rec.color}
                          </span>
                        </div>
                      </td>

                      {/* Jumlah Unit */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span className="px-2.5 py-1 bg-rose-50 text-rose-800 border border-rose-200 font-bold text-xs rounded-lg inline-block">
                          -{rec.quantity} unit
                        </span>
                      </td>

                      {/* Harga & Total */}
                      <td className="py-3.5 px-4 text-right font-mono whitespace-nowrap">
                        <div className="font-bold text-slate-900">
                          Rp {new Intl.NumberFormat('id-ID').format(totalRowVal)}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          @ Rp {new Intl.NumberFormat('id-ID').format(rec.unitPrice)}
                        </div>
                      </td>

                      {/* Tujuan / Pelanggan */}
                      <td className="py-3.5 px-4 text-slate-900 font-semibold">
                        {rec.customerOrDestination}
                      </td>

                      {/* Alasan & Ekspedisi */}
                      <td className="py-3.5 px-4 text-slate-700 max-w-xs">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 text-slate-700 font-medium text-[10px] rounded">
                            {rec.reason || 'Penjualan'}
                          </span>
                          <span className="text-[10px] text-slate-500 truncate">
                            {rec.shippingCarrier || 'Internal'}
                          </span>
                        </div>
                        {rec.note && (
                          <div className="text-[11px] text-slate-500 italic mt-1 line-clamp-2">
                            &quot;{rec.note}&quot;
                          </div>
                        )}
                      </td>

                      {/* Actions: Edit / Koreksi & Hapus */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenEditModal(rec)}
                            title="Edit / Koreksi Data Outbound"
                            className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold text-[11px] rounded-md transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[14px]">edit</span>
                            <span>Edit</span>
                          </button>

                          <button
                            onClick={() => setRecordToDelete(rec)}
                            title="Hapus Record Ini"
                            className="p-1 bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200 hover:border-rose-200 rounded-md transition-colors cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      <AddEditOutgoingStockModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        products={products}
        recordToEdit={recordToEdit}
        onSave={handleSaveModal}
      />

      {/* Delete Confirmation Modal */}
      {recordToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in font-sans">
          <div className="bg-white w-full max-w-md border border-slate-200 rounded-2xl shadow-2xl p-6 flex flex-col gap-4">
            <div className="flex items-center gap-3 text-rose-600 font-bold text-base">
              <span className="material-symbols-outlined text-[24px]">warning</span>
              <span>Konfirmasi Hapus Record Outbound</span>
            </div>

            <p className="text-xs text-slate-600">
              Apakah Anda yakin ingin menghapus record barang keluar{' '}
              <strong>{recordToDelete.productName}</strong> ({recordToDelete.quantity} unit) ke{' '}
              <strong>{recordToDelete.customerOrDestination}</strong> tanggal <strong>{recordToDelete.dateOut}</strong>?
            </p>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-500 font-mono">
              SO: {recordToDelete.soNumber} | Ukuran: {recordToDelete.size} | Warna: {recordToDelete.color}
            </div>

            <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                onClick={() => setRecordToDelete(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
              >
                Batal
              </button>

              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer shadow-xs"
              >
                Ya, Hapus Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
