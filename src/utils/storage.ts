import { Account, BillReminder, Budget, Category, MonthlyReportSummary, Transaction } from '../types/finance';
import { getCurrentMonthStr, getMonthNameIndo } from './formatters';

const STORAGE_KEYS = {
  TRANSACTIONS: 'xon_finance_transactions_v2_zero',
  CATEGORIES: 'xon_finance_categories_v2_zero',
  ACCOUNTS: 'xon_finance_accounts_v2_zero',
  BUDGETS: 'xon_finance_budgets_v2_zero',
  REMINDERS: 'xon_finance_reminders_v2_zero',
};

// Automatic one-time migration to ensure everything is set to 0 as requested
const ZERO_INITIALIZED_KEY = 'xon_finance_zero_init_v2';
if (typeof window !== 'undefined' && !localStorage.getItem(ZERO_INITIALIZED_KEY)) {
  try {
    // Clear old sample/mock keys
    localStorage.removeItem('xon_finance_transactions_v1');
    localStorage.removeItem('xon_finance_accounts_v1');
    localStorage.removeItem('xon_finance_budgets_v1');
    localStorage.removeItem('xon_finance_reminders_v1');
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
    localStorage.removeItem(STORAGE_KEYS.ACCOUNTS);
    localStorage.removeItem(STORAGE_KEYS.BUDGETS);
    localStorage.removeItem(STORAGE_KEYS.REMINDERS);
    localStorage.setItem(ZERO_INITIALIZED_KEY, 'true');
  } catch (e) {
    console.error(e);
  }
}

export const DEFAULT_CATEGORIES: Category[] = [
  // Pengeluaran (Expenses)
  { id: 'cat_food', name: 'Makanan & Minuman', type: 'expense', icon: 'Utensils', color: '#EA580C', bgLight: '#FFEDD5', isCustom: false },
  { id: 'cat_transport', name: 'Transportasi & Bensin', type: 'expense', icon: 'Car', color: '#2563EB', bgLight: '#DBEAFE', isCustom: false },
  { id: 'cat_shopping', name: 'Belanja & Kebutuhan', type: 'expense', icon: 'ShoppingBag', color: '#D97706', bgLight: '#FEF3C7', isCustom: false },
  { id: 'cat_bills', name: 'Tagihan & Utilitas', type: 'expense', icon: 'Receipt', color: '#DC2626', bgLight: '#FEE2E2', isCustom: false },
  { id: 'cat_entertainment', name: 'Hiburan & Liburan', type: 'expense', icon: 'Film', color: '#9333EA', bgLight: '#F3E8FF', isCustom: false },
  { id: 'cat_health', name: 'Kesehatan & Obat', type: 'expense', icon: 'HeartPulse', color: '#059669', bgLight: '#D1FAE5', isCustom: false },
  { id: 'cat_education', name: 'Pendidikan & Kursus', type: 'expense', icon: 'GraduationCap', color: '#0284C7', bgLight: '#E0F2FE', isCustom: false },
  { id: 'cat_family', name: 'Keluarga & Sedekah', type: 'expense', icon: 'Heart', color: '#E11D48', bgLight: '#FFE4E6', isCustom: false },
  { id: 'cat_other_exp', name: 'Pengeluaran Lain', type: 'expense', icon: 'MoreHorizontal', color: '#64748B', bgLight: '#F1F5F9', isCustom: false },
  
  // Pemasukan (Incomes)
  { id: 'cat_salary', name: 'Gaji Pokok', type: 'income', icon: 'Briefcase', color: '#16A34A', bgLight: '#DCFCE7', isCustom: false },
  { id: 'cat_freelance', name: 'Proyek / Freelance', type: 'income', icon: 'Laptop', color: '#0D9488', bgLight: '#CCFBF1', isCustom: false },
  { id: 'cat_investment', name: 'Investasi & Dividen', type: 'income', icon: 'TrendingUp', color: '#4F46E5', bgLight: '#EEF2FF', isCustom: false },
  { id: 'cat_bonus', name: 'Bonus & THR', type: 'income', icon: 'Gift', color: '#C026D3', bgLight: '#FAE8FF', isCustom: false },
  { id: 'cat_other_inc', name: 'Pemasukan Lain', type: 'income', icon: 'PlusCircle', color: '#0284C7', bgLight: '#E0F2FE', isCustom: false },
];

// All accounts start with exact 0 balance
export const DEFAULT_ACCOUNTS: Account[] = [
  { id: 'acc_bca', name: 'Bank BCA', type: 'bank', initialBalance: 0, currentBalance: 0, accountNumber: '8830-1928-44', color: '#0060AF', icon: 'Building2' },
  { id: 'acc_mandiri', name: 'Bank Mandiri', type: 'bank', initialBalance: 0, currentBalance: 0, accountNumber: '1370-0012-99', color: '#003366', icon: 'Landmark' },
  { id: 'acc_gopay', name: 'GoPay / OVO', type: 'ewallet', initialBalance: 0, currentBalance: 0, accountNumber: '0812-3456-7890', color: '#00AA13', icon: 'Smartphone' },
  { id: 'acc_cash', name: 'Dompet Tunai (Cash)', type: 'cash', initialBalance: 0, currentBalance: 0, color: '#16A34A', icon: 'Wallet' },
];

// All transactions start empty (0)
export const DEFAULT_TRANSACTIONS: Transaction[] = [];

// All budgets start empty (0)
export const DEFAULT_BUDGETS: Budget[] = [];

// All reminders start empty (0)
export const DEFAULT_REMINDERS: BillReminder[] = [];

export function getStoredTransactions(): Transaction[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (!raw) {
      saveStoredTransactions(DEFAULT_TRANSACTIONS);
      return DEFAULT_TRANSACTIONS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_TRANSACTIONS;
  }
}

export function saveStoredTransactions(transactions: Transaction[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  } catch (e) {
    console.error('Failed to save transactions to localStorage', e);
  }
}

export function getStoredCategories(): Category[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (!raw) {
      saveStoredCategories(DEFAULT_CATEGORIES);
      return DEFAULT_CATEGORIES;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_CATEGORIES;
  }
}

export function saveStoredCategories(categories: Category[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  } catch (e) {
    console.error('Failed to save categories to localStorage', e);
  }
}

export function getStoredAccounts(): Account[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
    if (!raw) {
      saveStoredAccounts(DEFAULT_ACCOUNTS);
      return DEFAULT_ACCOUNTS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_ACCOUNTS;
  }
}

export function saveStoredAccounts(accounts: Account[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
  } catch (e) {
    console.error('Failed to save accounts to localStorage', e);
  }
}

export function getStoredBudgets(): Budget[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BUDGETS);
    if (!raw) {
      saveStoredBudgets(DEFAULT_BUDGETS);
      return DEFAULT_BUDGETS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_BUDGETS;
  }
}

export function saveStoredBudgets(budgets: Budget[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
  } catch (e) {
    console.error('Failed to save budgets to localStorage', e);
  }
}

export function getStoredReminders(): BillReminder[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REMINDERS);
    if (!raw) {
      saveStoredReminders(DEFAULT_REMINDERS);
      return DEFAULT_REMINDERS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_REMINDERS;
  }
}

export function saveStoredReminders(reminders: BillReminder[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(reminders));
  } catch (e) {
    console.error('Failed to save reminders to localStorage', e);
  }
}

export function generateMonthlyReport(
  month: string, // YYYY-MM
  transactions: Transaction[],
  categories: Category[]
): MonthlyReportSummary {
  const monthTransactions = transactions.filter(t => t.date.startsWith(month));
  
  let totalIncome = 0;
  let totalExpense = 0;
  let incomeCount = 0;
  let expenseCount = 0;
  const categoryTotals: Record<string, number> = {};
  const dayStats: Record<string, { income: number; expense: number }> = {};

  monthTransactions.forEach(tx => {
    const day = tx.date.split('-')[2];
    if (!dayStats[day]) {
      dayStats[day] = { income: 0, expense: 0 };
    }

    if (tx.type === 'income') {
      totalIncome += tx.amount;
      incomeCount += 1;
      dayStats[day].income += tx.amount;
    } else if (tx.type === 'expense') {
      totalExpense += tx.amount;
      expenseCount += 1;
      dayStats[day].expense += tx.amount;
      categoryTotals[tx.categoryId] = (categoryTotals[tx.categoryId] || 0) + tx.amount;
    }
  });

  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.max(0, Math.round((netSavings / totalIncome) * 100)) : 0;

  const categoryBreakdown = Object.entries(categoryTotals)
    .map(([catId, total]) => {
      const cat = categories.find(c => c.id === catId);
      return {
        categoryId: catId,
        categoryName: cat?.name || 'Lainnya',
        total,
        percentage: totalExpense > 0 ? Math.round((total / totalExpense) * 100) : 0,
        color: cat?.color || '#64748B',
        icon: cat?.icon || 'CircleDollarSign',
      };
    })
    .sort((a, b) => b.total - a.total);

  // Daily trends sorted by day
  const dailyTrends = Object.entries(dayStats)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([day, val]) => ({
      day,
      income: val.income,
      expense: val.expense,
    }));

  // Top 5 expenses this month
  const topExpenses = monthTransactions
    .filter(t => t.type === 'expense')
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  return {
    month,
    monthName: getMonthNameIndo(month),
    totalIncome,
    totalExpense,
    netSavings,
    savingsRate,
    incomeCount,
    expenseCount,
    categoryBreakdown,
    dailyTrends,
    topExpenses,
  };
}

export function resetAllDataToDefault(): void {
  // Clear all storage keys
  Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
  localStorage.removeItem('xon_finance_transactions_v1');
  localStorage.removeItem('xon_finance_accounts_v1');
  localStorage.removeItem('xon_finance_budgets_v1');
  localStorage.removeItem('xon_finance_reminders_v1');

  // Explicitly write empty zero state
  saveStoredTransactions([]);
  saveStoredAccounts(DEFAULT_ACCOUNTS);
  saveStoredBudgets([]);
  saveStoredReminders([]);
  saveStoredCategories(DEFAULT_CATEGORIES);
}
