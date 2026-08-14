import React, { useState, useEffect } from 'react';
import { Product } from '../types';

interface QuickSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSelectProduct: (product: Product) => void;
}

export const QuickSearchModal: React.FC<QuickSearchModalProps> = ({
  isOpen,
  onClose,
  products,
  onSelectProduct,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      } else if (e.key === '/' && !isOpen) {
        const activeTag = document.activeElement?.tagName;
        if (activeTag !== 'INPUT' && activeTag !== 'TEXTAREA') {
          e.preventDefault();
        }
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.sku.toLowerCase().includes(query.toLowerCase()) ||
      p.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-start justify-center pt-20 px-4 animate-fade-in font-sans">
      <div className="bg-white w-full max-w-xl border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Search Header */}
        <div className="p-4 border-b border-slate-200 flex items-center gap-3 bg-slate-50">
          <span className="material-symbols-outlined text-[20px] text-blue-600">
            search
          </span>
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari nama barang, SKU, atau kategori (misal: ThinkPad, APP-POLO)..."
            className="w-full bg-transparent text-xs text-slate-900 outline-none placeholder:text-slate-400 font-sans"
          />
          <button
            onClick={onClose}
            className="text-[10px] font-mono font-bold bg-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-300 px-2 py-1 rounded transition-colors cursor-pointer"
          >
            ESC
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 divide-y divide-slate-100">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-xs font-sans text-slate-400">
              Tidak ada produk yang cocok dengan &quot;{query}&quot;
            </div>
          ) : (
            filtered.map((p) => (
              <div
                key={p.id}
                onClick={() => {
                  onSelectProduct(p);
                  onClose();
                }}
                className="p-3.5 hover:bg-blue-50/50 rounded-xl cursor-pointer flex items-center justify-between group transition-all"
              >
                <div>
                  <div className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                    {p.name}
                    <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded uppercase tracking-wider">
                      {p.category}
                    </span>
                  </div>
                  <div className="text-xs font-mono text-slate-500 mt-0.5">{p.sku}</div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-semibold text-slate-900">{p.stock} unit</div>
                  <div className="text-xs text-blue-600 font-semibold font-mono">
                    Rp {new Intl.NumberFormat('id-ID').format(p.price)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-[10px] text-slate-500 flex items-center justify-between px-4 uppercase tracking-wider">
          <span>
            Pencarian Cepat Katalog SKU
          </span>
          <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 font-bold rounded font-mono">
            Cmd + K
          </span>
        </div>
      </div>
    </div>
  );
};
