"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { TabKey } from "../types";
import Swal from "sweetalert2";
import {
  SubmitInitialDepositApi,
  VerifyDepositApi,
  SubmitBinanceDepositApi,
} from "@/app/api/wallet";
import { depositListApi } from "@/app/api/wallet";
import { toast } from "react-toastify";
import DepositSupportModal from "./DepositSupportModal";
import PaginationControls from "../../PaginationControls";
import { useRouter } from "next/navigation";

type DepositInfo = {
  amount: string;
  deposit_id: string;
  coin: string;
  token: string;
  address: string;
  qr_code: string;
  expires_at?: string;
  status?: "pending" | "completed" | "expired" | "failed";
};

type DepositRow = {
  id: number;
  deposit_id: string;
  amount: string;
  network: string;
  status: number; // 1 pending, 2 completed, 3 failed, 4 expired
  created_at: string;
  payment_method: string;
};

type Pagination = {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  next_page_url: string | null;
  prev_page_url: string | null;
};

type StepKey = 1 | 2 | 3 | 4;

const COIN_OPTIONS = [
  { id: "USDT", label: "USDT (Tether)", badge: "T", className: "usdt" },
];

const NETWORK_OPTIONS = [
  { id: "TRC20", label: "TRX Tron (TRC20)", badge: "⟁", className: "trx" },
];

const STATUS_MAP: Record<number, { label: string; cls: string }> = {
  1: { label: "Pending",   cls: "status-pending" },
  2: { label: "Completed", cls: "status-confirmed" },
  3: { label: "Failed",    cls: "status-cancelled" },
  4: { label: "Expired",   cls: "status-cancelled" },
};

// ── payment methods ────────────────────────────────────────────────────────
const PAYMENT_METHODS = [
  { id: "crypto",  label: "Crypto",         desc: "Pay with USDT (TRC20)",  icon: "fa-solid fa-coins" },
  { id: "binance", label: "Binance Pay Manual", desc: "Pay via Binance transfer", icon: "fa-brands fa-bitcoin" },
] as const;

type PaymentMethodId = (typeof PAYMENT_METHODS)[number]["id"];

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
  const defaultAmount = amountPreset?.[0] ?? 0;

  // ── payment method selection (Crypto / Binance Manual) ──────────────────────
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodId>("crypto");
  const route = useRouter();
  const [adminBinance, setAdminBinance] = useState({
    wallet_address: '',
    binance_id: '1054059828'
  })

  // ── deposit form state (crypto) ─────────────────────────────────────────────
  const [depositAmount, setDepositAmount] = useState<number>(defaultAmount);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [depositInfo, setDepositInfo] = useState<DepositInfo | null>(null);
  const [status, setStatus] = useState<"idle" | "waiting" | "completed" | "expired">("idle");
  const [secondsLeft, setSecondsLeft] = useState<number>(0);
  const [totalSeconds, setTotalSeconds] = useState<number>(30 * 60);
  const [selectedCoin, setSelectedCoin] = useState<string>(COIN_OPTIONS[0].id);
  const [selectedNetwork, setSelectedNetwork] = useState<string>(NETWORK_OPTIONS[0].id);

  // ── deposit form state (binance manual) ─────────────────────────────────────
  const [binanceUserId, setBinanceUserId] = useState<string>("");
  const [binanceAmount, setBinanceAmount] = useState<number>(defaultAmount);
  const [binanceSubmitting, setBinanceSubmitting] = useState<boolean>(false);
  const [binanceSubmitted, setBinanceSubmitted] = useState<boolean>(false);
  const [binanceDepositId, setBinanceDepositId] = useState<string>("");

  // ── support modal state (shared) ─────────────────────────────────────────────
  const [supportModalMode, setSupportModalMode] = useState<"submit" | "support" | null>(null);

  // ── deposit list state ──────────────────────────────────────────────────────
  const [depositList, setDepositList] = useState<DepositRow[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    current_page: 1, last_page: 1, per_page: 10, total: 0,
    next_page_url: null, prev_page_url: null,
  });
  const [isListLoading, setIsListLoading] = useState<boolean>(false);
  const [isFetching, setIsFetching] = useState<boolean>(false);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── sync parent ─────────────────────────────────────────────────────────────
  useEffect(() => {
    setSelectedAmount(depositAmount);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [depositAmount]);

  // ── fetch deposit list ──────────────────────────────────────────────────────
  const fetchDepositList = useCallback(async (page = 1, initial = false) => {
    if (initial) setIsListLoading(true);
    else setIsFetching(true);

    try {
      // depositListApi does not accept arguments; call without page
      const res = await depositListApi();

      if (!res.error) {
        setDepositList(res.data.data ?? []);
        setPagination({
          current_page: res.data.current_page,
          last_page:    res.data.last_page,
          per_page:     res.data.per_page,
          total:        res.data.total,
          next_page_url: res.data.next_page_url,
          prev_page_url: res.data.prev_page_url,
        });
      }
    } catch {
      // silently ignore — list is non-critical
    } finally {
      setIsListLoading(false);
      setIsFetching(false);
    }
  }, []);

  useEffect(() => { fetchDepositList(1, true); }, [fetchDepositList]);

  const handlePageChange = (page: number) => fetchDepositList(page);

  const slOffset = (pagination.current_page - 1) * pagination.per_page;

  // ── step indicator (crypto flow) ─────────────────────────────────────────────
  const currentStep: StepKey = useMemo(() => {
    if (status === "completed") return 4;
    if (status === "waiting" || status === "expired") return 3;
    return depositAmount > 0 ? 2 : 1;
  }, [status, depositAmount]);

  // ── validation (crypto) ───────────────────────────────────────────────────────
  const validateAmount = () => {
    if (isNaN(depositAmount)) { toast.error("Please enter a valid amount."); return false; }
    if (depositAmount < 1)    { toast.error("Minimum deposit amount is 1 USD."); return false; }
    if (depositAmount > 5000) { toast.error("Maximum deposit amount is 5,000 USD."); return false; }
    return true;
  };

  // ── create deposit (crypto) — UNCHANGED ─────────────────────────────────────
  const createDeposit = async () => {
    if (!validateAmount()) return;    

    setIsLoading(true);
    try {
      const response = await SubmitInitialDepositApi({
        amount: depositAmount,
        coin: selectedCoin,
        network: selectedNetwork,
        payment_method: paymentMethod,
      });

      if (!response.error) {
        const info: DepositInfo = response.data;
        setDepositInfo(info);
        setStatus("expired" === info.status ? "expired" : "waiting");

        if (info.expires_at) {
          const secs = Math.max(0, Math.floor((new Date(info.expires_at).getTime() - Date.now()) / 1000));
          setSecondsLeft(secs);
          setTotalSeconds(secs > 0 ? secs : 30 * 60);
        } else {
          setSecondsLeft(30 * 60);
          setTotalSeconds(30 * 60);
        }

        // refresh list so new pending row shows immediately
        fetchDepositList(1);
      } else {
        Swal.fire("Failed", response.message || "Transaction failed. Please try again.", "error");
      }
    } catch {
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
      html: `Are you sure you want to deposit <strong>${depositAmount} USD</strong> in <strong>${selectedCoin}</strong> on <strong>${selectedNetwork}</strong>?`,
      showCloseButton: true, showCancelButton: true, focusConfirm: false,
      cancelButtonText: "No, Cancel!", confirmButtonText: "Yes, Deposit!",
    });
    if (result.isConfirmed) await createDeposit();
  };

  // ── validation + submit (binance manual) ─────────────────────────────────────
  const validateBinanceAmount = () => {
    if (isNaN(binanceAmount)) { toast.error("Please enter a valid amount."); return false; }
    if (binanceAmount < 1)    { toast.error("Minimum deposit amount is 1 USD."); return false; }
    if (binanceAmount > 5000) { toast.error("Maximum deposit amount is 5,000 USD."); return false; }
    return true;
  };

  const handleBinanceSubmit = async () => {
    if (!binanceUserId.trim()) { toast.error("Please enter your Binance ID."); return; }
    if (!validateBinanceAmount()) return;

    const result = await Swal.fire({
      title: "Deposit Confirmation",
      icon: "info",
      html: `Are you sure you want to deposit <strong>${binanceAmount} USD</strong> via <strong>Binance</strong>?`,
      showCloseButton: true, showCancelButton: true, focusConfirm: false,
      cancelButtonText: "No, Cancel!", confirmButtonText: "Yes, Deposit!",
    });
    if (!result.isConfirmed) return;

    setBinanceSubmitting(true);

    try {
      const response = await SubmitBinanceDepositApi({
        binance_id: binanceUserId.trim(),
        amount: binanceAmount,
        payment_method: paymentMethod,
      });

      if (!response.error) {
        setBinanceSubmitted(true);
        setBinanceDepositId(response.data?.deposit_id ?? "");
        toast.success("Deposit request submitted. Please complete the transfer, then submit your payment details for review.");
        fetchDepositList(1);
      } else {
        Swal.fire("Failed", response.message || "Transaction failed. Please try again.", "error");
      }
    } catch {
      Swal.fire("Error", "A network error occurred during submission.", "error");
    } finally {
      setBinanceSubmitting(false);
    }
  };

  const resetBinanceFlow = () => {
    setBinanceSubmitted(false);
    setBinanceDepositId("");
    setBinanceUserId("");
    setBinanceAmount(defaultAmount);
  };

  // ── countdown (crypto) ───────────────────────────────────────────────────────
  useEffect(() => {
    if (status !== "waiting") return;
    tickRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) { setStatus("expired"); if (tickRef.current) clearInterval(tickRef.current); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [status]);

  // ── poll verify (crypto) ─────────────────────────────────────────────────────
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
          fetchDepositList(1); // refresh list on success
        } else if (res?.data?.expired) {
          if (pollRef.current) clearInterval(pollRef.current);
          setStatus("expired");
        }
      } catch (err) { console.error("Verify poll failed", err); }
    }, 8000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [status, depositInfo?.token]);

  // ── helpers ─────────────────────────────────────────────────────────────────
  const resetFlow = () => {
    setDepositInfo(null); setStatus("idle");
    setSecondsLeft(0); setDepositAmount(defaultAmount);
  };

  const copyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
      .then(() => toast.success(`${label} copied to clipboard!`))
      .catch(() => toast.error(`Failed to copy ${label.toLowerCase()}.`));
  };

  const formatTime = (s: number) => ({
    m: Math.floor(s / 60).toString().padStart(2, "0"),
    s: Math.floor(s % 60).toString().padStart(2, "0"),
  });

  const formatDate = (dt: string) =>
    new Date(dt).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });

  const isLocked = status === "waiting" || status === "completed";
  const { m: minutesLabel, s: secondsLabel } = formatTime(status === "expired" ? 0 : secondsLeft);
  const RING_RADIUS = 52;
  const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
  const ringProgress = totalSeconds > 0 ? Math.max(0, Math.min(1, secondsLeft / totalSeconds)) : 0;
  const ringOffset = RING_CIRCUMFERENCE * (1 - ringProgress);

  const steps: { key: StepKey; label: string; sub: string }[] = [
    { key: 1, label: "Enter Amount",   sub: "Enter deposit amount" },
    { key: 2, label: "Select Coin",    sub: "Choose cryptocurrency" },
    { key: 3, label: "Make Payment",   sub: "Send to address" },
    { key: 4, label: "Complete",       sub: "Balance will be added" },
  ];

  // ── shared support modal props ───────────────────────────────────────────────
  const supportDepositId = paymentMethod === "crypto" ? (depositInfo?.deposit_id ?? "") : binanceDepositId;
  const supportDepositAmount = paymentMethod === "crypto" ? (depositInfo?.amount ?? "") : (binanceAmount ? String(binanceAmount) : "");
  const supportCoinLabel = paymentMethod === "crypto" ? "USDT" : "USD";

  // ── render ──────────────────────────────────────────────────────────────────
  return (
    <div className="dl-wrapper">

      {/* Payment method selector */}
      <div className="dl-card dl-method-card bg-light-dark mt-3">
        <label className="dl-label mb-2 fs-5">Select Payment Method <small className="text-danger fs-4">*</small></label>
        {/* dl-method-grid  */}
        <div className="">
          {PAYMENT_METHODS.map((m) => (
            <button
              key={m.id}
              type="button"
              className={`dl-method-btn bg-dark w-50 mt-3 ${paymentMethod === m.id ? "active" : ""}`}
              disabled={isLocked || binanceSubmitted}
              onClick={() => setPaymentMethod(m.id)}
            >
              <span className={` ${paymentMethod === m.id ? 'bg-warning' : 'bg-light-white'} dl-method-icon`}><i className={m.icon} /></span>
              <span className="dl-method-text gap-0">
                <span className="dl-method-label">{m.label}</span>
                <small className="dl-method-sub">{m.desc}</small>
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Step indicator */}
      <div className="dl-steps bg-light-dark mt-2">
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

      {/* ── CRYPTO FLOW (unchanged) ─────────────────────────────────────────── */}
      {paymentMethod === "crypto" && (
        <>
          {/* Form card */}
          <div className="dl-card dl-form-card bg-light-dark">
            <div className="dl-form-grid deposit-wrapper mt-0">
              <div>
                <label className="dl-label">1. Enter Deposit Amount <small className="text-danger fs-4">*</small></label>
                <div className="amount-input mb-2">
                  <input
                    type="text" inputMode="decimal" placeholder="Amount"
                    value={depositAmount || ""} required disabled={isLocked}
                    onChange={(e) => {
                      const v = Number(e.target.value.replace(/[^\d.]/g, ""));
                      if (!Number.isNaN(v)) setDepositAmount(v);
                    }}
                  />
                  <span>USDT</span>
                </div>
                {amountPreset?.length > 0 && (
                  <div className="dl-amount-presets">
                    {amountPreset.map((n) => (
                      <button key={n} type="button" disabled={isLocked}
                        className={`dl-preset-btn ${depositAmount === n ? "active" : ""}`}
                        onClick={() => setDepositAmount(n)}>{n}</button>
                    ))}
                  </div>
                )}
                <small className="dl-hint text-danger">Min: 5 USD &nbsp;•&nbsp; Max: 5,000 USD</small>
              </div>

              <div>
                <label>2. Select Coin: <small className="text-danger fs-4">*</small></label>
                <div className="dl-select-row pt-2">
                  <div className="dl-dropdown">
                    <span className={`dl-coin-badge dl-coin-badge--${COIN_OPTIONS.find((c) => c.id === selectedCoin)?.className}`}>
                      {COIN_OPTIONS.find((c) => c.id === selectedCoin)?.badge}
                    </span>
                    <select disabled={isLocked} value={selectedCoin} onChange={(e) => setSelectedCoin(e.target.value)} aria-label="Select coin">
                      {COIN_OPTIONS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                    </select>
                    <i className="fa-solid fa-chevron-down dl-dropdown-caret" />
                  </div>
                  <label>3. Select Network: <small className="text-danger fs-4">*</small></label>
                  <div className="dl-dropdown">
                    <span className={`dl-coin-badge dl-coin-badge--${NETWORK_OPTIONS.find((n) => n.id === selectedNetwork)?.className}`}>
                      {NETWORK_OPTIONS.find((n) => n.id === selectedNetwork)?.badge}
                    </span>
                    <select disabled={isLocked} value={selectedNetwork} onChange={(e) => setSelectedNetwork(e.target.value)} aria-label="Select network">
                      {NETWORK_OPTIONS.map((n) => <option key={n.id} value={n.id}>{n.label}</option>)}
                    </select>
                    <i className="fa-solid fa-chevron-down dl-dropdown-caret" />
                  </div>
                </div>
              </div>
            </div>

            <div className="d-flex justify-content-end pt-2">
              <button type="button" className="dl-cta w-50"
                disabled={isLoading || depositAmount <= 0 || isLocked}
                onClick={handleCreateDeposit}>
                {isLoading ? "Creating..." : "Create Deposit"} <span aria-hidden>→</span>
              </button>
            </div>
          </div>

          {/* Deposit details */}
          {depositInfo && status !== "idle" && (
            <div className="dl-details">
              <h3 className="dl-details-title">Deposit Details</h3>

              <div className="dl-details-grid">
                {/* left: info card */}
                <div className="dl-card dl-info-card bg-light-dark">
                  <div className="dl-row">
                    <span className="dl-row-label">Coin</span>
                    <span className="dl-row-value"><span className="dl-coin-badge dl-coin-badge--usdt">T</span> USDT (Tether)</span>
                  </div>
                  <div className="dl-row">
                    <span className="dl-row-label">Network</span>
                    <span className="dl-row-value"><span className="dl-coin-badge dl-coin-badge--trx">⟁</span> TRC20 (Tron)</span>
                  </div>

                  <div className="dl-block">
                    <div className="dl-block-head">
                      <span>Deposit Address</span><span className="dl-pill">TRC20</span>
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

                  <div className="dl-block border-bottom border-dark-light">
                    <span className="dl-block-head"><span>Send Exact Amount</span></span>
                    <div className="dl-exact-row">
                      <span className="dl-exact-amount fs-2"><b>{depositInfo.amount}</b> <b className="text-warning ps-2">USDT</b></span>
                      <button type="button" className="dl-icon-btn" onClick={() => copyText(depositInfo.amount, "Amount")} aria-label="Copy amount">
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

                {/* right: timer + status */}
                <div className="dl-side-col">
                  <div className="dl-card dl-timer-card bg-light-dark">
                    <span className="dl-side-label dl-side-label--center">Payment Expires In</span>
                    <div className="dl-ring-wrap">
                      <svg className="dl-ring-svg" viewBox="0 0 120 120">
                        <defs>
                          <linearGradient id="dlRingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%"   stopColor="#FCE38A" />
                            <stop offset="50%"  stopColor="#F9C74F" />
                            <stop offset="100%" stopColor="#F8961E" />
                          </linearGradient>
                        </defs>
                        <circle className="dl-ring-track" cx="60" cy="60" r={RING_RADIUS} />
                        <circle
                          className={`dl-ring-progress ${secondsLeft <= 60 && status === "waiting" ? "dl-ring-progress--danger" : ""}`}
                          cx="60" cy="60" r={RING_RADIUS}
                          strokeDasharray={RING_CIRCUMFERENCE}
                          strokeDashoffset={status === "expired" ? RING_CIRCUMFERENCE : ringOffset}
                        />
                      </svg>
                      <div className="dl-ring-center">
                        <span className="dl-ring-time">
                          {status === "expired" ? "00:00" : `${minutesLabel}:${secondsLabel}`}
                        </span>
                        <div className="dl-ring-units pt-1">
                          <span>Minutes</span><span>Seconds</span>
                        </div>
                      </div>
                    </div>
                    <small className="dl-side-sub">
                      {status === "expired" ? "This deposit request has expired" : "This deposit request will expire soon"}
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
                        <i className={status === "completed" ? "fa-solid fa-check" : status === "expired" ? "fa-solid fa-xmark" : "fa-regular fa-hourglass-half"} />
                      </div>
                    </div>
                    <p className="dl-status-text">
                      {status === "waiting"   && "Waiting for payment... Once we receive your payment, your balance will be updated automatically."}
                      {status === "completed" && "Payment received. Your balance has been updated."}
                      {status === "expired"   && "This request expired before payment was detected. Please create a new deposit."}
                    </p>
                    {status === "expired" && (
                      <button type="button" className="dl-cta dl-cta--secondary mt-3 text-white" onClick={resetFlow}>
                        Create New Deposit
                      </button>
                    )}
                    {status === "completed" && (
                      <button type="button" className="dl-cta mt-3" onClick={() => setActiveTabValue("tab6" as TabKey)}>
                        View Transaction Details
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── BINANCE MANUAL FLOW ──────────────────────────────────────────────── */}
      {paymentMethod === "binance" && (
        <div className="dl-card dl-form-card bg-light-dark">
          <div className="dl-form-grid deposit-wrapper mt-0">
            <div>
              <label className="dl-label">1. Your Binance ID <small className="text-danger fs-4">*</small></label>
              <div className="amount-input mb-2">
                <input
                  type="text" placeholder="Enter your Binance ID"
                  value={binanceUserId} disabled={binanceSubmitted}
                  onChange={(e) => setBinanceUserId(e.target.value)}
                />
              </div>
              <small className="dl-hint text-danger">This helps our team match your transfer faster.</small>
            </div>

            <div>
              <label className="dl-label">2. Deposit Amount <small className="text-danger fs-4">*</small></label>
              <div className="amount-input mb-2">
                <input
                  type="text" inputMode="decimal" placeholder="Amount"
                  value={binanceAmount || ""} disabled={binanceSubmitted}
                  onChange={(e) => {
                    const v = Number(e.target.value.replace(/[^\d.]/g, ""));
                    if (!Number.isNaN(v)) setBinanceAmount(v);
                  }}
                />
                <span>USD</span>
              </div>
              {amountPreset?.length > 0 && (
                <div className="dl-amount-presets">
                  {amountPreset.map((n) => (
                    <button key={n} type="button" disabled={binanceSubmitted}
                      className={`dl-preset-btn ${binanceAmount === n ? "active" : ""}`}
                      onClick={() => setBinanceAmount(n)}>{n}</button>
                  ))}
                </div>
              )}
              <small className="dl-hint text-danger">Min: 1 USD &nbsp;•&nbsp; Max: 5,000 USD</small>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
              <div className="dl-block">
                <span className="dl-block-head"><span>Admin Binance QR Code</span></span>
                <div className=" w-100">
                   <span className="dl-qr-wrap w-100 bg-transparent">
                    <Image src={'/images/admin-qr-code.png'} width={200} height={200} alt="Deposit QR code" className="rounded p-2 bg-white" />
                   </span>
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="dl-block">
                <div className="dl-block-head"><span>Admin Binance Wallet Address</span><span className="dl-pill">Binance</span></div>
                <div className="dl-address-row">
                  <code className="dl-address">{adminBinance.wallet_address}</code>
                  <button type="button" className="dl-icon-btn" onClick={() => copyText(adminBinance.wallet_address, "Wallet address")} aria-label="Copy wallet address">
                    <i className="fa-solid fa-copy" />
                  </button>
                </div>
              </div>

              <div className="dl-block">
                <div className="dl-block-head"><span>Admin Binance ID</span></div>
                <div className="dl-address-row">
                  <code className="dl-address">{adminBinance.binance_id}</code>
                  <button type="button" className="dl-icon-btn" onClick={() => copyText(adminBinance.binance_id, "Binance ID")} aria-label="Copy Binance ID">
                    <i className="fa-solid fa-copy" />
                  </button>
                </div>
              </div>

              <div className="d-flex justify-content-end pt-4">
                <button type="button" className="dl-cta"
                  disabled={binanceSubmitting || binanceAmount <= 0 || binanceSubmitted}
                  onClick={handleBinanceSubmit}>
                  {binanceSubmitting ? "Submitting..." : binanceSubmitted ? "Request Submitted" : "Create Deposit"} <span aria-hidden>→</span>
                </button>
              </div>
            </div>
          </div>

          

          {binanceSubmitted && (
            <div className="dl-notice mt-3">
              <div className="dl-binance-submitted">
                <i className="fa-solid fa-circle-check" />
                <div>
                  <strong>Deposit request created.</strong>
                  <p>Please complete the transfer to the address above, then use &quot;I&apos;ve Already Paid&quot; below to submit your payment details for review.</p>
                </div>
              </div>
              <div className="d-flex justify-content-end pt-2">
                <button type="button" className="dl-cta dl-cta--secondary text-white" onClick={resetBinanceFlow}>
                  Create Another Deposit
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Contact Support + Important Notice (redesigned, shared) ─────────── */}
      <div className="dl-support-section">
        {(depositInfo || status !== "idle" || binanceSubmitted) && (
          <div className="dl-support-grid bg-light-dark">
            <button type="button" className="dl-support-card bg-dark" onClick={() => setSupportModalMode("submit")}>
              <span className="dl-support-icon dl-support-icon--paid"><i className="fa-solid fa-receipt" /></span>
              <span className="dl-support-body">
                <span className="dl-support-title">I&apos;ve Already Paid</span>
                <span className="dl-support-desc">Already sent the payment? Submit your payment details for faster verification.</span>
                <span className="dl-support-cta">Submit Payment Details <i className="fa-solid fa-arrow-right" /></span>
              </span>
            </button>

            <div className="dl-support-divider"><span>OR</span></div>

            <button type="button" className="dl-support-card bg-dark" onClick={() => route.push('/dashboard/support/')}>
              <span className="dl-support-icon dl-support-icon--help"><i className="fa-solid fa-headset" /></span>
              <span className="dl-support-body">
                <span className="dl-support-title">Need Support?</span>
                <span className="dl-support-desc">Facing any issue or didn&apos;t get your balance? Our support team is here to help you.</span>
                <span className="dl-support-cta">Contact Support <i className="fa-solid fa-arrow-right" /></span>
              </span>
            </button>
          </div>
        )}

        <div className="dl-notice-bar bg-dark">
          <div className="dl-notice-head"><i className="fa-solid fa-triangle-exclamation" /> Important Notice</div>
          <div className="dl-notice-items">
            <div className="dl-notice-item">
              <span className="dl-notice-icon dl-notice-icon--green"><i className="fa-solid fa-dollar-sign" /></span>
              <span className="line-h-22">Send only <strong className="dl-accent-green">USDT</strong> to the TRC20 (Tron) address shown above.</span>
            </div>
            <div className="dl-notice-item">
              <span className="dl-notice-icon dl-notice-icon--pink"><i className="fa-solid fa-scale-balanced" /></span>
              <span className="line-h-22">Send <strong className="dl-accent-amber">exact amount</strong> as shown. Wrong amount may require manual review.</span>
            </div>
            <div className="dl-notice-item">
              <span className="dl-notice-icon dl-notice-icon--amber"><i className="fa-solid fa-ban" /></span>
              <span className="line-h-22">Do not send from an exchange (Binance, Coinbase, etc.) using an internal transfer.</span>
            </div>
            <div className="dl-notice-item">
              <span className="dl-notice-icon dl-notice-icon--emerald"><i className="fa-solid fa-circle-check" /></span>
              <span className="line-h-22">Your payment will be confirmed after 1 network confirmation.</span>
            </div>
            <div className="dl-notice-item">
              <span className="dl-notice-icon dl-notice-icon--purple"><i className="fa-regular fa-clock" /></span>
              <span className="line-h-22">This deposit request is valid for <strong className="dl-accent-amber">30 minutes</strong> only.</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Recent Deposit List ────────────────────────────────────────────── */}
      <div className="dl-card bg-light-dark transaction-details wallet-main-wrapprr">
        <div className="dl-list-head">
          <h6 className="dl-list-title">Recent Submitted Deposit List</h6>
          <button type="button" className="dl-refresh-btn" onClick={() => fetchDepositList(pagination.current_page)} disabled={isFetching}>
            <i className={`fa-solid fa-rotate-right ${isFetching ? "dl-spin" : ""}`} />
          </button>
        </div>

        {/* Desktop table */}
        <div className="table-responsive d-none d-md-block mt-3">
          <table>
            <thead>
              <tr>
                <th>Sl #</th>
                <th>Deposit ID</th>
                <th>Amount</th>
                <th>Network</th>
                <th>Date</th>
                <th>Payment Method</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {isListLoading ? (
                <tr><td colSpan={7} className="text-center py-4">Loading...</td></tr>
              ) : depositList.length > 0 ? (
                depositList.map((r, index) => {
                  const s = STATUS_MAP[r.status] ?? { label: "Unknown", cls: "status-failed" };
                  return (
                    <tr key={r.id}>
                      <td>{slOffset + index + 1}</td>
                      <td><code className="dl-deposit-id">#{r.deposit_id}</code></td>
                      <td>$ {Number(r.amount).toFixed(4)} <small className="text-warning">USDT</small></td>
                      <td>{r.network ?? "TRC20"}</td>
                      <td>{formatDate(r.created_at)}</td>
                      <td><span className={`${ r.payment_method === 'binance' ? 'text-warning' : 'text-info'}`}>{r.payment_method}</span></td>
                      <td><span className={s.cls}>{s.label}</span></td>
                    </tr>
                  );
                })
              ) : (
                <tr><td colSpan={7} className="text-center py-4 text-warning">No recent deposits found.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="d-block d-md-none mt-3">
          {isListLoading ? (
            <div className="text-center py-4">Loading...</div>
          ) : depositList.length > 0 ? (
            depositList.map((r, index) => {
              const s = STATUS_MAP[r.status] ?? { label: "Unknown", cls: "status-failed" };
              return (
                <div key={r.id} className="dl-mobile-row">
                  <div className="dl-mobile-row-top">
                    <span className="dl-mobile-num">#{slOffset + index + 1}</span>
                    <span className={s.cls}>{s.label}</span>
                  </div>
                  <div className="dl-mobile-row-body">
                    <div className="dl-mobile-field">
                      <small>Deposit ID</small>
                      <code>#{r.deposit_id}</code>
                    </div>
                    <div className="dl-mobile-field">
                      <small>Amount</small>
                      <span>$ {Number(r.amount).toFixed(2)} <b className="text-warning">USDT</b></span>
                    </div>
                    <div className="dl-mobile-field">
                      <small>Network</small>
                      <span>{r.network ?? "TRC20"}</span>
                    </div>
                    <div className="dl-mobile-field">
                      <small>Date</small>
                      <span>{formatDate(r.created_at)}</span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-4 text-warning">No recent deposits found.</div>
          )}
        </div>

        {/* Pagination */}
        {pagination.total > 0 && (
          <PaginationControls
            pagination={pagination}
            currentPage={pagination.current_page}
            pageLoading={isFetching}
            onPageChange={handlePageChange}
          />
        )}
      </div>

      {/* Support modal (shared for both payment methods) */}
      {supportModalMode && (
        <DepositSupportModal
          mode={supportModalMode}
          depositId={supportDepositId}
          coinLabel={supportCoinLabel}
          depositAmount={supportDepositAmount}
          onClose={() => setSupportModalMode(null)}
          onSuccess={() => fetchDepositList(1)}
        />
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
        .dl-step--done, .dl-step--active { opacity: 1; }
        .dl-step-dot {
          width: 30px; height: 30px; flex-shrink: 0; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; font-weight: 700; background: #1c2133; color: #9aa4ba;
        }
        .dl-step--done .dl-step-dot  { background: #1fae5c; color: #fff; }
        .dl-step--active .dl-step-dot { background: #1fae5c; color: #fff; box-shadow: 0 0 0 4px rgba(31,174,92,.18); }
        .dl-step-text { display: flex; flex-direction: column; line-height: 1.2; }
        .dl-step-label { font-size: 13px; font-weight: 600; color: #f2f4f8; }
        .dl-step-sub   { font-size: 11px; color: #7c8499; }
        .dl-step-line  { flex: 1; height: 1px; background: #373b4b; margin: 0 14px; }
        .dl-step-line--done { background: #1fae5c; }
        @media (max-width: 768px) {
          .dl-steps { overflow-x: auto; }
          .dl-step-sub { display: none; }
        }

        /* Cards */
        .dl-card { border: 1px solid #1f2433; border-radius: 14px; padding: 20px; }

        /* Payment method selector */
        .dl-method-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        @media (max-width: 700px) { .dl-method-grid { grid-template-columns: 1fr; } }
        .dl-method-btn {
          display: flex; align-items: center; gap: 12px; text-align: left;
          background: #161b29; border: 1.5px solid #262c40; border-radius: 12px; padding: 14px 16px;
          cursor: pointer; transition: border-color .15s ease, background .15s ease;
        }
        .dl-method-btn:hover { border-color: #3a4255; }
        .dl-method-btn.active { border-color: #e4b023; background: rgba(156,236,254,.06); }
        .dl-method-btn:disabled { opacity: .5; cursor: not-allowed; }
        .dl-method-icon {
          width: 42px; height: 42px; flex-shrink: 0; border-radius: 10px;
          display: flex; align-items: center; justify-content: center; font-size: 18px;
          color: #fff;
        }
        .dl-method-text { display: flex; flex-direction: column; gap: 2px; }
        .dl-method-label { font-size: 14px; font-weight: 700; color: #f2f4f8; }
        .dl-method-sub   { font-size: 12px; color: #7c8499; }

        .dl-form-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 18px;
        }
        @media (max-width: 700px) { .dl-form-grid { grid-template-columns: 1fr; } }

        .dl-label { display: block; font-size: 13px; font-weight: 600; color: #f2f4f8; margin-bottom: 8px; }
        .dl-hint  { display: block; margin-top: 6px; font-size: 12px; }

        /* Amount presets */
        .dl-amount-presets { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 8px; }
        .dl-preset-btn {
          background: #161b29; border: 1px solid #262c40; color: #c8cee0;
          font-weight: 600; font-size: 13px; padding: 6px 14px; border-radius: 8px; cursor: pointer;
          transition: all .15s ease;
        }
        .dl-preset-btn:hover { border-color: #3a4255; }
        .dl-preset-btn.active { background: linear-gradient(90deg,#9cecfe,#9cecfe); color: #222e48; border-color: transparent; }
        .dl-preset-btn:disabled { opacity: .5; cursor: not-allowed; }

        /* Dropdowns */
        .dl-select-row { display: flex; flex-direction: column; gap: 10px; }
        .dl-dropdown {
          display: flex; align-items: center; gap: 10px;
          background: #161b29; border: 1px solid #262c40; border-radius: 10px; padding: 0 14px;
          transition: border-color .15s ease;
        }
        .dl-dropdown:focus-within { border-color: #1fae5c; box-shadow: 0 0 0 1px rgba(31,174,92,.4); }
        .dl-dropdown select {
          flex: 1; appearance: none; -webkit-appearance: none;
          background: transparent; border: none; outline: none;
          color: #f2f4f8; font-weight: 600; font-size: 14px; padding: 12px 0; cursor: pointer;
        }
        .dl-dropdown select:disabled { cursor: not-allowed; opacity: .5; }
        .dl-dropdown select option { background: #161b29; color: #f2f4f8; }
        .dl-dropdown-caret { color: #7c8499; font-size: 11px; pointer-events: none; }

        .dl-coin-badge {
          width: 22px; height: 22px; border-radius: 50%; display: inline-flex;
          align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: #fff; flex-shrink: 0;
        }
        .dl-coin-badge--usdt { background: #1fae5c; }
        .dl-coin-badge--trx  { background: #e2393c; }

        /* CTA */
        .dl-cta {
          width: 100%; border: none; border-radius: 50px; padding: 14px 18px;
          font-weight: 700; font-size: 15px; color: #222E48;
          background: linear-gradient(90deg,#9CECFE,#9CECFE);
          display: flex; align-items: center; justify-content: center; gap: 8px;
          cursor: pointer; transition: opacity .15s ease;
        }
        .dl-cta:disabled { opacity: .5; cursor: not-allowed; }
        .dl-cta--secondary { background: #1c2133; }
        .line-h-22{
          line-height: 22px;
        }

        /* Deposit details */
        .dl-details-title { color: #2bd073; font-weight: 700; font-size: 16px; }
        .dl-details-grid  { display: grid; grid-template-columns: 1.4fr 1fr; gap: 18px; }
        @media (max-width: 860px) { .dl-details-grid { grid-template-columns: 1fr; } }

        .dl-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #1c2133; font-size: 14px; }
        .dl-row-label { color: #8d96ad; }
        .dl-row-value { display: flex; align-items: center; gap: 8px; font-weight: 600; }

        .dl-block { margin-top: 16px; }
        .dl-block-head { display: flex; align-items: center; gap: 8px; font-size: 12px; color: #8d96ad; margin-bottom: 6px; }
        .dl-pill { background: #16321f; color: #2bd073; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 999px; }

        .dl-address-row { background: #161b29; }
        .dl-address-row, .dl-exact-row {
          display: flex; align-items: center; gap: 8px;
          border: 1px solid #262c40; border-radius: 10px; padding: 12px 14px;
        }
        .dl-address { flex: 1; font-size: 16px; word-break: break-all; color: #cfdbf2; }
        .dl-exact-amount { flex: 1; font-size: 18px; font-weight: 700; color: #2bd073; }
        .dl-icon-btn {
          background: #1c2133; border: none; color: #c8cee0;
          width: 32px; height: 32px; border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; flex-shrink: 0;
        }
        .dl-icon-btn:hover { background: #262c40; }
        .dl-qr-wrap { display: flex; background: #fff; padding: 14px; border-radius: 10px; width: fit-content; margin: 0 auto; }

        /* Binance submitted notice inline */
        .dl-binance-submitted { display: flex; gap: 12px; align-items: flex-start; }
        .dl-binance-submitted i { color: #2bd073; font-size: 18px; margin-top: 2px; }
        .dl-binance-submitted strong { color: #f2f4f8; font-size: 14px; }
        .dl-binance-submitted p { margin: 4px 0 0; color: #9aa4ba; font-size: 13px; line-height: 1.5; }

        /* Timer card */
        .dl-side-col { display: flex; flex-direction: column; gap: 18px; }
        .dl-side-label { font-size: 12px; color: #8d96ad; display: flex; align-items: center; gap: 6px; }
        .dl-side-label--center { justify-content: center; text-transform: uppercase; letter-spacing: .12em; font-weight: 700; color: #c8cee0; font-size: 11px; }
        .dl-timer-card { text-align: center; display: flex; flex-direction: column; align-items: center; gap: 14px; }

        .dl-ring-wrap { position: relative; width: 168px; height: 168px; }
        .dl-ring-svg  { width: 100%; height: 100%; transform: rotate(-90deg); }
        .dl-ring-track    { fill: none; stroke: #1c2236; stroke-width: 6; }
        .dl-ring-progress { fill: none; stroke: url(#dlRingGradient); stroke-width: 6; stroke-linecap: round; transition: stroke-dashoffset 1s linear; }
        .dl-ring-progress--danger { animation: dl-ring-pulse 1s ease-in-out infinite; }
        @keyframes dl-ring-pulse { 0%,100%{opacity:1} 50%{opacity:.55} }

        .dl-ring-center { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; }
        .dl-ring-time   { font-size: 28px; font-weight: 800; color: #fff; font-variant-numeric: tabular-nums; letter-spacing: .02em; }
        .dl-ring-units  { display: flex; gap: 16px; letter-spacing: .1em; text-transform: uppercase; color: #7c8499; font-weight: 700; font-size: 9px; }
        .dl-ring-units span  { font-size: 9px; }

        .dl-side-sub { color: #7c8499; font-size: 12px; }

        /* Status card */
        .dl-side-label-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
        .dl-status-pill { font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 999px; }
        .dl-status-pill--waiting   { background: #3a2c12; color: #f0b332; }
        .dl-status-pill--completed { background: #16321f; color: #2bd073; }
        .dl-status-pill--expired   { background: #3a3715; color: #ef4060; }

        .dl-status-visual { display: flex; justify-content: center; margin: 6px 0 14px; }
        .dl-status-ring {
          width: 86px; height: 86px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center; font-size: 26px;
          background: radial-gradient(circle, rgba(240,192,60,.18), transparent 70%);
          border: 2px solid #6e5d2a; color: #f0bc6f;
        }
        .dl-status-ring--completed { border-color: #1fae5c; color: #2bd073; background: radial-gradient(circle,rgba(31,174,92,.18),transparent 70%); }
        .dl-status-ring--expired   { border-color: #b3334a; color: #ef4060; background: radial-gradient(circle,rgba(239,64,96,.18),transparent 70%); }

        .dl-status-ring--waiting { animation: dl-pulse-ring 1.8s ease-in-out infinite; }
        .dl-status-ring--waiting i { animation: dl-hourglass-flip 1.8s ease-in-out infinite; transform-origin: center; }
        .dl-status-ring--completed i { animation: dl-check-pop .5s cubic-bezier(.34,1.56,.64,1) both; }
        .dl-status-ring--expired   i { animation: dl-x-shake .5s ease-in-out both; }

        @keyframes dl-pulse-ring    { 0%,100%{box-shadow:0 0 0 0 rgba(111,138,240,.35)} 50%{box-shadow:0 0 0 10px rgba(111,138,240,0)} }
        @keyframes dl-hourglass-flip{ 0%,35%{transform:rotate(0deg)} 50%,85%{transform:rotate(180deg)} 100%{transform:rotate(180deg)} }
        @keyframes dl-check-pop     { 0%{transform:scale(.3);opacity:0} 60%{transform:scale(1.25);opacity:1} 100%{transform:scale(1)} }
        @keyframes dl-x-shake       { 0%,100%{transform:translateX(0) scale(1)} 20%{transform:translateX(-4px) scale(1.1)} 40%{transform:translateX(4px) scale(1.1)} 60%{transform:translateX(-3px) scale(1.05)} 80%{transform:translateX(3px) scale(1.05)} }

        .dl-status-text { text-align: center; font-size: 13px; color: #9aa4ba; line-height: 1.5; margin: 0; }

        /* ── Redesigned Contact Support + Important Notice ────────────────── */
        .dl-support-section { display: flex; flex-direction: column; gap: 16px; }

        .dl-support-grid {
          display: grid; grid-template-columns: 1fr auto 1fr; align-items: stretch; gap: 18px;
          border: 1px solid #1f2433; border-radius: 16px; padding: 22px;
        }
        @media (max-width: 760px) {
          .dl-support-grid { grid-template-columns: 1fr; }
          .dl-support-divider { flex-direction: row; padding: 4px 0; }
          .dl-support-divider::before, .dl-support-divider::after { width: auto; height: 1px; flex: 1; }
        }

        .dl-support-card {
          display: flex; align-items: flex-start; gap: 14px; text-align: left;
          border: 1px solid #232a3d; border-radius: 14px; padding: 18px;
          cursor: pointer; transition: border-color .15s ease, transform .15s ease;
        }
        .dl-support-card:hover { border-color: #f0bb4a; transform: translateY(-1px); }
        .dl-support-icon {
          width: 44px; height: 44px; flex-shrink: 0; border-radius: 12px;
          display: flex; align-items: center; justify-content: center; font-size: 18px; color: #fff;
        }
        .dl-support-icon--paid { background: linear-gradient(135deg,#c026d3,#7c3aed); }
        .dl-support-icon--help { background: linear-gradient(135deg,#2563eb,#1d4ed8); }
        .dl-support-body { display: flex; flex-direction: column; gap: 6px; }
        .dl-support-title { font-size: 15px; font-weight: 700; color: #f2f4f8; }
        .dl-support-desc  { font-size: 12.5px; color: #8d96ad; line-height: 1.5; }
        .dl-support-cta   { display: inline-flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 700; color: #9cecfe; margin-top: 2px; }

        .dl-support-divider {
          display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px;
          color: #6e7690; font-size: 12px; font-weight: 700; letter-spacing: .08em;
        }
        .dl-support-divider::before, .dl-support-divider::after {
          content: ""; width: 1px; flex: 1; background: #f8b72d;
        }
        .dl-support-divider span {
          border: 1px solid #2b3247; border-radius: 50%; width: 34px; height: 34px;
          display: flex; align-items: center; justify-content: center; background: #dd9b0e; transform: rotate(45deg);
        }
        .dl-support-divider span { position: relative; }

        .dl-notice-bar { border: 1px dashed #3a3352; border-radius: 14px; padding: 18px 20px; }
        .dl-notice-head { display: flex; align-items: center; gap: 8px; color: #f0b332; font-weight: 700; font-size: 13px; margin-bottom: 14px; }
        .dl-notice-items { display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; }
        @media (max-width: 980px) { .dl-notice-items { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 520px) { .dl-notice-items { grid-template-columns: 1fr; } }
        .dl-notice-item { display: flex; flex-direction: column; align-items: flex-start; gap: 10px; font-size: 12px; color: #c8cee0; line-height: 1.5; }
        .dl-notice-icon {
          width: 40px; height: 40px; border-radius: 50%; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center; font-size: 20px;
          background: #1c2133; border: 1px solid #2b3247;
        }
        .dl-notice-icon--green   { color: #2bd073; }
        .dl-notice-icon--pink    { color: #ec4899; }
        .dl-notice-icon--amber   { color: #f0b332; }
        .dl-notice-icon--emerald { color: #34d399; }
        .dl-notice-icon--purple  { color: #a78bfa; }
        .dl-accent-green { color: #2bd073; }
        .dl-accent-red   { color: #ef4060; }
        .dl-accent-amber { color: #f0b332; }

        /* Deposit list */
        .dl-list-head { display: flex; align-items: center; justify-content: space-between; }
        .dl-list-title { color: #f2f4f8; font-weight: 700; font-size: 15px; margin: 0; }
        .dl-refresh-btn {
          background: #1c2133; border: 1px solid #262c40; color: #9aa4ba;
          width: 32px; height: 32px; border-radius: 8px;
          display: flex; align-items: center; justify-content: center; cursor: pointer;
          transition: background .15s ease;
        }
        .dl-refresh-btn:hover { background: #262c40; }
        .dl-refresh-btn:disabled { opacity: .5; cursor: not-allowed; }
        .dl-spin { animation: dl-spin 0.8s linear infinite; }
        @keyframes dl-spin { to { transform: rotate(360deg); } }

        .dl-deposit-id { font-size: 12px; color: #9cecfe; letter-spacing: .02em; }

        /* Mobile list cards */
        .dl-mobile-row { background: #161b29; border: 1px solid #262c40; border-radius: 10px; padding: 14px; margin-bottom: 10px; }
        .dl-mobile-row-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
        .dl-mobile-num { font-size: 12px; color: #7c8499; }
        .dl-mobile-row-body { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .dl-mobile-field { display: flex; flex-direction: column; gap: 2px; }
        .dl-mobile-field small { font-size: 10px; color: #7c8499; text-transform: uppercase; letter-spacing: .06em; }
        .dl-mobile-field span, .dl-mobile-field code { font-size: 13px; font-weight: 600; color: #f2f4f8; }
      `}</style>
    </div>
  );
}

