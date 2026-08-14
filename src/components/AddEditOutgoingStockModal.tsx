import React, { useState, useEffect } from 'react';
import { Product, OutgoingStockRecord } from '../types';

interface AddEditOutgoingStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  recordToEdit?: OutgoingStockRecord | null;
  onSave: (recordData: Partial<OutgoingStockRecord>, isEditing: boolean) => void;
}

export const AddEditOutgoingStockModal: React.FC<AddEditOutgoingStockModalProps> = ({
  isOpen,
  onClose,
  products,
  recordToEdit,
  onSave,
}) => {
  const isEditing = !!recordToEdit;

  const [productId, setProductId] = useState<string>('');
  const [productName, setProductName] = useState<string>('');
  const [sku, setSku] = useState<string>('');
  const [category, setCategory] = useState<string>('Pakaian');
  const [size, setSize] = useState<string>('M');
  const [color, setColor] = useState<string>('Hitam');
  const [colorHex, setColorHex] = useState<string>('#191c1e');
  const [quantity, setQuantity] = useState<number>(5);
  const [unitPrice, setUnitPrice] = useState<number>(100000);
  const [customerOrDestination, setCustomerOrDestination] = useState<string>('');
  const [soNumber, setSoNumber] = useState<string>('');
  const [shippingCarrier, setShippingCarrier] = useState<string>('Kurir Internal Gudang');
  const [reason, setReason] = useState<string>('Penjualan');
  const [dateOut, setDateOut] = useState<string>(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState<string>('');

  useEffect(() => {
    if (recordToEdit) {
      setProductId(recordToEdit.productId || '');
      setProductName(recordToEdit.productName || '');
      setSku(recordToEdit.sku || '');
      setCategory(recordToEdit.category || 'Pakaian');
      setSize(recordToEdit.size || '—');
      setColor(recordToEdit.color || '—');
      setColorHex(recordToEdit.colorHex || '#191c1e');
      setQuantity(recordToEdit.quantity || 1);
      setUnitPrice(recordToEdit.unitPrice || 0);
      setCustomerOrDestination(recordToEdit.customerOrDestination || '');
      setSoNumber(recordToEdit.soNumber || '');
      setShippingCarrier(recordToEdit.shippingCarrier || 'Kurir Internal Gudang');
      setReason(recordToEdit.reason || 'Penjualan');
      setDateOut(recordToEdit.dateOut || new Date().toISOString().slice(0, 10));
      setNote(recordToEdit.note || '');
    } else {
      // Default new record
      if (products.length > 0) {
        const defaultProd = products[0];
        setProductId(defaultProd.id);
        setProductName(defaultProd.name);
        setSku(defaultProd.sku);
        setCategory(defaultProd.category);
        setSize(defaultProd.size || 'M');
        setColor(defaultProd.color || 'Hitam');
        setColorHex(defaultProd.colorHex || '#191c1e');
        setUnitPrice(defaultProd.price || 100000);
      } else {
        setProductId('custom');
        setProductName('');
        setSku('');
        setCategory('Umum');
        setSize('M');
        setColor('Hitam');
        setColorHex('#191c1e');
        setUnitPrice(0);
      }
      setQuantity(5);
      setCustomerOrDestination('');
      setSoNumber(`SO-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
      setShippingCarrier('Kurir Internal Gudang');
      setReason('Penjualan');
      setDateOut(new Date().toISOString().slice(0, 10));
      setNote('');
    }
  }, [recordToEdit, products, isOpen]);

  if (!isOpen) return null;

  // Helper to handle numeric size preset click and auto-generate SKU code
  const handleSelectSizePreset = (selectedSize: string) => {
    setSize(selectedSize);

    // Auto-generate or update SKU code based on selected numeric size preset
    let newSku = sku.trim();
    if (!newSku) {
      const namePart = productName
        ? productName
            .split(' ')
            .map((w) => w[0])
            .join('')
            .toUpperCase()
            .replace(/[^A-Z0-9]/g, '')
        : 'PRD';
      const colorPart = color && color !== '—' ? color.slice(0, 3).toUpperCase() : 'ALL';
      newSku = `${namePart || 'PRD'}-${colorPart}-${selectedSize}`;
    } else {
      const parts = newSku.split('-');
      if (parts.length > 1) {
        parts[parts.length - 1] = selectedSize;
        newSku = parts.join('-');
      } else {
        newSku = `${newSku}-${selectedSize}`;
      }
    }
    setSku(newSku);
  };

  // Extract all categories added in stock management (products) + default presets
  const categoriesFromProducts = Array.from(
    new Set([
      'Pakaian',
      'Elektronik',
      'Office',
      'Furniture',
      'Aksesoris',
      'Lainnya',
      ...products.map((p) => p.category?.trim()).filter(Boolean) as string[],
      ...(category ? [category] : []),
    ])
  );

  // Find currently selected product stock for validation warning
  const selectedProduct = products.find((p) => p.id === productId);
  const availableStock = selectedProduct ? selectedProduct.stock : null;

  const handleProductSelect = (selectedId: string) => {
    setProductId(selectedId);
    if (selectedId === 'custom') {
      return;
    }
    const found = products.find((p) => p.id === selectedId);
    if (found) {
      setProductName(found.name);
      setSku(found.sku);
      setCategory(found.category);
      if (found.size && found.size !== '—') setSize(found.size);
      if (found.color && found.color !== '—') setColor(found.color);
      if (found.colorHex) setColorHex(found.colorHex);
      setUnitPrice(found.price);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim()) {
      alert('Nama produk tidak boleh kosong.');
      return;
    }
    if (quantity <= 0) {
      alert('Jumlah unit keluar harus lebih besar dari 0.');
      return;
    }

    onSave(
      {
        id: recordToEdit?.id,
        productId,
        productName: productName.trim(),
        sku: sku.trim() || `SKU-${Date.now().toString().slice(-4)}`,
        category,
        size: size.trim() || '—',
        color: color.trim() || '—',
        colorHex,
        quantity: Number(quantity),
        unitPrice: Number(unitPrice),
        customerOrDestination: customerOrDestination.trim() || 'Pelanggan Umum',
        soNumber: soNumber.trim() || `SO-${Date.now().toString().slice(-6)}`,
        shippingCarrier: shippingCarrier.trim() || 'Internal',
        reason,
        dateOut,
        note: note.trim(),
      },
      isEditing
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in font-sans overflow-y-auto">
      <div className="bg-white w-full max-w-2xl border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-8">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <div className="text-xs font-semibold text-rose-600 uppercase tracking-wider mb-0.5">
              {isEditing ? 'Koreksi Data / Edit Outbound Record' : 'Pencatatan Barang Keluar'}
            </div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-rose-600">
                {isEditing ? 'edit_note' : 'outbox'}
              </span>
              {isEditing ? `Edit Record Barang Keluar (${recordToEdit?.id})` : 'Catat Pengeluaran Barang / Pengiriman'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-200 cursor-pointer transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5 text-xs text-slate-800">
          {isEditing && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-600 shrink-0 text-[18px]">info</span>
              <span>
                <strong>Mode Edit Koreksi:</strong> Mengubah jumlah unit, ukuran, warna, atau tanggal keluar akan mengoreksi riwayat dan menyesuaikan stok inventaris secara otomatis.
              </span>
            </div>
          )}

          {/* Product Selection */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1.5 uppercase text-[11px] tracking-wider">
              Pilih Produk dari Katalog
            </label>
            <select
              value={productId}
              onChange={(e) => handleProductSelect(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 outline-none focus:border-rose-600 focus:bg-white transition-colors"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  [{p.sku}] {p.name} — Stok Saat Ini: {p.stock} ({p.size}/{p.color})
                </option>
              ))}
              <option value="custom">+ Input Custom Produk Non-Katalog</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1 uppercase text-[11px] tracking-wider">
                Nama Produk *
              </label>
              <input
                type="text"
                required
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Misal: Polo Shirt Premium"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 outline-none focus:border-rose-600 focus:bg-white"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-slate-700 font-semibold uppercase text-[11px] tracking-wider">
                  Kode SKU / Barang
                </label>
                <button
                  type="button"
                  onClick={() => handleSelectSizePreset(size || '42')}
                  className="text-[10px] text-rose-600 hover:text-rose-800 font-semibold cursor-pointer flex items-center gap-1 transition-colors"
                  title="Generate Kode SKU Otomatis berdasarkan Ukuran & Produk"
                >
                  <span className="material-symbols-outlined text-[13px]">auto_fix_high</span>
                  <span>Generate SKU</span>
                </button>
              </div>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="Misal: PSP-HIT-42"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono outline-none focus:border-rose-600 focus:bg-white"
              />
            </div>
          </div>

          {/* Size & Color Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-3.5 border border-slate-200 rounded-xl">
            <div>
              <label className="block text-slate-700 font-semibold mb-1 uppercase text-[11px] tracking-wider">
                Ukuran (Size)
              </label>
              <input
                type="text"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                placeholder="38, 39, 40, 41, 42, 43..."
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono font-bold outline-none focus:border-rose-600"
              />
              <div className="flex gap-1.5 mt-2 flex-wrap items-center">
                <span className="text-[10px] text-slate-500 font-medium w-full block mb-0.5">
                  Preset Ukuran Angka (Klik untuk pilih & auto SKU):
                </span>
                {['38', '39', '40', '41', '42', '43', '44'].map((s) => (
                  <button
                    type="button"
                    key={s}
                    onClick={() => handleSelectSizePreset(s)}
                    className={`px-2.5 py-1 text-[11px] font-mono font-bold rounded-md border transition-all duration-150 cursor-pointer shadow-2xs ${
                      size === s
                        ? 'bg-rose-600 text-white border-rose-600 ring-2 ring-rose-300 scale-105 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-rose-50 hover:border-rose-300 hover:text-rose-700'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1 uppercase text-[11px] tracking-wider">
                Warna (Color)
              </label>
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="Hitam, Putih, Navy, etc."
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-900 outline-none focus:border-rose-600"
              />
              <div className="flex gap-1 mt-1.5 flex-wrap">
                {['Hitam', 'Putih', 'Navy', 'Merah', 'Abu-Abu', '—'].map((c) => (
                  <button
                    type="button"
                    key={c}
                    onClick={() => setColor(c)}
                    className={`px-2 py-0.5 text-[10px] rounded border transition-colors cursor-pointer ${
                      color === c ? 'bg-rose-600 text-white border-rose-600 font-bold' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1 uppercase text-[11px] tracking-wider">
                Kategori
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-900 outline-none focus:border-rose-600 font-medium"
              >
                {categoriesFromProducts.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <div className="flex gap-1 mt-1.5 flex-wrap items-center">
                <span className="text-[10px] text-slate-500 font-medium w-full block mb-0.5">
                  Kategori dari Manajemen Stok:
                </span>
                {categoriesFromProducts.map((cat) => (
                  <button
                    type="button"
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`px-2 py-0.5 text-[10px] rounded border transition-colors cursor-pointer ${
                      category === cat
                        ? 'bg-rose-600 text-white border-rose-600 font-bold'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Date Out & Quantity & Unit Price */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1 uppercase text-[11px] tracking-wider">
                Tanggal Keluar *
              </label>
              <input
                type="date"
                required
                value={dateOut}
                onChange={(e) => setDateOut(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 outline-none focus:border-rose-600 focus:bg-white font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1 uppercase text-[11px] tracking-wider flex items-center justify-between">
                <span>Jumlah Keluar *</span>
                {availableStock !== null && (
                  <span className={`text-[10px] font-mono ${availableStock < quantity ? 'text-rose-600 font-bold' : 'text-slate-400'}`}>
                    (Stok: {availableStock})
                  </span>
                )}
              </label>
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-bold text-sm outline-none focus:border-rose-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1 uppercase text-[11px] tracking-wider">
                Harga Per Unit (IDR)
              </label>
              <input
                type="number"
                min="0"
                value={unitPrice}
                onChange={(e) => setUnitPrice(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono outline-none focus:border-rose-600 focus:bg-white"
              />
            </div>
          </div>

          {/* Customer/Destination & SO / Surat Jalan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1 uppercase text-[11px] tracking-wider">
                Pelanggan / Tujuan Cabang / Divisi *
              </label>
              <input
                type="text"
                required
                value={customerOrDestination}
                onChange={(e) => setCustomerOrDestination(e.target.value)}
                placeholder="Misal: Toko Cabang Surabaya / PT Utama"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 outline-none focus:border-rose-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1 uppercase text-[11px] tracking-wider">
                No. SO / Surat Jalan / DO
              </label>
              <input
                type="text"
                value={soNumber}
                onChange={(e) => setSoNumber(e.target.value)}
                placeholder="Misal: SO-2026-0912"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono outline-none focus:border-rose-600 focus:bg-white"
              />
            </div>
          </div>

          {/* Reason & Shipping Carrier */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1 uppercase text-[11px] tracking-wider">
                Alasan Pengeluaran
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 outline-none focus:border-rose-600 focus:bg-white"
              >
                <option value="Penjualan">Penjualan (Sales)</option>
                <option value="Transfer Cabang">Transfer Cabang / Antar Gudang</option>
                <option value="Penggunaan Internal">Penggunaan Internal Divisi</option>
                <option value="Sample/Hadiah">Sample / Event Marketing</option>
                <option value="Retur Supplier">Retur Ke Supplier / Defect</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1 uppercase text-[11px] tracking-wider">
                Ekspedisi / Kurir Pengiriman
              </label>
              <input
                type="text"
                value={shippingCarrier}
                onChange={(e) => setShippingCarrier(e.target.value)}
                placeholder="Kurir Internal, JNE Cargo, J&T, dll."
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 outline-none focus:border-rose-600 focus:bg-white"
              />
            </div>
          </div>

          {/* Notes / Remarks */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1 uppercase text-[11px] tracking-wider">
              Catatan Keterangan
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Catatan tambahan pengiriman barang (misal: nomor resi, nama penerima lapangan)"
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 outline-none focus:border-rose-600 focus:bg-white"
            />
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <div className="text-[11px] text-slate-500 font-mono">
              Total Valuasi Keluar: <strong className="text-rose-600 font-bold">Rp {new Intl.NumberFormat('id-ID').format(quantity * unitPrice)}</strong>
            </div>
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[16px]">
                  {isEditing ? 'check_circle' : 'save'}
                </span>
                <span>{isEditing ? 'Simpan Perubahan' : 'Simpan Stok Keluar'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
