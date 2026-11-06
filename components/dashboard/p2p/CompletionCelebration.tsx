"use client";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function CompletionCelebration({ isOpen, onClose }: Props) {
  if (!isOpen) return null;

  return (
    <div className="completionCelebration" role="dialog" aria-modal="true" aria-labelledby="completion-celebration-title">
      <section className="completionCard">
        <div className="completionBadge" aria-hidden="true">
          <i className="fa-solid fa-check" />
        </div>
        <span className="completionEyebrow">Trade complete</span>
        <h2 id="completion-celebration-title">Order Completed</h2>
        <p>Your order has been completed successfully.</p>
        <button type="button" className="completionButton" onClick={onClose}>
          Continue to feedback
          <i className="fa-solid fa-arrow-right" aria-hidden="true" />
        </button>
      </section>
    </div>
  );
}
