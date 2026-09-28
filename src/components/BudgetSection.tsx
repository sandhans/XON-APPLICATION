import React, { useState } from 'react';
import { Budget, Category, Transaction } from '../types/finance';
import { formatIDR, getCurrentMonthStr } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';
import { Plus, Edit2, AlertCircle, CheckCircle2, X } from 'lucide-react';

interface BudgetSectionProps {
  budgets: Budget[];
  categories: Category[];
  transactions: Transaction[];
  selectedMonth: string;
  onSaveBudget: (categoryId: string, monthlyLimit: number) => void;
  onDeleteBudget: (budgetId: string) => void;
}

export const BudgetSection: React.FC<BudgetSectionProps> = ({
  budgets,
  categories,
  transactions,
  selectedMonth,
  onSaveBudget,
  onDeleteBudget,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCatId, setSelectedCatId] = useState('');
  const [limitInput, setLimitInput] = useState('');
  const [error, setError] = useState('');

  // Calculate spent per category for the current month
  const spentPerCategory = React.useMemo(() => {
    const map: Record<string, number> = {};
    transactions
      .filter((t) => t.type === 'expense' && t.date.startsWith(selectedMonth))
      .forEach((t) => {
        map[t.categoryId] = (map[t.categoryId] || 0) + t.amount;
      });
    return map;
  }, [transactions, selectedMonth]);

  // Total budget vs total spent in budgeted categories
  const totalBudget = budgets.reduce((acc, b) => acc + b.monthlyLimit, 0);
  const totalBudgetSpent = budgets.reduce((acc, b) => acc + (spentPerCategory[b.categoryId] || 0), 0);
  const totalBudgetPct = totalBudget > 0 ? Math.min(100, Math.round((totalBudgetSpent / totalBudget) * 100)) : 0;

  const expenseCategories = categories.filter((c) => c.type === 'expense');

  const handleOpenAdd = () => {
    const unbudgeted = expenseCategories.find((c) => !budgets.some((b) => b.categoryId === c.id));
    setSelectedCatId(unbudgeted ? unbudgeted.id : expenseCategories[0]?.id || '');
    setLimitInput('');
    setError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (b: Budget) => {
    setSelectedCatId(b.categoryId);
    setLimitInput(b.monthlyLimit.toString());
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = limitInput.replace(/\D/g, '');
    const num = Number(clean);
    if (!num || num <= 0) {
      setError('Batas anggaran harus lebih dari 0');
      return;
    }

    onSaveBudget(selectedCatId, num);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>Kontrol Finansial</span>
            <span aria-hidden="true">·</span>
            <span>Batas Pengeluaran</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Anggaran Bulanan
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Tetapkan batas pengeluaran per kategori agar keuangan tetap terkendali dan disiplin.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg shadow-sm transition-colors whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Atur Anggaran Kategori</span>
        </button>
      </div>

      {/* Overall Budget Progress */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Total Pemakaian Anggaran Bulan Ini
          </span>
          <span className="text-xs font-mono font-bold text-slate-800">
            {formatIDR(totalBudgetSpent)} / {formatIDR(totalBudget)}
          </span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden mb-2">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              totalBudgetPct > 100
                ? 'bg-rose-500'
                : totalBudgetPct > 80
                ? 'bg-amber-500'
                : 'bg-emerald-500'
            }`}
            style={{ width: `${Math.min(100, totalBudgetPct)}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>{totalBudgetPct}% terpakai</span>
          <span>Sisa: {formatIDR(Math.max(0, totalBudget - totalBudgetSpent))}</span>
        </div>
      </div>

      {/* Budget Grid per Category */}
      {budgets.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-slate-200/80 shadow-xs text-center">
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <CategoryIcon name="PieChart" className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900 mb-1">
            Belum ada batas anggaran bulanan
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
            Atur batas pengeluaran untuk kategori seperti makanan, belanja, atau tagihan agar keuangan tetap terkontrol.
          </p>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Atur Anggaran Kategori</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgets.map((b) => {
            const cat = categories.find((c) => c.id === b.categoryId);
            const spent = spentPerCategory[b.categoryId] || 0;
            const pct = b.monthlyLimit > 0 ? Math.round((spent / b.monthlyLimit) * 100) : 0;
            const remaining = b.monthlyLimit - spent;
            const isOver = remaining < 0;

            return (
              <div
                key={b.id}
                className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: cat?.bgLight || '#F1F5F9', color: cat?.color || '#475569' }}
                      >
                        <CategoryIcon name={cat?.icon || 'PieChart'} className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 leading-tight">
                          {cat?.name || 'Kategori'}
                        </h4>
                        <span className="text-[11px] text-slate-400 font-mono">
                          Batas: {formatIDR(b.monthlyLimit)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(b)}
                        className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"
                        title="Ubah Anggaran"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteBudget(b.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                        title="Hapus Anggaran"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mb-2">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isOver ? 'bg-rose-500' : pct >= 80 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-600">{formatIDR(spent)}</span>
                    <span className={isOver ? 'text-rose-600 font-semibold' : 'text-slate-500'}>
                      {pct}%
                    </span>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Sisa Anggaran:</span>
                  <span className={`font-mono font-semibold ${isOver ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {isOver ? `Over ${formatIDR(Math.abs(remaining))}` : formatIDR(remaining)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-slate-200 p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Atur Batas Anggaran Bulanan
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Pilih Kategori Pengeluaran
                </label>
                <select
                  value={selectedCatId}
                  onChange={(e) => setSelectedCatId(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  {expenseCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Batas Maksimal Pengeluaran (Rp)
                </label>
                <div className="relative rounded-xl border border-slate-200 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all bg-white px-3 py-2">
                  <div className="flex items-baseline">
                    <span className="text-sm font-bold text-slate-400 mr-2">Rp</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="0"
                      value={limitInput ? new Intl.NumberFormat('id-ID').format(Number(limitInput.replace(/\D/g, ''))) : ''}
                      onChange={(e) => setLimitInput(e.target.value)}
                      className="w-full text-lg font-bold font-mono text-slate-900 focus:outline-none bg-transparent"
                      autoFocus
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="text-xs font-medium text-rose-600 bg-rose-50 px-3 py-2 rounded-lg">
                  {error}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
                >
                  Simpan Batas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
