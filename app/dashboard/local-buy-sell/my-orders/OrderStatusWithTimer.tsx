import { getOrderCountdown, getStatusUI } from './orderListUi';

type Order = Parameters<typeof getStatusUI>[0] & Parameters<typeof getOrderCountdown>[0];

export default function OrderStatusWithTimer({ trade, nowMs }: { trade: Order; nowMs: number }) {
  const status = getStatusUI(trade);
  const countdown = getOrderCountdown(trade, nowMs);

  return (
    <div className="local-order-status-stack">
      <span className={status.className}>{status.text}</span>
      {countdown && (
        <span className={`local-order-countdown${countdown.expired ? ' is-expired' : ''}`} role="timer" aria-live="off">
          {countdown.label} <strong>{countdown.expired ? 'Time ended' : countdown.time}</strong>
        </span>
      )}
    </div>
  );
}
