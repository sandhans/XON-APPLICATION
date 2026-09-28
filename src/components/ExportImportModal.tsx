import React, { useRef } from 'react';
import { Account, BillReminder, Budget, Category, Transaction } from '../types/finance';
import { Download, Upload, RotateCcw, X, FileText, Check } from 'lucide-react';

interface ExportImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
  budgets: Budget[];
  reminders: BillReminder[];
  onImportData: (data: {
    transactions?: Transaction[];
    categories?: Category[];
    accounts?: Account[];
    budgets?: Budget[];
    reminders?: BillReminder[];
  }) => void;
  onResetData: () => void;
}

export const ExportImportModal: React.FC<ExportImportModalProps> = ({
  isOpen,
  onClose,
  transactions,
  categories,
  accounts,
  budgets,
  reminders,
  onImportData,
  onResetData,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Export full JSON backup
  const handleExportJSON = () => {
    const fullBackup = {
      app: 'xon_finance',
      exportedAt: new Date().toISOString(),
      transactions,
      categories,
      accounts,
      budgets,
      reminders,
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(fullBackup, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', `xon-keuangan-backup-${new Date().toISOString().split('T')[0]}.json`);
    dlAnchor.click();
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Tanggal', 'Waktu', 'Tipe', 'Kategori', 'Akun', 'Nominal', 'Catatan'];
    const rows = transactions.map((t) => [
      t.id,
      t.date,
      t.time || '',
      t.type,
      `"${t.categoryName}"`,
      `"${t.accountName}"`,
      t.amount,
      `"${(t.note || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', encodeURI(csvContent));
    dlAnchor.setAttribute('download', `xon-semua-transaksi-${new Date().toISOString().split('T')[0]}.csv`);
    dlAnchor.click();
  };

  // Import JSON backup
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.transactions || parsed.categories || parsed.accounts) {
          onImportData(parsed);
          alert('Data berhasil diimpor!');
          onClose();
        } else {
          alert('Format berkas JSON tidak valid.');
        }
      } catch (err) {
        alert('Gagal membaca berkas JSON.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-6 animate-in fade-in zoom-in-95 duration-150">
        
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Cadangan & Manajemen Data
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Kelola ekspor, impor, dan pemulihan data aplikasi xon
            </p>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-4">
          
          {/* Export section */}
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
              Unduh Data
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleExportCSV}
                className="flex items-center justify-center gap-2 p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 transition-colors"
              >
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>Unduh CSV</span>
              </button>
              <button
                onClick={handleExportJSON}
                className="flex items-center justify-center gap-2 p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 transition-colors"
              >
                <Download className="w-4 h-4 text-blue-600" />
                <span>Cadangan JSON</span>
              </button>
            </div>
          </div>

          {/* Import section */}
          <div className="space-y-2 pt-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
              Pulihkan dari Cadangan
            </span>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 transition-colors"
            >
              <Upload className="w-4 h-4 text-purple-600" />
              <span>Impor Berkas Cadangan JSON</span>
            </button>
          </div>

          {/* Reset section */}
          <div className="space-y-2 pt-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
              Setel Ulang Data
            </span>
            <button
              onClick={() => {
                const conf = window.confirm(
                  'PERHATIAN: Apakah Anda yakin ingin mengosongkan seluruh data transaksi, tagihan, dan batas anggaran, serta mengembalikan semua saldo rekening menjadi Rp 0?'
                );
                if (conf) {
                  onResetData();
                  onClose();
                }
              }}
              className="w-full flex items-center justify-center gap-2 p-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700 transition-colors"
            >
              <RotateCcw className="w-4 h-4 text-rose-600" />
              <span>Kosongkan & Setel Saldo ke Rp 0</span>
            </button>
          </div>

        </div>

        <div className="pt-2 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
