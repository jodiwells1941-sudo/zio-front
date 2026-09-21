"use client";

import { getBonusFeesSettings, getMerchantAccount } from "@/app/api/merchant";
import { getTrade, sendTradeMessage, updateTradeStatus } from "@/app/api/trade";
import { getTradeEcho } from "@/utils/tradeEcho";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import OrderCompleted from "./OrderCompleted";
import { getViewerOrderAmountDisplay } from "./p2pOrderDisplay";
import P2PPendingAmmountCard from "./P2PPendingAmmountCard";

// ─── Types ────────────────────────────────────────────────────────────────────

export type PaymentStatus = "payment" | "pending" | "completed" | "rejected";

export interface SellMethodField {
  key: string;
  label: string;
  type: string;
  required: boolean;
  placeholder?: string;
  pattern?: string;
  mono?: boolean;
}

export interface TradeData {
  id: number;
  order_id: string;
  user_price: string;
  payable_amount: string;
  receivable_amount: string;
  is_client: boolean;
  /**
   * 1=pending  2=approved  3=rejected  4=rejected_for_balance
   * 5=dispatched  6=dispatch_approved  7=dispatch_rejected
   * 8=dispatch_timeout  9=completed (feedback allowed)  10=appealed
   */
  status: number;
  notes: string | null;
  type: string; // "buy" | "sell"
  is_client_seller: boolean;
  created_at: string;
  pending_time_limit: string;
  /**
   * Backend computes exactly which next-status values the current auth user
   * is allowed to submit.  We drive every action button from this list.
   */
  status_list: number[];
  /** ISO-8601 payment window end (approved → payment sent). */
  payment_expires_at?: string | null;
  current_status: {
    id: number;
    note: string;
    status: string;
    status_text: string;
    method: string;
    with_fiat: string;
    user: { id: number; name: string; avatar: string } | null;
  } | null;
  p2p_ad: {
    asset: string;
    with_fiat: string;
    payment_time_limit: number;
    payment_method: {
      remarks: string | null;
      qr_code: string | null;
      field_values: Record<string, string>;
      sell_method: {
        name: string;
        fields: SellMethodField[];
        icon: string;
      };
    };
  };
  client: { id: number; name: string; avatar: string };
  customer: { id: number; name: string; avatar: string };
  trade_review?: any;
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface P2PTransferCardProps {
  /** Raw trade.status from the parent (1 = pending). */
  pendingStatus?: number;
  /** Remaining seconds in the pending window. */
  pendingTimeLeft?: number;
  /** ISO string for pending_time_limit from backend. */
  pendingExpireTime?: string | null;
  /** Optional callback fired when the countdown hits zero. */
  onTradeExpired?: () => void;
}

// ─── Status helpers ───────────────────────────────────────────────────────────

export function resolveUIStatus(status: number): PaymentStatus {
  if ([9, 6].includes(status)) return "completed";
  if (status === 5) return "pending";
  if ([3, 4, 7, 8, 10].includes(status)) return "rejected";
  return "payment"; // 1, 2
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function parseApiDateToMs(dateStr?: string | null): number | null {
  if (!dateStr) return null;
  const direct = new Date(dateStr).getTime();
  if (!Number.isNaN(direct)) return direct;
  const normalized = dateStr.includes("T")
    ? dateStr
    : dateStr.replace(" ", "T");
  const retry = new Date(normalized).getTime();
  return Number.isNaN(retry) ? null : retry;
}

// ─── Status Banner ────────────────────────────────────────────────────────────

function StatusBanner({ status }: { status: number }) {
  const map: Record<number, React.ReactElement> = {
    1: (
      <div className="toast-body p-2 rounded-2 text-white toast-bg-warning">
        <span className="spinner-border spinner-border-sm me-2" role="status" />
        Pending — waiting for seller to approve
      </div>
    ),
    2: (
      <div className="toast-body p-2 rounded-2 text-white toast-bg-success d-flex align-items-center">
        <i className="fas fa-check me-2" />
        Buy Request Accepted — please transfer payment now
      </div>
    ),
    3: (
      <div className="toast-body p-2 rounded-2 text-white toast-bg-danger d-flex align-items-center">
        <i className="fas fa-times me-2" />
        Order Rejected by Seller
      </div>
    ),
    4: (
      <div className="toast-body p-2 rounded-2 text-white toast-bg-danger d-flex align-items-center">
        <i className="fas fa-times me-2" />
        Order Rejected — Insufficient Balance
      </div>
    ),
    5: (
      <div className="toast-body p-2 rounded-2 text-white toast-bg-warning d-flex align-items-center">
        <span className="spinner-border spinner-border-sm me-2" role="status" />
        Payment Dispatched — waiting for seller to release crypto
      </div>
    ),
    7: (
      <div className="toast-body p-2 rounded-2 text-white toast-bg-danger d-flex align-items-center">
        <i className="fas fa-times me-2" />
        Dispatch Rejected — sent to admin for review
      </div>
    ),
    9: (
      <div className="toast-body p-2 rounded-2 text-white toast-bg-success d-flex align-items-center">
        <i className="fas fa-check me-2" />
        Order Completed Successfully
      </div>
    ),
  };
  return map[status] ?? null;
}

// ─── Copy Button ──────────────────────────────────────────────────────────────

export function CopyBtn({ text, id }: { text: string; id: string }) {
  const [copied, setCopied] = useState(false);
  const handle = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };
  return (
    <button className="p2pCopyBtn" type="button" aria-label="copy" onClick={handle}>
      {copied ? (
        <i className="fa-solid fa-check text-success" />
      ) : (
        <i className="fa-regular fa-copy" />
      )}
    </button>
  );
}

// ─── Order Details Accordion ──────────────────────────────────────────────────

function OrderDetailsAccordion({
  rows,
}: {
  rows: Array<{ label: string; value: string }>;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div className="p2pOrderDetails">
      <button
        className="p2pOrderDetailsHeader"
        type="button"
        onClick={() => setOpen((o) => !o)}
      >
        <span>Order details</span>
        <i className={`fa-solid fa-angle-${open ? "up" : "down"}`} />
      </button>
      {open && (
        <div className="p2pOrderDetailsBody">
          {rows.map((row, i) => (
            <div key={`${row.label}-${i}`} className="p2pDetailRow">
              <span className="p2pMuted">{row.label}</span>
              <span className={`p2pDetailVal ${i === 0 ? "green" : ""}`}>
                {row.value}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PaymentProofModal({
  isOpen,
  trade,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  trade: TradeData | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [note, setNote] = useState("I have paid the seller.");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [bonusPercent, setBonusPercent] = useState(0);
  const [sellFeePercent, setSellFeePercent] = useState(0);
  const orderView = trade ? getViewerOrderAmountDisplay(trade) : null;

  useEffect(() => {
    if (!trade) return;

    let mounted = true;

    const loadSettings = async () => {
      try {
        const res = await getBonusFeesSettings();
        const settings = res?.data ?? {};
        const nextBonus = Number(settings?.user_buy_bonus ?? 0);
        const nextFee = Number(settings?.user_sell_charge ?? 0);

        if (!mounted) return;
        setBonusPercent(trade.type === "buy" ? nextBonus : 0);
        setSellFeePercent(trade.type === "sell" ? nextFee : 0);
      } catch (error) {
        console.error("Failed to load bonus & fees settings:", error);
        if (mounted) {
          setBonusPercent(0);
          setSellFeePercent(0);
        }
      }
    };

    void loadSettings();

    return () => {
      mounted = false;
    };
  }, [trade]);

  useEffect(() => {
    if (!isOpen) {
      setProofFile(null);
      setNote("I have paid the seller.");
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      setSubmitting(false);
      return;
    }
  }, [isOpen]);

  if (!isOpen || !trade) return null;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (!file) {
      setProofFile(null);
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      return;
    }

    setProofFile(file);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  };

  const adjustedTotalAmount = trade?.type === "buy"
    ? Number(trade.receivable_amount || 0) * (1 + (bonusPercent / 100))
    : Number(trade.payable_amount || 0) * (1 - (sellFeePercent / 100));
  const totalAmountCurrency = trade?.type === "buy"
    ? trade?.p2p_ad?.asset ?? "USDT"
    : trade?.p2p_ad?.with_fiat ?? orderView?.fiat ?? "BDT";

  const handleSubmit = async () => {
    if (!proofFile) {
      toast.error("Please upload a payment proof image before submitting.");
      return;
    }

    setSubmitting(true);
    try {
      await sendTradeMessage(trade.id, {
        message: note.trim() || "I have paid the seller.",
        attachment: proofFile,
      });
      await updateTradeStatus(trade.id, 5, "Buyer confirms payment sent with proof attachment");
      toast.success("Payment proof sent successfully.");
      onSuccess();
      onClose();
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Failed to send payment proof.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" style={{ display: "flex" }}>
      <div className="modal-content" style={{ maxWidth: 620, width: "min(92vw, 620px)" }}>
        <div className="modal-header">
          <h6 className="modal-title">Submit payment proof</h6>
          <button
            type="button"
            className="modal-close-btn"
            aria-label="Close modal"
            onClick={onClose}
          >
            <i className="fas fa-times" />
          </button>
        </div>

        <div className="modal-body p-3">
          <div className="p2pCard p-3 mb-3">
            <div className="p2pStepTitle mb-2">Order details</div>
            {orderView && (
              <div className="p2pOrderDetailsBody">
                {orderView.detailRows.map((row, index) => (
                  <div key={`${row.label}-${index}`} className="p2pDetailRow">
                    <span className="p2pMuted">{row.label}</span>
                    <span className="p2pDetailVal text-white">
                      {row.value}
                    </span>
                  </div>
                ))}

                {trade?.type === "buy" && bonusPercent > 0 && (
                  <div className="p2pDetailRow">
                    <span className="p2pMuted">Buy Bonus</span>
                    <span className="p2pDetailVal text-warning">+{bonusPercent}%</span>
                  </div>
                )}

                {trade?.type === "sell" && sellFeePercent > 0 && (
                  <div className="p2pDetailRow">
                    <span className="p2pMuted">Selling Fee</span>
                    <span className="p2pDetailVal text-warning">{sellFeePercent}%</span>
                  </div>
                )}

                <div className="p2pDetailRow">
                  <span className="p2pMuted">Total Amount</span>
                  <span className="p2pDetailVal text-success">
                    {totalAmountCurrency} {adjustedTotalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="mb-3">
            <label className="form-label text-white-50 small mb-2">Message</label>
            <textarea
              className="form-control bg-dark text-light border-dark"
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="I have paid the seller."
            />
          </div>

          <div className="mb-3">
            <label className="form-label text-white-50 small mb-2">Proof image</label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              className="form-control bg-dark text-light border-dark"
              onChange={handleFileChange}
            />
          </div>

          {previewUrl && (
            <div className="mb-3 text-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="Payment proof preview"
                className="img-fluid rounded border border-secondary"
                style={{ maxHeight: 220, objectFit: "contain" }}
              />
            </div>
          )}
        </div>

        <div className="modal-footer mx-auto mb-4">
          <button type="button" className="p2pLinkBtn me-3" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button
            type="button"
            className="p2pPrimaryBtn"
            onClick={() => void handleSubmit()}
            disabled={submitting || !proofFile}
          >
            {submitting ? "Submitting…" : "Submit Proof"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Payment Info Card ────────────────────────────────────────────────────────

export function PaymentInfoCard({
  trade,
  view,
}: {
  trade: TradeData;
  view: ReturnType<typeof getViewerOrderAmountDisplay>;
}) {
  const pm = trade.p2p_ad?.payment_method;
  const sellMethod = pm?.sell_method;
  const fieldDefs = sellMethod?.fields ?? [];
  const fieldValues = pm?.field_values ?? {};
  const remarks = pm?.remarks;
  const qrCode = pm?.qr_code;
  const orderId = trade.order_id;
  const [bonusPercent, setBonusPercent] = useState(0);
  const [sellFeePercent, setSellFeePercent] = useState(0);

  useEffect(() => {
    let mounted = true;

    const loadSettings = async () => {
      try {
        const res = await getBonusFeesSettings();
        const settings = res?.data ?? {};
        const nextBonus = Number(settings?.user_buy_bonus ?? 0);
        const nextFee = Number(settings?.user_sell_charge ?? 0);

        if (!mounted) return;
        setBonusPercent(trade.type === "buy" ? nextBonus : 0);
        setSellFeePercent(trade.type === "sell" ? nextFee : 0);
      } catch (error) {
        console.error("Failed to load bonus & fees settings:", error);
        if (mounted) {
          setBonusPercent(0);
          setSellFeePercent(0);
        }
      }
    };

    void loadSettings();

    return () => {
      mounted = false;
    };
  }, [trade.type]);

  const extraFeeOrBonusRow =
    trade.type === "buy" && bonusPercent > 0
      ? { label: "Buy Bonus", value: `+${bonusPercent}%` }
      : trade.type === "sell" && sellFeePercent > 0
        ? { label: "Selling Fee", value: `${sellFeePercent}%` }
        : null;

  const totalAmount = trade.type === "buy"
    ? Number(trade.receivable_amount || 0) * (1 + (bonusPercent / 100))
    : Number(trade.payable_amount || 0) * (1 - (sellFeePercent / 100));
  const totalAmountCurrency = trade.type === "buy"
    ? trade.p2p_ad?.asset ?? "USDT"
    : trade.p2p_ad?.with_fiat ?? view.fiat ?? "BDT";

  return (
    <div className="p2pCard p-0">
      <div className="p2pCardRow px-3 bg-dark rounded-top-3">
        <div className="p2pCardLabel">{view.youPayLabel}</div>
        <div className="p2pCardValue green">
          {view.youPayLine}
          <CopyBtn text={view.youPayCopyText} id="payable" />
        </div>
      </div>

      <div className="p2pCardRow px-3">
        <div className="p2pCardLabel">
          Reference message <i className="fa-regular fa-circle-question p2pInfo" />
        </div>
        <div className="p2pCardValue">
          {orderId}
          <CopyBtn text={orderId} id="ref" />
        </div>
      </div>

      {extraFeeOrBonusRow && (
        <div className="p2pCardRow px-3">
          <div className="p2pCardLabel">{extraFeeOrBonusRow.label}</div>
          <div className="p2pCardValue text-warning">
            {extraFeeOrBonusRow.value}
          </div>
        </div>
      )}

      <div className="p2pCardRow px-3">
        <div className="p2pCardLabel">Total Amount</div>
        <div className="p2pCardValue green">
          {totalAmountCurrency} {totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
        </div>
      </div>

      {fieldDefs.map((field) => {
        const val = fieldValues[field.key];
        if (!val) return null;
        return (
          <div key={field.key} className="p2pCardRow px-3">
            <div className="p2pCardLabel">{field.label}</div>
            <div className={`p2pCardValue ${field.mono ? "font-monospace" : ""}`}>
              {val}
              <CopyBtn text={val} id={field.key} />
            </div>
          </div>
        );
      })}

      {qrCode && (
        <div className="p2pCardRow px-3">
          <div className="p2pCardLabel">QR Code</div>
          <div className="p2pCardValue">
            <img
              src={qrCode}
              alt="Payment QR"
              style={{ width: 80, height: 80, objectFit: "contain" }}
            />
          </div>
        </div>
      )}

      {remarks && (
        <div className="p2pCardRow px-3">
          <div className="p2pCardLabel">Remarks</div>
          <div className="p2pRemark">{remarks}</div>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function P2PTransferCard({
  pendingStatus = 0,
  pendingTimeLeft = 0,
  pendingExpireTime = null,
  onTradeExpired,
}: P2PTransferCardProps = {}) {
  const searchParams = useSearchParams();
  const tradeId = searchParams.get("trade_id");

  const [trade, setTrade] = useState<TradeData | null>(null);
  const [uiStatus, setUiStatus] = useState<PaymentStatus>("payment");
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<number | null>(null);
  const [timerExpired, setTimerExpired] = useState(false);
  const [showProofModal, setShowProofModal] = useState(false);
  const [isMerchant, setIsMerchant] = useState(false);

  useEffect(() => {
    const checkMerchant = async () => {
      try {
        const res = await getMerchantAccount();
        setIsMerchant(res?.data?.application?.status === "approved");
      } catch {
        setIsMerchant(false);
      }
    };

    void checkMerchant();
  }, []);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchTrade = useCallback(async () => {
    if (!tradeId) return;
    try {
      setLoading(true);
      const res = await getTrade(Number(tradeId));
      const t: TradeData = res?.data;
      setTrade(t);
      setUiStatus(resolveUIStatus(t.status));
      if (t.status === 2 && t.payment_expires_at) {
        const expiresAtMs = parseApiDateToMs(t.payment_expires_at);
        const sec = expiresAtMs
          ? Math.max(0, Math.floor((expiresAtMs - Date.now()) / 1000))
          : 0;
        setSecondsLeft(sec);
        setTimerExpired(sec <= 0);
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Failed to load trade.");
    } finally {
      setLoading(false);
    }
  }, [tradeId]);

  useEffect(() => {
    fetchTrade();
  }, [fetchTrade]);

  // ── Realtime ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!tradeId) return;
    const tradeIdNum = Number(tradeId);
    if (!Number.isFinite(tradeIdNum) || tradeIdNum < 1) return;

    const echo = getTradeEcho();
    if (!echo) return;

    const channelName = `trade.${tradeIdNum}`;
    const channel = echo.private(channelName);
    const onOrderUpdate = (payload: { data?: { refresh?: boolean } }) => {
      if (payload?.data?.refresh) void fetchTrade();
    };

    channel.listen(".p2p-order-details.update", onOrderUpdate);

    return () => {
      channel.stopListening(".p2p-order-details.update");
      echo.leave(channelName);
    };
  }, [tradeId, fetchTrade]);

  // ── Poll while pending (status=1) ─────────────────────────────────────────
  useEffect(() => {
    if (!tradeId || !trade || trade.status !== 1) return;

    const poll = setInterval(async () => {
      try {
        const res = await getTrade(Number(tradeId));
        const t: TradeData = res?.data;

        if (t.status === 2) {
          setTrade(t);
          setUiStatus(resolveUIStatus(t.status));
          if (t.payment_expires_at) {
            const expiresAtMs = parseApiDateToMs(t.payment_expires_at);
            const sec = expiresAtMs
              ? Math.max(0, Math.floor((expiresAtMs - Date.now()) / 1000))
              : 0;
            setSecondsLeft(sec);
            setTimerExpired(sec <= 0);
          }
          toast.success(
            "Your request has been approved! Please complete the payment."
          );
          clearInterval(poll);
        }

        if ([3, 4, 5, 6, 7, 8, 9].includes(t.status)) {
          setTrade(t);
          setUiStatus(resolveUIStatus(t.status));
          clearInterval(poll);
        }
      } catch {
        // silent
      }
    }, 2000);

    return () => clearInterval(poll);
  }, [trade?.status, tradeId]);

  // ── Countdown for status=2 payment window ─────────────────────────────────
  useEffect(() => {
    if (trade?.status !== 2 || secondsLeft <= 0) return;

    const t = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(t);
          setTimerExpired(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return () => clearInterval(t);
  }, [trade?.status, secondsLeft]);

  useEffect(() => {
    if (trade?.status === 2 && trade.payment_expires_at) {
      const expiresAtMs = parseApiDateToMs(trade.payment_expires_at);
      const sec = expiresAtMs
        ? Math.max(0, Math.floor((expiresAtMs - Date.now()) / 1000))
        : 0;
      setTimerExpired(sec <= 0);
    } else {
      setTimerExpired(false);
    }
  }, [trade?.status, trade?.payment_expires_at]);

  // ── Status Update ─────────────────────────────────────────────────────────
  const handleStatusUpdate = async (newStatus: number, notes?: string) => {
    if (!trade) return;

    const v = getViewerOrderAmountDisplay(trade);

    const confirmMap: Record<
      number,
      {
        title: string;
        html: string;
        confirmText: string;
        icon: "warning" | "question" | "info";
      }
    > = {
      2: {
        title: "Approve Trade?",
        html: `Approving will deduct <strong>${v.asset} ${v.cryptoStr}</strong> from your wallet.<br/>Are you sure you want to approve this trade?`,
        confirmText: "Yes, Approve!",
        icon: "question",
      },
      3: {
        title: "Reject / Cancel Order?",
        html: `Are you sure you want to <strong>cancel this order</strong>?<br/>This action cannot be undone.`,
        confirmText: "Yes, Cancel!",
        icon: "warning",
      },
      5: {
        title: "Confirm Payment Sent?",
        html: `Please confirm you have transferred <strong>${v.fiat} ${v.fiatStr}</strong> to the seller.<br/>Only click if you have <strong>already sent the payment</strong>.`,
        confirmText: "Yes, I Transferred!",
        icon: "info",
      },
      6: {
        title: "Release Crypto?",
        html: `Confirm you have received <strong>${v.fiat} ${v.fiatStr}</strong> from the buyer.<br/>This will release <strong>${v.cryptoStr} ${v.asset}</strong> to the buyer's wallet.`,
        confirmText: "Yes, Release!",
        icon: "question",
      },
      7: {
        title: "Submit Dispute?",
        html: `Are you sure you want to <strong>dispute this trade</strong>?<br/>An admin will review and resolve the issue.`,
        confirmText: "Yes, Dispute!",
        icon: "warning",
      },
      10: {
        title: "Submit Claim to Admin?",
        html: `Your payment time has expired.<br/>Do you want to <strong>submit a claim</strong> for admin review?`,
        confirmText: "Yes, Submit Claim!",
        icon: "warning",
      },
    };

    const confirm = confirmMap[newStatus];

    if (confirm) {
      const result = await Swal.fire({
        title: confirm.title,
        html: confirm.html,
        icon: confirm.icon,
        showCloseButton: true,
        showCancelButton: true,
        confirmButtonText: confirm.confirmText,
        cancelButtonText: "No, Go Back!",
        confirmButtonColor: [3, 7, 10].includes(newStatus)
          ? "#dc3545"
          : "#198754",
      });

      if (!result.isConfirmed) return;
    }

    setSubmitting(newStatus);
    try {
      await updateTradeStatus(trade.id, newStatus, notes);
      const updated = { ...trade, status: newStatus };
      setTrade(updated as TradeData);
      setUiStatus(resolveUIStatus(newStatus));

      const msgs: Record<number, string> = {
        2: "Trade approved! Buyer can now send payment.",
        3: "Order rejected.",
        5:
          trade.type === "buy"
            ? "Seller notified. Waiting for crypto release."
            : "Buyer notified. Waiting for you to confirm receipt.",
        6:
          trade.type === "buy"
            ? "Crypto released successfully. Trade complete!"
            : "Trade completed successfully.",
        7: "Dispatch disputed. Admin will review.",
        10: "Claim submitted. Admin will review shortly.",
      };
      toast.success(msgs[newStatus] ?? "Status updated.");
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Failed to update status.");
    } finally {
      setSubmitting(null);
    }
  };

  const [bonusPercent, setBonusPercent] = useState(0);
  const [sellFeePercent, setSellFeePercent] = useState(0);

  useEffect(() => {
    if (!trade) return;

    let mounted = true;

    const loadSettings = async () => {
      try {
        const res = await getBonusFeesSettings();
        const settings = res?.data ?? {};
        const nextBonus = Number(settings?.user_buy_bonus ?? 0);
        const nextFee = Number(settings?.user_sell_charge ?? 0);

        if (!mounted) return;
        setBonusPercent(trade.type === "buy" ? nextBonus : 0);
        setSellFeePercent(trade.type === "sell" ? nextFee : 0);
      } catch (error) {
        console.error("Failed to load bonus & fees settings:", error);
        if (mounted) {
          setBonusPercent(0);
          setSellFeePercent(0);
        }
      }
    };

    void loadSettings();

    return () => {
      mounted = false;
    };
  }, [trade]);

  // ── Guards ────────────────────────────────────────────────────────────────
  if (!tradeId)
    return <p className="text-center py-5 text-muted">No trade ID found in URL.</p>;

  if (loading)
    return (
      <div className="p2pOrderHeader placeholder-glow">
        <span className="placeholder col-8 mb-2 d-block rounded" />
        <span className="placeholder col-5 mb-2 d-block rounded" />
        <span className="placeholder col-6 d-block rounded" />
      </div>
    );

  if (!trade)
    return <p className="text-center py-5 text-danger">Trade not found.</p>;

  // ── Derived ───────────────────────────────────────────────────────────────
  const orderId = trade.order_id;
  const vd = getViewerOrderAmountDisplay(trade);
  const fiat = vd.fiat;
  const asset = vd.asset;
  const methodName = trade.p2p_ad?.payment_method?.sell_method?.name ?? "N/A";
  const orderDetailRows = [...vd.detailRows];
  if (trade.type === "buy" && bonusPercent > 0) {
    orderDetailRows.push({ label: "Buy Bonus", value: `+${bonusPercent}%`, copyText: `${bonusPercent}%` });
  }
  if (trade.type === "sell" && sellFeePercent > 0) {
    orderDetailRows.push({ label: "Selling Fee", value: `${sellFeePercent}%`, copyText: `${sellFeePercent}%` });
  }
  const mm = Math.floor(secondsLeft / 60);
  const ss = secondsLeft % 60;

  const statusList = trade.status_list ?? [];
  const canApprove = statusList.includes(2);
  const canReject = statusList.includes(3);
  const canDispatch = statusList.includes(5);
  const canRelease = statusList.includes(6);
  const canDispute = statusList.includes(7);
  const canClaim = statusList.includes(10);
  const isBuyFlow = trade.type === "buy";
  const notifyTransferredLabel = isBuyFlow ? "I Have Paid" : "Transferred, Notify Buyer";

  // Pending countdown (status === 1) — derived values
  const isPending = trade.status === 1;
  const pendingMm = Math.floor(pendingTimeLeft / 60);
  const pendingSs = pendingTimeLeft % 60;
  const backToP2PHref = isMerchant ? "/dashboard/merchant/orders/" : "/dashboard/wallet/?tab=tab3";

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="p2pOrderHeader">
        <StatusBanner status={trade.status} />

        {/* Pending countdown banner (status === 1) */}
        {isPending && pendingExpireTime && (
          <div className="alert bg-warning alert-warning d-flex justify-content-between align-items-center mt-4 mb-2 py-2">
            <span className="d-flex align-items-center gap-2">
              <i className="fa-regular fa-clock" />
              Waiting for approval — expires in
            </span>
            <strong className="font-monospace fs-20">
              {pad(pendingMm)}:{pad(pendingSs)}
            </strong>
          </div>
        )}

        {uiStatus === "completed" ? (
          <div className="d-flex justify-content-between align-items-center">
            <h2 className="p2pTitle text-white">Order Completed</h2>
            <span className="w-15 h-15 border border-success rounded-pill d-flex justify-content-center align-items-center mt-3">
              <span className="p-3 bg-success m-2 rounded-pill d-flex justify-content-center align-items-center">
                <i className="fa-solid fa-check" />
              </span>
            </span>
            {trade.status != 1 && (
              <Link href="/dashboard/chat/" className="chat-notification d-md-none">
                <i className="fa-solid fa-message" />
                <span className="chat-badge">0</span>
              </Link>
            )}
          </div>
        ) : uiStatus === "rejected" ? (
          <div className="d-flex justify-content-between align-items-center">
            <h2 className="p2pTitle text-danger">
              {trade.current_status?.status_text ?? "Order Cancelled"}
            </h2>
          </div>
        ) : (
          <div className="d-flex justify-content-between align-items-center">
            <h2 className="p2pTitle">
              {/* Payment countdown for status=2 */}
              {uiStatus === "payment" && trade.status === 2 && (
                <>
                  {isBuyFlow ? "Pay the Seller within " : "Pay the Buyer within "}
                  <span className="p2pTimer">
                    {pad(mm)}:{pad(ss)}
                  </span>
                </>
              )}

              {uiStatus === "pending" && (
                <>
                  {isBuyFlow ? (
                    <>
                      Pending the Seller to Release{" "}
                      <i className="fa-regular fa-circle-question text-xs" />
                    </>
                  ) : (
                    <>
                      Pending the Buyer to Confirm{" "}
                      <i className="fa-regular fa-circle-question text-xs" />
                    </>
                  )}
                </>
              )}
            </h2>
            {trade.status != 1 && (
              <Link href="/dashboard/chat/" className="chat-notification d-md-none">
                <i className="fa-solid fa-message" />
                <span className="chat-badge">0</span>
              </Link>
            )}
          </div>
        )}

        <div className="p2pSubRow">
          <div className="p2pOrderNo">
            <span className="p2pMuted">Order ID</span>
            <span className="p2pOrderValue">{orderId}</span>
            <CopyBtn text={orderId} id="order_id" />
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          PAYMENT PHASE  (trade.status = 1 or 2)
      ══════════════════════════════════════════════════════════════════ */}
      {uiStatus === "payment" && (
        <div className="p2pStepWrap">
          <div className="p2pStepRow">
            <div className="p2pStepNo d-flex justify-content-center align-items-center bg-warning">
              1
            </div>
            <div className="p2pStepContent">
              <div className="p2pStepTop">
                <div className="p2pStepTitle">
                  Transfer via : <span className="p2pMethod">{methodName}</span>
                </div>
                <button className="p2pTipBtn" type="button">
                  <i className="fa-regular fa-circle-question" /> Payment Tips
                </button>
              </div>
              { !isPending && (
                <PaymentInfoCard trade={trade} view={vd}  />
              )}
              <OrderDetailsAccordion rows={orderDetailRows} />
            </div>
          </div>

          <div className="p2pStepRow">
            <div className="p2pStepNo d-flex justify-content-center align-items-center bg-warning">
              2
            </div>

            <div className="p2pStep2">
              <div className="p2pStep2Body">
                <div className="p2pActions">
                  {canDispatch && (
                    <button
                      className="p2pPrimaryBtn"
                      type="button"
                      onClick={() => {
                        if (notifyTransferredLabel === "Transferred, Notify Buyer") {
                          void handleStatusUpdate(5);
                          return;
                        }
                        setShowProofModal(true);
                      }}
                      disabled={submitting !== null}
                    >
                      {submitting === 5 ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" />
                          Notifying…
                        </>
                      ) : (
                        notifyTransferredLabel
                      )}
                    </button>
                  )}
                  {timerExpired && canClaim && (
                    <button
                      className="p2pPrimaryBtn bg-danger"
                      type="button"
                      onClick={() => handleStatusUpdate(10)}
                      disabled={submitting !== null}
                    >
                      {submitting === 10 ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" />
                          Submitting Claim…
                        </>
                      ) : (
                        "⏱ Time Expired — Claim to Admin"
                      )}
                    </button>
                  )}
                </div>

                {(canApprove || canReject) && (
                  <>
                    <div className="p2pStepTitle">Review Trade Request</div>
                    <div className="p2pMuted p2pSmall">
                      A buyer wants to purchase {vd.cryptoStr} {asset}.
                      Approve to proceed or reject to decline.
                    </div>
                    <div className="p2pActions">
                      {canApprove && (
                        <button
                          className="p2pPrimaryBtn"
                          type="button"
                          onClick={() => handleStatusUpdate(2)}
                          disabled={submitting !== null}
                        >
                          {submitting === 2 ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" />
                              Approving…
                            </>
                          ) : (
                            "Approve Trade"
                          )}
                        </button>
                      )}
                      {canReject && (
                        <button
                          className="p2pLinkBtn"
                          type="button"
                          onClick={() => handleStatusUpdate(3)}
                          disabled={submitting !== null}
                        >
                          Reject Trade
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          PENDING PHASE  (trade.status = 5)
      ══════════════════════════════════════════════════════════════════ */}
      {uiStatus === "pending" && (
        <P2PPendingAmmountCard
          trade={trade}
          canRelease={canRelease}
          canDispute={canDispute}
          canClaim={canClaim}
          submitting={submitting}
          onStatusUpdate={handleStatusUpdate}
        />
      )}

      {/* ══════════════════════════════════════════════════════════════════
          COMPLETED  (status 6 or 9)
      ══════════════════════════════════════════════════════════════════ */}
      {uiStatus === "completed" && <OrderCompleted trade={trade} />}

      {/* ══════════════════════════════════════════════════════════════════
          REJECTED / CANCELLED  (status 3, 4, 7, 8, 10)
      ══════════════════════════════════════════════════════════════════ */}
      {uiStatus === "rejected" && (
        <div className="p2pStepWrap">
          <div className="p2pCard p-3 text-center">
            <i className="fa-solid fa-circle-xmark text-danger fs-1 mb-3 d-block" />
            <div className="p2pStepTitle text-danger mb-1">
              {trade.current_status?.status_text ?? "Order Cancelled"}
            </div>
            <p className="p2pMuted p2pSmall">{trade.current_status?.note}</p>
            <Link
              href={backToP2PHref}
              className="p2pPrimaryBtn d-inline-block mt-3"
            >
              Back to P2P Market
            </Link>
          </div>
        </div>
      )}

      <PaymentProofModal
        isOpen={showProofModal}
        trade={trade}
        onClose={() => setShowProofModal(false)}
        onSuccess={() => {
          setShowProofModal(false);
          void fetchTrade();
        }}
      />
    </>
  );
}