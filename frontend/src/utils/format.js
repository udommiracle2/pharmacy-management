export function formatCurrency(amount) {
  const value = Number(amount) || 0;
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(date, withTime = false) {
  if (!date) return '—';
  const d = new Date(date);
  const opts = { day: '2-digit', month: 'short', year: 'numeric' };
  if (withTime) {
    opts.hour = '2-digit';
    opts.minute = '2-digit';
  }
  return d.toLocaleDateString('en-GB', opts);
}

export function daysUntil(date) {
  const now = new Date();
  const target = new Date(date);
  return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
}
