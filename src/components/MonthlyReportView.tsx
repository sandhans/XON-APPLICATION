import React, { useMemo } from 'react';
import { Category, MonthlyReportSummary, Transaction } from '../types/finance';
import { formatIDR, formatDateIndo, getMonthNameIndo } from '../utils/formatters';
import { generateMonthlyReport } from '../utils/storage';
import { CategoryIcon } from './CategoryIcon';
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  PiggyBank, 
  Printer, 
  Download, 
  ChevronLeft, 
  ChevronRight,
  Receipt,
  CheckCircle2,
  Calendar
} from 'lucide-react';

interface MonthlyReportViewProps {
  selectedMonth: string;
  onMonthChange: (month: string) => void;
  transactions: Transaction[];
  categories: Category[];
}

export const MonthlyReportView: React.FC<MonthlyReportViewProps> = ({
  selectedMonth,
  onMonthChange,
  transactions,
  categories,
}) => {
  // Generate report for current selected month
  const report: MonthlyReportSummary = useMemo(() => {
    return generateMonthlyReport(selectedMonth, transactions, categories);
  }, [selectedMonth, transactions, categories]);

  // Calculate previous month report for comparison
  const previousMonthStr = useMemo(() => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const prevDate = new Date(year, month - 2, 1);
    return `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;
  }, [selectedMonth]);

  const prevReport: MonthlyReportSummary = useMemo(() => {
    return generateMonthlyReport(previousMonthStr, transactions, categories);
  }, [previousMonthStr, transactions, categories]);

  // Calculate percentage deltas
  const expenseDeltaPct = useMemo(() => {
    if (prevReport.totalExpense === 0) return 0;
    return Math.round(((report.totalExpense - prevReport.totalExpense) / prevReport.totalExpense) * 100);
  }, [report.totalExpense, prevReport.totalExpense]);

  const incomeDeltaPct = useMemo(() => {
    if (prevReport.totalIncome === 0) return 0;
    return Math.round(((report.totalIncome - prevReport.totalIncome) / prevReport.totalIncome) * 100);
  }, [report.totalIncome, prevReport.totalIncome]);

  // Navigate months
  const handlePrevMonth = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const d = new Date(year, month - 2, 1);
    onMonthChange(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  };

  const handleNextMonth = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const d = new Date(year, month, 1);
    onMonthChange(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  };

  // Export to CSV
  const handleExportCSV = () => {
    const monthTxs = transactions.filter((t) => t.date.startsWith(selectedMonth));
    if (monthTxs.length === 0) {
      alert('Tidak ada transaksi pada bulan ini untuk diekspor.');
      return;
    }

    const headers = ['Tanggal', 'Tipe', 'Kategori', 'Akun', 'Nominal', 'Catatan'];
    const rows = monthTxs.map((t) => [
      t.date,
      t.type === 'income' ? 'Pemasukan' : t.type === 'expense' ? 'Pengeluaran' : 'Transfer',
      `"${t.categoryName}"`,
      `"${t.accountName}"`,
      t.amount,
      `"${(t.note || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `laporan-keuangan-xon-${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print function
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Month Selection Controls */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>Ringkasan Keuangan</span>
            <span aria-hidden="true">·</span>
            <span>Laporan Resmi</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Laporan Bulan {report.monthName}
          </h1>
        </div>

        {/* Month selector & Export actions */}
        <div className="flex flex-wrap items-center gap-2">
          
          <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 text-slate-600 hover:text-slate-900 rounded-md hover:bg-white transition-colors"
              title="Bulan Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs font-semibold text-slate-800">
              {report.monthName}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1.5 text-slate-600 hover:text-slate-900 rounded-md hover:bg-white transition-colors"
              title="Bulan Berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Laporan</span>
          </button>

        </div>
      </div>

      {/* KPI Cards: Pemasukan, Pengeluaran, Saldo Akhir */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Total Pemasukan */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-emerald-600">Total Pemasukan</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono tracking-tight text-emerald-600">
            {formatIDR(report.totalIncome)}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2">
            <span>{report.incomeCount} transaksi pemasukan</span>
            {prevReport.totalIncome > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <span className={incomeDeltaPct >= 0 ? 'text-emerald-600 font-medium' : 'text-slate-500'}>
                  {incomeDeltaPct >= 0 ? `+${incomeDeltaPct}%` : `${incomeDeltaPct}%`} vs bulan lalu
                </span>
              </>
            )}
          </div>
        </div>

        {/* Total Pengeluaran */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-rose-600">Total Pengeluaran</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono tracking-tight text-rose-600">
            {formatIDR(report.totalExpense)}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2">
            <span>{report.expenseCount} transaksi pengeluaran</span>
            {prevReport.totalExpense > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <span className={expenseDeltaPct > 0 ? 'text-rose-600 font-medium' : 'text-emerald-600 font-medium'}>
                  {expenseDeltaPct > 0 ? `+${expenseDeltaPct}%` : `${expenseDeltaPct}%`} vs bulan lalu
                </span>
              </>
            )}
          </div>
        </div>

        {/* Saldo Akhir / Arus Kas Bersih */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-700">Saldo Akhir Bulan Ini</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-2xl font-bold font-mono tracking-tight ${
            report.netSavings >= 0 ? 'text-slate-900' : 'text-rose-600'
          }`}>
            {formatIDR(report.netSavings)}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2">
            <span className={report.netSavings >= 0 ? 'text-emerald-600 font-medium' : 'text-rose-600 font-medium'}>
              {report.savingsRate}% dari total pemasukan
            </span>
            <span aria-hidden="true">·</span>
            <span>{report.netSavings >= 0 ? 'Surplus' : 'Defisit'}</span>
          </div>
        </div>

      </div>

      {/* Rincian Pengeluaran Berdasarkan Kategori */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Distribusi Pengeluaran per Kategori
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Alokasi dan persentase penggunaan dana pada {report.monthName}
            </p>
          </div>
          <span className="text-xs font-mono font-medium text-slate-500">
            Total: {formatIDR(report.totalExpense)}
          </span>
        </div>

        {report.categoryBreakdown.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            Belum ada catatan pengeluaran pada bulan ini.
          </div>
        ) : (
          <div className="space-y-3.5">
            {report.categoryBreakdown.map((item) => (
              <div key={item.categoryId} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-medium text-slate-800">
                      {item.categoryName}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-slate-500">
                      {item.percentage}%
                    </span>
                    <span className="font-mono font-semibold text-slate-900">
                      {formatIDR(item.total)}
                    </span>
                  </div>
                </div>

                {/* Visual Bar */}
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${item.percentage}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Top 5 Pengeluaran Terbesar Bulan Ini */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5">
        <h2 className="text-base font-bold text-slate-900 mb-1">
          Pengeluaran Terbesar Bulan Ini
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          Daftar pengeluaran dengan nominal tertinggi yang terjadi pada {report.monthName}
        </p>

        {report.topExpenses.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-400">
            Tidak ada data transaksi.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {report.topExpenses.map((tx, idx) => (
              <div key={tx.id} className="py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-slate-400 w-4">
                    0{idx + 1}.
                  </span>
                  <div>
                    <div className="text-xs sm:text-sm font-semibold text-slate-800">
                      {tx.note || tx.categoryName}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                      <span>{tx.categoryName}</span>
                      <span aria-hidden="true">·</span>
                      <span>{formatDateIndo(tx.date, 'short')}</span>
                      <span aria-hidden="true">·</span>
                      <span>{tx.accountName}</span>
                    </div>
                  </div>
                </div>
                <div className="text-sm font-bold font-mono text-rose-600">
                  -{formatIDR(tx.amount)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
