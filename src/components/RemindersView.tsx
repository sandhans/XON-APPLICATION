import React, { useState, useMemo } from 'react';
import { Account, BillReminder, Category } from '../types/finance';
import { formatIDR, formatDateIndo, getTodayDateStr } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';
import { 
  Bell, 
  Plus, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Trash2, 
  Edit3, 
  Check, 
  X,
  CreditCard,
  Repeat
} from 'lucide-react';

interface RemindersViewProps {
  reminders: BillReminder[];
  categories: Category[];
  accounts: Account[];
  onSaveReminder: (reminderData: Omit<BillReminder, 'id' | 'createdAt'>, existingId?: string) => void;
  onDeleteReminder: (id: string) => void;
  onPayReminder: (reminder: BillReminder, payAccountId: string) => void;
  onUnpayReminder: (id: string) => void;
}

export const RemindersView: React.FC<RemindersViewProps> = ({
  reminders,
  categories,
  accounts,
  onSaveReminder,
  onDeleteReminder,
  onPayReminder,
  onUnpayReminder,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<BillReminder | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'paid'>('pending');

  // Form states for modal
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [amountInput, setAmountInput] = useState('');
  const [dueDate, setDueDate] = useState(getTodayDateStr());
  const [categoryId, setCategoryId] = useState('');
  const [accountId, setAccountId] = useState('');
  const [repeat, setRepeat] = useState<'once' | 'monthly' | 'weekly' | 'yearly'>('monthly');
  const [remindDaysBefore, setRemindDaysBefore] = useState<number>(3);
  const [note, setNote] = useState('');
  const [formError, setFormError] = useState('');

  // Pay confirmation modal state
  const [payingReminder, setPayingReminder] = useState<BillReminder | null>(null);
  const [selectedPayAccount, setSelectedPayAccount] = useState<string>('');

  const todayStr = getTodayDateStr();

  // Open modal for new reminder
  const handleOpenNew = () => {
    setEditingReminder(null);
    setTitle('');
    setAmount(0);
    setAmountInput('');
    setDueDate(getTodayDateStr());
    setCategoryId(categories.find((c) => c.type === 'expense')?.id || '');
    setAccountId(accounts[0]?.id || '');
    setRepeat('monthly');
    setRemindDaysBefore(3);
    setNote('');
    setFormError('');
    setIsModalOpen(true);
  };

  // Open modal for editing
  const handleOpenEdit = (rem: BillReminder) => {
    setEditingReminder(rem);
    setTitle(rem.title);
    setAmount(rem.amount);
    setAmountInput(rem.amount.toString());
    setDueDate(rem.dueDate);
    setCategoryId(rem.categoryId);
    setAccountId(rem.accountId || accounts[0]?.id || '');
    setRepeat(rem.repeat);
    setRemindDaysBefore(rem.remindDaysBefore);
    setNote(rem.note || '');
    setFormError('');
    setIsModalOpen(true);
  };

  // Check due urgency
  const getDueStatus = (dueDateStr: string, isPaid: boolean) => {
    if (isPaid) {
      return { status: 'paid', text: 'Sudah Lunas', color: 'text-emerald-700 bg-emerald-50' };
    }

    const today = new Date(todayStr);
    const due = new Date(dueDateStr);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        status: 'overdue',
        text: `Lewat ${Math.abs(diffDays)} hari`,
        color: 'text-rose-700 bg-rose-50 border-rose-200',
        badge: 'Terlambat',
      };
    }
    if (diffDays === 0) {
      return {
        status: 'today',
        text: 'Jatuh tempo hari ini',
        color: 'text-amber-700 bg-amber-50 border-amber-200',
        badge: 'Hari Ini',
      };
    }
    if (diffDays <= 3) {
      return {
        status: 'urgent',
        text: `${diffDays} hari lagi`,
        color: 'text-amber-700 bg-amber-50 border-amber-200',
        badge: 'Segera',
      };
    }
    return {
      status: 'upcoming',
      text: `${diffDays} hari lagi`,
      color: 'text-slate-600 bg-slate-50 border-slate-200',
      badge: 'Mendatang',
    };
  };

  // Filter reminders
  const pendingReminders = useMemo(() => {
    return reminders
      .filter((r) => !r.isPaid)
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [reminders]);

  const paidReminders = useMemo(() => {
    return reminders
      .filter((r) => r.isPaid)
      .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
  }, [reminders]);

  // Urgent reminders (due today or in next few days or overdue)
  const urgentReminders = useMemo(() => {
    return pendingReminders.filter((r) => {
      const today = new Date(todayStr);
      const due = new Date(r.dueDate);
      const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays <= r.remindDaysBefore;
    });
  }, [pendingReminders, todayStr]);

  const totalPendingAmount = useMemo(() => {
    return pendingReminders.reduce((acc, curr) => acc + curr.amount, 0);
  }, [pendingReminders]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError('Nama tagihan harus diisi');
      return;
    }
    if (!amount || amount <= 0) {
      setFormError('Nominal harus lebih dari 0');
      return;
    }

    const cat = categories.find((c) => c.id === categoryId);

    onSaveReminder(
      {
        title: title.trim(),
        amount,
        categoryId: categoryId || 'cat_bills',
        categoryName: cat?.name || 'Tagihan & Utilitas',
        dueDate,
        repeat,
        remindDaysBefore: Number(remindDaysBefore),
        isPaid: editingReminder ? editingReminder.isPaid : false,
        accountId: accountId || accounts[0]?.id,
        note: note.trim(),
      },
      editingReminder?.id
    );

    setIsModalOpen(false);
  };

  // Confirm payment
  const handleConfirmPayment = () => {
    if (payingReminder) {
      onPayReminder(payingReminder, selectedPayAccount || payingReminder.accountId || accounts[0]?.id);
      setPayingReminder(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>Manajemen Tagihan</span>
            <span aria-hidden="true">·</span>
            <span>Pengingat Otomatis</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Pengingat Pembayaran & Tagihan Rutin
          </h1>
        </div>

        <button
          onClick={handleOpenNew}
          className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg shadow-sm transition-colors whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Atur Tagihan Baru</span>
        </button>
      </div>

      {/* Urgent Alert Banner (Notification before due date) */}
      {urgentReminders.length > 0 && (
        <div className="bg-amber-50/90 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
            <Bell className="w-4 h-4 animate-bounce" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-amber-900">
              Perhatian: Ada {urgentReminders.length} tagihan yang mendekati tanggal jatuh tempo!
            </h3>
            <p className="text-xs text-amber-800/90 mt-0.5">
              Pastikan saldo mencukupi untuk tagihan: {urgentReminders.map((r) => r.title).join(', ')}.
            </p>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Total Tagihan Belum Dibayar</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono tracking-tight text-slate-900">
            {formatIDR(totalPendingAmount)}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2">
            <span>{pendingReminders.length} tagihan aktif</span>
            <span aria-hidden="true">·</span>
            <span>Wajib dilunasi</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-amber-600">Jatuh Tempo Segera</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono tracking-tight text-amber-600">
            {urgentReminders.length}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2">
            <span>Sesuai batas notifikasi pengingat</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-emerald-600">Riwayat Lunas</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono tracking-tight text-emerald-600">
            {paidReminders.length}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2">
            <span>Sudah diselesaikan</span>
          </div>
        </div>

      </div>

      {/* Main Tab Controls & Reminder List */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        
        {/* Tabs */}
        <div className="flex items-center gap-2 p-3 border-b border-slate-100 bg-slate-50/50">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'pending'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Belum Dibayar ({pendingReminders.length})
          </button>
          <button
            onClick={() => setActiveTab('paid')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'paid'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sudah Dibayar ({paidReminders.length})
          </button>
        </div>

        {/* Content */}
        {activeTab === 'pending' ? (
          pendingReminders.length === 0 ? (
            <div className="py-16 text-center px-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900 mb-1">
                Semua Tagihan Sudah Lunas!
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                Tidak ada tagihan yang tertunda saat ini. Anda dapat menambahkan tagihan atau pembayaran rutin baru.
              </p>
              <button
                onClick={handleOpenNew}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Atur Tagihan Baru</span>
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {pendingReminders.map((rem) => {
                const dueInfo = getDueStatus(rem.dueDate, false);
                const cat = categories.find((c) => c.id === rem.categoryId);
                const account = accounts.find((a) => a.id === rem.accountId);

                return (
                  <div
                    key={rem.id}
                    className="p-4 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
                  >
                    {/* Left: Info */}
                    <div className="flex items-start gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                        style={{ backgroundColor: cat?.bgLight || '#F1F5F9', color: cat?.color || '#475569' }}
                      >
                        <CategoryIcon name={cat?.icon || 'Receipt'} className="w-5 h-5" />
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900">
                            {rem.title}
                          </h4>
                          {/* Zero-pill status text */}
                          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${dueInfo.color}`}>
                            {dueInfo.text}
                          </span>
                        </div>

                        {/* Unboxed Metadata with separators */}
                        <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 mt-1">
                          <span>Jatuh tempo: {formatDateIndo(rem.dueDate, 'short')}</span>
                          <span aria-hidden="true">·</span>
                          <span>{rem.categoryName}</span>
                          <span aria-hidden="true">·</span>
                          <span>{account?.name || 'Dompet'}</span>
                          <span aria-hidden="true">·</span>
                          <span>
                            {rem.repeat === 'monthly'
                              ? 'Bulanan'
                              : rem.repeat === 'weekly'
                              ? 'Mingguan'
                              : rem.repeat === 'yearly'
                              ? 'Tahunan'
                              : 'Sekali'}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>Ingatkan H-{rem.remindDaysBefore}</span>
                        </div>

                        {rem.note && (
                          <div className="text-xs text-slate-400 mt-1 italic">
                            Catatan: {rem.note}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Nominal & Action Buttons */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-slate-100">
                      <div className="text-left sm:text-right">
                        <div className="text-base font-bold font-mono text-slate-900">
                          {formatIDR(rem.amount)}
                        </div>
                      </div>

                      {/* Pay CTA: 1-click Pay and record transaction */}
                      <button
                        onClick={() => {
                          setPayingReminder(rem);
                          setSelectedPayAccount(rem.accountId || accounts[0]?.id || '');
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg shadow-xs transition-colors whitespace-nowrap"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Tandai Lunas</span>
                      </button>

                      {/* Edit & Delete */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(rem)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Ubah Tagihan"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteReminder(rem.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Hapus Tagihan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                    </div>

                  </div>
                );
              })}
            </div>
          )
        ) : (
          paidReminders.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              Belum ada riwayat tagihan yang sudah dibayar.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {paidReminders.map((rem) => {
                const cat = categories.find((c) => c.id === rem.categoryId);
                return (
                  <div
                    key={rem.id}
                    className="p-4 sm:px-5 flex items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-900 line-through text-slate-500">
                          {rem.title}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                          <span>Jatuh tempo: {formatDateIndo(rem.dueDate, 'short')}</span>
                          <span aria-hidden="true">·</span>
                          <span>Lunas pada {rem.paidAt ? formatDateIndo(rem.paidAt.split('T')[0], 'short') : 'Bulan ini'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-sm font-mono font-semibold text-slate-600">
                        {formatIDR(rem.amount)}
                      </div>
                      <button
                        onClick={() => onUnpayReminder(rem.id)}
                        className="px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
                      >
                        Batal Lunas
                      </button>
                      <button
                        onClick={() => onDeleteReminder(rem.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                        title="Hapus"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}

      </div>

      {/* Modal: Atur Tagihan Rutin Baru / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">
                {editingReminder ? 'Ubah Tagihan' : 'Atur Tagihan / Pembayaran Rutin'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Nama Tagihan / Pembayaran
                </label>
                <input
                  type="text"
                  placeholder="Contoh: WiFi Indihome, Listrik PLN, BPJS, Spotify..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Nominal Pembayaran (Rp)
                </label>
                <div className="relative rounded-xl border border-slate-200 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all bg-white px-3 py-2">
                  <div className="flex items-baseline">
                    <span className="text-sm font-bold text-slate-400 mr-2">Rp</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="0"
                      value={amountInput ? new Intl.NumberFormat('id-ID').format(Number(amountInput)) : ''}
                      onChange={(e) => {
                        const clean = e.target.value.replace(/\D/g, '');
                        setAmount(clean ? parseInt(clean, 10) : 0);
                        setAmountInput(clean);
                      }}
                      className="w-full text-lg font-bold font-mono text-slate-900 focus:outline-none bg-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">
                    Tanggal Jatuh Tempo
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">
                    Siklus Rutin
                  </label>
                  <select
                    value={repeat}
                    onChange={(e) => setRepeat(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="monthly">Setiap Bulan (Bulanan)</option>
                    <option value="weekly">Setiap Minggu</option>
                    <option value="yearly">Setiap Tahun (Tahunan)</option>
                    <option value="once">Sekali Bayar Saja</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">
                    Kategori
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  >
                    {categories.filter((c) => c.type === 'expense').map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">
                    Ingatkan Sebelumnya
                  </label>
                  <select
                    value={remindDaysBefore}
                    onChange={(e) => setRemindDaysBefore(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value={0}>Pada Hari Jatuh Tempo (H-0)</option>
                    <option value={1}>1 Hari Sebelumnya (H-1)</option>
                    <option value={2}>2 Hari Sebelumnya (H-2)</option>
                    <option value={3}>3 Hari Sebelumnya (H-3)</option>
                    <option value={7}>7 Hari Sebelumnya (H-7)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Dompet Rekomendasi Pembayaran
                </label>
                <select
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({formatIDR(a.currentBalance)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Catatan / Nomor Pelanggan (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: No Pelanggan 081234567, Bayar via m-BCA"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              {formError && (
                <div className="text-xs font-medium text-rose-600 bg-rose-50 px-3 py-2 rounded-lg">
                  {formError}
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
                  Simpan Tagihan
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Modal: Konfirmasi Pembayaran Tagihan & Otomatis Catat Transaksi */}
      {payingReminder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-slate-200 p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <Check className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-slate-900 mb-1">
              Pelunasan Tagihan
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Apakah Anda sudah membayar <strong>{payingReminder.title}</strong> sebesar{' '}
              <strong className="text-slate-900 font-mono">{formatIDR(payingReminder.amount)}</strong>?
              Sistem akan otomatis mencatat pengeluaran ini ke riwayat transaksi.
            </p>

            <div className="mb-5">
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Pilih Sumber Dana (Dompet)
              </label>
              <select
                value={selectedPayAccount}
                onChange={(e) => setSelectedPayAccount(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} — Saldo: {formatIDR(a.currentBalance)}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setPayingReminder(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmPayment}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
              >
                Ya, Catat & Tandai Lunas
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
