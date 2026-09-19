'use client';

import { useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PaymentReceivedModelProps {
  isOpen: boolean;
  onClose: () => void;
  setConfirmPayment: () => void;
  buyerName: string;
  amount: number;
  currency: string;
  details?: Array<{ label: string; value: string }>;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PaymentReceivedModel({
  isOpen,
  onClose,
  setConfirmPayment,
  buyerName,
  amount,
  currency,
  details = [],
}: PaymentReceivedModelProps) {
  const [isVerified, setIsVerified] = useState(false);

  if (!isOpen) return null;

  const formattedAmount = Number(amount).toFixed(2);

  return (
    <div className="modal-overlay">
      <div className="modal-content">

        {/* Header */}
        <div className="modal-header">
          <h6 className="modal-title">Received payment in your account?</h6>
          <button
            onClick={onClose}
            className="modal-close-btn"
            aria-label="Close modal"
            type="button"
          >
            <i className="fas fa-times" />
          </button>
        </div>

        {/* Body */}
        <div className="m-2 bg-dark rounded">
          <div className="modal-body">
            {details.length > 0 && (
              <div className="mb-3 rounded border border-secondary-subtle p-3 bg-black bg-opacity-10">
                <div className="fw-semibold text-white mb-2">Order details</div>
                {details.map((row, index) => (
                  <div key={`${row.label}-${index}`} className="d-flex justify-content-between align-items-center gap-3 py-1 small text-white-50">
                    <span>{row.label}</span>
                    <strong className="text-white text-end">{row.value}</strong>
                  </div>
                ))}
              </div>
            )}

            {/* Steps — shown before checkbox is checked */}
            {!isVerified && (
              <>
                <div className="verification-step">
                  <div className="step-indicator">
                    <div className="step-number">
                      <i className="fas fa-check" />
                    </div>
                  </div>
                  <div className="step-content">
                    <p className="step-text">
                      Log in to your receiving account to verify that the payment of{' '}
                      <strong>{currency} {formattedAmount}</strong> has been received.
                    </p>
                  </div>
                </div>

                <div className="verification-step">
                  <div className="step-indicator">
                    <div className="step-number">
                      <i className="fas fa-check" />
                    </div>
                  </div>
                  <div className="step-content">
                    <p className="step-text">
                      Verify the buyer&apos;s real name is{' '}
                      <strong>{buyerName}</strong>. Click &ldquo;Confirm Release&rdquo; to proceed.
                    </p>
                  </div>
                </div>
              </>
            )}

            {/* Warning — shown after checkbox is checked */}
            {isVerified && (
              <div className="verification-step">
                <div className="step-indicator">
                  <div className="step-number">
                    <i className="fas fa-exclamation-circle" />
                  </div>
                </div>
                <div className="step-content">
                  <p className="step-text">
                    If you release the crypto without checking your payment, you may lose your assets!
                    To avoid loss due to bank chargeback,{' '}
                    <strong>DO NOT</strong> accept payments from an unassociated third-party account.
                  </p>
                </div>
              </div>
            )}

            {/* Verification checkbox */}
            <div className="verification-checkbox-wrapper">
              <input
                type="checkbox"
                id="payment-verify"
                className="verification-checkbox"
                checked={isVerified}
                onChange={e => setIsVerified(e.target.checked)}
              />
              <label htmlFor="payment-verify" className="verification-label">
                I have verified that I received{' '}
                <strong>{currency} {formattedAmount}</strong>{' '}
                in my account from the buyer —{' '}
                <strong>{buyerName}</strong>
              </label>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer mx-auto mb-4 mt-4">
          <button
            type="button"
            className={`confirm-btn ${isVerified ? 'active' : 'disabled'}`}
            disabled={!isVerified}
            onClick={setConfirmPayment}
          >
            Confirm Release
          </button>
        </div>

      </div>
    </div>
  );
}

