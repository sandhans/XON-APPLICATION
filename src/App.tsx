/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Account, 
  BillReminder, 
  Budget, 
  Category, 
  CategoryType, 
  MainView, 
  Transaction 
} from './types/finance';
import { 
  getStoredAccounts, 
  getStoredBudgets, 
  getStoredCategories, 
  getStoredReminders, 
  getStoredTransactions, 
  resetAllDataToDefault, 
  saveStoredAccounts, 
  saveStoredBudgets, 
  saveStoredCategories, 
  saveStoredReminders, 
  saveStoredTransactions 
} from './utils/storage';
import { getCurrentMonthStr, getMonthNameIndo, getTodayDateStr } from './utils/formatters';

// Components
import { Header } from './components/Header';
import { SummaryCards } from './components/SummaryCards';
import { TransactionList } from './components/TransactionList';
import { TransactionModal } from './components/TransactionModal';
import { MonthlyReportView } from './components/MonthlyReportView';
import { RemindersView } from './components/RemindersView';
import { CategoryManagerView } from './components/CategoryManagerView';
import { BudgetSection } from './components/BudgetSection';
import { WalletsSection } from './components/WalletsSection';
import { DashboardCharts } from './components/DashboardCharts';
import { ExportImportModal } from './components/ExportImportModal';
import { Database, Plus, ShieldCheck } from 'lucide-react';

export default function App() {
  // Primary State
  const [currentView, setCurrentView] = useState<MainView>('dashboard');
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonthStr());

  // Entity States
  const [transactions, setTransactions] = useState<Transaction[]>(() => getStoredTransactions());
  const [categories, setCategories] = useState<Category[]>(() => getStoredCategories());
  const [accounts, setAccounts] = useState<Account[]>(() => getStoredAccounts());
  const [budgets, setBudgets] = useState<Budget[]>(() => getStoredBudgets());
  const [reminders, setReminders] = useState<BillReminder[]>(() => getStoredReminders());

  // Guarantee clean zero state on initial load
  useEffect(() => {
    const isZeroApplied = localStorage.getItem('xon_finance_zero_init_v2');
    if (isZeroApplied === 'true' && (transactions.length > 0 || accounts.some((a) => a.initialBalance > 0))) {
      resetAllDataToDefault();
      setTransactions([]);
      setAccounts(getStoredAccounts());
      setBudgets([]);
      setReminders([]);
    }
  }, []);

  // Modals & UI States
  const [isAddTxModalOpen, setIsAddTxModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isDataModalOpen, setIsDataModalOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    saveStoredTransactions(transactions);
  }, [transactions]);

  useEffect(() => {
    saveStoredCategories(categories);
  }, [categories]);

  useEffect(() => {
    saveStoredAccounts(accounts);
  }, [accounts]);

  useEffect(() => {
    saveStoredBudgets(budgets);
  }, [budgets]);

  useEffect(() => {
    saveStoredReminders(reminders);
  }, [reminders]);

  // Recalculate account balances based on transactions & initial balances
  // This guarantees complete data integrity
  const synchronizedAccounts = useMemo(() => {
    const balanceAdjustments: Record<string, number> = {};

    transactions.forEach((tx) => {
      if (tx.type === 'income') {
        balanceAdjustments[tx.accountId] = (balanceAdjustments[tx.accountId] || 0) + tx.amount;
      } else if (tx.type === 'expense') {
        balanceAdjustments[tx.accountId] = (balanceAdjustments[tx.accountId] || 0) - tx.amount;
      } else if (tx.type === 'transfer') {
        balanceAdjustments[tx.accountId] = (balanceAdjustments[tx.accountId] || 0) - tx.amount;
        if (tx.toAccountId) {
          balanceAdjustments[tx.toAccountId] = (balanceAdjustments[tx.toAccountId] || 0) + tx.amount;
        }
      }
    });

    return accounts.map((acc) => ({
      ...acc,
      currentBalance: acc.initialBalance + (balanceAdjustments[acc.id] || 0),
    }));
  }, [accounts, transactions]);

  // Summary statistics for selected month
  const stats = useMemo(() => {
    let income = 0;
    let expense = 0;
    let count = 0;

    transactions.forEach((tx) => {
      if (tx.date.startsWith(selectedMonth)) {
        count += 1;
        if (tx.type === 'income') income += tx.amount;
        if (tx.type === 'expense') expense += tx.amount;
      }
    });

    const net = income - expense;
    const rate = income > 0 ? Math.max(0, Math.round((net / income) * 100)) : 0;
    const totalBal = synchronizedAccounts.reduce((acc, a) => acc + a.currentBalance, 0);

    return {
      totalBalance: totalBal,
      totalIncome: income,
      totalExpense: expense,
      netSavings: net,
      savingsRate: rate,
      transactionCount: count,
      monthName: getMonthNameIndo(selectedMonth),
    };
  }, [transactions, selectedMonth, synchronizedAccounts]);

  // Notification count: pending reminders due today or soon
  const upcomingRemindersCount = useMemo(() => {
    const today = new Date(getTodayDateStr());
    return reminders.filter((r) => {
      if (r.isPaid) return false;
      const due = new Date(r.dueDate);
      const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays <= r.remindDaysBefore;
    }).length;
  }, [reminders]);

  // 1. Transaction Handlers
  const handleSaveTransaction = (
    txData: Omit<Transaction, 'id' | 'createdAt'>,
    existingId?: string
  ) => {
    if (existingId) {
      setTransactions((prev) =>
        prev.map((t) => (t.id === existingId ? { ...t, ...txData } : t))
      );
    } else {
      const newTx: Transaction = {
        ...txData,
        id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        createdAt: Date.now(),
      };
      setTransactions((prev) => [newTx, ...prev]);
    }
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const handleEditTransaction = (tx: Transaction) => {
    setEditingTransaction(tx);
    setIsAddTxModalOpen(true);
  };

  // 2. Bill Reminder Handlers
  const handleSaveReminder = (
    reminderData: Omit<BillReminder, 'id' | 'createdAt'>,
    existingId?: string
  ) => {
    if (existingId) {
      setReminders((prev) =>
        prev.map((r) => (r.id === existingId ? { ...r, ...reminderData } : r))
      );
    } else {
      const newRem: BillReminder = {
        ...reminderData,
        id: `rem_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        createdAt: Date.now(),
      };
      setReminders((prev) => [newRem, ...prev]);
    }
  };

  const handleDeleteReminder = (id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
  };

  // 1-Click Pay Bill: Marks reminder as paid and automatically adds expense transaction!
  const handlePayReminder = (reminder: BillReminder, payAccountId: string) => {
    const account = synchronizedAccounts.find((a) => a.id === payAccountId);
    const cat = categories.find((c) => c.id === reminder.categoryId);

    // 1. Create expense transaction
    const newTx: Transaction = {
      id: `tx_bill_${Date.now()}`,
      type: 'expense',
      amount: reminder.amount,
      categoryId: reminder.categoryId,
      categoryName: reminder.categoryName,
      accountId: payAccountId,
      accountName: account?.name || 'Dompet',
      date: getTodayDateStr(),
      time: '12:00',
      note: `Pelunasan tagihan: ${reminder.title}`,
      createdAt: Date.now(),
    };

    // 2. Update reminder status
    setReminders((prev) =>
      prev.map((r) =>
        r.id === reminder.id
          ? {
              ...r,
              isPaid: true,
              paidAt: new Date().toISOString(),
              paidTransactionId: newTx.id,
            }
          : r
      )
    );

    // 3. Add transaction
    setTransactions((prev) => [newTx, ...prev]);
  };

  const handleUnpayReminder = (id: string) => {
    const rem = reminders.find((r) => r.id === id);
    if (rem && rem.paidTransactionId) {
      // Remove automatically created transaction
      setTransactions((prev) => prev.filter((t) => t.id !== rem.paidTransactionId));
    }
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isPaid: false, paidAt: undefined, paidTransactionId: undefined } : r))
    );
  };

  // 3. Category Handlers
  const handleAddCategory = (catData: Omit<Category, 'id'>) => {
    const newCat: Category = {
      ...catData,
      id: `cat_custom_${Date.now()}`,
    };
    setCategories((prev) => [...prev, newCat]);
  };

  const handleUpdateCategory = (id: string, updated: Partial<Category>) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updated } : c))
    );
    // Also update transaction category names if changed
    if (updated.name) {
      setTransactions((prev) =>
        prev.map((t) => (t.categoryId === id ? { ...t, categoryName: updated.name! } : t))
      );
    }
  };

  const handleDeleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    // Reassign transactions with this category to general other
    setTransactions((prev) =>
      prev.map((t) =>
        t.categoryId === id
          ? {
              ...t,
              categoryId: t.type === 'income' ? 'cat_other_inc' : 'cat_other_exp',
              categoryName: 'Lainnya',
            }
          : t
      )
    );
  };

  // 4. Budget Handlers
  const handleSaveBudget = (categoryId: string, monthlyLimit: number) => {
    setBudgets((prev) => {
      const idx = prev.findIndex((b) => b.categoryId === categoryId && b.month === selectedMonth);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], monthlyLimit };
        return copy;
      }
      return [
        ...prev,
        {
          id: `bgt_${Date.now()}`,
          categoryId,
          monthlyLimit,
          month: selectedMonth,
        },
      ];
    });
  };

  const handleDeleteBudget = (budgetId: string) => {
    setBudgets((prev) => prev.filter((b) => b.id !== budgetId));
  };

  // 5. Account Handlers
  const handleAddAccount = (accData: Omit<Account, 'id'>) => {
    const newAcc: Account = {
      ...accData,
      id: `acc_${Date.now()}`,
    };
    setAccounts((prev) => [...prev, newAcc]);
  };

  const handleUpdateAccount = (id: string, updated: Partial<Account>) => {
    setAccounts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updated } : a))
    );
  };

  const handleDeleteAccount = (id: string) => {
    if (accounts.length <= 1) {
      alert('Minimal harus memiliki 1 akun/dompet aktif.');
      return;
    }
    setAccounts((prev) => prev.filter((a) => a.id !== id));
  };

  // 6. Reset & Import Handlers
  const handleResetData = () => {
    resetAllDataToDefault();
    setTransactions(getStoredTransactions());
    setCategories(getStoredCategories());
    setAccounts(getStoredAccounts());
    setBudgets(getStoredBudgets());
    setReminders(getStoredReminders());
  };

  const handleImportData = (data: any) => {
    if (data.transactions) setTransactions(data.transactions);
    if (data.categories) setCategories(data.categories);
    if (data.accounts) setAccounts(data.accounts);
    if (data.budgets) setBudgets(data.budgets);
    if (data.reminders) setReminders(data.reminders);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      
      {/* Top Bar Contract Navigation */}
      <Header
        currentView={currentView}
        onViewChange={setCurrentView}
        selectedMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
        onOpenAddModal={() => {
          setEditingTransaction(null);
          setIsAddTxModalOpen(true);
        }}
        upcomingRemindersCount={upcomingRemindersCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* VIEW 1: DASHBOARD (Ringkasan) */}
        {currentView === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* KPI Summary Cards */}
            <SummaryCards
              totalBalance={stats.totalBalance}
              totalIncome={stats.totalIncome}
              totalExpense={stats.totalExpense}
              netSavings={stats.netSavings}
              savingsRate={stats.savingsRate}
              transactionCount={stats.transactionCount}
              monthName={stats.monthName}
            />

            {/* Visual Analytics & Reminders Overview */}
            <DashboardCharts
              transactions={transactions}
              categories={categories}
              reminders={reminders}
              selectedMonth={selectedMonth}
              onNavigateToReports={() => setCurrentView('reports')}
              onNavigateToReminders={() => setCurrentView('reminders')}
              onNavigateToTransactions={() => setCurrentView('transactions')}
            />

            {/* Recent Transactions List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Aktivitas Transaksi Terakhir
                  </h2>
                  <p className="text-xs text-slate-500">
                    Catatan arus kas pada {stats.monthName}
                  </p>
                </div>
                <button
                  onClick={() => setCurrentView('transactions')}
                  className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                >
                  Lihat Semua Transaksi
                </button>
              </div>

              <TransactionList
                transactions={transactions}
                categories={categories}
                accounts={synchronizedAccounts}
                onEditTransaction={handleEditTransaction}
                onDeleteTransaction={handleDeleteTransaction}
                onOpenAddModal={() => {
                  setEditingTransaction(null);
                  setIsAddTxModalOpen(true);
                }}
                selectedMonth={selectedMonth}
              />
            </div>
          </div>
        )}

        {/* VIEW 2: TRANSACTIONS (Daftar & Filter Lengkap) */}
        {currentView === 'transactions' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                  <span>Buku Kas Digital</span>
                  <span aria-hidden="true">·</span>
                  <span>Semua Transaksi</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                  Daftar Transaksi Keuangan
                </h1>
              </div>

              <button
                onClick={() => {
                  setEditingTransaction(null);
                  setIsAddTxModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg shadow-sm transition-colors whitespace-nowrap self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Catat Transaksi Baru</span>
              </button>
            </div>

            <TransactionList
              transactions={transactions}
              categories={categories}
              accounts={synchronizedAccounts}
              onEditTransaction={handleEditTransaction}
              onDeleteTransaction={handleDeleteTransaction}
              onOpenAddModal={() => {
                setEditingTransaction(null);
                setIsAddTxModalOpen(true);
              }}
            />
          </div>
        )}

        {/* VIEW 3: MONTHLY REPORT (Requested Feature 3) */}
        {currentView === 'reports' && (
          <div className="animate-in fade-in duration-150">
            <MonthlyReportView
              selectedMonth={selectedMonth}
              onMonthChange={setSelectedMonth}
              transactions={transactions}
              categories={categories}
            />
          </div>
        )}

        {/* VIEW 4: BILL REMINDERS (Requested Feature 1) */}
        {currentView === 'reminders' && (
          <div className="animate-in fade-in duration-150">
            <RemindersView
              reminders={reminders}
              categories={categories}
              accounts={synchronizedAccounts}
              onSaveReminder={handleSaveReminder}
              onDeleteReminder={handleDeleteReminder}
              onPayReminder={handlePayReminder}
              onUnpayReminder={handleUnpayReminder}
            />
          </div>
        )}

        {/* VIEW 5: CUSTOM CATEGORIES (Requested Feature 2) */}
        {currentView === 'categories' && (
          <div className="animate-in fade-in duration-150">
            <CategoryManagerView
              categories={categories}
              transactions={transactions}
              onAddCategory={handleAddCategory}
              onUpdateCategory={handleUpdateCategory}
              onDeleteCategory={handleDeleteCategory}
            />
          </div>
        )}

        {/* VIEW 6: BUDGETS */}
        {currentView === 'budget' && (
          <div className="animate-in fade-in duration-150">
            <BudgetSection
              budgets={budgets.filter((b) => b.month === selectedMonth)}
              categories={categories}
              transactions={transactions}
              selectedMonth={selectedMonth}
              onSaveBudget={handleSaveBudget}
              onDeleteBudget={handleDeleteBudget}
            />
          </div>
        )}

        {/* VIEW 7: WALLETS & ACCOUNTS */}
        {currentView === 'accounts' && (
          <div className="animate-in fade-in duration-150">
            <WalletsSection
              accounts={synchronizedAccounts}
              transactions={transactions}
              onAddAccount={handleAddAccount}
              onUpdateAccount={handleUpdateAccount}
              onDeleteAccount={handleDeleteAccount}
              onOpenTransferModal={() => {
                setEditingTransaction(null);
                setIsAddTxModalOpen(true);
              }}
            />
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 font-sans">xon</span>
            <span>— Aplikasi Pencatatan Pemasukan & Pengeluaran Keuangan Pribadi</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsDataModalOpen(true)}
              className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 transition-colors"
            >
              <Database className="w-3.5 h-3.5" />
              <span>Kelola Data & Cadangan</span>
            </button>
            <span aria-hidden="true">·</span>
            <span>Penyimpanan Aman di Perangkat Anda</span>
          </div>
        </div>
      </footer>

      {/* Transaction Modal (Add / Edit) */}
      <TransactionModal
        isOpen={isAddTxModalOpen}
        onClose={() => {
          setIsAddTxModalOpen(false);
          setEditingTransaction(null);
        }}
        onSave={handleSaveTransaction}
        categories={categories}
        accounts={synchronizedAccounts}
        initialTransaction={editingTransaction}
        onOpenCreateCategory={(catType) => {
          setCurrentView('categories');
        }}
      />

      {/* Export / Import Modal */}
      <ExportImportModal
        isOpen={isDataModalOpen}
        onClose={() => setIsDataModalOpen(false)}
        transactions={transactions}
        categories={categories}
        accounts={synchronizedAccounts}
        budgets={budgets}
        reminders={reminders}
        onImportData={handleImportData}
        onResetData={handleResetData}
      />

    </div>
  );
}
