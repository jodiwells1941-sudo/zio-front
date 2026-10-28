"use client";

import { useId, useState } from "react";
import { toast } from "react-toastify";
import styles from "./TradeOrderSummary.module.css";
import PaymentMethodIcon from "../../PaymentMethodIcon";

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
  bonusPercent = 0,
  feeAmount = 0,
  feePercent = 0,
}: Props) {
  const isBuy = kind === "buy";
  const totalReceived = isBuy ? cryptoAmount + bonusAmount : fiatAmount;
  const [copiedOrderId, setCopiedOrderId] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
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
    <section className={`${styles.card} ${isBuy ? styles.buy : styles.sell}`}>
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
        <div className={styles.row}>
          <span>Currency</span>
          <b>{currency || "—"}</b>
        </div>
        {isBuy ? (
          <>
            <div className={styles.row}>
              <span>Amount</span>
              <b>{formatAmount(fiatAmount)} {currency}</b>
            </div>
            <div className={styles.row}>
              <span>Market Price (1 {asset})</span>
              <b>{formatAmount(price)} {currency}</b>
            </div>
            <div className={styles.row}>
              <span>{asset} Amount</span>
              <b>{formatAmount(cryptoAmount)} {asset}</b>
            </div>
            <div className={styles.row}>
              <span>Bonus ({formatAmount(bonusPercent)}%)</span>
              <b className={styles.positive}>+ {formatAmount(bonusAmount)} {asset}</b>
            </div>
            <div className={`${styles.row} ${styles.total}`}>
              <span>Total You Will Receive</span>
              <b>{formatAmount(totalReceived)} {asset}</b>
            </div>
          </>
        ) : (
          <>
            <div className={styles.row}>
              <span>Sell Amount</span>
              <b>{formatAmount(cryptoAmount)} {asset}</b>
            </div>
            <div className={styles.row}>
              <span>Fee ({formatAmount(feePercent)}%)</span>
              <b className={styles.negative}>+ {formatAmount(feeAmount)} {currency}</b>
            </div>
            <div className={styles.row}>
              <span>Total Amount</span>
              <b>{formatAmount(fiatAmount+feeAmount)} {currency}</b>
            </div>
            <div className={styles.row}>
              <span>Market Price (1 {asset})</span>
              <b>{formatAmount(price)} {currency}</b>
            </div>
            <div className={styles.row}>
              <span>Received Amount ({currency})</span>
              <b>{formatAmount(totalReceived)} {currency}</b>
            </div>
          </>
        )}
      </div>
      </div>
      <div className={styles.receiveBanner}>
        <span className={styles.receiveIcon}>
          <i className={`fa-solid ${isBuy ? "fa-sack-dollar" : "fa-hand-holding-dollar"}`} />
        </span>
        <span>{isBuy ? "Pay Amount" : "Total Received Amount"}</span>
        <b>{formatAmount(totalReceived)} {currency}</b>
      </div>
      {(paymentMethod || paymentDetails.length > 0) && (
        <div className={styles.paymentCard}>
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
              <b>{detail.value}</b>
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
