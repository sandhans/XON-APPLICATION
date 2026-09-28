export type TransactionType = 'income' | 'expense' | 'transfer';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  categoryId: string;
  categoryName: string;
  accountId: string;
  accountName: string;
  toAccountId?: string;
  toAccountName?: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  note: string;
  tags?: string[];
  createdAt: number;
}

export type CategoryType = 'income' | 'expense';

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  icon: string;
  color: string;
  bgLight: string;
  isCustom?: boolean;
}

export type AccountType = 'bank' | 'ewallet' | 'cash' | 'investment';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  initialBalance: number;
  currentBalance: number;
  accountNumber?: string;
  color: string;
  icon: string;
}

export interface Budget {
  id: string;
  categoryId: string;
  monthlyLimit: number;
  month: string; // YYYY-MM
}

export type BillRepeatFrequency = 'once' | 'monthly' | 'weekly' | 'yearly';

export interface BillReminder {
  id: string;
  title: string;
  amount: number;
  categoryId: string;
  categoryName: string;
  dueDate: string; // YYYY-MM-DD
  repeat: BillRepeatFrequency;
  remindDaysBefore: number; // e.g., 0 for on the day, 1, 3, 7 days before
  isPaid: boolean;
  paidAt?: string;
  paidTransactionId?: string;
  accountId?: string;
  note?: string;
  createdAt: number;
}

export type MainView = 'dashboard' | 'transactions' | 'reports' | 'reminders' | 'categories' | 'budget' | 'accounts';

export interface FilterOptions {
  search: string;
  type: 'all' | 'income' | 'expense' | 'transfer';
  categoryId: string;
  accountId: string;
  month: string; // YYYY-MM or 'all'
  sortBy: 'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc';
}

export interface SummaryStats {
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
  savingsRate: number;
  transactionCount: number;
}

export interface MonthlyReportSummary {
  month: string; // YYYY-MM
  monthName: string;
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
  savingsRate: number;
  incomeCount: number;
  expenseCount: number;
  categoryBreakdown: {
    categoryId: string;
    categoryName: string;
    total: number;
    percentage: number;
    color: string;
    icon: string;
  }[];
  dailyTrends: {
    day: string;
    income: number;
    expense: number;
  }[];
  topExpenses: Transaction[];
}

