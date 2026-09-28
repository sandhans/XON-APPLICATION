import React from 'react';
import { MainView } from '../types/finance';
import { 
  LayoutDashboard, 
  ReceiptText, 
  FileSpreadsheet, 
  Bell, 
  Tags, 
  PieChart, 
  Wallet, 
  Plus,
  Calendar,
  Sparkles
} from 'lucide-react';
import { getMonthNameIndo } from '../utils/formatters';

interface HeaderProps {
  currentView: MainView;
  onViewChange: (view: MainView) => void;
  selectedMonth: string;
  onMonthChange: (month: string) => void;
  onOpenAddModal: () => void;
  upcomingRemindersCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onViewChange,
  selectedMonth,
  onMonthChange,
  onOpenAddModal,
  upcomingRemindersCount,
}) => {
  // Generate list of recent 6 months for quick selection
  const monthOptions = React.useMemo(() => {
    const list = [];
    const baseDate = new Date();
    for (let i = 0; i < 6; i++) {
      const d = new Date(baseDate.getFullYear(), baseDate.getMonth() - i, 1);
      const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      list.push({ value: val, label: getMonthNameIndo(val) });
    }
    return list;
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onViewChange('dashboard')}
              className="flex items-center gap-2 text-left group focus:outline-none"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-lg shadow-sm group-hover:bg-emerald-700 transition-colors">
                x
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900 font-sans">
                xon
              </span>
            </button>
          </div>

          {/* Zone 2: Navigation Links (Clean single line typography) */}
          <nav className="hidden lg:flex items-center gap-1">
            <button
              onClick={() => onViewChange('dashboard')}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                currentView === 'dashboard'
                  ? 'text-emerald-700 bg-emerald-50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Ringkasan</span>
            </button>

            <button
              onClick={() => onViewChange('transactions')}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                currentView === 'transactions'
                  ? 'text-emerald-700 bg-emerald-50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ReceiptText className="w-4 h-4" />
              <span>Transaksi</span>
            </button>

            <button
              onClick={() => onViewChange('reports')}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                currentView === 'reports'
                  ? 'text-emerald-700 bg-emerald-50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Laporan Bulanan</span>
            </button>

            <button
              onClick={() => onViewChange('reminders')}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap relative ${
                currentView === 'reminders'
                  ? 'text-emerald-700 bg-emerald-50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Bell className="w-4 h-4" />
              <span>Tagihan</span>
              {upcomingRemindersCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-rose-500" />
              )}
            </button>

            <button
              onClick={() => onViewChange('categories')}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                currentView === 'categories'
                  ? 'text-emerald-700 bg-emerald-50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Tags className="w-4 h-4" />
              <span>Kategori</span>
            </button>

            <button
              onClick={() => onViewChange('budget')}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                currentView === 'budget'
                  ? 'text-emerald-700 bg-emerald-50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <PieChart className="w-4 h-4" />
              <span>Anggaran</span>
            </button>

            <button
              onClick={() => onViewChange('accounts')}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                currentView === 'accounts'
                  ? 'text-emerald-700 bg-emerald-50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Wallet className="w-4 h-4" />
              <span>Dompet</span>
            </button>
          </nav>

          {/* Zone 3: Primary Actions (Month selector + Add Transaction CTA) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Month Filter Selector */}
            <div className="relative flex items-center">
              <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
              <select
                aria-label="Pilih Periode Bulan"
                value={selectedMonth}
                onChange={(e) => onMonthChange(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 border border-slate-200 rounded-lg hover:bg-slate-200/70 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer transition-colors"
              >
                {monthOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg shadow-sm transition-colors whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Catat Transaksi</span>
            </button>
          </div>

        </div>

        {/* Mobile secondary tab bar */}
        <div className="lg:hidden flex items-center gap-1 overflow-x-auto py-2 border-t border-slate-100 no-scrollbar">
          {[
            { id: 'dashboard', label: 'Ringkasan', icon: LayoutDashboard },
            { id: 'transactions', label: 'Transaksi', icon: ReceiptText },
            { id: 'reports', label: 'Laporan', icon: FileSpreadsheet },
            { id: 'reminders', label: 'Tagihan', icon: Bell, badge: upcomingRemindersCount },
            { id: 'categories', label: 'Kategori', icon: Tags },
            { id: 'budget', label: 'Anggaran', icon: PieChart },
            { id: 'accounts', label: 'Dompet', icon: Wallet },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = currentView === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onViewChange(tab.id as MainView)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                  isActive
                    ? 'text-emerald-700 bg-emerald-50'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {Boolean(tab.badge && tab.badge > 0) && (
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                )}
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
};
