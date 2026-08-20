import React, { useState, useMemo } from 'react';
import { Product } from '../types';

interface StockTableProps {
  products: Product[];
  onUpdateStock: (productId: string, variantId: string | null, delta: number) => void;
  onOpenAddModal: () => void;
  onOpenEditModal: (product: Product) => void;
  onOpenExportModal: () => void;
  onViewLogs: (product: Product) => void;
  onDeleteProduct?: (productId: string) => void;
  onCopyProduct?: (product: Product) => void;
  onNavigateIncomingStock?: () => void;
  onNavigateOutgoingStock?: () => void;
}

export const StockTable: React.FC<StockTableProps> = ({
  products,
  onUpdateStock,
  onOpenAddModal,
  onOpenEditModal,
  onOpenExportModal,
  onViewLogs,
  onDeleteProduct,
  onCopyProduct,
  onNavigateIncomingStock,
  onNavigateOutgoingStock,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua Kategori');
  const [sortBy, setSortBy] = useState<'id' | 'name' | 'sku' | 'category' | 'stock' | 'price'>('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [expandedRowIds, setExpandedRowIds] = useState<Record<string, boolean>>({ '002': true });
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const itemsPerPage = 8;

  // Extract category counts
  const categoryCounts = useMemo(() => {
    const map = new Map<string, number>();
    products.forEach((p) => {
      const cat = p.category?.trim() || 'Tanpa Kategori';
      map.set(cat, (map.get(cat) || 0) + 1);
    });
    return map;
  }, [products]);

  const categories = useMemo(() => {
    const unique = Array.from(categoryCounts.keys()).sort((a, b) => a.localeCompare(b));
    return ['Semua Kategori', ...unique];
  }, [categoryCounts]);

  const handleSort = (field: 'id' | 'name' | 'sku' | 'category' | 'stock' | 'price') => {
    if (sortBy === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedRowIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const cat = p.category?.trim() || 'Tanpa Kategori';
        const matchesCategory =
          selectedCategory === 'Semua Kategori' || cat === selectedCategory;
        const matchesSearch =
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
          p.description.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        let comparison = 0;
        if (sortBy === 'category') {
          comparison = (a.category || '').localeCompare(b.category || '');
        } else if (sortBy === 'name') {
          comparison = a.name.localeCompare(b.name);
        } else if (sortBy === 'sku') {
          comparison = a.sku.localeCompare(b.sku);
        } else if (sortBy === 'stock') {
          comparison = a.stock - b.stock;
        } else if (sortBy === 'price') {
          comparison = a.price - b.price;
        } else {
          comparison = a.id.localeCompare(b.id, undefined, { numeric: true });
        }
        return sortDirection === 'asc' ? comparison : -comparison;
      });
  }, [products, selectedCategory, searchTerm, sortBy, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));
  const startIdx = (currentPage - 1) * itemsPerPage;
  const currentProducts = filteredProducts.slice(startIdx, startIdx + itemsPerPage);

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID').format(num);
  };

  // Helper for category badge styling
  const getCategoryColor = (cat?: string) => {
    const c = (cat || '').toLowerCase();
    if (c.includes('pakaian') || c.includes('fashion') || c.includes('baju')) {
      return 'bg-purple-50 text-purple-700 border-purple-200';
    }
    if (c.includes('elektronik') || c.includes('gadget') || c.includes('tech')) {
      return 'bg-blue-50 text-blue-700 border-blue-200';
    }
    if (c.includes('office') || c.includes('kantor') || c.includes('atk')) {
      return 'bg-amber-50 text-amber-700 border-amber-200';
    }
    if (c.includes('furniture') || c.includes('perabot')) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
    if (c.includes('aksesoris') || c.includes('sepatu') || c.includes('alas kaki')) {
      return 'bg-rose-50 text-rose-700 border-rose-200';
    }
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in font-sans">
      {/* Top Header Title & Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
            Manajemen Inventaris
          </div>
          <h1 className="text-2xl font-display font-bold text-slate-900 tracking-tight">
            Daftar Stok Produk & Inventaris
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Kelola persediaan barang, filter per kategori, sesuaikan stok masuk/keluar, dan kelola data produk.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {onNavigateIncomingStock && (
            <button
              onClick={onNavigateIncomingStock}
              className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors cursor-pointer shadow-2xs"
            >
              <span className="material-symbols-outlined text-[18px] text-emerald-600">move_to_inbox</span>
              <span>Catat Stok Masuk</span>
            </button>
          )}

          {onNavigateOutgoingStock && (
            <button
              onClick={onNavigateOutgoingStock}
              className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors cursor-pointer shadow-2xs"
            >
              <span className="material-symbols-outlined text-[18px] text-rose-600">outbox</span>
              <span>Catat Stok Keluar</span>
            </button>
          )}

          <button
            onClick={onOpenAddModal}
            className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors cursor-pointer shadow-2xs"
          >
            <span className="material-symbols-outlined text-[18px] text-blue-600">add</span>
            <span>Tambah Produk</span>
          </button>

          <button
            onClick={onOpenExportModal}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span>Unduh Excel</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar with Search & Category Pills */}
      <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-xs flex flex-col gap-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px] pointer-events-none">
              search
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari nama produk, SKU, atau kategori..."
              className="w-full h-10 pl-10 pr-8 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:bg-white outline-none transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 text-xs cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Menampilkan <strong className="text-slate-800">{filteredProducts.length}</strong> dari {products.length} total produk
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-slate-100 pb-1">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            const count =
              cat === 'Semua Kategori'
                ? products.length
                : categoryCounts.get(cat) || 0;

            return (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium tracking-wide transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                }`}
              >
                <span>{cat}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? 'bg-white text-blue-700' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}

          <button
            onClick={() => {
              setSelectedCategory('Semua Kategori');
              setSearchTerm('');
              setCurrentPage(1);
            }}
            className="p-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-500 hover:text-blue-600 hover:bg-slate-200/60 transition-colors cursor-pointer ml-auto shrink-0"
            title="Reset Filter"
          >
            <span className="material-symbols-outlined text-[16px]">filter_list</span>
          </button>
        </div>
      </div>

      {/* Primary Inventory Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th
                  onClick={() => handleSort('id')}
                  className="py-3.5 px-4 w-12 text-center cursor-pointer hover:text-slate-900 transition-colors select-none"
                >
                  ID {sortBy === 'id' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  onClick={() => handleSort('name')}
                  className="py-3.5 px-4 min-w-[200px] cursor-pointer hover:text-slate-900 transition-colors select-none"
                >
                  NAMA PRODUK {sortBy === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  onClick={() => handleSort('sku')}
                  className="py-3.5 px-4 cursor-pointer hover:text-slate-900 transition-colors select-none"
                >
                  SKU {sortBy === 'sku' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  onClick={() => handleSort('category')}
                  className="py-3.5 px-4 cursor-pointer hover:text-slate-900 transition-colors select-none"
                >
                  KATEGORI {sortBy === 'category' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="py-3.5 px-4">UKURAN</th>
                <th className="py-3.5 px-4">WARNA</th>
                <th
                  onClick={() => handleSort('stock')}
                  className="py-3.5 px-4 text-center cursor-pointer hover:text-slate-900 transition-colors select-none"
                >
                  STOK SAAT INI {sortBy === 'stock' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  onClick={() => handleSort('price')}
                  className="py-3.5 px-4 text-right cursor-pointer hover:text-slate-900 transition-colors select-none"
                >
                  HARGA (IDR) {sortBy === 'price' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="py-3.5 px-4 text-center w-28">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-800">
              {currentProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-14 text-center text-slate-400">
                    <span className="material-symbols-outlined text-[36px] block mb-2 text-slate-300">
                      inventory_2
                    </span>
                    <p className="font-semibold text-slate-600 text-sm">Tidak ada produk ditemukan</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Coba ubah kata kunci pencarian atau reset filter kategori.
                    </p>
                  </td>
                </tr>
              ) : (
                currentProducts.map((product) => {
                  const isExpanded = !!expandedRowIds[product.id];
                  const isLowStock = product.stock <= (product.minThreshold || 10);
                  const hasVariants = !!(product.variants && product.variants.length > 0);
                  const categoryBadgeColor = getCategoryColor(product.category);

                  return (
                    <React.Fragment key={product.id}>
                      <tr className="hover:bg-slate-50/70 transition-colors group">
                        {/* ID */}
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-500 text-center font-bold">
                          {product.id}
                        </td>

                        {/* Name & Desc */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {hasVariants && (
                              <button
                                onClick={() => toggleExpand(product.id)}
                                className="text-blue-600 hover:text-blue-800 cursor-pointer p-0.5 rounded hover:bg-blue-50 transition-colors"
                                title="Lihat varian ukuran/warna"
                              >
                                <span className="material-symbols-outlined text-[16px]">
                                  {isExpanded ? 'expand_less' : 'expand_more'}
                                </span>
                              </button>
                            )}
                            <div>
                              <div className="font-semibold text-slate-900 flex items-center gap-2">
                                <span>{product.name}</span>
                                {isLowStock && (
                                  <span className="px-1.5 py-0.2 bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold rounded">
                                    Stok Rendah
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-400 truncate max-w-xs">
                                {product.description}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* SKU */}
                        <td className="py-3 px-4 font-mono text-slate-600 text-[11px] font-medium">
                          {product.sku}
                        </td>

                        {/* Category Badge */}
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-1 text-[11px] font-semibold rounded-md border ${categoryBadgeColor}`}>
                            {product.category || '—'}
                          </span>
                        </td>

                        {/* Size */}
                        <td className="py-3 px-4 font-mono text-slate-700 font-medium">
                          {hasVariants ? `${product.variants!.length} Varian` : product.size || '—'}
                        </td>

                        {/* Color */}
                        <td className="py-3 px-4">
                          {hasVariants ? (
                            <span className="text-[11px] text-slate-500">Multi-warna</span>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              {product.colorHex && (
                                <span
                                  className="w-2.5 h-2.5 rounded-full border border-slate-300 inline-block shrink-0"
                                  style={{ backgroundColor: product.colorHex }}
                                />
                              )}
                              <span className="text-slate-700 text-xs">{product.color || '—'}</span>
                            </div>
                          )}
                        </td>

                        {/* Stock Counter with inline adjustments */}
                        <td className="py-3 px-4 text-center">
                          <div className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg p-1">
                            <button
                              onClick={() => onUpdateStock(product.id, null, -1)}
                              disabled={product.stock <= 0}
                              className="w-6 h-6 rounded bg-white hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs shadow-2xs disabled:opacity-30 cursor-pointer"
                              title="Kurangi stok (-1)"
                            >
                              -
                            </button>
                            <span className="font-mono font-bold text-xs px-1.5 min-w-[28px]">
                              {product.stock}
                            </span>
                            <button
                              onClick={() => onUpdateStock(product.id, null, 1)}
                              className="w-6 h-6 rounded bg-white hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs shadow-2xs cursor-pointer"
                              title="Tambah stok (+1)"
                            >
                              +
                            </button>
                          </div>
                        </td>

                        {/* Price */}
                        <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                          {formatIDR(product.price)}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => onOpenEditModal(product)}
                              className="p-1 rounded text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                              title="Edit Produk"
                            >
                              <span className="material-symbols-outlined text-[18px]">edit</span>
                            </button>
                            {onCopyProduct && (
                              <button
                                onClick={() => onCopyProduct(product)}
                                className="p-1 rounded text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                                title="Duplikat Produk"
                              >
                                <span className="material-symbols-outlined text-[18px]">content_copy</span>
                              </button>
                            )}
                            <button
                              onClick={() => onViewLogs(product)}
                              className="p-1 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                              title="Riwayat Audit"
                            >
                              <span className="material-symbols-outlined text-[18px]">history</span>
                            </button>
                            {onDeleteProduct && (
                              <button
                                onClick={() => setDeletingProduct(product)}
                                className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                title="Hapus Permanen"
                              >
                                <span className="material-symbols-outlined text-[18px]">delete</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>

                      {/* Expandable Variants Rows */}
                      {hasVariants && isExpanded && product.variants!.map((v) => (
                        <tr key={v.id} className="bg-blue-50/20 text-slate-600 text-xs">
                          <td className="py-2 px-4 text-center font-mono text-[10px] text-slate-400">
                            └
                          </td>
                          <td className="py-2 px-4 pl-10 text-slate-700">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[11px] font-semibold text-blue-700">
                                Ukuran {v.size}
                              </span>
                              <span className="text-[11px] text-slate-400">• {v.color}</span>
                            </div>
                          </td>
                          <td className="py-2 px-4 font-mono text-[11px] text-slate-500">
                            {v.sku}
                          </td>
                          <td className="py-2 px-4">
                            <span className={`px-2 py-0.5 text-[10px] font-semibold rounded border ${categoryBadgeColor}`}>
                              {product.category}
                            </span>
                          </td>
                          <td className="py-2 px-4 font-mono text-slate-800 font-bold">
                            {v.size}
                          </td>
                          <td className="py-2 px-4">
                            <div className="flex items-center gap-1.5">
                              {v.colorHex && (
                                <span
                                  className="w-2.5 h-2.5 rounded-full border border-slate-300 inline-block shrink-0"
                                  style={{ backgroundColor: v.colorHex }}
                                />
                              )}
                              <span className="text-[11px]">{v.color}</span>
                            </div>
                          </td>
                          <td className="py-2 px-4 text-center">
                            <div className="inline-flex items-center gap-1 bg-white border border-slate-200 rounded p-0.5">
                              <button
                                onClick={() => onUpdateStock(product.id, v.id, -1)}
                                disabled={v.stock <= 0}
                                className="w-5 h-5 rounded bg-slate-50 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-[10px] disabled:opacity-30 cursor-pointer"
                              >
                                -
                              </button>
                              <span className="font-mono font-bold text-xs px-1 min-w-[20px]">
                                {v.stock}
                              </span>
                              <button
                                onClick={() => onUpdateStock(product.id, v.id, 1)}
                                className="w-5 h-5 rounded bg-slate-50 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-[10px] cursor-pointer"
                              >
                                +
                              </button>
                            </div>
                          </td>
                          <td className="py-2 px-4 text-right font-mono text-[11px] text-slate-700">
                            {formatIDR(v.price)}
                          </td>
                          <td className="py-2 px-4 text-center text-[11px] text-slate-400">
                            Varian
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination Controls */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <div>
            Menampilkan {currentProducts.length > 0 ? startIdx + 1 : 0} hingga{' '}
            {Math.min(startIdx + itemsPerPage, filteredProducts.length)} dari {filteredProducts.length} produk
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 border border-slate-300 rounded-md bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-medium transition-colors cursor-pointer"
            >
              Sebelumnya
            </button>
            <span className="font-mono text-slate-700 font-semibold px-2">
              Halaman {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 border border-slate-300 rounded-md bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-medium transition-colors cursor-pointer"
            >
              Berikutnya
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deletingProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-xl p-6 max-w-sm w-full shadow-2xl flex flex-col gap-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-[24px]">warning</span>
            </div>

            <div className="text-center">
              <h3 className="text-base font-bold text-slate-900">Hapus Produk Permanen?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Apakah Anda yakin ingin menghapus <strong>"{deletingProduct.name}"</strong> ({deletingProduct.sku}) secara permanen dari Cloud Database? Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setDeletingProduct(null)}
                className="flex-1 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  if (onDeleteProduct) {
                    onDeleteProduct(deletingProduct.id);
                  }
                  setDeletingProduct(null);
                }}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-xs"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
