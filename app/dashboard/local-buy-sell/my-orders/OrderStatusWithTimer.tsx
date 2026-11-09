import { getOrderCountdown, getStatusUI } from './orderListUi';

type Order = Parameters<typeof getStatusUI>[0] & Parameters<typeof getOrderCountdown>[0];

export default function OrderStatusWithTimer({ trade, nowMs, showCountdown = true }: { trade: Order; nowMs: number; showCountdown?: boolean }) {
  const status = getStatusUI(trade);
  const countdown = showCountdown ? getOrderCountdown(trade, nowMs) : null;

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

export function OrderNextStep({ trade, nowMs }: { trade: Order; nowMs: number }) {
  const countdown = getOrderCountdown(trade, nowMs);
  const proofGiven = trade.record_kind !== 'ad' && trade.status === 5;
  const awaitingProof = trade.record_kind !== 'ad' && trade.status === 2 && !countdown?.expired;
  if (!countdown && !awaitingProof && !proofGiven) {
    return <span className="local-order-next-step-empty" aria-label="No active countdown">—</span>;
  }

  const canAppeal = trade.status === 2 && countdown?.expired === true;
  const label = proofGiven ? 'Proof Given' : canAppeal ? 'Appeal' : awaitingProof ? 'Proof' : countdown?.expired ? 'Time Ended' : countdown?.time;
  const showTimeBelow = countdown && (proofGiven || awaitingProof || canAppeal || countdown.expired);

  return (
    <div
      className={`local-order-next-step${proofGiven ? ' is-proof' : ''}${countdown?.expired ? ' is-expired' : ''}`}
      title={countdown?.label ?? (proofGiven ? 'Payment proof submitted' : 'Payment proof required')}
    >
      <span className="local-order-next-step-icon" aria-hidden="true">
        <i className={`fa-solid ${proofGiven ? 'fa-check' : canAppeal ? 'fa-triangle-exclamation' : awaitingProof ? 'fa-receipt' : 'fa-clock'}`} />
      </span>
      <span className="local-order-next-step-copy">
        <strong role={proofGiven || canAppeal || awaitingProof || countdown?.expired ? 'status' : 'timer'} aria-live="off" aria-label={`${countdown?.label ?? 'Payment proof required'}: ${label}`}>
          {label}
        </strong>
        {showTimeBelow && (
          <span className="local-order-next-step-time" role="timer" aria-live="off" aria-label={`Time remaining: ${countdown.time}`}>
            {countdown.time}
          </span>
        )}
      </span>
    </div>
  );
}
