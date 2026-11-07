import type { ReactNode } from 'react';
import styles from './PaymentDetailsCollapse.module.css';

export default function PaymentDetailsCollapse({ children }: { children: ReactNode }) {
  return (
    <details className={styles.details}>
      <summary className={styles.toggle}>
        <span>Order Summary</span>
        <i className="fa-solid fa-chevron-down" aria-hidden="true" />
      </summary>
      <div className={styles.content}>{children}</div>
    </details>
  );
}
