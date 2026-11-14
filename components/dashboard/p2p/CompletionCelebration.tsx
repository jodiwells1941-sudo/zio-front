"use client";

import type { LocalOrderSummaryRow } from "@/app/dashboard/local-buy-sell/localOrderSummary";

const displayCurrency = (value: string) => value.replace(/\bUSDT\b/gi, "USD");

type Props = {
  isOpen: boolean;
  onClose: () => void;
  receivedAmount?: string;
  paidAmount?: string;
  summaryRows?: LocalOrderSummaryRow[];
  side?: "buy" | "sell";
};

export default function CompletionCelebration({
  isOpen,
  onClose,
  receivedAmount,
  paidAmount,
  summaryRows = [],
  side = "buy",
}: Props) {
  if (!isOpen) return null;

  return (
    <div className="completionCelebration" role="dialog" aria-modal="true" aria-labelledby="completion-celebration-title">
      <section className="completionCard">
        <div className="completionHeader">
          <div className="completionBadge" aria-hidden="true">
            <i className="fa-solid fa-check" />
          </div>
          <span className="completionEyebrow">Order successfully completed</span>
          <h2 id="completion-celebration-title">
            {receivedAmount ? "You Received" : "Order Completed"}
          </h2>
        </div>
        <div className="completionBody">
          {receivedAmount ? (
            <>
              <div className="completionAmounts" aria-label="Completed trade amounts">
                <div className="completionReceivedBlock">
                  <span className="completionAmountLabel">
                    <i className="fa-solid fa-arrow-down" aria-hidden="true" />
                    Received
                  </span>
                  <p className="completionReceivedAmount">{displayCurrency(receivedAmount)}</p>
                </div>
                {paidAmount && (
                  <div className="completionEquivalent">
                    <span><i className="fa-solid fa-arrow-up" aria-hidden="true" /> Paid</span>
                    <strong>{displayCurrency(paidAmount)}</strong>
                  </div>
                )}
              </div>
              <p className="completionMessage">Your local trade has been completed successfully.</p>
            </>
          ) : (
            <p className="completionMessage">Your order has been completed successfully.</p>
          )}
          {summaryRows.length > 0 && <details className={`completionSummary completionSummary--${side}`}>
            <summary>
              <span><i className="fa-solid fa-receipt" aria-hidden="true" /> Order Summary</span>
              <i className="fa-solid fa-chevron-down completionSummaryChevron" aria-hidden="true" />
            </summary>
            <dl className="completionSummaryRows">
              {summaryRows.map((row, index) => <div className={`completionSummaryRow ${row.total ? "completionSummaryRow--total" : ""} ${row.tone ? `completionSummaryRow--${row.tone}` : ""}`} key={`${row.label}-${index}`}>
                <dt>{displayCurrency(row.label)}</dt><dd>{displayCurrency(row.value)}</dd>
              </div>)}
            </dl>
          </details>}
        </div>
        <div className="completionFooter">
          <button type="button" className="completionButton" onClick={onClose}>
            Continue to feedback
            <i className="fa-solid fa-arrow-right" aria-hidden="true" />
          </button>
        </div>
      </section>
    </div>
  );
}
