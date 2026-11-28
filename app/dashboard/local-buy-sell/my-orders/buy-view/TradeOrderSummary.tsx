"use client";

import { useId, useState } from "react";
import { toast } from "react-toastify";
import CopyPaymentDetail from "@/components/dashboard/p2p/CopyPaymentDetail";
import styles from "./TradeOrderSummary.module.css";
import PaymentMethodIcon from "../../PaymentMethodIcon";
import { localOrderSummaryRows } from "../../localOrderSummary";

type Props = {
  orderId: string;
  kind: "buy" | "sell";
  asset: string;
  currency: string;
  fiatAmount: number;
  price: number;
  priceLabel?: string;
  cryptoAmount: number;
  paymentTimeLimit: number;
  note?: string | null;
  paymentMethod?: string;
  paymentMethodIconImage?: string | null;
  paymentDetails?: Array<{ label: string; value: string }>;
  showPaymentDetails?: boolean;
  bonusAmount?: number;
  bonusPercent?: number;
  feeAmount?: number;
  feePercent?: number;
  remainingSeconds?: number | null;
};

const formatAmount = (amount: number, digits = 2) =>
  Number.isFinite(amount)
    ? amount.toLocaleString(undefined, {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
      })
    : (0).toFixed(digits);

const formatCountdown = (seconds: number) => {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  return `${String(Math.floor(safeSeconds / 60)).padStart(2, "0")}:${String(safeSeconds % 60).padStart(2, "0")}`;
};

export default function TradeOrderSummary({
  orderId,
  kind,
  asset,
  currency,
  fiatAmount,
  price,
  priceLabel,
  cryptoAmount,
  paymentTimeLimit,
  note,
  paymentMethod,
  paymentMethodIconImage,
  paymentDetails = [],
  showPaymentDetails = true,
  bonusAmount = 0,
  feeAmount = 0,
  feePercent = 0,
  remainingSeconds = null,
}: Props) {
  const isBuy = kind === "buy";
  const secondaryUsdAmount = Math.max(0, cryptoAmount + (isBuy ? bonusAmount : feeAmount));
  const summaryRows = localOrderSummaryRows({ side: kind, fiat: currency, asset, fiatAmount, assetAmount: cryptoAmount, price, priceLabel, bonusAmount, feeAmount, feePercent });

  const [copiedOrderId, setCopiedOrderId] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const contentId = useId();

  const copyOrderId = async () => {
    try {
      await navigator.clipboard.writeText(orderId);
      setCopiedOrderId(true);
      window.setTimeout(() => setCopiedOrderId(false), 1500);
    } catch {
      toast.error("Could not copy the order ID.");
    }
  };

  return (
    <section className={`${styles.card} bg-dark ${isBuy ? styles.buy : styles.sell}`}>

      <div className="position-relative mb-2 pb-2">
        <div className={styles.receiveBanner}>
          <span className={styles.receiveIcon}>
            <i className={`fa-solid ${isBuy ? "fa-sack-dollar" : "fa-hand-holding-dollar"}`} />
          </span>
          <span className="fw-bold fs-20">{isBuy ? "Pay Now" : "Received"}</span>
          <div className={styles.receiveValueGroup}>
            <b className="mb-2 pb-2 fs-5">{formatAmount(fiatAmount)} {currency}</b>
            <small className="py-1">{isBuy ? "You Will Receive: " : "Sell USD = "}<strong>${formatAmount(secondaryUsdAmount)} USD</strong></small>
          </div>
        </div>
      </div>

      <button
        type="button"
        className={`${styles.summaryToggle} mb-0 pb-0`}
        aria-expanded={isExpanded}
        aria-controls={contentId}
        onClick={() => setIsExpanded(expanded => !expanded)}
      >
        <span className={styles.summaryToggleTitle}>
          <i className="fa-solid fa-clipboard-list" aria-hidden="true" />
          Order Summary
        </span>
        <i
          className={`fa-solid ${isExpanded ? "fa-chevron-up" : "fa-chevron-down"}`}
          aria-hidden="true"
        />
      </button>
      <div id={contentId} hidden={!isExpanded}>
        <div className={styles.summary}>
          <div className={styles.row}>
            <span><i className="fa-solid fa-hashtag" aria-hidden="true" />Order ID</span>
            <span className={styles.orderIdValue}>
              <b>{orderId}</b>
              <button
                type="button"
                className={styles.copyButton}
                onClick={copyOrderId}
                aria-label={copiedOrderId ? "Order ID copied" : "Copy order ID"}
                title={copiedOrderId ? "Copied" : "Copy order ID"}
              >
                <i className={`fa-regular ${copiedOrderId ? "fa-circle-check" : "fa-copy"}`} aria-hidden="true" />
              </button>
            </span>
          </div>
          <div className={styles.row}>
            <span><i className="fa-solid fa-credit-card" aria-hidden="true" />Payment Method</span>
            <b>{paymentMethod || "—"}</b>
          </div>
          {summaryRows.map((row, index) => (
            <div className={`${styles.row} ${row.total ? styles.total : ""} ${index === summaryRows.length - 1 ? styles.summaryFinalTotal : ""} ${row.label === "Pay Amount" ? styles.payAmountRow : row.label.startsWith("Received Amount") ? styles.receivedAmountRow : ""}`} key={row.label}>
              <span><i className={`fa-solid ${row.icon}`} aria-hidden="true" />{row.label}</span>
              <b className={row.tone === "positive" ? styles.positive : row.tone === "negative" ? styles.negative : row.tone === "received" ? styles.received : undefined}>{row.value}</b>
            </div>
          ))}
        </div>
      </div>
      {(paymentMethod || paymentDetails.length > 0 || paymentTimeLimit > 0) && (
        <div className={`${styles.paymentCard} ${'bg-navy-blue'}`}>
          <div className={styles.paymentHead}>
            <PaymentMethodIcon
              className={styles.paymentIcon}
              methodName={paymentMethod}
              iconImage={paymentMethodIconImage}
              size={36}
              fallbackMode="brand"
            />
            <span className={styles.paymentMethodText}>
              <b>{paymentMethod || "Payment Method"}</b>
              <small>{currency} Payment Details</small>
            </span>
            <div className={styles.paymentTime} aria-label={`Order time limit: ${remainingSeconds === null ? `${paymentTimeLimit} minutes` : formatCountdown(remainingSeconds)}`}>
              <i className="fa-solid fa-hourglass-half" aria-hidden="true" />
              <span>
                <small>Order Time Limit</small>
                <b>{remainingSeconds === null ? `${paymentTimeLimit} Min` : formatCountdown(remainingSeconds)}</b>
              </span>
            </div>
          </div>
          {showPaymentDetails && paymentDetails.length > 0 ? paymentDetails.map(detail => (
            <div className={styles.paymentRow} key={detail.label}>
              <span>{detail.label}</span>
              <span className={styles.paymentValue}>
                <b>{detail.value}</b>
                <CopyPaymentDetail value={detail.value} label={detail.label} className={styles.copyButton} />
              </span>
            </div>
          )) : showPaymentDetails ? (
            <div className={styles.paymentEmpty}>No payment details available.</div>
          ) : null}
        </div>
      )}
      {note?.trim() && (
        <div className={styles.note}>
          <div className={styles.noteHeader}>
            <span className={styles.noteIcon}><i className="fa-regular fa-comment-dots" aria-hidden="true" /></span>
            <span>
              <b>Additional Note</b>
              <small>Order message</small>
            </span>
          </div>
          <p className={styles.noteText}>{note.trim()}</p>
        </div>
      )}
    </section>
  );
}
