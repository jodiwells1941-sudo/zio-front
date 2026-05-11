"use client";

import React, { useEffect, useState } from "react";
import { addSecurityMoney } from "@/app/api/common"; // adjust import path as needed
import { toast } from "react-toastify";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AddSecurityMoneyModalProps {
  walletBalance: number;       // current available wallet balance
  currentSecurityDeposit: number; // current security_amount_for_ads
  onClose: () => void;
  onSuccess: (newSecurityDeposit: number) => void;
}

// ─── Validation ───────────────────────────────────────────────────────────────

const MIN_AMOUNT = 20;

function validateAmount(
  raw: string,
  walletBalance: number
): string {
  const trimmed = raw.trim();

  if (trimmed === "") return "Amount is required.";

  const num = Number(trimmed);

  if (isNaN(num) || !/^\d+(\.\d{1,2})?$/.test(trimmed)) {
    return "Please enter a valid amount.";
  }
  if (num < MIN_AMOUNT) {
    return `Minimum deposit amount is $${MIN_AMOUNT.toFixed(2)}.`;
  }
  if (num > walletBalance) {
    return "Amount exceeds your available wallet balance.";
  }

  return "";
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

export default function AddSecurityMoneyModal({
  walletBalance,
  currentSecurityDeposit,
  onClose,
  onSuccess,
}: AddSecurityMoneyModalProps) {
  const [amountRaw,       setAmountRaw]       = useState("");
  const [error,           setError]           = useState("");
  const [touched,         setTouched]         = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [loading,         setLoading]         = useState(false);
  const [apiError,        setApiError]        = useState("");

  // Re-validate when amount changes (only after first submit attempt or touched)
  useEffect(() => {
    if (!touched && !submitAttempted) return;
    setError(validateAmount(amountRaw, walletBalance));
  }, [amountRaw, walletBalance, touched, submitAttempted]);

  // ── Derived ───────────────────────────────────────────────────────────────
  const parsedAmount     = parseFloat(amountRaw) || 0;
  const previewBalance   = Math.max(walletBalance - parsedAmount, 0);
  const previewSecurity  = currentSecurityDeposit + parsedAmount;
  const hasValidAmount   = parsedAmount >= MIN_AMOUNT && parsedAmount <= walletBalance;

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmountRaw(e.target.value);
    setApiError("");
  };

  const handleBlur = () => {
    setTouched(true);
    setError(validateAmount(amountRaw, walletBalance));
  };

  const handleMaxClick = () => {
    setAmountRaw(walletBalance.toFixed(2));
    setTouched(true);
    setApiError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);
    setTouched(true);

    const validationError = validateAmount(amountRaw, walletBalance);
    setError(validationError);
    if (validationError) return;

    setLoading(true);
    setApiError("");

    try {
      const res = await addSecurityMoney({ amount: parsedAmount });
      onSuccess(res?.data?.new_security_deposit ?? previewSecurity);
      onClose();
      toast.success("Security deposit added successfully!");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Something went wrong. Please try again.";
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  };

  const showError = (touched || submitAttempted) && !!error;
  const showValid = (touched || submitAttempted) && !error && amountRaw.trim() !== "";

  return (
    <div
      className="rt-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="asm-modal-title"
    >
      {/* Backdrop */}
      <button
        className="rt-modal-backdrop"
        type="button"
        onClick={onClose}
        aria-label="Close modal"
      />

      <div className="bg-light-white rt-modal--lg w-md-25">

        {/* ── Head ── */}
        <div className="rt-modal-head">
          <h6 className="rt-modal-title" id="asm-modal-title">
            Add Security Deposit
          </h6>
          <button
            type="button"
            className="rt-modal-x"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* ── Body ── */}
        <div className="rt-modal-body bg-light-dark m-3 rounded border border-dark-light">
          <form onSubmit={handleSubmit} noValidate className="ticket-form">

            {/* ── Info Banner ── */}
            <div className="asm-info-banner border border-dark-light rounded p-3 mb-3 d-flex align-items-start gap-2">
              <i className="fa-solid fa-circle-info text-warning mt-1" aria-hidden="true" />
              <p className="mb-0 text-sm text-light">
                Security deposits are locked funds used to back your sell ads.
                They ensure trade reliability and will be released when your ads are closed.
              </p>
            </div>

            {/* ── Balance Summary ── */}
            <div className="ticket-form-grid mb-4">
              <div className="asm-balance-card border border-dark-light rounded p-3 text-center">
                <span className="asm-balance-label d-block text-light text-sm mb-1">
                  Wallet Balance
                </span>
                <span className="asm-balance-value fw-bold">
                  ${walletBalance.toFixed(2)}
                </span>
              </div>
              <div className="asm-balance-card border border-dark-light rounded p-3 text-center">
                <span className="asm-balance-label d-block text-light text-sm mb-1">
                  Security Deposit
                </span>
                <span className="asm-balance-value fw-bold">
                  ${currentSecurityDeposit.toFixed(2)}
                </span>
              </div>
            </div>

            {/* ── Amount Input ── */}
            <div className="input-box">
              <label htmlFor="asm-amount">
                Amount <span className="text-danger fs-4">*</span>
                <span className="text-sm ps-1 text-light">(min ${MIN_AMOUNT}.00)</span>
              </label>

              <div className="asm-amount-wrap position-relative">
                <input
                  id="asm-amount"
                  type="number"
                  min={MIN_AMOUNT}
                  step="0.01"
                  placeholder="0.00"
                  value={amountRaw}
                  onChange={handleAmountChange}
                  onBlur={handleBlur}
                  disabled={loading}
                  className={[
                    showError ? "is-invalid" : "",
                    showValid ? "is-valid"   : "",
                  ].join(" ").trim()}
                />
                {/* <button
                  type="button"
                  className="asm-max-btn btn--secondary text-sm py-1 px-2"
                  onClick={handleMaxClick}
                  disabled={loading || walletBalance <= 0}
                  tabIndex={-1}
                  aria-label="Use maximum wallet balance"
                >
                  MAX
                </button> */}
              </div>

              {showError && (
                <div className="invalid-feedback d-block">
                  <i className="fa-solid fa-circle-exclamation me-1" aria-hidden="true" />
                  {error}
                </div>
              )}
            </div>

            {/* ── Preview (only when valid amount entered) ── */}
            {hasValidAmount && (
              <div className="asm-preview border border-dark-light rounded p-3 mt-4">
                <p className="text-sm text-light mb-2 fw-semibold">After Transfer</p>
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span className="text-sm">Wallet Balance</span>
                  <span className="text-sm fw-bold text-danger">
                    ${previewBalance.toFixed(2)}
                  </span>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="text-sm">Security Deposit</span>
                  <span className="text-sm fw-bold text-success">
                    ${previewSecurity.toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            {/* ── API Error ── */}
            {apiError && (
              <div className="invalid-feedback d-block mt-3">
                <i className="fa-solid fa-circle-exclamation me-1" aria-hidden="true" />
                {apiError}
              </div>
            )}

          </form>
        </div>

        {/* ── Footer ── */}
        <div className="rt-modal-foot pb-3 px-3">
          <button
            type="button"
            className="ticket-action-btn"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || (submitAttempted && !!error)}
            className="btn--primary py-2 px-3 text-sm d-flex align-items-center justify-content-center gap-2"
          >
            {loading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm"
                  role="status"
                  aria-hidden="true"
                />
                Processing…
              </>
            ) : (
              <>
                Confirm Deposit <span className="arrow">›</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}