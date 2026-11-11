export type OrderSideFilter = 'all' | 'buy' | 'sell';

export const maskOrderId = (value: string): string => {
  const id = value.trim();
  const prefix = id.match(/^[A-Za-z]+/)?.[0] ?? id.slice(0, 3);
  return id.length > prefix.length + 3 ? `${prefix}**${id.slice(-3)}` : id;
};

export type OrderStatusFilter =
  | 'all' | 'pending' | 'approved' | 'payment_sent' | 'payment_received'
  | 'completed' | 'appealed' | 'rejected' | 'cancelled' | 'refunded' | 'no_order';

export const STATUS_OPTIONS: { value: OrderStatusFilter; label: string }[] = [
  { value: 'all', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'payment_sent', label: 'Payment sent' },
  { value: 'payment_received', label: 'Payment received' },
  { value: 'appealed', label: 'Appealed' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'refunded', label: 'Refunded' },
  { value: 'completed', label: 'Completed' },
  { value: 'no_order', label: 'No order yet' },
];

type OrderListRow = {
  type: string;
  status: number;
  status_text: string;
  date: string;
  created_at?: string | null;
  record_kind?: 'order' | 'ad';
  ad_status?: boolean;
  isCustomer?: boolean;
  pending_time_limit?: string | null;
  payment_expires_at?: string | null;
};

export const getOrderCountdown = (trade: OrderListRow, nowMs: number): { label: string; time: string; expired: boolean } | null => {
  if (!nowMs || trade.record_kind === 'ad') return null;

  let label: string;
  let deadline: string | null | undefined;
  if (trade.status === 1) {
    label = trade.isCustomer ? 'Review request' : 'Waiting for approval';
    deadline = trade.pending_time_limit;
  } else if (trade.status === 2) {
    label = trade.type === 'Buy' ? 'Pay the Seller within' : "Waiting Buyer's Payment";
    deadline = trade.payment_expires_at;
  } else if (trade.status === 5) {
    label = trade.type === 'Sell' ? 'Confirm payment within' : 'Waiting for seller confirmation';
    deadline = trade.payment_expires_at;
  } else {
    return null;
  }

  if (!deadline) return null;
  const expiresAt = Date.parse(deadline);
  if (!Number.isFinite(expiresAt)) return null;
  const seconds = Math.max(0, Math.ceil((expiresAt - nowMs) / 1000));
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return {
    label,
    time: `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`,
    expired: seconds === 0,
  };
};

export const formatRelativeTime = (trade: OrderListRow, nowMs: number): string => {
  const timestamp = Date.parse(trade.created_at ?? trade.date.replace(' ', 'T'));
  if (!Number.isFinite(timestamp)) return trade.date || '—';
  if (!nowMs) return trade.date;
  const elapsed = Math.max(0, Math.floor((nowMs - timestamp) / 1000));
  if (elapsed < 60) return 'Just now';
  const minutes = Math.floor(elapsed / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  if (days < 365) return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  const years = Math.floor(days / 365);
  return `${years} ${years === 1 ? 'year' : 'years'} ago`;
};

export const getStatusUI = (trade: OrderListRow): { text: string; className: string } => {
  if (trade.record_kind === 'ad') {
    return {
      text: trade.status_text,
      className: `local-order-status ${trade.ad_status ? 'local-order-status--ad-active' : 'local-order-status--ad-paused'}`,
    };
  }

  const badge = (text: string, status: string) => ({ text, className: `local-order-status local-order-status--${status}` });
  switch (trade.status) {
    case 1: return badge(trade.type === 'Sell' ? 'Waiting for approval' : 'Pending', 'pending');
    case 2: return badge('Approved', 'approved');
    case 3: return badge('Rejected', 'rejected');
    case 4: return badge('Refunded', 'refunded');
    case 5: return badge('Payment sent', 'paid');
    case 6: return badge('Payment received', 'payment-received');
    case 7: return badge('Rejected', 'dispatch-rejected');
    case 8: return badge(trade.status_text || 'Cancelled', 'cancelled');
    case 9: return badge('Completed', 'completed');
    case 10: return badge('Appealed', 'appealed');
    default: return badge(trade.status_text || 'Unknown', 'ad-paused');
  }
};
