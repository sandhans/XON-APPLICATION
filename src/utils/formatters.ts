/**
 * Utility functions for Indonesian currency, date formatting, and financial calculations.
 */

export function formatIDR(amount: number, compact: boolean = false): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return 'Rp 0';
  }

  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);

  if (compact) {
    if (absAmount >= 1_000_000_000) {
      const val = (absAmount / 1_000_000_000).toFixed(1).replace('.0', '');
      return `${isNegative ? '-' : ''}Rp ${val.replace('.', ',')} M`;
    }
    if (absAmount >= 1_000_000) {
      const val = (absAmount / 1_000_000).toFixed(1).replace('.0', '');
      return `${isNegative ? '-' : ''}Rp ${val.replace('.', ',')} Jt`;
    }
    if (absAmount >= 1_000) {
      const val = (absAmount / 1_000).toFixed(1).replace('.0', '');
      return `${isNegative ? '-' : ''}Rp ${val.replace('.', ',')} Rb`;
    }
  }

  const formatted = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(absAmount);

  return isNegative ? `-${formatted}` : formatted;
}

export function formatDateIndo(dateStr: string, format: 'short' | 'full' | 'day-date' = 'short'): string {
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);

    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
      'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
    ];
    
    const monthNamesFull = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

    if (format === 'short') {
      return `${day} ${monthNames[month - 1]} ${year}`;
    }
    if (format === 'day-date') {
      return `${dayNames[date.getDay()]}, ${day} ${monthNames[month - 1]}`;
    }
    return `${dayNames[date.getDay()]}, ${day} ${monthNamesFull[month - 1]} ${year}`;
  } catch {
    return dateStr;
  }
}

export function getMonthNameIndo(monthStr: string): string {
  // input: "2026-09"
  try {
    const [year, month] = monthStr.split('-').map(Number);
    const monthNamesFull = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return `${monthNamesFull[month - 1]} ${year}`;
  } catch {
    return monthStr;
  }
}

export function getCurrentMonthStr(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function getTodayDateStr(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getCurrentTimeStr(): string {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}
