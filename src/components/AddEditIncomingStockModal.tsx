import React, { useState, useEffect } from 'react';
import { Product, IncomingStockRecord } from '../types';

interface AddEditIncomingStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  recordToEdit?: IncomingStockRecord | null;
  onSave: (recordData: Partial<IncomingStockRecord>, isEditing: boolean) => void;
}

export const AddEditIncomingStockModal: React.FC<AddEditIncomingStockModalProps> = ({
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
  const [quantity, setQuantity] = useState<number>(10);
  const [unitPrice, setUnitPrice] = useState<number>(100000);
  const [supplier, setSupplier] = useState<string>('');
  const [poNumber, setPoNumber] = useState<string>('');
  const [dateAdded, setDateAdded] = useState<string>(new Date().toISOString().slice(0, 10));
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
      setSupplier(recordToEdit.supplier || '');
      setPoNumber(recordToEdit.poNumber || '');
      setDateAdded(recordToEdit.dateAdded || new Date().toISOString().slice(0, 10));
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
      setQuantity(10);
      setSupplier('');
      setPoNumber(`PO-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
      setDateAdded(new Date().toISOString().slice(0, 10));
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
      alert('Jumlah unit masuk harus lebih besar dari 0.');
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
        supplier: supplier.trim() || 'Pemasok Umum',
        poNumber: poNumber.trim() || `PO-${Date.now().toString().slice(-6)}`,
        dateAdded,
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
            <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-0.5">
              {isEditing ? 'Koreksi Data / Edit Record' : 'Pencatatan Stok Masuk'}
            </div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-blue-600">
                {isEditing ? 'edit_note' : 'move_to_inbox'}
              </span>
              {isEditing ? `Edit Record Stok Masuk (${recordToEdit?.id})` : 'Catat Penerimaan Barang Baru'}
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
                <strong>Mode Edit Koreksi:</strong> Perubahan tanggal, ukuran, warna, atau jumlah unit akan memperbarui catatan dan menyesuaikan inventaris otomatis.
              </span>
            </div>
          )}

          {/* Product Selection */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1.5 uppercase text-[11px] tracking-wider">
              Pilih Produk dari Katalog (Atau Custom)
            </label>
            <select
              value={productId}
              onChange={(e) => handleProductSelect(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition-colors"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  [{p.sku}] {p.name} — Stok Saat Ini: {p.stock} ({p.size}/{p.color})
                </option>
              ))}
              <option value="custom">+ Input Produk Baru / Non-Katalog</option>
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
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 outline-none focus:border-blue-600 focus:bg-white"
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
                  className="text-[10px] text-blue-600 hover:text-blue-800 font-semibold cursor-pointer flex items-center gap-1 transition-colors"
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
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono outline-none focus:border-blue-600 focus:bg-white"
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
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono font-bold outline-none focus:border-blue-600"
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
                        ? 'bg-blue-600 text-white border-blue-600 ring-2 ring-blue-300 scale-105 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700'
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
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-900 outline-none focus:border-blue-600"
              />
              <div className="flex gap-1 mt-1.5 flex-wrap">
                {['Hitam', 'Putih', 'Navy', 'Merah', 'Abu-Abu', '—'].map((c) => (
                  <button
                    type="button"
                    key={c}
                    onClick={() => setColor(c)}
                    className={`px-2 py-0.5 text-[10px] rounded border transition-colors cursor-pointer ${
                      color === c ? 'bg-blue-600 text-white border-blue-600 font-bold' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
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
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-900 outline-none focus:border-blue-600 font-medium"
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
                        ? 'bg-blue-600 text-white border-blue-600 font-bold'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Date Added & Quantity & Unit Price */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1 uppercase text-[11px] tracking-wider">
                Tanggal Masuk *
              </label>
              <input
                type="date"
                required
                value={dateAdded}
                onChange={(e) => setDateAdded(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 outline-none focus:border-blue-600 focus:bg-white font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1 uppercase text-[11px] tracking-wider">
                Jumlah Unit Masuk *
              </label>
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-bold text-sm outline-none focus:border-blue-600 focus:bg-white"
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
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono outline-none focus:border-blue-600 focus:bg-white"
              />
            </div>
          </div>

          {/* Supplier & PO Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1 uppercase text-[11px] tracking-wider">
                Pemasok / Supplier
              </label>
              <input
                type="text"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                placeholder="Misal: PT Textile Garmen Jaya"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 outline-none focus:border-blue-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1 uppercase text-[11px] tracking-wider">
                No. PO / Invoice / Nota
              </label>
              <input
                type="text"
                value={poNumber}
                onChange={(e) => setPoNumber(e.target.value)}
                placeholder="Misal: PO-2026-0801"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono outline-none focus:border-blue-600 focus:bg-white"
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
              placeholder="Catatan tambahan penerimaan barang (misal: kondisi dus baik, verified oleh tim QC)"
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 outline-none focus:border-blue-600 focus:bg-white"
            />
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <div className="text-[11px] text-slate-500 font-mono">
              Total Nilai Masuk: <strong className="text-blue-600 font-bold">Rp {new Intl.NumberFormat('id-ID').format(quantity * unitPrice)}</strong>
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
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[16px]">
                  {isEditing ? 'check_circle' : 'save'}
                </span>
                <span>{isEditing ? 'Simpan Perubahan' : 'Simpan Stok Masuk'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
