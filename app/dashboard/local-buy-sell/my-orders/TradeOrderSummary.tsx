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
  bonusAmount = 0,
  bonusPercent = 0,
  feeAmount = 0,
  feePercent = 0,
}: Props) {
  const isBuy = kind === "buy";
  const totalReceived = isBuy ? cryptoAmount + bonusAmount : fiatAmount - feeAmount;

  return (
    <section className={`${styles.card} ${isBuy ? styles.buy : styles.sell}`}>
      <h3 className={styles.title}>{isBuy ? `Buy ${asset}` : `Sell ${asset}`}</h3>
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
              <span>{asset} Amount</span>
              <b>{formatAmount(cryptoAmount)} {asset}</b>
            </div>
            <div className={styles.row}>
              <span>Market Price (1 {asset})</span>
              <b>{formatAmount(price)} {currency}</b>
            </div>
            <div className={styles.row}>
              <span>Amount ({currency})</span>
              <b>{formatAmount(fiatAmount)} {currency}</b>
            </div>
            <div className={styles.row}>
              <span>Fee ({formatAmount(feePercent)}%)</span>
              <b className={styles.negative}>- {formatAmount(feeAmount)} {currency}</b>
            </div>
            <div className={styles.row}>
              <span>Payment Method</span>
              <b>{paymentMethod || "N/A"}</b>
            </div>
            <div className={`${styles.row} ${styles.total}`}>
              <span>Total You Will Receive</span>
              <b>{formatAmount(totalReceived)} {currency}</b>
            </div>
          </>
        )}
      </div>
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
