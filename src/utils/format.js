/**
 * Format helpers for Kalshi Tracker
 */

export function formatCurrency(amount) {
  const sign = amount >= 0 ? '' : '-';
  return `${sign}$${Math.abs(amount).toFixed(2)}`;
}

export function formatPercent(value) {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

export function formatPrice(price) {
  if (price >= 1000) return `$${(price / 1000).toFixed(1)}k`;
  if (price >= 1) return `$${price.toFixed(2)}`;
  return `${(price * 100).toFixed(0)}¢`;
}

export function getSignalColor(signal) {
  switch (signal) {
    case 'BUY': return '#00ff88';
    case 'SELL': return '#ff4466';
    case 'WATCH': return '#ffaa00';
    case 'NO_LIQUIDITY': return '#555566';
    default: return '#888899';
  }
}

export function getPnlColor(value) {
  if (value > 0) return '#00ff88';
  if (value < 0) return '#ff4466';
  return '#888899';
}

export function getTimeAgo(dateStr) {
  const ms = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}
