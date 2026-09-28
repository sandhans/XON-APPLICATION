import React from 'react';
import { formatIDR } from '../utils/formatters';
import { Wallet, ArrowDownLeft, ArrowUpRight, PiggyBank } from 'lucide-react';

interface SummaryCardsProps {
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
  savingsRate: number;
  transactionCount: number;
  monthName: string;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  totalBalance,
  totalIncome,
  totalExpense,
  netSavings,
  savingsRate,
  transactionCount,
  monthName,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Saldo Bersih */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Total Saldo Aktif</span>
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
            <Wallet className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-bold font-mono tracking-tight text-slate-900">
            {formatIDR(totalBalance)}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2">
            <span>Semua Akun & Dompet</span>
            <span aria-hidden="true">·</span>
            <span>Kas Tersedia</span>
          </div>
        </div>
      </div>

      {/* 2. Total Pemasukan Bulan Ini */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-medium uppercase tracking-wider text-emerald-600">Pemasukan Bulan Ini</span>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
            <ArrowDownLeft className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-bold font-mono tracking-tight text-emerald-600">
            +{formatIDR(totalIncome)}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2">
            <span>{monthName}</span>
            <span aria-hidden="true">·</span>
            <span>Uang Masuk</span>
          </div>
        </div>
      </div>

      {/* 3. Total Pengeluaran Bulan Ini */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-medium uppercase tracking-wider text-rose-600">Pengeluaran Bulan Ini</span>
          <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-bold font-mono tracking-tight text-rose-600">
            -{formatIDR(totalExpense)}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2">
            <span>{monthName}</span>
            <span aria-hidden="true">·</span>
            <span>Uang Keluar</span>
          </div>
        </div>
      </div>

      {/* 4. Arus Kas Bersih / Tabungan */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Sisa / Arus Kas Bersih</span>
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
            <PiggyBank className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className={`text-2xl font-bold font-mono tracking-tight ${
            netSavings >= 0 ? 'text-slate-900' : 'text-rose-600'
          }`}>
            {formatIDR(netSavings)}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2">
            <span className={netSavings >= 0 ? 'text-emerald-600 font-medium' : 'text-rose-600 font-medium'}>
              {savingsRate}% tersimpan
            </span>
            <span aria-hidden="true">·</span>
            <span>{transactionCount} transaksi</span>
          </div>
        </div>
      </div>
    </div>
  );
};
