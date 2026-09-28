import React, { useState, useMemo } from 'react';
import { Account, Category, FilterOptions, Transaction } from '../types/finance';
import { formatIDR, formatDateIndo } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';
import { 
  Search, 
  Filter, 
  Trash2, 
  Edit3, 
  ArrowDownLeft, 
  ArrowUpRight, 
  ArrowLeftRight,
  Receipt,
  Plus
} from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onOpenAddModal: () => void;
  selectedMonth?: string;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  categories,
  accounts,
  onEditTransaction,
  onDeleteTransaction,
  onOpenAddModal,
  selectedMonth,
}) => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense' | 'transfer'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [accountFilter, setAccountFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc'>('date_desc');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Filter & Sort logic
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((tx) => {
        // Month filter if provided
        if (selectedMonth && !tx.date.startsWith(selectedMonth)) {
          return false;
        }

        // Type filter
        if (typeFilter !== 'all' && tx.type !== typeFilter) {
          return false;
        }

        // Category filter
        if (categoryFilter !== 'all' && tx.categoryId !== categoryFilter) {
          return false;
        }

        // Account filter
        if (accountFilter !== 'all' && tx.accountId !== accountFilter && tx.toAccountId !== accountFilter) {
          return false;
        }

        // Search text
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchNote = tx.note.toLowerCase().includes(q);
          const matchCategory = tx.categoryName.toLowerCase().includes(q);
          const matchAccount = tx.accountName.toLowerCase().includes(q);
          return matchNote || matchCategory || matchAccount;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date_desc') {
          return new Date(b.date).getTime() - new Date(a.date).getTime() || b.createdAt - a.createdAt;
        }
        if (sortBy === 'date_asc') {
          return new Date(a.date).getTime() - new Date(b.date).getTime() || a.createdAt - b.createdAt;
        }
        if (sortBy === 'amount_desc') {
          return b.amount - a.amount;
        }
        if (sortBy === 'amount_asc') {
          return a.amount - b.amount;
        }
        return 0;
      });
  }, [transactions, selectedMonth, typeFilter, categoryFilter, accountFilter, search, sortBy]);

  const categoryMap = useMemo(() => {
    const map = new Map<string, Category>();
    categories.forEach((c) => map.set(c.id, c));
    return map;
  }, [categories]);

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
      
      {/* Filter and Search Bar */}
      <div className="p-4 border-b border-slate-100 space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          
          {/* Live Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari transaksi, catatan, atau akun..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          {/* Interactive filter tabs (Segmented controls) */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg shrink-0 overflow-x-auto no-scrollbar">
            {(
              [
                { id: 'all', label: 'Semua' },
                { id: 'expense', label: 'Pengeluaran' },
                { id: 'income', label: 'Pemasukan' },
                { id: 'transfer', label: 'Transfer' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setTypeFilter(tab.id)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  typeFilter === tab.id
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

        </div>

        {/* Secondary Filters row */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-600">
          
          {/* Category Filter */}
          <select
            aria-label="Filter Berdasarkan Kategori"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs"
          >
            <option value="all">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.type === 'income' ? 'Masuk' : 'Keluar'})
              </option>
            ))}
          </select>

          {/* Account Filter */}
          <select
            aria-label="Filter Berdasarkan Dompet"
            value={accountFilter}
            onChange={(e) => setAccountFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs"
          >
            <option value="all">Semua Dompet</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>

          {/* Sort By */}
          <select
            aria-label="Urutkan Transaksi"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs"
          >
            <option value="date_desc">Tanggal: Terbaru</option>
            <option value="date_asc">Tanggal: Terlama</option>
            <option value="amount_desc">Nominal: Terbesar</option>
            <option value="amount_asc">Nominal: Terkecil</option>
          </select>

          {(search || typeFilter !== 'all' || categoryFilter !== 'all' || accountFilter !== 'all') && (
            <button
              onClick={() => {
                setSearch('');
                setTypeFilter('all');
                setCategoryFilter('all');
                setAccountFilter('all');
              }}
              className="text-xs text-rose-600 hover:text-rose-700 font-medium px-2 py-1"
            >
              Reset Filter
            </button>
          )}

          <div className="ml-auto text-xs text-slate-400">
            {filteredTransactions.length} transaksi
          </div>
        </div>
      </div>

      {/* Transactions Table / List */}
      {filteredTransactions.length === 0 ? (
        <div className="py-16 px-4 text-center">
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Receipt className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900 mb-1">
            Belum ada transaksi
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
            {search || typeFilter !== 'all'
              ? 'Tidak ada transaksi yang cocok dengan kriteria pencarian atau filter yang dipilih.'
              : 'Mulai catat transaksi pengeluaran atau pemasukan harian Anda agar keuangan lebih terpantau.'}
          </p>
          <button
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Catat Transaksi Pertama</span>
          </button>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 overflow-x-auto">
          {filteredTransactions.map((tx) => {
            const cat = categoryMap.get(tx.categoryId);
            const isExpense = tx.type === 'expense';
            const isIncome = tx.type === 'income';
            const isTransfer = tx.type === 'transfer';

            return (
              <div
                key={tx.id}
                className="flex items-center justify-between p-3.5 sm:px-5 hover:bg-slate-50/70 transition-colors group"
              >
                {/* Left: Category Icon & Details */}
                <div className="flex items-center gap-3 min-w-0 pr-4">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor: isTransfer ? '#EFF6FF' : cat?.bgLight || '#F1F5F9',
                      color: isTransfer ? '#2563EB' : cat?.color || '#475569',
                    }}
                  >
                    {isTransfer ? (
                      <ArrowLeftRight className="w-4 h-4" />
                    ) : (
                      <CategoryIcon name={cat?.icon || 'CircleDollarSign'} className="w-4 h-4" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-semibold text-slate-900 truncate">
                        {tx.note || tx.categoryName}
                      </span>
                    </div>
                    {/* Zero-pill metadata with subtle separators */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5 truncate">
                      <span>{tx.categoryName}</span>
                      <span aria-hidden="true">·</span>
                      <span>
                        {isTransfer ? `${tx.accountName} → ${tx.toAccountName}` : tx.accountName}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{formatDateIndo(tx.date, 'short')}</span>
                      {tx.time && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>{tx.time}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Amount & Actions */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <div
                      className={`text-sm sm:text-base font-bold font-mono tracking-tight ${
                        isIncome
                          ? 'text-emerald-600'
                          : isExpense
                          ? 'text-rose-600'
                          : 'text-blue-600'
                      }`}
                    >
                      {isIncome && '+'}
                      {isExpense && '-'}
                      {formatIDR(tx.amount)}
                    </div>
                  </div>

                  {/* Actions (visible on hover / touch) */}
                  <div className="flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onEditTransaction(tx)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-md transition-colors"
                      title="Ubah Transaksi"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    {deleteConfirmId === tx.id ? (
                      <div className="flex items-center gap-1 bg-rose-50 p-1 rounded-md">
                        <button
                          onClick={() => {
                            onDeleteTransaction(tx.id);
                            setDeleteConfirmId(null);
                          }}
                          className="px-2 py-0.5 text-[11px] font-medium text-white bg-rose-600 hover:bg-rose-700 rounded transition-colors"
                        >
                          Hapus
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-1.5 py-0.5 text-[11px] text-slate-600 hover:text-slate-900"
                        >
                          Batal
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirmId(tx.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                        title="Hapus Transaksi"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
