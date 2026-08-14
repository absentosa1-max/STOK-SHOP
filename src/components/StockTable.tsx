import React, { useState } from 'react';
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
  const [categorySortOrder, setCategorySortOrder] = useState<'a-z' | 'z-a' | 'count-desc' | 'count-asc'>('a-z');
  const [sortBy, setSortBy] = useState<'id' | 'name' | 'sku' | 'category' | 'stock' | 'price'>('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [expandedRowIds, setExpandedRowIds] = useState<Record<string, boolean>>({ '002': true });
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const itemsPerPage = 5;

  // Extract strictly entered categories from current products
  const enteredCategories = Array.from(
    new Set(products.map((p) => p.category?.trim()).filter(Boolean) as string[])
  );

  // Sort entered categories based on user selected ordering
  const sortedCategories = [...enteredCategories].sort((a, b) => {
    if (categorySortOrder === 'a-z') return a.localeCompare(b);
    if (categorySortOrder === 'z-a') return b.localeCompare(a);
    const countA = products.filter((p) => p.category === a).length;
    const countB = products.filter((p) => p.category === b).length;
    if (categorySortOrder === 'count-desc') return countB - countA;
    if (categorySortOrder === 'count-asc') return countA - countB;
    return a.localeCompare(b);
  });

  const categories = ['Semua Kategori', ...sortedCategories];

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

  // Filter & Sort products
  const filteredProducts = products
    .filter((p) => {
      const matchesCategory =
        selectedCategory === 'Semua Kategori' || p.category === selectedCategory;
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
        comparison = a.id.localeCompare(b.id);
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

  const totalEntries = 124; // Simulated total entries matching Image 3 design
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const currentProducts = filteredProducts.slice(startIdx, startIdx + itemsPerPage);

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID').format(num);
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in font-sans">
      {/* Top Header Title & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
            Manajemen Inventaris
          </div>
          <h1 className="text-2xl font-display font-bold text-slate-900 tracking-tight">
            Daftar Stok Produk
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Kelola persediaan barang, sesuaikan stok, dan pantau pergerakan inventory.
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
            <span>Unduh Laporan Excel</span>
          </button>
        </div>
      </div>

      {/* Filter Bar & Search */}
      <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Field */}
        <div className="relative flex-1 max-w-sm">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px] pointer-events-none">
            search
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari berdasarkan nama produk, SKU, atau kategori..."
            className="w-full h-10 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:bg-white outline-none transition-all"
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

        {/* Category Filter Pills & Order Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 text-xs">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium tracking-wide transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-blue-600 text-white font-semibold shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                  }`}
                >
                  {cat}
                </button>
              );
            })}

            <button
              onClick={() => {
                setSelectedCategory('Semua Kategori');
                setSearchTerm('');
              }}
              className="p-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-500 hover:text-blue-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
              title="Reset Filter"
            >
              <span className="material-symbols-outlined text-[16px]">filter_list</span>
            </button>
          </div>

          {/* Category Ordering Options */}
          <div className="flex items-center gap-2 border-t sm:border-t-0 sm:border-l border-slate-200 pt-2 sm:pt-0 sm:pl-3">
            <span className="text-[11px] text-slate-500 font-medium whitespace-nowrap flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-blue-600">sort</span>
              Urutan:
            </span>
            <select
              value={categorySortOrder}
              onChange={(e) => setCategorySortOrder(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-md text-slate-800 text-[11px] px-2 py-1 outline-none focus:border-blue-600 font-medium cursor-pointer"
            >
              <option value="a-z">Abjad (A - Z)</option>
              <option value="z-a">Abjad (Z - A)</option>
              <option value="count-desc">Jumlah Produk (Terbanyak)</option>
              <option value="count-asc">Jumlah Produk (Tersedikit)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Inventory Data Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th onClick={() => handleSort('id')} className="py-3.5 px-4 w-12 text-center cursor-pointer hover:text-slate-900 transition-colors">
                  ID {sortBy === 'id' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => handleSort('name')} className="py-3.5 px-4 min-w-[200px] cursor-pointer hover:text-slate-900 transition-colors">
                  NAMA PRODUK {sortBy === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => handleSort('sku')} className="py-3.5 px-4 cursor-pointer hover:text-slate-900 transition-colors">
                  SKU {sortBy === 'sku' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => handleSort('category')} className="py-3.5 px-4 cursor-pointer hover:text-slate-900 transition-colors">
                  <div className="flex items-center gap-1 text-blue-700 font-bold">
                    <span>KATEGORI</span>
                    <span>{sortBy === 'category' ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}</span>
                  </div>
                </th>
                <th className="py-3.5 px-4">UKURAN</th>
                <th className="py-3.5 px-4">WARNA</th>
                <th onClick={() => handleSort('stock')} className="py-3.5 px-4 text-center cursor-pointer hover:text-slate-900 transition-colors">
                  STOK SAAT INI {sortBy === 'stock' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => handleSort('price')} className="py-3.5 px-4 text-right cursor-pointer hover:text-slate-900 transition-colors">
                  HARGA (IDR) {sortBy === 'price' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="py-3.5 px-4 text-center w-28">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-800">
              {currentProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <span className="material-symbols-outlined text-[32px] block mb-2 text-blue-500 opacity-60">
                      inventory
                    </span>
                    Tidak ada produk yang sesuai dengan pencarian.
                  </td>
                </tr>
              ) : (
                currentProducts.map((p) => {
                  const isExpanded = !!expandedRowIds[p.id];
                  const isLowStock = p.stock <= (p.minThreshold || 10);

                  return (
                    <React.Fragment key={p.id}>
                      {/* Main Product Row */}
                      <tr className="hover:bg-slate-50/80 transition-colors group">
                        <td className="py-3.5 px-4 font-mono text-slate-400 text-center">{p.id}</td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            {p.hasVariants && (
                              <button
                                onClick={() => toggleExpand(p.id)}
                                className="p-0.5 text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                                title="Lihat variasi"
                              >
                                <span className="material-symbols-outlined text-[18px]">
                                  {isExpanded ? 'expand_more' : 'chevron_right'}
                                </span>
                              </button>
                            )}
                            <div>
                              <div className="font-semibold text-slate-900 text-sm flex items-center gap-2 flex-wrap">
                                <span>{p.name}</span>
                                {p.hasVariants && (
                                  <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-[10px] font-semibold">
                                    {p.variants?.length || 0} Variasi
                                  </span>
                                )}
                                {isLowStock && (
                                  <span className="px-1.5 py-0.5 bg-amber-50 border border-amber-300 text-amber-700 text-[10px] font-semibold rounded">
                                    Stok Rendah
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-slate-500 mt-0.5">{p.description}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-600 text-[11px]">{p.sku}</td>
                        <td className="py-3.5 px-4">
                          <span className="inline-block px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-700 rounded text-[11px] font-medium">
                            {p.category || '—'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          {p.size !== '—' ? (
                            <span className="inline-block px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-800 rounded font-mono text-[11px]">
                              {p.size}
                            </span>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          {p.color !== '—' ? (
                            <span className="inline-flex items-center gap-1.5 text-slate-700">
                              <span
                                className="w-2.5 h-2.5 rounded-full border border-slate-300"
                                style={{ backgroundColor: p.colorHex || '#94A3B8' }}
                              />
                              {p.color}
                            </span>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="inline-flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => onUpdateStock(p.id, null, -1)}
                              className="w-7 h-7 bg-white border border-slate-300 rounded hover:border-blue-600 hover:text-blue-600 text-slate-700 font-bold flex items-center justify-center transition-colors cursor-pointer active:scale-95 shadow-2xs"
                              title="Kurangi Stok"
                            >
                              -
                            </button>
                            <span className="font-bold text-sm min-w-[32px] text-center text-slate-900 font-mono">
                              {p.stock}
                            </span>
                            <button
                              onClick={() => onUpdateStock(p.id, null, 1)}
                              className="w-7 h-7 bg-white border border-slate-300 rounded hover:border-blue-600 hover:text-blue-600 text-slate-700 font-bold flex items-center justify-center transition-colors cursor-pointer active:scale-95 shadow-2xs"
                              title="Tambah Stok"
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                          Rp {formatIDR(p.price)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => onOpenEditModal(p)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                              title="Kelola Variasi & Detail Produk"
                            >
                              <span className="material-symbols-outlined text-[18px]">style</span>
                            </button>
                            <button
                              onClick={() => onViewLogs(p)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                              title="Riwayat Pergerakan"
                            >
                              <span className="material-symbols-outlined text-[18px]">history</span>
                            </button>
                            <button
                              onClick={() => onOpenEditModal(p)}
                              className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                              title="Edit Detail"
                            >
                              <span className="material-symbols-outlined text-[18px]">edit</span>
                            </button>
                            {onCopyProduct && (
                              <button
                                onClick={() => onCopyProduct(p)}
                                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                                title="Salin / Duplikat Stok"
                              >
                                <span className="material-symbols-outlined text-[18px]">content_copy</span>
                              </button>
                            )}
                            {onDeleteProduct && (
                              <button
                                onClick={() => setDeletingProduct(p)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                                title="Hapus Stok"
                              >
                                <span className="material-symbols-outlined text-[18px]">delete</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>

                      {/* Variant Rows (if expanded) */}
                      {p.hasVariants &&
                        isExpanded &&
                        p.variants?.map((v) => (
                          <tr
                            key={v.id}
                            className="bg-slate-50/90 hover:bg-slate-100/80 transition-colors border-l-4 border-l-blue-600"
                          >
                            <td className="py-2.5 px-4 text-center"></td>
                            <td className="py-2.5 px-4 pl-8 text-slate-500 font-medium text-xs flex items-center gap-1.5">
                              <span className="text-blue-600 font-semibold">↳ VARIASI</span>
                            </td>
                            <td className="py-2.5 px-4 font-mono text-slate-600 text-[11px]">{v.sku}</td>
                            <td className="py-2.5 px-4">
                              <span className="inline-block px-2 py-0.5 bg-white border border-slate-200 text-slate-700 rounded text-[10px] font-medium">
                                {v.size}
                              </span>
                            </td>
                            <td className="py-2.5 px-4">
                              <span className="inline-flex items-center gap-1.5 text-slate-700">
                                <span
                                  className="w-2.5 h-2.5 rounded-full border border-slate-300"
                                  style={{ backgroundColor: v.colorHex || '#94A3B8' }}
                                />
                                {v.color}
                              </span>
                            </td>
                            <td className="py-2.5 px-4 text-center">
                              <div className="inline-flex items-center justify-center gap-1.5 font-mono">
                                <button
                                  onClick={() => onUpdateStock(p.id, v.id, -1)}
                                  className="w-6 h-6 bg-white border border-slate-300 rounded hover:border-blue-600 text-slate-700 font-bold text-xs flex items-center justify-center transition-colors cursor-pointer active:scale-95 shadow-2xs"
                                >
                                  -
                                </button>
                                <span className="font-bold text-xs min-w-[28px] text-center text-slate-800">
                                  {v.stock}
                                </span>
                                <button
                                  onClick={() => onUpdateStock(p.id, v.id, 1)}
                                  className="w-6 h-6 bg-white border border-slate-300 rounded hover:border-blue-600 text-slate-700 font-bold text-xs flex items-center justify-center transition-colors cursor-pointer active:scale-95 shadow-2xs"
                                >
                                  +
                                </button>
                              </div>
                            </td>
                            <td className="py-2.5 px-4 text-right font-mono font-semibold text-slate-900">
                              Rp {formatIDR(v.price)}
                            </td>
                            <td className="py-2.5 px-4 text-center"></td>
                          </tr>
                        ))}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="text-[11px] font-medium">
            MENAMPILKAN <span className="font-bold text-slate-800">1</span> - {' '}
            <span className="font-bold text-slate-800">{filteredProducts.length}</span> DARI{' '}
            <span className="font-bold text-blue-600">{totalEntries}</span> ITEM
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="w-8 h-8 rounded bg-white border border-slate-200 flex items-center justify-center hover:bg-blue-600 hover:text-white hover:border-blue-600 disabled:opacity-40 transition-colors cursor-pointer shadow-2xs"
            >
              <span className="material-symbols-outlined text-[16px]">chevron_left</span>
            </button>

            {[1, 2, 3].map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 rounded text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer ${
                  currentPage === page
                    ? 'bg-blue-600 text-white font-bold shadow-2xs'
                    : 'bg-white border border-slate-200 hover:bg-slate-100 text-slate-700'
                }`}
              >
                {page}
              </button>
            ))}

            <span className="px-1 text-slate-400">...</span>

            <button
              onClick={() => setCurrentPage(12)}
              className="w-8 h-8 rounded bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-100 text-slate-700 cursor-pointer"
            >
              12
            </button>

            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages || 1))}
              className="w-8 h-8 rounded bg-white border border-slate-200 flex items-center justify-center hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-colors cursor-pointer shadow-2xs"
            >
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deletingProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in font-sans">
          <div className="bg-white w-full max-w-md border border-slate-200 rounded-2xl shadow-2xl p-6 flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl">
                <span className="material-symbols-outlined text-[24px]">warning</span>
              </div>
              <div>
                <div className="text-xs font-bold text-rose-600 uppercase tracking-wider">
                  Konfirmasi Hapus
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  Hapus Barang Inventory?
                </h3>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Apakah Anda yakin ingin menghapus produk <span className="text-slate-900 font-semibold">&quot;{deletingProduct.name}&quot;</span> (SKU: {deletingProduct.sku})? Tindakan ini akan menghapus stok dari sistem.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                onClick={() => setDeletingProduct(null)}
                className="px-4 py-2 bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
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
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer shadow-xs"
              >
                Ya, Hapus Produk
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
