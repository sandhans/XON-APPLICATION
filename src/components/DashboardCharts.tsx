import React from 'react';
import { BillReminder, Category, Transaction } from '../types/finance';
import { formatIDR, formatDateIndo } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';
import { ArrowUpRight, ArrowDownLeft, Clock, AlertCircle, CheckCircle2, ChevronRight } from 'lucide-react';

interface DashboardChartsProps {
  transactions: Transaction[];
  categories: Category[];
  reminders: BillReminder[];
  selectedMonth: string;
  onNavigateToReports: () => void;
  onNavigateToReminders: () => void;
  onNavigateToTransactions: () => void;
}

export const DashboardCharts: React.FC<DashboardChartsProps> = ({
  transactions,
  categories,
  reminders,
  selectedMonth,
  onNavigateToReports,
  onNavigateToReminders,
  onNavigateToTransactions,
}) => {
  const monthTransactions = transactions.filter((t) => t.date.startsWith(selectedMonth));

  // Category breakdown for expenses
  const categoryBreakdown = React.useMemo(() => {
    let totalExp = 0;
    const map: Record<string, number> = {};

    monthTransactions.forEach((tx) => {
      if (tx.type === 'expense') {
        totalExp += tx.amount;
        map[tx.categoryId] = (map[tx.categoryId] || 0) + tx.amount;
      }
    });

    return Object.entries(map)
      .map(([catId, amount]) => {
        const cat = categories.find((c) => c.id === catId);
        return {
          catId,
          name: cat?.name || 'Lainnya',
          amount,
          percentage: totalExp > 0 ? Math.round((amount / totalExp) * 100) : 0,
          color: cat?.color || '#64748B',
          bgLight: cat?.bgLight || '#F1F5F9',
          icon: cat?.icon || 'CircleDollarSign',
        };
      })
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5); // top 5
  }, [monthTransactions, categories]);

  // Pending reminders due soon
  const pendingReminders = reminders.filter((r) => !r.isPaid).slice(0, 3);

  // Recent transactions
  const recentTransactions = [...monthTransactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() || b.createdAt - a.createdAt)
    .slice(0, 5);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* 1. Pengeluaran per Kategori (2 Cols on LG) */}
      <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Alokasi Pengeluaran Utama
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Kategori dengan pengeluaran terbesar pada bulan ini
              </p>
            </div>
            <button
              onClick={onNavigateToReports}
              className="flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
            >
              <span>Laporan Lengkap</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {categoryBreakdown.length === 0 ? (
            <div className="text-center py-10 px-4">
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2">
                <CategoryIcon name="PieChart" className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-slate-700">Belum ada pengeluaran di bulan ini</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Grafik proporsi kategori akan tampil secara otomatis saat Anda mencatat pengeluaran.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {categoryBreakdown.map((cat) => (
                <div key={cat.catId} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-md flex items-center justify-center text-xs"
                        style={{ backgroundColor: cat.bgLight, color: cat.color }}
                      >
                        <CategoryIcon name={cat.icon} className="w-3 h-3" />
                      </div>
                      <span className="font-semibold text-slate-800">{cat.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-slate-400">{cat.percentage}%</span>
                      <span className="font-mono font-bold text-slate-900">
                        {formatIDR(cat.amount)}
                      </span>
                    </div>
                  </div>

                  {/* Visual Bar */}
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${cat.percentage}%`,
                        backgroundColor: cat.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Menampilkan 5 kategori dengan nominal terbesar</span>
          <span className="font-medium text-slate-700">Otomatis Terkalkulasi</span>
        </div>
      </div>

      {/* 2. Tagihan Mendatang Widget (1 Col) */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900">
              Jadwal Tagihan
            </h3>
            <button
              onClick={onNavigateToReminders}
              className="flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
            >
              <span>Semua ({reminders.filter((r) => !r.isPaid).length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {pendingReminders.length === 0 ? (
            <div className="py-8 text-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-xs text-slate-600 font-medium">Semua tagihan lunas!</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Tidak ada tagihan tertunda</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingReminders.map((rem) => {
                const cat = categories.find((c) => c.id === rem.categoryId);
                return (
                  <div
                    key={rem.id}
                    className="p-3 bg-slate-50 rounded-lg border border-slate-200/60 flex items-center justify-between"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="text-xs font-bold text-slate-900 truncate">
                        {rem.title}
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                        <Clock className="w-3 h-3 text-amber-600" />
                        <span>Jatuh tempo: {formatDateIndo(rem.dueDate, 'short')}</span>
                      </div>
                    </div>
                    <div className="text-xs font-bold font-mono text-slate-900 shrink-0">
                      {formatIDR(rem.amount)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <button
          onClick={onNavigateToReminders}
          className="w-full mt-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors text-center"
        >
          Buka Halaman Pengingat Tagihan
        </button>
      </div>

    </div>
  );
};
