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
};

const formatAmount = (amount: number, digits = 2) =>
  Number.isFinite(amount)
    ? amount.toLocaleString(undefined, {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
      })
    : (0).toFixed(digits);

export default function TradeOrderSummary({
  orderId,
  kind,
  asset,
  currency,
  fiatAmount,
  price,
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
}: Props) {
  const isBuy = kind === "buy";
  const summaryRows = localOrderSummaryRows({ side: kind, fiat: currency, asset, fiatAmount, assetAmount: cryptoAmount, price, bonusAmount, feeAmount, feePercent });
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
      <button
        type="button"
        className={styles.summaryToggle}
        aria-expanded={isExpanded}
        aria-controls={contentId}
        onClick={() => setIsExpanded(expanded => !expanded)}
      >
        <span className={styles.subtitle}>Order Summary</span>
        <i
          className={`fa-solid ${isExpanded ? "fa-chevron-up" : "fa-chevron-down"}`}
          aria-hidden="true"
        />
      </button>
      <div id={contentId} hidden={!isExpanded}>
      <div className={styles.summary}>
        <div className={styles.row}>
          <span>Order ID</span>
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
        {summaryRows.map(row => (
          <div className={`${styles.row} ${row.total ? styles.total : ""}`} key={row.label}>
            <span>{row.label}</span>
            <b className={row.tone === "positive" ? styles.positive : row.tone === "negative" ? styles.negative : row.tone === "received" ? styles.received : undefined}>{row.value}</b>
          </div>
        ))}
      </div>
      </div>
      <div className={styles.receiveBanner}>
        <span className={styles.receiveIcon}>
          <i className={`fa-solid ${isBuy ? "fa-sack-dollar" : "fa-hand-holding-dollar"}`} />
        </span>
        <span>{isBuy ? "Pay Amount" : "Received Amount"}</span>
        <b>{formatAmount(fiatAmount)} {currency}</b>
        
      </div>
      {(paymentMethod || paymentDetails.length > 0) && (
        <div className={`${styles.paymentCard} ${'bg-navy-blue'}`}>
          <div className={styles.paymentHead}>
            <PaymentMethodIcon
              className={styles.paymentIcon}
              methodName={paymentMethod}
              iconImage={paymentMethodIconImage}
              size={36}
              fallbackMode="brand"
            />
            <span>
              <b>{paymentMethod || "Payment Method"}</b>
              <small>{currency} Payment Details</small>
            </span>
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
      <div className={styles.detail}>
        <span>Order Time Limit</span>
        <b>{paymentTimeLimit || "—"}{paymentTimeLimit ? " min" : ""}</b>
      </div>
      <div className={`${styles.detail} ${styles.note}`}>
        <span>Additional Note</span>
        <p>{note?.trim() || "No additional note provided."}</p>
      </div>
    </section>
  );
}
