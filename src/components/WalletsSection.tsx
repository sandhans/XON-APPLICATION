import React, { useState } from 'react';
import { Account, AccountType, Transaction } from '../types/finance';
import { formatIDR } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';
import { Plus, Wallet, Building2, Landmark, Smartphone, Edit2, Trash2, X, ArrowLeftRight } from 'lucide-react';

interface WalletsSectionProps {
  accounts: Account[];
  transactions: Transaction[];
  onAddAccount: (account: Omit<Account, 'id'>) => void;
  onUpdateAccount: (id: string, updated: Partial<Account>) => void;
  onDeleteAccount: (id: string) => void;
  onOpenTransferModal: () => void;
}

export const WalletsSection: React.FC<WalletsSectionProps> = ({
  accounts,
  transactions,
  onAddAccount,
  onUpdateAccount,
  onDeleteAccount,
  onOpenTransferModal,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('bank');
  const [initialBalance, setInitialBalance] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [color, setColor] = useState('#0060AF');
  const [error, setError] = useState('');

  const handleOpenAdd = () => {
    setEditingAccount(null);
    setName('');
    setType('bank');
    setInitialBalance('');
    setAccountNumber('');
    setColor('#0060AF');
    setError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (acc: Account) => {
    setEditingAccount(acc);
    setName(acc.name);
    setType(acc.type);
    setInitialBalance(acc.currentBalance.toString());
    setAccountNumber(acc.accountNumber || '');
    setColor(acc.color);
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Nama dompet/rekening harus diisi');
      return;
    }
    const cleanBal = initialBalance.replace(/\D/g, '');
    const balNum = cleanBal ? Number(cleanBal) : 0;

    let icon = 'Wallet';
    if (type === 'bank') icon = 'Building2';
    if (type === 'ewallet') icon = 'Smartphone';
    if (type === 'investment') icon = 'TrendingUp';

    if (editingAccount) {
      onUpdateAccount(editingAccount.id, {
        name: name.trim(),
        type,
        currentBalance: balNum,
        accountNumber: accountNumber.trim() || undefined,
        color,
        icon,
      });
    } else {
      onAddAccount({
        name: name.trim(),
        type,
        initialBalance: balNum,
        currentBalance: balNum,
        accountNumber: accountNumber.trim() || undefined,
        color,
        icon,
      });
    }

    setIsModalOpen(false);
  };

  const totalAllWallets = accounts.reduce((acc, a) => acc + a.currentBalance, 0);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>Aset & Likuiditas</span>
            <span aria-hidden="true">·</span>
            <span>Semua Rekening</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Dompet & Rekening Keuangan
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Pantau saldo kas fisik, rekening bank konvensional, e-wallet, dan pos dana Anda.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenTransferModal}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-xs transition-colors whitespace-nowrap"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-blue-600" />
            <span>Transfer Dana</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg shadow-sm transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Rekening</span>
          </button>
        </div>
      </div>

      {/* Total Balance Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-6 rounded-2xl shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
            Total Kekayaan Likuid
          </span>
          <div className="text-3xl font-extrabold font-mono tracking-tight mt-1 text-white">
            {formatIDR(totalAllWallets)}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-2">
            <span>{accounts.length} Akun / Dompet Terhubung</span>
            <span aria-hidden="true">·</span>
            <span>Real-time terupdate</span>
          </div>
        </div>
      </div>

      {/* Wallets Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {accounts.map((acc) => {
          return (
            <div
              key={acc.id}
              className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: acc.color }}
                  >
                    <CategoryIcon name={acc.icon} className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(acc)}
                      className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"
                      title="Ubah Dompet"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {accounts.length > 1 && (
                      <button
                        onClick={() => {
                          const conf = window.confirm(`Hapus dompet "${acc.name}"?`);
                          if (conf) onDeleteAccount(acc.id);
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                        title="Hapus Dompet"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <h3 className="text-sm font-bold text-slate-900 leading-tight">
                  {acc.name}
                </h3>
                {acc.accountNumber && (
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                    {acc.accountNumber}
                  </p>
                )}
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-medium block">
                  Saldo Sekarang
                </span>
                <span className="text-lg font-bold font-mono text-slate-900 block mt-0.5">
                  {formatIDR(acc.currentBalance)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Tambah / Edit Dompet */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-slate-200 p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingAccount ? 'Ubah Dompet / Rekening' : 'Tambah Rekening Baru'}
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
                  Nama Dompet / Bank
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Bank BCA, GoPay, Dompet Tunai, Bibit..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Jenis Akun
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as AccountType)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="bank">Rekening Bank</option>
                  <option value="ewallet">E-Wallet (GoPay, OVO, ShopeePay)</option>
                  <option value="cash">Uang Tunai / Kas Fisik</option>
                  <option value="investment">Investasi / Reksadana / Saham</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Nomor Rekening / HP (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: 8830192844 atau 08123456789"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  {editingAccount ? 'Sesuaikan Saldo (Rp)' : 'Saldo Awal (Rp)'}
                </label>
                <div className="relative rounded-xl border border-slate-200 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all bg-white px-3 py-2">
                  <div className="flex items-baseline">
                    <span className="text-sm font-bold text-slate-400 mr-2">Rp</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="0"
                      value={initialBalance ? new Intl.NumberFormat('id-ID').format(Number(initialBalance.replace(/\D/g, ''))) : ''}
                      onChange={(e) => setInitialBalance(e.target.value)}
                      className="w-full text-lg font-bold font-mono text-slate-900 focus:outline-none bg-transparent"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Pilih Warna Lambang
                </label>
                <div className="flex items-center gap-2">
                  {['#0060AF', '#003366', '#00AA13', '#16A34A', '#D97706', '#9333EA', '#DC2626', '#0F172A'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-6 h-6 rounded-full transition-transform ${
                        color === c ? 'scale-125 ring-2 ring-slate-900' : ''
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
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
                  Simpan Rekening
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
