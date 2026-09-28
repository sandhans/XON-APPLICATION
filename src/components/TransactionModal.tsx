import React, { useState, useEffect } from 'react';
import { Account, Category, Transaction, TransactionType } from '../types/finance';
import { formatIDR, getTodayDateStr, getCurrentTimeStr } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';
import { X, ArrowDownLeft, ArrowUpRight, ArrowLeftRight, Check, Plus } from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transactionData: Omit<Transaction, 'id' | 'createdAt'>, existingId?: string) => void;
  categories: Category[];
  accounts: Account[];
  initialTransaction?: Transaction | null;
  onOpenCreateCategory?: (type: 'income' | 'expense') => void;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  categories,
  accounts,
  initialTransaction,
  onOpenCreateCategory,
}) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState<number>(0);
  const [amountInput, setAmountInput] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [accountId, setAccountId] = useState<string>('');
  const [toAccountId, setToAccountId] = useState<string>('');
  const [date, setDate] = useState<string>(getTodayDateStr());
  const [time, setTime] = useState<string>(getCurrentTimeStr());
  const [note, setNote] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (initialTransaction) {
      setType(initialTransaction.type);
      setAmount(initialTransaction.amount);
      setAmountInput(initialTransaction.amount.toString());
      setCategoryId(initialTransaction.categoryId);
      setAccountId(initialTransaction.accountId);
      setToAccountId(initialTransaction.toAccountId || '');
      setDate(initialTransaction.date);
      setTime(initialTransaction.time || getCurrentTimeStr());
      setNote(initialTransaction.note);
    } else {
      // Default reset
      setType('expense');
      setAmount(0);
      setAmountInput('');
      setDate(getTodayDateStr());
      setTime(getCurrentTimeStr());
      setNote('');
      setError('');

      // Set default account
      if (accounts.length > 0) {
        setAccountId(accounts[0].id);
        if (accounts.length > 1) {
          setToAccountId(accounts[1].id);
        }
      }
    }
  }, [initialTransaction, isOpen, accounts]);

  // Filter categories by transaction type
  const filteredCategories = categories.filter((c) => {
    if (type === 'transfer') return false;
    return c.type === type;
  });

  // Ensure selected category is valid for current type
  useEffect(() => {
    if (type !== 'transfer') {
      const match = filteredCategories.find((c) => c.id === categoryId);
      if (!match && filteredCategories.length > 0) {
        setCategoryId(filteredCategories[0].id);
      }
    }
  }, [type, filteredCategories, categoryId]);

  if (!isOpen) return null;

  const handleAmountChange = (val: string) => {
    // Only numbers
    const clean = val.replace(/\D/g, '');
    const num = clean ? parseInt(clean, 10) : 0;
    setAmount(num);
    setAmountInput(clean);
  };

  const addPresetAmount = (addVal: number) => {
    const newAmt = (amount || 0) + addVal;
    setAmount(newAmt);
    setAmountInput(newAmt.toString());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount <= 0) {
      setError('Nominal harus lebih dari 0');
      return;
    }

    if (!accountId) {
      setError('Pilih rekening/dompet');
      return;
    }

    if (type === 'transfer') {
      if (!toAccountId || toAccountId === accountId) {
        setError('Pilih dompet tujuan transfer yang berbeda');
        return;
      }
    } else if (!categoryId) {
      setError('Pilih kategori');
      return;
    }

    const account = accounts.find((a) => a.id === accountId);
    const toAccount = accounts.find((a) => a.id === toAccountId);
    const category = categories.find((c) => c.id === categoryId);

    onSave(
      {
        type,
        amount,
        categoryId: type === 'transfer' ? 'transfer' : categoryId,
        categoryName: type === 'transfer' ? 'Transfer Antar Akun' : category?.name || 'Lainnya',
        accountId,
        accountName: account?.name || 'Akun',
        toAccountId: type === 'transfer' ? toAccountId : undefined,
        toAccountName: type === 'transfer' ? toAccount?.name : undefined,
        date,
        time,
        note: note.trim() || (type === 'transfer' ? `Transfer ke ${toAccount?.name}` : category?.name || 'Transaksi'),
      },
      initialTransaction?.id
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">
            {initialTransaction ? 'Ubah Transaksi' : 'Catat Transaksi Baru'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Transaction Type Segmented Switch */}
          <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-lg transition-all ${
                type === 'expense'
                  ? 'bg-white text-rose-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Pengeluaran</span>
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-lg transition-all ${
                type === 'income'
                  ? 'bg-white text-emerald-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowDownLeft className="w-3.5 h-3.5" />
              <span>Pemasukan</span>
            </button>
            <button
              type="button"
              onClick={() => setType('transfer')}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-lg transition-all ${
                type === 'transfer'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>Transfer</span>
            </button>
          </div>

          {/* Amount Display & Input */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Nominal Transaksi (Rupiah)
            </label>
            <div className="relative rounded-xl border border-slate-200 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all bg-white px-3.5 py-2.5">
              <div className="flex items-baseline">
                <span className="text-lg font-bold text-slate-400 mr-2">Rp</span>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  value={amountInput ? new Intl.NumberFormat('id-ID').format(Number(amountInput)) : ''}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  className="w-full text-2xl font-bold font-mono text-slate-900 focus:outline-none bg-transparent"
                  autoFocus
                />
              </div>
            </div>

            {/* Quick preset chips */}
            <div className="flex items-center gap-1.5 mt-2 overflow-x-auto no-scrollbar py-0.5">
              {[20000, 50000, 100000, 500000, 1000000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => addPresetAmount(preset)}
                  className="px-2.5 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors whitespace-nowrap"
                >
                  +{formatIDR(preset, true)}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setAmount(0);
                  setAmountInput('');
                }}
                className="px-2 py-1 text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Category Selector (If not transfer) */}
          {type !== 'transfer' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-slate-500">
                  Kategori
                </label>
                {onOpenCreateCategory && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenCreateCategory(type);
                    }}
                    className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Tambah Kategori Baru</span>
                  </button>
                )}
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-40 overflow-y-auto p-1 border border-slate-100 rounded-xl bg-slate-50/50">
                {filteredCategories.map((cat) => {
                  const isSelected = categoryId === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategoryId(cat.id)}
                      className={`flex flex-col items-center justify-center p-2 rounded-lg text-center transition-all ${
                        isSelected
                          ? 'bg-white shadow-xs border border-emerald-500 text-emerald-700 ring-1 ring-emerald-500'
                          : 'bg-white/60 hover:bg-white text-slate-600 border border-slate-200/60'
                      }`}
                    >
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center mb-1"
                        style={{ backgroundColor: cat.bgLight, color: cat.color }}
                      >
                        <CategoryIcon name={cat.icon} className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-[11px] font-medium leading-tight truncate w-full">
                        {cat.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Accounts / Wallets */}
          {type === 'transfer' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Dari Dompet
                </label>
                <select
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({formatIDR(acc.currentBalance)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Ke Dompet Tujuan
                </label>
                <select
                  value={toAccountId}
                  onChange={(e) => setToAccountId(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id} disabled={acc.id === accountId}>
                      {acc.name} ({formatIDR(acc.currentBalance)})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Dompet / Rekening Pembayaran
              </label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} — Saldo: {formatIDR(acc.currentBalance)}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Tanggal
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Waktu
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          {/* Note / Description */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Catatan / Keterangan
            </label>
            <input
              type="text"
              placeholder="Contoh: Makan siang warteg, beli token listrik, bayar tagihan..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          {error && (
            <div className="text-xs font-medium text-rose-600 bg-rose-50 px-3 py-2 rounded-lg">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg shadow-sm transition-colors"
            >
              Simpan Transaksi
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
