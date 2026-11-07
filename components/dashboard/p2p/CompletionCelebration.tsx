"use client";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  receivedAmount?: string;
  paidAmount?: string;
};

export default function CompletionCelebration({
  isOpen,
  onClose,
  receivedAmount,
  paidAmount,
}: Props) {
  if (!isOpen) return null;

  return (
    <div className="completionCelebration" role="dialog" aria-modal="true" aria-labelledby="completion-celebration-title">
      <section className="completionCard">
        <div className="completionBadge" aria-hidden="true">
          <i className="fa-solid fa-check" />
        </div>
        <span className="completionEyebrow">Order successfully Completed</span>
        <h2 id="completion-celebration-title">
          {receivedAmount ? "You Received" : "Order Completed"}
        </h2>
        {receivedAmount ? (
          <>
            <div className="completionAmounts" aria-label="Completed trade amounts">
              <div className="completionReceivedBlock">
                <span className="completionAmountLabel">
                  <i className="fa-solid fa-arrow-down" aria-hidden="true" />
                  Received
                </span>
                <p className="completionReceivedAmount">{receivedAmount}</p>
              </div>
              {paidAmount && (
                <div className="completionEquivalent">
                  <span><i className="fa-solid fa-arrow-up" aria-hidden="true" /> Paid</span>
                  <strong>{paidAmount}</strong>
                </div>
              )}
            </div>
            <p className="completionMessage">Your trade has been completed successfully.</p>
          </>
        ) : (
          <p className="completionMessage">Your order has been completed successfully.</p>
        )}
        <button type="button" className="completionButton" onClick={onClose}>
          Continue to feedback
          <i className="fa-solid fa-arrow-right" aria-hidden="true" />
        </button>
      </section>
    </div>
  );
}
