"use client";

import { useState, type ReactNode } from "react";
import styles from "./PendingTradeReview.module.css";

type PendingTradeReviewProps = {
  orderId: string;
  isSeller: boolean;
  counterpartyName: string;
  sellerName: string;
  buyerName: string;
  fiatAmount: number;
  assetAmount: number;
  price: number;
  fiat: string;
  asset: string;
  paymentMethod: string;
  fee?: number;
  bonus?: number;
  secondsLeft: number;
  actions?: ReactNode;
};

function amount(value: number, maximumFractionDigits = 2) {
  return Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits,
  });
}

export default function PendingTradeReview({
  orderId, isSeller, counterpartyName, sellerName, buyerName, fiatAmount,
  assetAmount, price, fiat, asset, paymentMethod, fee = 0, bonus = 0,
  secondsLeft, actions,
}: PendingTradeReviewProps) {
  const [summaryOpen, setSummaryOpen] = useState(true);
  const [copied, setCopied] = useState(false);
  const safeSeconds = Math.max(0, Math.floor(secondsLeft || 0));
  const countdown = `${String(Math.floor(safeSeconds / 60)).padStart(2, "0")}:${String(safeSeconds % 60).padStart(2, "0")}`;
  const assetLabel = asset.toUpperCase() === "USDT" ? "USD" : asset;
  const rows = [
    { icon: "fa-credit-card", label: "Payment method", value: paymentMethod },
    { icon: "fa-coins", label: "Currency", value: fiat },
    { icon: "fa-chart-line", label: `Market price (1 ${assetLabel})`, value: `${amount(price)} ${fiat}` },
    { icon: "fa-money-bill-wave", label: "Fiat amount", value: `${amount(fiatAmount)} ${fiat}` },
    { icon: "fa-wallet", label: `${assetLabel} amount`, value: `${amount(assetAmount, 6)} ${assetLabel}` },
    ...(fee > 0 ? [{ icon: "fa-percent", label: "Fee", value: `${amount(fee, 6)} ${assetLabel}`, tone: "fee" }] : []),
    ...(bonus > 0 ? [{ icon: "fa-gift", label: "Bonus", value: `+${amount(bonus, 6)} ${assetLabel}`, tone: "bonus" }] : []),
    { icon: "fa-user", label: "Seller", value: sellerName },
    { icon: "fa-user", label: "Buyer", value: buyerName },
  ];

  async function copyOrderId() {
    try {
      await navigator.clipboard.writeText(orderId);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section className={styles.review} aria-label="Pending trade request">
      <div className={styles.hero}>
        <span className={styles.heroIcon}><i className={`fa-solid ${actions ? "fa-clipboard-check" : "fa-hourglass-half"}`} aria-hidden="true" /></span>
        <div className={styles.heroText}>
          <span className={styles.eyebrow}>{actions ? "Action required" : "Request submitted"}</span>
          <h2>{actions ? "Review trade request" : "Waiting for approval"}</h2>
          <p>{actions ? `${counterpartyName} placed an order. Check the amounts before you respond.` : `Your request is with ${counterpartyName}. This page updates when they respond.`}</p>
        </div>
        <div className={styles.timer} aria-label={`${countdown} remaining to review`}>
          <span>Time left</span><strong>{countdown}</strong>
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.orderLine}>
          <span>Order ID</span><strong>{orderId}</strong>
          <button type="button" onClick={copyOrderId} aria-label={copied ? "Order ID copied" : "Copy order ID"} title={copied ? "Copied" : "Copy order ID"}>
            <i className={`fa-regular ${copied ? "fa-circle-check" : "fa-copy"}`} aria-hidden="true" />
          </button>
        </div>

        <div className={styles.amounts}>
          <div className={styles.amountCard}>
            <span className={styles.amountIcon}><i className="fa-solid fa-money-bill-transfer" aria-hidden="true" /></span>
            <span>{isSeller ? "Receive payment" : "Pay seller"}<strong>{amount(fiatAmount)} {fiat}</strong></span>
          </div>
          <div className={styles.amountCard}>
            <span className={styles.amountIcon}><i className="fa-solid fa-coins" aria-hidden="true" /></span>
            <span>{isSeller ? "Sell amount" : "Buy amount"}<strong>{amount(assetAmount, 6)} {assetLabel}</strong></span>
          </div>
        </div>

        <div className={styles.summary}>
          <button type="button" className={styles.summaryToggle} onClick={() => setSummaryOpen(value => !value)} aria-expanded={summaryOpen}>
            <span><i className="fa-solid fa-receipt" aria-hidden="true" /> Order summary</span>
            <i className={`fa-solid ${summaryOpen ? "fa-chevron-up" : "fa-chevron-down"}`} aria-hidden="true" />
          </button>
          {summaryOpen && <div className={styles.summaryRows}>
            {rows.map(row => <div className={styles.summaryRow} key={row.label}>
              <span><i className={`fa-solid ${row.icon}`} aria-hidden="true" />{row.label}</span>
              <strong className={row.tone === "fee" ? styles.fee : row.tone === "bonus" ? styles.bonus : undefined}>{row.value}</strong>
            </div>)}
          </div>}
        </div>

        {actions && <div className={styles.actionArea}>
          <div><strong>Confirm this request</strong><span>Approval starts the payment step. Rejecting closes the request.</span></div>
          <div className={styles.actions}>{actions}</div>
        </div>}
      </div>
    </section>
  );
}
