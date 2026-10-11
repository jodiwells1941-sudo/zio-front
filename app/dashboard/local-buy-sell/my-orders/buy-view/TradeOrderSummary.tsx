"use client";

import styles from "./TradeOrderSummary.module.css";

type Props = {
  kind: "buy" | "sell";
  asset: string;
  currency: string;
  fiatAmount: number;
  price: number;
  cryptoAmount: number;
  paymentTimeLimit: number;
  note?: string | null;
  paymentMethod?: string;
  paymentDetails?: Array<{ label: string; value: string }>;
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
  kind,
  asset,
  currency,
  fiatAmount,
  price,
  cryptoAmount,
  paymentTimeLimit,
  note,
  paymentMethod,
  paymentDetails = [],
  bonusAmount = 0,
  bonusPercent = 0,
  feeAmount = 0,
  feePercent = 0,
}: Props) {
  const isBuy = kind === "buy";
  const totalReceived = isBuy ? cryptoAmount + bonusAmount : fiatAmount - feeAmount;

  return (
    <section className={`${styles.card} ${isBuy ? styles.buy : styles.sell}`}>
      <div className={styles.summary}>
        <h4 className={styles.subtitle}>Order Summary</h4>
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
              <b className={styles.negative}>- {formatAmount(feeAmount)} {currency}</b>
            </div>
            <div className={styles.row}>
              <span>Total Amount</span>
              <b>{formatAmount(fiatAmount)} {currency}</b>
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
      <div className={styles.receiveBanner}>
        <span className={styles.receiveIcon}>
          <i className={`fa-solid ${isBuy ? "fa-sack-dollar" : "fa-hand-holding-dollar"}`} />
        </span>
        <span>{isBuy ? "Pay Amount" : "Total Received Amount"}</span>
        {/* <b>{formatAmount(totalReceived)} {currency}</b> */}
        {isBuy ? <b>{formatAmount(fiatAmount)} {currency}</b> : <b>{formatAmount(totalReceived)} {currency}</b>}
        
      </div>
      {!isBuy && (
        <div className={styles.paymentCard}>
          <div className={styles.paymentHead}>
            <span className={styles.paymentIcon}><i className="fa-solid fa-credit-card" /></span>
            <span>
              <b>{paymentMethod || "Payment Method"}</b>
              <small>{currency} Payment Details</small>
            </span>
          </div>
          {paymentDetails.length > 0 ? paymentDetails.map(detail => (
            <div className={styles.paymentRow} key={detail.label}>
              <span>{detail.label}</span>
              <b>{detail.value}</b>
            </div>
          )) : (
            <div className={styles.paymentEmpty}>No payment details available.</div>
          )}
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
