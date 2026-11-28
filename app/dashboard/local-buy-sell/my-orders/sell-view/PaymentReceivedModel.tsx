'use client';

import styles from './PaymentReceivedModel.module.css';
import type { LocalOrderSummaryRow } from '../../localOrderSummary';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PaymentReceivedModelProps {
  isOpen: boolean;
  onClose: () => void;
  setConfirmPayment: () => void;
  buyerName: string;
  amount: number;
  currency: string;
  details?: LocalOrderSummaryRow[];
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PaymentReceivedModel({
  isOpen,
  onClose,
  setConfirmPayment,
  amount,
  currency,
  details = [],
}: PaymentReceivedModelProps) {
  if (!isOpen) return null;

  const formattedAmount = Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className={styles.overlay} onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
      <section className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="payment-confirm-title">
        <div className={styles.scrollBody}>
          <header className={styles.header}>
            <span className={styles.headerIcon} aria-hidden="true"><i className="fa-solid fa-shield-halved" /></span>
            <button onClick={onClose} className={styles.close} aria-label="Close modal" type="button">×</button>
            <h2 id="payment-confirm-title">Confirm Payment</h2>
            <p>The buyer marked this order as paid. Verify that you received the payment before releasing the order.</p>
          </header>

          <div className={styles.expectedPayment}>
            <span>Expected Payment</span>
            <strong>{currency} {formattedAmount}</strong>
          </div>

          <div className={styles.body}>
            {details.length > 0 && (
              <details className={styles.orderSummary} open>
                <summary className={styles.summaryToggle}>
                  <span><i className="fa-solid fa-clipboard-list" aria-hidden="true" /> Order Summary</span>
                  <i className="fa-solid fa-chevron-down" aria-hidden="true" />
                </summary>
                {details.map((row, index) => (
                  <div key={`${row.label}-${index}`} className={`${styles.summaryRow} ${row.total ? styles.summaryTotal : ''} ${row.tone === 'negative' ? styles.negative : ''} ${row.tone === 'positive' || row.tone === 'received' ? styles.received : ''}`}>
                    <span><i className={`fa-solid ${row.icon || 'fa-circle'} `} aria-hidden="true" />{row.label}</span>
                    <strong>{row.value}</strong>
                  </div>
                ))}
              </details>
            )}

          </div>
        </div>

        <footer className={styles.footer}>
          <button type="button" className={styles.cancelButton} onClick={onClose}>Cancel</button>
          <button
            type="button"
            className={styles.confirmButton}
            onClick={setConfirmPayment}
          >
            Confirm &amp; Release
          </button>
        </footer>
      </section>
    </div>
  );
}
