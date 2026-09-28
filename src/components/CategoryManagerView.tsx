import React, { useState, useMemo } from 'react';
import { Category, CategoryType, Transaction } from '../types/finance';
import { AVAILABLE_ICONS, CategoryIcon } from './CategoryIcon';
import { formatIDR } from '../utils/formatters';
import { Plus, Edit3, Trash2, X, Check, Tag, ShieldCheck } from 'lucide-react';

interface CategoryManagerViewProps {
  categories: Category[];
  transactions: Transaction[];
  onAddCategory: (category: Omit<Category, 'id'>) => void;
  onUpdateCategory: (id: string, updated: Partial<Category>) => void;
  onDeleteCategory: (id: string) => void;
}

const PALETTE = [
  { color: '#EA580C', bgLight: '#FFEDD5', name: 'Oranye' },
  { color: '#2563EB', bgLight: '#DBEAFE', name: 'Biru' },
  { color: '#16A34A', bgLight: '#DCFCE7', name: 'Hijau' },
  { color: '#DC2626', bgLight: '#FEE2E2', name: 'Merah' },
  { color: '#9333EA', bgLight: '#F3E8FF', name: 'Ungu' },
  { color: '#D97706', bgLight: '#FEF3C7', name: 'Kuning' },
  { color: '#0D9488', bgLight: '#CCFBF1', name: 'Toska' },
  { color: '#E11D48', bgLight: '#FFE4E6', name: 'Pink' },
  { color: '#4F46E5', bgLight: '#EEF2FF', name: 'Indigo' },
  { color: '#0284C7', bgLight: '#E0F2FE', name: 'Langit' },
  { color: '#64748B', bgLight: '#F1F5F9', name: 'Abu-Abu' },
];

export const CategoryManagerView: React.FC<CategoryManagerViewProps> = ({
  categories,
  transactions,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
}) => {
  const [activeTab, setActiveTab] = useState<CategoryType>('expense');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [type, setType] = useState<CategoryType>('expense');
  const [selectedIcon, setSelectedIcon] = useState('Utensils');
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [error, setError] = useState('');

  // Calculate statistics per category (usage count & total amount)
  const categoryStats = useMemo(() => {
    const stats: Record<string, { count: number; total: number }> = {};
    transactions.forEach((tx) => {
      if (!stats[tx.categoryId]) {
        stats[tx.categoryId] = { count: 0, total: 0 };
      }
      stats[tx.categoryId].count += 1;
      stats[tx.categoryId].total += tx.amount;
    });
    return stats;
  }, [transactions]);

  const filteredCategories = useMemo(() => {
    return categories.filter((c) => c.type === activeTab);
  }, [categories, activeTab]);

  const handleOpenAdd = (defaultType?: CategoryType) => {
    setEditingCategory(null);
    setName('');
    setType(defaultType || activeTab);
    setSelectedIcon('Tag');
    setSelectedColorIndex(0);
    setError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setType(cat.type);
    setSelectedIcon(cat.icon);
    const colorIdx = PALETTE.findIndex((p) => p.color === cat.color);
    setSelectedColorIndex(colorIdx >= 0 ? colorIdx : 0);
    setError('');
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Nama kategori harus diisi');
      return;
    }

    const paletteChoice = PALETTE[selectedColorIndex];

    if (editingCategory) {
      onUpdateCategory(editingCategory.id, {
        name: name.trim(),
        type,
        icon: selectedIcon,
        color: paletteChoice.color,
        bgLight: paletteChoice.bgLight,
      });
    } else {
      onAddCategory({
        name: name.trim(),
        type,
        icon: selectedIcon,
        color: paletteChoice.color,
        bgLight: paletteChoice.bgLight,
        isCustom: true,
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>Personalisasi</span>
            <span aria-hidden="true">·</span>
            <span>Klasifikasi Anggaran</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Kelola Kategori Transaksi
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Atur dan tambahkan kategori kustom untuk pengelompokan pemasukan dan pengeluaran harian.
          </p>
        </div>

        <button
          onClick={() => handleOpenAdd(activeTab)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg shadow-sm transition-colors whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Kategori Kustom</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('expense')}
          className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === 'expense'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Kategori Pengeluaran ({categories.filter((c) => c.type === 'expense').length})
        </button>
        <button
          onClick={() => setActiveTab('income')}
          className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === 'income'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Kategori Pemasukan ({categories.filter((c) => c.type === 'income').length})
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCategories.map((cat) => {
          const stats = categoryStats[cat.id] || { count: 0, total: 0 };

          return (
            <div
              key={cat.id}
              className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between group hover:border-slate-300 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: cat.bgLight, color: cat.color }}
                >
                  <CategoryIcon name={cat.icon} className="w-5 h-5" />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-slate-900 truncate">
                      {cat.name}
                    </span>
                    {cat.isCustom && (
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                        Kustom
                      </span>
                    )}
                  </div>
                  {/* Zero-pill metadata */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                    <span>{stats.count} transaksi</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono">{formatIDR(stats.total, true)}</span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => handleOpenEdit(cat)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                  title="Ubah Kategori"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                {cat.isCustom && (
                  <button
                    onClick={() => {
                      if (stats.count > 0) {
                        const confirmed = window.confirm(
                          `Kategori "${cat.name}" sudah digunakan oleh ${stats.count} transaksi. Transaksi terkait akan dialihkan ke "Lainnya". Tetap hapus?`
                        );
                        if (!confirmed) return;
                      }
                      onDeleteCategory(cat.id);
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Hapus Kategori Kustom"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Tambah / Edit Kategori */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">
                {editingCategory ? 'Ubah Kategori' : 'Buat Kategori Kustom Baru'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              
              {/* Type selector */}
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Jenis Transaksi
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setType('expense')}
                    className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all ${
                      type === 'expense'
                        ? 'border-rose-500 bg-rose-50 text-rose-700 ring-1 ring-rose-500'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Pengeluaran
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('income')}
                    className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all ${
                      type === 'income'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Pemasukan
                  </button>
                </div>
              </div>

              {/* Name input */}
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Nama Kategori
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Kopi & Ngemil, Skincare, Hobi, Gaji Sampingan..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  required
                />
              </div>

              {/* Icon Selector */}
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Pilih Ikon
                </label>
                <div className="grid grid-cols-6 gap-2 max-h-32 overflow-y-auto p-2 border border-slate-200 rounded-xl bg-slate-50/50">
                  {AVAILABLE_ICONS.map((iconName) => {
                    const isSelected = selectedIcon === iconName;
                    return (
                      <button
                        key={iconName}
                        type="button"
                        onClick={() => setSelectedIcon(iconName)}
                        className={`p-2 rounded-lg flex items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-white shadow-xs border border-emerald-500 text-emerald-600 ring-1 ring-emerald-500'
                            : 'text-slate-500 hover:text-slate-900 hover:bg-white/80'
                        }`}
                      >
                        <CategoryIcon name={iconName} className="w-5 h-5" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Color Palette */}
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Warna Tema
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  {PALETTE.map((pal, idx) => (
                    <button
                      key={pal.color}
                      type="button"
                      onClick={() => setSelectedColorIndex(idx)}
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform ${
                        selectedColorIndex === idx ? 'scale-110 ring-2 ring-offset-2 ring-slate-900' : ''
                      }`}
                      style={{ backgroundColor: pal.color }}
                      title={pal.name}
                    >
                      {selectedColorIndex === idx && <Check className="w-4 h-4 text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Preview */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                <span className="text-[11px] font-medium text-slate-400 block mb-1">
                  Pratinjau Tampilan
                </span>
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{
                      backgroundColor: PALETTE[selectedColorIndex].bgLight,
                      color: PALETTE[selectedColorIndex].color,
                    }}
                  >
                    <CategoryIcon name={selectedIcon} className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-semibold text-slate-800">
                    {name.trim() || 'Nama Kategori'}
                  </span>
                </div>
              </div>

              {error && (
                <div className="text-xs font-medium text-rose-600 bg-rose-50 px-3 py-2 rounded-lg">
                  {error}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg shadow-sm"
                >
                  {editingCategory ? 'Perbarui Kategori' : 'Simpan Kategori'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
