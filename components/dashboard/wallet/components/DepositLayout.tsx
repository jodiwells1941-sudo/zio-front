"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { TabKey } from "../types";
import Swal from "sweetalert2";
import { SubmitInitialDepositApi, VerifyDepositApi } from "@/app/api/wallet";
import { toast } from "react-toastify";

type DepositInfo = {
  amount: string;
  coin: string;
  token: string;
  address: string;
  qr_code: string;
  expires_at?: string;     // ISO timestamp from backend, e.g. "2026-06-30T10:30:00Z"
  status?: "pending" | "completed" | "expired" | "failed";
};

type StepKey = 1 | 2 | 3 | 4;

export default function DepositLayout({
  title,
  actionLabel,
  paymentMethods,
  amountPreset,
  selectedPayment,
  setSelectedPayment,
  selectedAmount,
  setSelectedAmount,
  setActiveTabValue,
}: {
  title: string;
  actionLabel: string;
  paymentMethods: string[];
  amountPreset: number[];
  selectedPayment: string;
  setSelectedPayment: (v: string) => void;
  selectedAmount: number;
  setSelectedAmount: (v: number) => void;
  setActiveTabValue: (v: TabKey) => void;
}) {
  const [depositAmount, setDepositAmount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [depositInfo, setDepositInfo] = useState<DepositInfo | null>(null);
  const [status, setStatus] = useState<"idle" | "waiting" | "completed" | "expired">("idle");
  const [secondsLeft, setSecondsLeft] = useState<number>(0);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentStep: StepKey = useMemo(() => {
    if (status === "completed") return 4;
    if (status === "waiting" || status === "expired") return 3;
    return depositAmount > 0 ? 2 : 1;
  }, [status, depositAmount]);

  // ---- Create deposit ----
  const validateAmount = () => {
    if (isNaN(depositAmount)) {
      toast.error("Please enter a valid amount.");
      return false;
    }
    if (depositAmount < 1) {
      toast.error("Minimum deposit amount is 5 USD.");
      return false;
    }
    if (depositAmount > 5000) {
      toast.error("Maximum deposit amount is 5,000 USD.");
      return false;
    }
    return true;
  };

  const createDeposit = async () => {
    if (!validateAmount()) return;

    setIsLoading(true);
    try {
      const response = await SubmitInitialDepositApi({ amount: depositAmount });

      if (!response.error) {
        const info: DepositInfo = response.data;
        setDepositInfo(info);
        setStatus("expired" === info.status ? "expired" : "waiting");

        if (info.expires_at) {
          const ms = new Date(info.expires_at).getTime() - Date.now();
          setSecondsLeft(Math.max(0, Math.floor(ms / 1000)));
        } else {
          // Fallback if backend hasn't been updated yet — 30 min default
          setSecondsLeft(30 * 60);
        }
      } else {
        Swal.fire("Failed", response.message || "Transaction failed. Please try again.", "error");
      }
    } catch (error) {
      Swal.fire("Error", "A network error occurred during submission.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateDeposit = async () => {
    if (!validateAmount()) return;

    const result = await Swal.fire({
      title: "Deposit Confirmation",
      icon: "info",
      html: `Are you sure you want to deposit <strong>${depositAmount} USD</strong>?`,
      showCloseButton: true,
      showCancelButton: true,
      focusConfirm: false,
      confirmButtonAriaLabel: "Thumbs up, great!",
      cancelButtonText: "No, Cancel!",
      confirmButtonText: "Yes, Deposit!",
      cancelButtonAriaLabel: "Thumbs down",
    });

    if (result.isConfirmed) {
      await createDeposit();
    }
  };

  // ---- Countdown timer ----
  useEffect(() => {
    if (status !== "waiting") return;

    tickRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          setStatus("expired");
          if (tickRef.current) clearInterval(tickRef.current);
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [status]);

  // ---- Poll for verification while waiting ----
  useEffect(() => {
    if (status !== "waiting" || !depositInfo?.token) return;

    pollRef.current = setInterval(async () => {
      try {
        const res = await VerifyDepositApi({ token: depositInfo.token });

        if (res?.data?.verified) {
          if (pollRef.current) clearInterval(pollRef.current);
          if (tickRef.current) clearInterval(tickRef.current);
          setStatus("completed");

          Swal.fire({ icon: "success", title: "Deposit Successful" });
        } else if (res?.data?.expired) {
          if (pollRef.current) clearInterval(pollRef.current);
          setStatus("expired");
        }
      } catch (err) {
        console.error("Verify poll failed", err);
        // transient network error — just let the next tick try again
      }
    }, 8000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [status, depositInfo?.token]);

  const resetFlow = () => {
    setDepositInfo(null);
    setStatus("idle");
    setSecondsLeft(0);
    setDepositAmount(0);
  };

  const copyText = (text: string, label: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => toast.success(`${label} copied to clipboard!`))
      .catch(() => toast.error(`Failed to copy ${label.toLowerCase()}.`));
  };

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
    const s = Math.floor(totalSeconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const steps: { key: StepKey; label: string; sub: string }[] = [
    { key: 1, label: "Enter Amount", sub: "Enter deposit amount" },
    { key: 2, label: "Select Coin", sub: "Choose cryptocurrency" },
    { key: 3, label: "Make Payment", sub: "Send to address" },
    { key: 4, label: "Complete", sub: "Balance will be added" },
  ];

  return (
    <div className="dl-wrapper">
      {/* Step indicator */}
      <div className="dl-steps bg-light-dark mt-3">
        {steps.map((s, idx) => (
          <React.Fragment key={s.key}>
            <div className={`dl-step ${currentStep >= s.key ? "dl-step--done" : ""} ${currentStep === s.key ? "dl-step--active" : ""}`}>
              <div className="dl-step-dot">{currentStep > s.key ? "✓" : s.key}</div>
              <div className="dl-step-text">
                <span className="dl-step-label">{s.label}</span>
                <small className="dl-step-sub">{s.sub}</small>
              </div>
            </div>
            {idx < steps.length - 1 && <div className={`dl-step-line ${currentStep > s.key ? "dl-step-line--done" : ""}`} />}
          </React.Fragment>
        ))}
      </div>

      {/* Form card */}
      <div className="dl-card dl-form-card bg-light-dark">
        <div className="dl-form-grid deposit-wrapper">
          <div>
            <label className="dl-label">1. Enter Deposit Amount <small className="text-danger fs-4">*</small></label>
            <div className="amount-input mb-2">
              <input
                type="text"
                inputMode="decimal"
                placeholder="0"
                value={depositAmount || ""}
                required
                onChange={(e) => {
                  const v = Number(e.target.value.replace(/[^\d.]/g, ""));
                  if (!Number.isNaN(v)) setDepositAmount(v);
                }}
              />
              <span>USD</span>
            </div>
            <small className="dl-hint text-danger">Min: 5 USD &nbsp;•&nbsp; Max: 5,000 USD</small>
          </div>

          <div>
             <label> 1. Select Network: <small className="text-danger fs-4">*</small></label>
            <div className="form-group-custom mt-8">
              <select required
                className="select-custom form-control-custom rounded-4"
                // value={formData.withFlat}
                // onChange={(e) => handleFlatChange(e.target.value)}
              >
                <option>TRX Tron (TRC20)</option>
              </select>
            </div>
          </div>

        </div>

        <button
          type="button"
          className="dl-cta"
          disabled={isLoading || depositAmount <= 0 || status === "waiting" || status === "completed"}
          onClick={handleCreateDeposit}
        >
          {isLoading ? "Creating..." : `Create Deposit`} <span aria-hidden>→</span>
        </button>
      </div>

      {/* Deposit details */}
      {depositInfo && status !== "idle" && (
        <div className="dl-details">
          <h3 className="dl-details-title">Deposit Details</h3>

          <div className="dl-details-grid">
            <div className="dl-card dl-info-card bg-light-dark">
              <div className="dl-row">
                <span className="dl-row-label">Coin</span>
                <span className="dl-row-value">
                  <span className="dl-coin-badge dl-coin-badge--usdt">T</span> USDT (Tether)
                </span>
              </div>
              <div className="dl-row">
                <span className="dl-row-label">Network</span>
                <span className="dl-row-value">
                  <span className="dl-coin-badge dl-coin-badge--trx">⟁</span> TRC20 (Tron)
                </span>
              </div>

              <div className="dl-block">
                <div className="dl-block-head">
                  <span>Deposit Address</span>
                  <span className="dl-pill">TRC20</span>
                </div>
                <div className="dl-address-row">
                  <code className="dl-address">{depositInfo.address}</code>
                  <button type="button" className="dl-icon-btn" onClick={() => copyText(depositInfo.address, "Address")} aria-label="Copy address">
                    <i className="fa-solid fa-copy" />
                  </button>
                  <button type="button" className="dl-icon-btn" aria-label="Show QR">
                    <i className="fa-solid fa-qrcode" />
                  </button>
                </div>
              </div>

              <div className="dl-block">
                <span className="dl-block-head"><span>Send Exact Amount</span></span>
                <div className="dl-exact-row">
                  <span className="dl-exact-amount"><b>{ depositInfo.amount}</b> <b className="text-warning ps-2">USDT</b></span>
                  <button
                    type="button"
                    className="dl-icon-btn"
                    onClick={() => copyText( depositInfo.amount, "Amount")}
                    aria-label="Copy amount"
                  >
                    <i className="fa-solid fa-copy" />
                  </button>
                </div>
              </div>

              {depositInfo.qr_code && (
                <div className="dl-block">
                  <span className="dl-block-head"><span>QR Code</span></span>
                  <div className="dl-qr-wrap">
                    <Image src={depositInfo.qr_code} width={170} height={170} alt="Deposit QR code" className="rounded" />
                  </div>
                </div>
              )}
            </div>

            <div className="dl-side-col">
              <div className="dl-card dl-timer-card bg-light-dark">
                <span className="dl-side-label"><i className="fa-regular fa-clock" /> Time Left</span>
                <div className={`dl-timer ${secondsLeft <= 60 ? "dl-timer--danger" : ""}`}>
                  {status === "expired" ? "00:00" : formatTime(secondsLeft)}
                </div>
                <small className="dl-side-sub">
                  {status === "expired"
                    ? "This deposit request has expired"
                    : "This deposit request will expire soon"}
                </small>
              </div>

              <div className="dl-card dl-status-card bg-light-dark">
                <div className="dl-side-label-row">
                  <span className="dl-side-label">⧖ Deposit Status</span>
                  <span className={`dl-status-pill dl-status-pill--${status}`}>
                    {status === "waiting" && "Waiting"}
                    {status === "completed" && "Completed"}
                    {status === "expired" && "Expired"}
                  </span>
                </div>

                <div className="dl-status-visual">
                  <div className={`dl-status-ring dl-status-ring--${status}`}>
                    <i
                      className={
                        status === "completed"
                          ? "fa-solid fa-check"
                          : status === "expired"
                          ? "fa-solid fa-xmark"
                          : "fa-regular fa-hourglass-half"
                      }
                    />
                  </div>
                </div>

                <p className="dl-status-text">
                  {status === "waiting" && "Waiting for payment... Once we receive your payment, your balance will be updated automatically."}
                  {status === "completed" && "Payment received. Your balance has been updated."}
                  {status === "expired" && "This request expired before payment was detected. Please create a new deposit."}
                </p>

                {status === "expired" && (
                  <button type="button" className="dl-cta dl-cta--secondary mt-3 text-white" onClick={resetFlow}>
                    Create New Deposit
                  </button>
                )}

                {status === "completed" && (
                  <button
                    type="button"
                    className="dl-cta mt-3"
                    onClick={() => setActiveTabValue("tab6" as TabKey)}
                  >
                    View Transaction Details
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="dl-notice">
            <div className="dl-notice-title">⚠ Important Notice</div>
            <ul>
              <li>Please send only <strong className="dl-accent-green">USDT</strong> to the address above.</li>
              <li>Ensure you are sending on the <strong className="dl-accent-red">TRC20 (Tron)</strong> network.</li>
              <li>Send the <strong className="dl-accent-amber">exact amount</strong> shown above. Wrong amount may require manual review.</li>
              <li>Do not send from an exchange (Binance, Coinbase, etc.) using an internal transfer.</li>
              <li>This deposit request is valid for <strong className="dl-accent-amber">10 minutes</strong> only.</li>
            </ul>
          </div>
        </div>
      )}

      <style jsx>{`
        .dl-wrapper {
          display: flex;
          flex-direction: column;
          gap: 24px;
          color: #e9ecf3;
        }

        /* Steps */
        .dl-steps {
          display: flex;
          align-items: center;
          /* background: #11151f; */
          border: 1px solid #1f2433;
          border-radius: 14px;
          padding: 18px 22px;
        }
        .dl-step {
          display: flex;
          align-items: center;
          gap: 10px;
          opacity: 0.55;
        }
        .dl-step--done,
        .dl-step--active {
          opacity: 1;
        }
        .dl-step-dot {
          width: 30px;
          height: 30px;
          flex-shrink: 0;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 700;
          background: #1c2133;
          color: #9aa4ba;
        }
        .dl-step--done .dl-step-dot {
          background: #1fae5c;
          color: #fff;
        }
        .dl-step--active .dl-step-dot {
          background: #1fae5c;
          color: #fff;
          box-shadow: 0 0 0 4px rgba(31, 174, 92, 0.18);
        }
        .dl-step-text {
          display: flex;
          flex-direction: column;
          line-height: 1.2;
        }
        .dl-step-label {
          font-size: 13px;
          font-weight: 600;
          color: #f2f4f8;
        }
        .dl-step-sub {
          font-size: 11px;
          color: #7c8499;
        }
        .dl-step-line {
          flex: 1;
          height: 1px;
          background: #232838;
          margin: 0 14px;
        }
        .dl-step-line--done {
          background: #1fae5c;
        }
        @media (max-width: 768px) {
          .dl-steps {
            overflow-x: auto;
          }
          .dl-step-sub {
            display: none;
          }
        }

        /* Cards */
        .dl-card {
          border: 1px solid #1f2433;
          border-radius: 14px;
          padding: 20px;
        }

        .dl-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 18px;
        }
        @media (max-width: 700px) {
          .dl-form-grid {
            grid-template-columns: 1fr;
          }
        }

        .dl-label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: #f2f4f8;
          margin-bottom: 8px;
        }

        .dl-amount-input {
          display: flex;
          align-items: center;
          background: #161b29;
          border: 1px solid #262c40;
          border-radius: 10px;
          padding: 4px 16px;
        }
        .dl-amount-input input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: #fff;
          font-size: 22px;
          font-weight: 700;
          padding: 10px 0;
        }
        .dl-amount-input span {
          color: #8d96ad;
          font-weight: 600;
        }
        .dl-hint {
          display: block;
          margin-top: 6px;
          color: #7c8499;
          font-size: 12px;
        }

        .dl-select-row {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .dl-select-fake {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #161b29;
          border: 1px solid #262c40;
          border-radius: 10px;
          padding: 12px 16px;
          font-weight: 600;
          font-size: 14px;
          color: #f2f4f8;
        }

        .dl-coin-badge {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 700;
          color: #fff;
        }
        .dl-coin-badge--usdt {
          background: #1fae5c;
        }
        .dl-coin-badge--trx {
          background: #e2393c;
        }

        .dl-cta {
          width: 100%;
          border: none;
          border-radius: 50px;
          padding: 14px 18px;
          font-weight: 700;
          font-size: 15px;
          color: #222E48;
          background: linear-gradient(90deg, #9CECFE, #9CECFE);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          transition: opacity 0.15s ease;
        }
        .dl-cta:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .dl-cta--secondary {
          background: #1c2133;
        }

        /* Details */
        .dl-details-title {
          color: #2bd073;
          font-weight: 700;
          font-size: 16px;
        }
        .dl-details-grid {
          display: grid;
          grid-template-columns: 1.4fr 1fr;
          gap: 18px;
        }
        @media (max-width: 860px) {
          .dl-details-grid {
            grid-template-columns: 1fr;
          }
        }

        .dl-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid #1c2133;
          font-size: 14px;
        }
        .dl-row-label {
          color: #8d96ad;
        }
        .dl-row-value {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
        }

        .dl-block {
          margin-top: 16px;
        }
        .dl-block-head {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: #8d96ad;
          margin-bottom: 6px;
        }
        .dl-pill {
          background: #16321f;
          color: #2bd073;
          font-size: 10px;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 999px;
        }
        .dl-address-row,
        .dl-exact-row {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #161b29;
          border: 1px solid #262c40;
          border-radius: 10px;
          padding: 12px 14px;
        }
        .dl-address {
          flex: 1;
          font-size: 13px;
          word-break: break-all;
          color: #f2f4f8;
        }
        .dl-exact-amount {
          flex: 1;
          font-size: 18px;
          font-weight: 700;
          color: #2bd073;
        }
        .dl-icon-btn {
          background: #1c2133;
          border: none;
          color: #c8cee0;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
        }
        .dl-icon-btn:hover {
          background: #262c40;
        }
        .dl-qr-wrap {
          display: flex;
          justify-content: center;
          background: #fff;
          padding: 14px;
          border-radius: 10px;
          width: fit-content;
          margin: 0 auto;
        }

        .dl-side-col {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }
        .dl-side-label {
          font-size: 12px;
          color: #8d96ad;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .dl-timer-card {
          text-align: center;
        }
        .dl-timer {
          font-size: 32px;
          font-weight: 800;
          color: #2bd073;
          margin: 8px 0 4px;
          font-variant-numeric: tabular-nums;
        }
        .dl-timer--danger {
          color: #ef4060;
        }
        .dl-side-sub {
          color: #7c8499;
          font-size: 12px;
        }

        .dl-side-label-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 14px;
        }
        .dl-status-pill {
          font-size: 11px;
          font-weight: 700;
          padding: 3px 10px;
          border-radius: 999px;
        }
        .dl-status-pill--waiting {
          background: #3a2c12;
          color: #f0b332;
        }
        .dl-status-pill--completed {
          background: #16321f;
          color: #2bd073;
        }
        .dl-status-pill--expired {
          background: #3a151c;
          color: #ef4060;
        }
        .dl-status-visual {
          display: flex;
          justify-content: center;
          margin: 6px 0 14px;
        }
        .dl-status-ring {
          width: 86px;
          height: 86px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 26px;
          background: radial-gradient(circle, rgba(60, 110, 240, 0.18), transparent 70%);
          border: 2px solid #2a3b6e;
          color: #6f8af0;
        }
        .dl-status-ring--completed {
          border-color: #1fae5c;
          color: #2bd073;
          background: radial-gradient(circle, rgba(31, 174, 92, 0.18), transparent 70%);
        }
        .dl-status-ring--expired {
          border-color: #b3334a;
          color: #ef4060;
          background: radial-gradient(circle, rgba(239, 64, 96, 0.18), transparent 70%);
        }

        /* Icon animations — status ring only */
        .dl-status-ring--waiting {
          animation: dl-pulse-ring 1.8s ease-in-out infinite;
        }
        .dl-status-ring--waiting i {
          animation: dl-hourglass-flip 1.8s ease-in-out infinite;
          transform-origin: center;
        }
        .dl-status-ring--completed i {
          animation: dl-check-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }
        .dl-status-ring--expired i {
          animation: dl-x-shake 0.5s ease-in-out both;
        }

        @keyframes dl-pulse-ring {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(111, 138, 240, 0.35);
          }
          50% {
            box-shadow: 0 0 0 10px rgba(111, 138, 240, 0);
          }
        }
        @keyframes dl-hourglass-flip {
          0%, 35% {
            transform: rotate(0deg);
          }
          50%, 85% {
            transform: rotate(180deg);
          }
          100% {
            transform: rotate(180deg);
          }
        }
        @keyframes dl-check-pop {
          0% {
            transform: scale(0.3);
            opacity: 0;
          }
          60% {
            transform: scale(1.25);
            opacity: 1;
          }
          100% {
            transform: scale(1);
          }
        }
        @keyframes dl-x-shake {
          0%, 100% {
            transform: translateX(0) scale(1);
          }
          20% {
            transform: translateX(-4px) scale(1.1);
          }
          40% {
            transform: translateX(4px) scale(1.1);
          }
          60% {
            transform: translateX(-3px) scale(1.05);
          }
          80% {
            transform: translateX(3px) scale(1.05);
          }
        }

        .dl-status-text {
          text-align: center;
          font-size: 13px;
          color: #9aa4ba;
          line-height: 1.5;
          margin: 0;
        }

        .dl-notice {
          margin-top: 18px;
          border: 1px dashed #5a4a1c;
          background: #1d1908;
          border-radius: 12px;
          padding: 16px 18px;
        }
        .dl-notice-title {
          color: #f0b332;
          font-weight: 700;
          margin-bottom: 8px;
          font-size: 14px;
        }
        .dl-notice ul {
          margin: 0;
          padding-left: 18px;
          color: #c8cee0;
          font-size: 13px;
          line-height: 1.8;
        }
        .dl-accent-green {
          color: #2bd073;
        }
        .dl-accent-red {
          color: #ef4060;
        }
        .dl-accent-amber {
          color: #f0b332;
        }
      `}</style>
    </div>
  );
}