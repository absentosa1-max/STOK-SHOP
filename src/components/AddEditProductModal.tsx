import React, { useState, useEffect } from 'react';
import { Product, ProductVariant } from '../types';

interface AddEditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit: Product | null;
  onSave: (productData: Partial<Product>) => void;
  existingCategories?: string[];
}

export const AddEditProductModal: React.FC<AddEditProductModalProps> = ({
  isOpen,
  onClose,
  productToEdit,
  onSave,
  existingCategories = [],
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('Elektronik');
  const [size, setSize] = useState('—');
  const [color, setColor] = useState('—');
  const [stock, setStock] = useState(10);
  const [price, setPrice] = useState(150000);

  // Variations State
  const [hasVariants, setHasVariants] = useState(false);
  const [variants, setVariants] = useState<ProductVariant[]>([]);

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name);
      setDescription(productToEdit.description);
      setSku(productToEdit.sku);
      setCategory(productToEdit.category);
      setSize(productToEdit.size || '—');
      setColor(productToEdit.color || '—');
      setStock(productToEdit.stock);
      setPrice(productToEdit.price);
      setHasVariants(!!productToEdit.hasVariants);
      setVariants(productToEdit.variants ? [...productToEdit.variants] : []);
    } else {
      setName('');
      setDescription('');
      setSku('');
      setCategory('Elektronik');
      setSize('—');
      setColor('—');
      setStock(10);
      setPrice(150000);
      setHasVariants(false);
      setVariants([]);
    }
  }, [productToEdit, isOpen]);

  // Recalculate main stock when variants change if hasVariants is true
  useEffect(() => {
    if (hasVariants && variants.length > 0) {
      const totalVarStock = variants.reduce((acc, v) => acc + (Number(v.stock) || 0), 0);
      setStock(totalVarStock);
    }
  }, [variants, hasVariants]);

  if (!isOpen) return null;

  const handleAddVariant = (sizeVal = 'M', colorVal = 'Hitam', hexVal = '#191c1e') => {
    const baseSku = sku || `SKU-${Math.floor(1000 + Math.random() * 9000)}`;
    const newVar: ProductVariant = {
      id: `v-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      sku: `${baseSku}-${sizeVal.toUpperCase()}-${variants.length + 1}`,
      size: sizeVal,
      color: colorVal,
      colorHex: hexVal,
      stock: 10,
      price: price || 150000,
    };
    setVariants((prev) => [...prev, newVar]);
  };

  const handleUpdateVariant = (
    id: string,
    field: keyof ProductVariant,
    value: string | number
  ) => {
    setVariants((prev) =>
      prev.map((v) => (v.id === id ? { ...v, [field]: value } : v))
    );
  };

  const handleRemoveVariant = (id: string) => {
    setVariants((prev) => prev.filter((v) => v.id !== id));
  };

  const handleSelectSizePreset = (selectedSize: string) => {
    setSize(selectedSize);

    // Auto-generate or update SKU code based on selected numeric size preset
    let newSku = sku.trim();
    if (!newSku) {
      const namePart = name
        ? name
            .split(' ')
            .map((w) => w[0])
            .join('')
            .toUpperCase()
            .replace(/[^A-Z0-9]/g, '')
        : 'PRD';
      const colorPart = color && color !== '—' ? color.slice(0, 3).toUpperCase() : 'STD';
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

  const handleGenerateSizePresets = () => {
    const sizes = ['38', '39', '40', '41', '42', '43', '44'];
    const baseSku = sku || `SKU-${Math.floor(1000 + Math.random() * 9000)}`;
    const newVars: ProductVariant[] = sizes.map((s, idx) => ({
      id: `v-preset-${Date.now()}-${idx}`,
      sku: `${baseSku}-${s}`,
      size: s,
      color: color !== '—' ? color : 'Standard',
      colorHex: '#191c1e',
      stock: 10,
      price: price || 150000,
    }));
    setVariants((prev) => [...prev, ...newVars]);
    setHasVariants(true);
  };

  const handleGenerateColorPresets = () => {
    const colors = [
      { name: 'Hitam', hex: '#191c1e' },
      { name: 'Putih', hex: '#ffffff' },
      { name: 'Navy', hex: '#0f172a' },
      { name: 'Abu-Abu', hex: '#64748b' },
    ];
    const baseSku = sku || `SKU-${Math.floor(1000 + Math.random() * 9000)}`;
    const newVars: ProductVariant[] = colors.map((c, idx) => ({
      id: `v-color-${Date.now()}-${idx}`,
      sku: `${baseSku}-${c.name.slice(0, 3).toUpperCase()}`,
      size: size !== '—' ? size : 'All Size',
      color: c.name,
      colorHex: c.hex,
      stock: 10,
      price: price || 150000,
    }));
    setVariants((prev) => [...prev, ...newVars]);
    setHasVariants(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const finalStock =
      hasVariants && variants.length > 0
        ? variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0)
        : Number(stock);

    onSave({
      id: productToEdit ? productToEdit.id : undefined,
      name,
      description,
      sku: sku || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      category,
      size: hasVariants ? 'Multi' : size,
      color: hasVariants ? 'Multi' : color,
      stock: finalStock,
      price: Number(price),
      hasVariants,
      variants: hasVariants ? variants : [],
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in font-sans">
      <div className="bg-white w-full max-w-2xl border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-0.5">
              Katalog produk & variasi
            </div>
            <h2 className="text-base font-bold text-slate-900">
              {productToEdit ? 'Edit Detail Produk & Variasi' : 'Tambah Produk Inventory Baru'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-sm font-bold p-1 transition-colors cursor-pointer rounded-lg hover:bg-slate-200/60"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex flex-col gap-5 text-xs font-sans">
          <div>
            <label className="block text-slate-700 font-semibold mb-1 uppercase text-[11px] tracking-wider">Nama Produk *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Misal: ThinkPad X1 Carbon / Polo Shirt"
              className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:border-blue-600 focus:bg-white outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1 uppercase text-[11px] tracking-wider">Deskripsi / Spesifikasi Singkat *</label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Misal: Laptop Bisnis / Bahan Katun Combed 30s"
              className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:border-blue-600 focus:bg-white outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-slate-700 font-semibold uppercase text-[11px] tracking-wider">Kode SKU Utama</label>
                <button
                  type="button"
                  onClick={() => handleSelectSizePreset(size && size !== '—' ? size : '42')}
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
                className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-900 focus:border-blue-600 focus:bg-white outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1 uppercase text-[11px] tracking-wider">Kategori Produk</label>
              <input
                type="text"
                required
                list="category-suggestions"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Ketik kategori..."
                className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:border-blue-600 focus:bg-white outline-none transition-all"
              />
              <datalist id="category-suggestions">
                {Array.from(new Set([...existingCategories, 'Pakaian', 'Elektronik', 'Office', 'Furniture', 'Aksesoris', 'Lainnya'].filter(Boolean))).map((cat) => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>
              <div className="flex gap-1 mt-1.5 flex-wrap items-center">
                <span className="text-[10px] text-slate-500 font-medium w-full block mb-0.5">
                  Kategori Terdaftar di Manajemen Stok:
                </span>
                {Array.from(
                  new Set([
                    'Pakaian',
                    'Elektronik',
                    'Office',
                    'Furniture',
                    'Aksesoris',
                    ...existingCategories.filter(Boolean),
                  ])
                ).map((cat) => (
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

          {!hasVariants && (
            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 border border-slate-200 rounded-xl">
              <div>
                <label className="block text-slate-700 font-semibold mb-1 uppercase text-[11px] tracking-wider">Ukuran Default</label>
                <input
                  type="text"
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  placeholder="38, 39, 40, 41, 42..."
                  className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-900 focus:border-blue-600 outline-none transition-all"
                />
                <div className="flex gap-1 mt-1.5 flex-wrap">
                  {['38', '39', '40', '41', '42', '43', '44'].map((s) => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => handleSelectSizePreset(s)}
                      className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded border transition-all cursor-pointer shadow-2xs ${
                        size === s
                          ? 'bg-blue-600 text-white border-blue-600 ring-1 ring-blue-300 scale-105'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1 uppercase text-[11px] tracking-wider">Warna Default</label>
                <input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="Hitam, Pale Gray, Putih..."
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:border-blue-600 focus:bg-white outline-none transition-all"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1 uppercase text-[11px] tracking-wider">
                {hasVariants ? 'Total Stok Produk (Akumulasi Variasi)' : 'Jumlah Stok Awal'}
              </label>
              <input
                type="number"
                min="0"
                required
                disabled={hasVariants}
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
                className={`w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold font-mono focus:border-blue-600 focus:bg-white outline-none transition-all ${
                  hasVariants ? 'text-blue-600 opacity-80 cursor-not-allowed' : 'text-slate-900'
                }`}
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1 uppercase text-[11px] tracking-wider">Harga Satuan Acuan (IDR)</label>
              <input
                type="number"
                min="0"
                required
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold font-mono text-slate-900 focus:border-blue-600 focus:bg-white outline-none transition-all"
              />
            </div>
          </div>

          {/* VARIATION MANAGEMENT SECTION */}
          <div className="pt-4 border-t border-slate-200 flex flex-col gap-3">
            <div className="flex items-center justify-between bg-slate-50 p-3 border border-slate-200 rounded-xl">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="hasVariants"
                  checked={hasVariants}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setHasVariants(checked);
                    if (checked && variants.length === 0) {
                      handleAddVariant('38', 'Hitam', '#191c1e');
                      handleAddVariant('39', 'Hitam', '#191c1e');
                    }
                  }}
                  className="w-4 h-4 accent-blue-600 cursor-pointer rounded"
                />
                <label htmlFor="hasVariants" className="text-xs font-bold text-slate-800 uppercase tracking-wide cursor-pointer select-none">
                  Aktifkan Variasi Produk (Ukuran, Warna, Stok per-Varian)
                </label>
              </div>
              {hasVariants && (
                <span className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-700 font-bold rounded uppercase tracking-wider">
                  {variants.length} Variasi
                </span>
              )}
            </div>

            {hasVariants && (
              <div className="flex flex-col gap-3 bg-slate-50/70 p-4 border border-slate-200 rounded-xl">
                {/* Presets & Bulk Controls */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200">
                  <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">
                    Buat variasi cepat:
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={handleGenerateSizePresets}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-medium rounded-md transition-colors cursor-pointer shadow-2xs flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[14px] text-blue-600">tag</span>
                      <span>+ Preset Ukuran Angka (38 - 44)</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleGenerateColorPresets}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-medium rounded-md transition-colors cursor-pointer shadow-2xs flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[14px] text-purple-600">palette</span>
                      <span>+ Preset Warna (4 Warna)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddVariant('40', 'Putih', '#ffffff')}
                      className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[11px] rounded-md transition-colors cursor-pointer shadow-2xs"
                    >
                      + Tambah Varian Custom
                    </button>
                  </div>
                </div>

                {/* Variants List Table */}
                {variants.length === 0 ? (
                  <div className="py-6 text-center text-slate-400 text-xs">
                    Belum ada variasi. Klik tombol di atas untuk menambah variasi produk.
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 max-h-60 overflow-y-auto pr-1">
                    {variants.map((v, index) => (
                      <div
                        key={v.id}
                        className="bg-white p-3 border border-slate-200 rounded-lg flex flex-col gap-2 relative group hover:border-slate-300 transition-all shadow-2xs"
                      >
                        <div className="flex items-center justify-between text-[11px] text-blue-600 uppercase tracking-wider font-bold">
                          <span>VARIAN #{index + 1}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveVariant(v.id)}
                            className="text-slate-400 hover:text-rose-600 p-0.5 cursor-pointer rounded"
                            title="Hapus Varian"
                          >
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                          <div>
                            <label className="block text-[10px] text-slate-500 font-medium mb-0.5">Ukuran</label>
                            <input
                              type="text"
                              required
                              value={v.size}
                              onChange={(e) => handleUpdateVariant(v.id, 'size', e.target.value)}
                              placeholder="38, 39, 40..."
                              className="w-full h-8 px-2 bg-slate-50 border border-slate-200 rounded text-xs font-mono font-bold text-slate-900 outline-none focus:border-blue-600"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] text-slate-500 font-medium mb-0.5">Warna</label>
                            <input
                              type="text"
                              required
                              value={v.color}
                              onChange={(e) => handleUpdateVariant(v.id, 'color', e.target.value)}
                              placeholder="Hitam"
                              className="w-full h-8 px-2 bg-slate-50 border border-slate-200 rounded text-xs text-slate-900 outline-none focus:border-blue-600"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] text-slate-500 font-medium mb-0.5">Kode SKU</label>
                            <input
                              type="text"
                              required
                              value={v.sku}
                              onChange={(e) => handleUpdateVariant(v.id, 'sku', e.target.value)}
                              className="w-full h-8 px-2 bg-slate-50 border border-slate-200 rounded text-[11px] font-mono text-slate-900 outline-none focus:border-blue-600"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] text-slate-500 font-medium mb-0.5">Stok</label>
                            <input
                              type="number"
                              min="0"
                              required
                              value={v.stock}
                              onChange={(e) =>
                                handleUpdateVariant(v.id, 'stock', Number(e.target.value))
                              }
                              className="w-full h-8 px-2 bg-slate-50 border border-slate-200 rounded text-xs font-bold font-mono text-slate-900 outline-none focus:border-blue-600"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] text-slate-500 font-medium mb-0.5">Harga (Rp)</label>
                            <input
                              type="number"
                              min="0"
                              required
                              value={v.price}
                              onChange={(e) =>
                                handleUpdateVariant(v.id, 'price', Number(e.target.value))
                              }
                              className="w-full h-8 px-2 bg-slate-50 border border-slate-200 rounded text-xs font-bold font-mono text-slate-900 outline-none focus:border-blue-600"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mt-2 pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              {productToEdit ? 'Simpan Perubahan' : 'Tambah Produk'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
