"use client";

import { getLocalBonusFeesSettings as getBonusFeesSettings } from "@/app/api/localBonusFees";
import { extendTradePaymentTime, getTrade, sendTradeMessage, updateTradeStatus } from "@/app/api/trade";
import OrderCompleted from "./OrderCompleted";
import { getViewerOrderAmountDisplay, normalizeCryptoAsset } from "@/components/dashboard/p2p/p2pOrderDisplay";
import { localOrderSummaryRows } from "../../localOrderSummary";
import P2PPendingAmmountCard from "./P2PPendingAmmountCard";
import { PaymentReceivedModel } from "../sell-view/PaymentReceivedModel";
import TradeOrderSummary from "./TradeOrderSummary";
import TradeProgressSteps from "../TradeProgressSteps";
import paymentTimeStyles from "../PaymentTimeExtension.module.css";
import proofModalStyles from "./PaymentProofModal.module.css";
import { getTradeEcho } from "@/utils/tradeEcho";
import Link from "next/link";
import OrderChatLink from "@/components/dashboard/p2p/OrderChatLink";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useCallback, useEffect, useId, useRef, useState } from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

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
  user_price_label?: string;
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
  status_list: number[];
  payment_expires_at?: string | null;
  charge_amount?: number;
  bonus_amount?: number;
  charge_percent?: number;
  bonus_percent?: number;
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
    remarks?: string | null;
    payment_method: {
      remarks: string | null;
      qr_code: string | null;
      field_values: Record<string, string>;
      sell_method: {
        name: string;
        fields: SellMethodField[];
        icon: string;
        icon_image?: string | null;
        icon_url?: string | null;
      };
    };
  };
  user_payment_method?: {
    icon_image?: string | null;
    icon_url?: string | null;
    sell_method?: { name?: string; icon_image?: string | null; icon_url?: string | null };
  } | null;
  method?: {
    icon_image?: string | null;
    icon_url?: string | null;
    sell_method?: { name?: string; icon_image?: string | null; icon_url?: string | null };
  } | null;
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
  /** Keep page-level layout (for example the chat column) in sync with the card. */
  onStatusChange?: (trade: TradeData) => void;
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
      <div className="p2pPendingStatus" role="status" aria-live="polite">
        <span className="spinner-border spinner-border-sm" aria-hidden="true" />
        <span>Pending — Waiting for seller to approve</span>
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
        Payment Dispatched — waiting for seller to release the amount
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

// ─── Order Details Accordion (legacy — kept for the proof modal's inline summary) ──

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
  const [note, setNote] = useState("Payment proof.");
  const [proofFiles, setProofFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [uploadedProofCount, setUploadedProofCount] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [proofError, setProofError] = useState(false);
  const [orderDetailsExpanded, setOrderDetailsExpanded] = useState(false);
  const orderDetailsId = useId();
  const uploadInputId = useId();
  const receiptInputRef = useRef<HTMLInputElement>(null);
  const orderView = trade ? getViewerOrderAmountDisplay(trade) : null;
  const summaryAsset = (trade?.p2p_ad?.asset || "USD").toUpperCase().replace("USDT", "USD");
  const summaryFiat = trade?.p2p_ad?.with_fiat || orderView?.fiat || "BDT";
  const summaryBonus = Number(trade?.bonus_amount ?? 0);
  const paymentMethodName = trade?.p2p_ad?.payment_method?.sell_method?.name || "—";
  const orderSummaryRows = trade && orderView ? [
    { label: "Order ID", value: trade.order_id || `#${trade.id}`, icon: "fa-hashtag" },
    { label: "Payment Method", value: paymentMethodName, icon: "fa-credit-card" },
    ...localOrderSummaryRows({
      side: "buy",
      fiat: summaryFiat,
      asset: summaryAsset,
      fiatAmount: orderView.fiatAmount,
      assetAmount: orderView.cryptoAmount,
      price: Number(trade.user_price),
      bonusAmount: summaryBonus,
    }),
  ] : [];

  useEffect(() => {
    const urls = proofFiles.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);

    return () => {
      urls.forEach(URL.revokeObjectURL);
    };
  }, [proofFiles]);

  useEffect(() => {
    if (!isOpen) {
      setProofFiles([]);
      setUploadedProofCount(0);
      setNote("Payment proof.");
      setSubmitting(false);
      setProofError(false);
      setOrderDetailsExpanded(false);
      return;
    }
  }, [isOpen]);

  if (!isOpen || !trade) return null;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? []);
    const supportedImageTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    const imageFiles = selectedFiles.filter(file => supportedImageTypes.includes(file.type));

    if (uploadedProofCount > 0) {
      toast.error("Finish submitting the selected proof images before adding or removing images.");
      event.target.value = "";
      return;
    }

    if (imageFiles.length !== selectedFiles.length) {
      toast.error("Only image files can be used as payment proof.");
    }
    if (imageFiles.length > 0) {
      setProofFiles(current => [...current, ...imageFiles]);
      setProofError(false);
    }
    event.target.value = "";
  };

  const removeProof = (indexToRemove: number) => {
    if (uploadedProofCount > 0) return;
    setProofFiles(current => current.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async () => {
    if (proofFiles.length === 0) {
      setProofError(true);
      toast.error("Please upload at least one payment proof image before submitting.");
      return;
    }

    setProofError(false);

    setSubmitting(true);
    let uploadedCount = uploadedProofCount;
    try {
      const proofMessage = note.trim() || "Payment proof.";
      for (let index = uploadedCount; index < proofFiles.length; index += 1) {
        await sendTradeMessage(trade.id, {
          message: index === 0 ? proofMessage : `Additional payment proof image ${index + 1} of ${proofFiles.length}.`,
          attachment: proofFiles[index],
        });
        uploadedCount = index + 1;
        setUploadedProofCount(uploadedCount);
      }
      await updateTradeStatus(trade.id, 5, "Buyer confirms payment sent with proof attachment");
      toast.success("Payment proof sent successfully.");
      onSuccess();
      onClose();
    } catch (e: any) {
      const errorMessage = e?.response?.data?.message ?? "Please try again.";
      if (uploadedCount > 0) {
        toast.error(
          uploadedCount === proofFiles.length
            ? `All proof images were uploaded, but the order status was not updated. Retry to notify the seller. ${errorMessage}`
            : `${uploadedCount} of ${proofFiles.length} proof images were uploaded. Retry to send the remaining images. ${errorMessage}`,
        );
      } else {
        toast.error(e?.response?.data?.message ?? "Failed to send payment proof.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`modal-overlay ${proofModalStyles.overlay}`} style={{ display: "flex" }} role="dialog" aria-modal="true" aria-labelledby="payment-proof-title">
      <div className={`modal-content ${proofModalStyles.modal}`}>
        <div className={`modal-header ${proofModalStyles.header}`}>
          <div>
            <span className={proofModalStyles.eyebrow}>Payment confirmation</span>
            <h6 id="payment-proof-title" className="modal-title">Submit payment proof</h6>
            <p className={proofModalStyles.subtitle}>Upload a clear receipt so the seller can verify your payment.</p>
          </div>
          <button
            type="button"
            className={`modal-close-btn ${proofModalStyles.closeButton}`}
            aria-label="Close modal"
            onClick={onClose}
          >
            <i className="fas fa-times" />
          </button>
        </div>

        <form
          className={`w-100 ${proofModalStyles.form}`}
          onSubmit={(event) => {
            event.preventDefault();
            if (proofFiles.length === 0) {
              setProofError(true);
              toast.error("Please upload at least one payment proof image before submitting.");
              return;
            }
            setProofError(false);
            void handleSubmit();
          }}
        >
          <div className={`modal-body ${proofModalStyles.body}`}>
            {orderView && (
              <div className={`${proofModalStyles.payAmount} align-items-center`}>
                <span className={proofModalStyles.payAmountIcon} aria-hidden="true">
                  <i className="fa-solid fa-sack-dollar" />
                </span>
                <span className={'fs-5'}><b>Pay Amount</b></span>
                <strong className={'fs-5'}><b>{orderView.youPayLine}</b></strong>
              </div>
            )}

            <section className={`${proofModalStyles.orderDetails} p2pCard px-3 mb-3`}>
              <button
                type="button"
                className={proofModalStyles.orderDetailsToggle}
                aria-expanded={orderDetailsExpanded}
                aria-controls={orderDetailsId}
                onClick={() => setOrderDetailsExpanded(expanded => !expanded)}
              >
                <span><i className="fa-solid fa-clipboard-list" aria-hidden="true" /> Order Summary</span>
                <i className={`fa-solid ${orderDetailsExpanded ? "fa-chevron-up" : "fa-chevron-down"}`} aria-hidden="true" />
              </button>
              {orderView && (
                <div id={orderDetailsId} className={proofModalStyles.orderDetailsContent} hidden={!orderDetailsExpanded}>
                  {orderSummaryRows.map((row, index) => (
                    <div key={`${row.label}-${index}`} className={`${proofModalStyles.summaryRow} ${row.total ? proofModalStyles.summaryTotal : ""} ${row.tone === "negative" ? proofModalStyles.summaryNegative : ""} ${row.tone === "positive" || row.tone === "received" ? proofModalStyles.summaryPositive : ""}`}>
                      <span><i className={`fa-solid ${row.icon}`} aria-hidden="true" />{row.label}</span>
                      <strong>{row.value}</strong>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className={proofModalStyles.uploadSection}>
              <div className={proofModalStyles.sectionHeading}>
                <div>
                  <span className={proofModalStyles.sectionTitle}>Payment receipt</span>
                  <span className={proofModalStyles.sectionHint}>JPEG, PNG, GIF or WebP · multiple images allowed</span>
                </div>
                <i className="fa-regular fa-image" aria-hidden="true" />
              </div>
              {proofFiles.length === 0 && (
              <label htmlFor={uploadInputId} className={`${proofModalStyles.uploadDropzone} ${proofError ? proofModalStyles.uploadError : ""}`}>
                <span className={proofModalStyles.uploadIcon} aria-hidden="true">
                  <i className="fa-solid fa-cloud-arrow-up" />
                </span>
                <span className={proofModalStyles.uploadCopy}>
                  <strong>Choose receipt images</strong>
                  <span>Tap to browse from your device</span>
                </span>
                <span className={proofModalStyles.browseButton}>Browse</span>
              </label>
              )}
              <input
                ref={receiptInputRef}
                id={uploadInputId}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                multiple
                className={proofModalStyles.fileInput}
                onChange={handleFileChange}
                disabled={submitting || uploadedProofCount > 0}
                aria-required="true"
                aria-invalid={proofError}
              />
              <div className={proofModalStyles.uploadHelp}>
                {uploadedProofCount > 0
                  ? `${uploadedProofCount} of ${proofFiles.length} images uploaded.`
                  : "Use a receipt showing the amount, recipient and transaction time."}
              </div>
              {proofError && (
                <div className={proofModalStyles.errorMessage}>Please upload at least one payment proof image.</div>
              )}
            </section>

            {proofFiles.length > 0 && (
              <div className={proofModalStyles.previewSection}>
                <div className={proofModalStyles.previewHeading}>Selected receipts <span>{proofFiles.length}</span></div>
                <div className={proofModalStyles.previewGrid}>
                  {proofFiles.map((file, index) => (
                    <div
                      key={`${file.name}-${file.lastModified}-${index}`}
                      className={proofModalStyles.previewCard}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={previewUrls[index]}
                        alt={`Payment proof ${index + 1}`}
                        className={proofModalStyles.previewImage}
                      />
                      <button
                        type="button"
                        className={proofModalStyles.removeButton}
                        aria-label={`Remove ${file.name}`}
                        title={`Remove ${file.name}`}
                        onClick={() => removeProof(index)}
                        disabled={submitting || uploadedProofCount > 0}
                      >
                        <i className="fa-solid fa-xmark" />
                      </button>
                      <span className={proofModalStyles.fileName}>
                        {file.name}
                      </span>
                    </div>
                  ))}
                  <button
                    type="button"
                    className={proofModalStyles.addReceiptTile}
                    onClick={() => receiptInputRef.current?.click()}
                    disabled={submitting || uploadedProofCount > 0}
                    aria-label="Add another receipt"
                    title="Add another receipt"
                  >
                    <i className="fa-solid fa-plus" aria-hidden="true" />
                    <span>Add receipt</span>
                  </button>
                </div>
              </div>
            )}

            <div className={proofModalStyles.messageSection}>
              <label className={proofModalStyles.sectionTitle} htmlFor={`${uploadInputId}-message`}>Message <span>(optional)</span></label>
              <textarea
                id={`${uploadInputId}-message`}
                className={proofModalStyles.messageInput}
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Payment proof."
              />
            </div>

            
          </div>

          <div className={proofModalStyles.footer}>
            <button type="button" className={proofModalStyles.cancelButton} onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button
              type="submit"
              className={proofModalStyles.submitButton}
              disabled={submitting}
            >
              {submitting
                ? "Submitting…"
                : uploadedProofCount === proofFiles.length && uploadedProofCount > 0
                  ? "Retry Notification"
                  : uploadedProofCount > 0
                    ? "Send Remaining Proof"
                    : "Submit Proof"}
            </button>
          </div>
        </form>
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
  const asset = normalizeCryptoAsset(trade.p2p_ad?.asset);
  const bonus = Number(trade.bonus_amount ?? 0);
  const fee = Number(trade.charge_amount ?? 0);
  const extraFeeOrBonusRow =
    trade.type === "buy" && bonus > 0
      ? { label: "Buy Bonus", value: `+${bonus.toFixed(2)} ${asset}` }
      : trade.type === "sell" && fee > 0
        ? { label: "Selling Fee", value: `${fee.toFixed(2)} ${asset}` }
        : null;

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
          {view.youPayLine}
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

export default function BuyDetailsCard({
  pendingStatus = 0,
  pendingTimeLeft = 0,
  pendingExpireTime = null,
  onTradeExpired,
  onStatusChange,
}: P2PTransferCardProps = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tradeId = searchParams.get("trade_id");

  const [trade, setTrade] = useState<TradeData | null>(null);
  const [uiStatus, setUiStatus] = useState<PaymentStatus>("payment");
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<number | null>(null);
  const [timerExpired, setTimerExpired] = useState(false);
  const [showProofModal, setShowProofModal] = useState(false);
  const [showPaymentReceivedModal, setShowPaymentReceivedModal] = useState(false);
  const [showTimeExtension, setShowTimeExtension] = useState(false);
  const [extensionMinutes, setExtensionMinutes] = useState(5);
  const [extendingTime, setExtendingTime] = useState(false);
  const autoExtensionPromptedFor = useRef<string | null>(null);
  const fetchSequence = useRef(0);

  const applyTrade = useCallback((nextTrade: TradeData) => {
    setTrade(nextTrade);
    setUiStatus(resolveUIStatus(nextTrade.status));
    onStatusChange?.(nextTrade);

    if (nextTrade.status === 2 && nextTrade.payment_expires_at) {
      const expiresAtMs = parseApiDateToMs(nextTrade.payment_expires_at);
      const nextSeconds = expiresAtMs
        ? Math.max(0, Math.floor((expiresAtMs - Date.now()) / 1000))
        : 0;
      setSecondsLeft(nextSeconds);
      setTimerExpired(nextSeconds <= 0);
    } else {
      setSecondsLeft(0);
      setTimerExpired(false);
    }
  }, [onStatusChange]);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchTrade = useCallback(async ({ silent = false }: { silent?: boolean } = {}) => {
    if (!tradeId) return;
    const requestSequence = ++fetchSequence.current;
    try {
      if (!silent) setLoading(true);
      const res = await getTrade(Number(tradeId));
      const t: TradeData = res?.data;
      if (requestSequence !== fetchSequence.current) return;
      applyTrade(t);
      if (t.status === 2 && t.payment_expires_at) {
        const expiresAtMs = parseApiDateToMs(t.payment_expires_at);
        const sec = expiresAtMs
          ? Math.max(0, Math.floor((expiresAtMs - Date.now()) / 1000))
          : 0;
        setSecondsLeft(sec);
        setTimerExpired(sec <= 0);
      }
    } catch (e: any) {
      if (!silent) toast.error(e?.response?.data?.message ?? "Failed to load trade.");
    } finally {
      if (!silent && requestSequence === fetchSequence.current) setLoading(false);
    }
  }, [tradeId, applyTrade]);

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

    const channelName = `p2p-order.${tradeIdNum}`;
    const channel = echo.private(channelName);
    const onOrderUpdate = () => {
      // The event is only emitted on this order's private channel. Refresh for
      // every event (including future payload shapes), not only when a
      // particular `refresh` flag happens to be present.
      void fetchTrade({ silent: true });
    };

    channel.listen(".p2p-order-details.update", onOrderUpdate);

    return () => {
      channel.stopListening(".p2p-order-details.update");
      echo.leave(channelName);
    };
  }, [tradeId, fetchTrade]);

  // ── Reconnect/fallback refresh ────────────────────────────────────────────
  useEffect(() => {
    const currentStatus = trade?.status;
    if (!tradeId || currentStatus === undefined || [6, 9].includes(currentStatus)) return;

    const refresh = () => void fetchTrade({ silent: true });
    const poll = window.setInterval(refresh, 10000);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);

    return () => {
      window.clearInterval(poll);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [trade?.status, tradeId, fetchTrade]);

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

    if (newStatus === 10) {
      const orderId = trade.order_id || String(trade.id);
      router.push(`/dashboard/local-buy-sell/appeal-center/create?order_id=${encodeURIComponent(orderId)}&trade_id=${trade.id}`);
      return;
    }

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
        title: "Approve Order?",
        html: `Approving will deduct <strong>${v.asset} ${v.cryptoStr}</strong> from your wallet.<br/>Are you sure you want to approve this trade?`,
        confirmText: "Yes, Approve!",
        icon: "question",
      },
      3: {
        title: "Cancel Order?",
        html: `Are you sure you want to <strong>cancel this order</strong>?<br/>This action cannot be undone.`,
        confirmText: "Yes, Cancel!",
        icon: "question",
      },
      5: {
        title: "Confirm Payment Sent?",
        html: `Please confirm you have transferred <strong>${v.fiat} ${v.fiatStr}</strong> to the seller.<br/>Only click if you have <strong>already sent the payment</strong>.`,
        confirmText: "Yes, I Transferred!",
        icon: "info",
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
        cancelButtonText: newStatus === 6 ? "Go Back" : "No, Go Back!",
        ...(newStatus === 2 ? {
          buttonsStyling: false,
          customClass: {
            popup: "local-approve-confirm",
            title: "local-approve-confirm-title",
            htmlContainer: "local-approve-confirm-message",
            icon: "local-approve-confirm-icon",
            confirmButton: "local-approve-confirm-yes",
            cancelButton: "local-approve-confirm-no",
            closeButton: "local-approve-confirm-close",
          },
        } : newStatus === 3 ? {
          buttonsStyling: false,
          customClass: {
            popup: "local-cancel-confirm",
            title: "local-cancel-confirm-title",
            htmlContainer: "local-cancel-confirm-message",
            icon: "local-cancel-confirm-icon",
            confirmButton: "local-cancel-confirm-yes",
            cancelButton: "local-cancel-confirm-no",
            closeButton: "local-cancel-confirm-close",
          },
        } : {}),
        confirmButtonColor: [3, 7, 10].includes(newStatus)
          ? "#dc3545"
          : "#198754",
      });

      if (!result.isConfirmed) return;
    }

    setSubmitting(newStatus);
    try {
      const response = await updateTradeStatus(trade.id, newStatus, notes);
      const updated = (response?.data ?? { ...trade, status: newStatus }) as TradeData;
      applyTrade(updated);

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

  const handleExtendPaymentTime = async (requestedMinutes = extensionMinutes) => {
    if (!trade || ![5, 10, 15, 20, 30, 40].includes(requestedMinutes)) return;

    setExtendingTime(true);
    try {
      await extendTradePaymentTime(trade.id, requestedMinutes);
      setShowTimeExtension(false);
      try {
        const response = await getTrade(trade.id);
        const updatedTrade: TradeData = response?.data;
        applyTrade(updatedTrade);
        if (updatedTrade.status === 2 && updatedTrade.payment_expires_at) {
          const expiresAtMs = parseApiDateToMs(updatedTrade.payment_expires_at);
          const seconds = expiresAtMs
            ? Math.max(0, Math.floor((expiresAtMs - Date.now()) / 1000))
            : 0;
          setSecondsLeft(seconds);
          setTimerExpired(seconds <= 0);
        }
      } catch {
        toast.error("Payment time was extended, but the order timer could not be refreshed. Reload the page to see the updated time.");
        return;
      }
      toast.success(`Payment time extended by ${requestedMinutes} minutes.`);
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Failed to extend payment time.");
    } finally {
      setExtendingTime(false);
    }
  };

  useEffect(() => {
    const openPaymentProof = () => setShowProofModal(true);
    window.addEventListener("local-trade-open-payment-proof", openPaymentProof);
    return () => window.removeEventListener("local-trade-open-payment-proof", openPaymentProof);
  }, []);

  useEffect(() => {
    const expiresAt = trade?.payment_expires_at;
    if (
      trade?.status !== 2 ||
      !expiresAt ||
      secondsLeft <= 0 ||
      secondsLeft > 5 * 60 ||
      autoExtensionPromptedFor.current === expiresAt
    ) return;

    autoExtensionPromptedFor.current = expiresAt;
    setShowTimeExtension(true);
  }, [trade?.status, trade?.payment_expires_at, secondsLeft]);

  const [sellFeePercent, setSellFeePercent] = useState(0);

  useEffect(() => {
    if (!trade) return;

    let mounted = true;

    const loadSettings = async () => {
      try {
        const res = await getBonusFeesSettings();
        const settings = res?.data ?? {};
        const nextFee = Number(settings?.user_sell_charge ?? 0);

        if (!mounted) return;
        setSellFeePercent(trade.type === "sell" ? nextFee : 0);
      } catch (error) {
        console.error("Failed to load bonus & fees settings:", error);
        if (mounted) {
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
  const methodName = trade.p2p_ad?.payment_method?.sell_method?.name ?? "Payment Method";
  const paymentMethodFields = trade.p2p_ad?.payment_method?.sell_method?.fields ?? [];
  const paymentFieldValues = trade.p2p_ad?.payment_method?.field_values ?? {};
  const paymentDetails = paymentMethodFields
    .filter(field => /(number|wallet|phone|mobile|account)/i.test(`${field.key} ${field.label}`))
    .map(field => ({
      label: field.label,
      value: paymentFieldValues[field.key]?.trim() ?? "",
    }))
    .filter(detail => detail.value);
  const mm = Math.floor(secondsLeft / 60);
  const ss = secondsLeft % 60;

  const statusList = trade.status_list ?? [];
  const canApprove = statusList.includes(2);
  const canReject = statusList.includes(3);
  const canDispatch = statusList.includes(5);
  const canRelease = statusList.includes(6);
  const canDispute = statusList.includes(7);
  const canClaim = statusList.includes(10);
  const canCancelOrder = trade.status === 1 || trade.status === 2;
  const isBuyFlow = trade.type === "buy";
  const notifyTransferredLabel = isBuyFlow ? "Payment Proof" : "Payment Proof";

  // Pending countdown (status === 1) — derived values
  const isPending = trade.status === 1;
  const pendingMm = Math.floor(pendingTimeLeft / 60);
  const pendingSs = pendingTimeLeft % 60;
  const backToP2PHref = "/dashboard/local-buy-sell";

  const fiatAmount = Number(trade.payable_amount);
  const cryptoAmount = Number(trade.receivable_amount);
  const price = Number(trade.user_price);
  const bonusAmount = Number(trade.bonus_amount ?? 0);
  const displayedBonusPercent = trade.bonus_percent != null
    ? Number(trade.bonus_percent)
    : 0;
  const feeCryptoAmount = Number(trade.charge_amount ?? 0);
  const feeAmount = feeCryptoAmount > 0
    ? feeCryptoAmount * price
    : fiatAmount * sellFeePercent / 100;
  const displayedFeePercent =
    fiatAmount > 0 && feeAmount > 0
      ? feeAmount / fiatAmount * 100
      : sellFeePercent;
  const note = trade.p2p_ad?.remarks ?? trade.p2p_ad?.payment_method?.remarks;

  const hasTopActions = (canReject && !canCancelOrder) || canApprove || canDispatch || canRelease || canDispute || (canClaim && (uiStatus === "pending" || timerExpired)) || trade.status === 2;
  const renderTopActions = () => !hasTopActions ? null : (
    <div className="p2pTopActions" role="group" aria-label="Order actions">
      <div className="p2pActions">
        {canReject && !canCancelOrder && (
          <button className="p2pGhostBtn p2pActionCancel" type="button" onClick={() => void handleStatusUpdate(3)} disabled={submitting !== null}>
            {submitting === 3 ? "Rejecting…" : "Reject Order"}
          </button>
        )}
        {canApprove && (
          <button className="p2pPrimaryBtn" type="button" onClick={() => void handleStatusUpdate(2)} disabled={submitting !== null}>
            {submitting === 2 ? "Approving…" : "Approve Order"}
          </button>
        )}
        {trade.status === 2 && secondsLeft > 0 && secondsLeft <= 5 * 60 && (
          <button
            className={`${paymentTimeStyles.openExtension} ${paymentTimeStyles.buy}`}
            type="button"
            onClick={() => setShowTimeExtension(true)}
            disabled={extendingTime || submitting !== null}
            aria-haspopup="dialog"
            aria-expanded={showTimeExtension}
          >
            <i className="fa-regular fa-clock" aria-hidden="true" />
            Need more time
            <i className="fa-solid fa-arrow-up-right-from-square" aria-hidden="true" />
          </button>
        )}
        {canDispatch && (
          <button className="p2pPrimaryBtn" type="button" onClick={() => setShowProofModal(true)} disabled={submitting !== null}>
            {submitting === 5 ? "Notifying…" : notifyTransferredLabel}
          </button>
        )}
        {canRelease && (
          <button className="p2pPrimaryBtn" type="button" onClick={() => setShowPaymentReceivedModal(true)} disabled={submitting !== null}>
            Confirm &amp; Release
          </button>
        )}
        {canDispute && (
          <button className="p2pGhostBtn" type="button" onClick={() => void handleStatusUpdate(7)} disabled={submitting !== null}>
            {submitting === 7 ? "Submitting…" : "Appeal"}
          </button>
        )}
        {canClaim && (uiStatus === "pending" || timerExpired) && (
          <button className="p2pGhostBtn" type="button" onClick={() => void handleStatusUpdate(10)} disabled={submitting !== null}>
            {submitting === 10 ? "Submitting…" : "Appeal"}
          </button>
        )}
      </div>
    </div>
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="p2pDetailActionPage">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="p2pOrderHeader">
        {isPending ? (
          <div className={`p2pPendingCard ${pendingTimeLeft > 0 && pendingTimeLeft <= 60 ? "is-urgent" : ""}`}>
            <div className="p2pPendingMain">
              <span className="p2pPendingIcon" aria-hidden="true">
                <i className={`fa-solid ${canApprove || canReject ? "fa-clipboard-check" : "fa-hourglass-half"}`} />
              </span>
              <div className="p2pPendingCopy" role="status">
                <span className="p2pPendingEyebrow">
                  {canApprove || canReject ? "Action required" : "Request submitted"}
                </span>
                <h3>{canApprove || canReject ? "Review trade request" : "Waiting for seller approval"}</h3>
                <p>
                  {canApprove || canReject
                    ? "Review the order details below and accept or decline this request."
                    : "Your request is with the seller. We’ll update you as soon as it’s reviewed."}
                </p>
              </div>
            </div>
            {pendingExpireTime && (
              <div className="p2pPendingCountdown" role="timer" aria-live="off">
                <span className="p2pCountdownIcon" aria-hidden="true">
                  <i className="fa-regular fa-clock" />
                </span>
                <span className="p2pCountdownLabel">Time left</span>
                <strong aria-label={`${pad(pendingMm)} minutes ${pad(pendingSs)} seconds remaining`}>
                  {pad(pendingMm)}:{pad(pendingSs)}
                </strong>
              </div>
            )}
          </div>
        ) : (
          <StatusBanner status={trade.status} />
        )}

        <div className="p2pStatusActionRow">
          <div className="p2pStatusActionTitle">
        {uiStatus === "completed" ? (
          <div className="d-flex justify-content-between align-items-center">
            <h2 className="p2pTitle text-white">Order Completed</h2>
            <span className="w-15 h-15 border border-success rounded-pill d-flex justify-content-center align-items-center mt-3">
              <span className="p-3 bg-success m-2 rounded-pill d-flex justify-content-center align-items-center">
                <i className="fa-solid fa-check" />
              </span>
            </span>
            {trade.status != 1 && (
              <OrderChatLink tradeId={trade.id} />
            )}
          </div>
        ) : uiStatus === "rejected" ? (
          <div className="d-flex justify-content-between align-items-center">
            <h2 className="p2pTitle text-danger">
              {trade.current_status?.status_text ?? "Order Cancelled"}
            </h2>
          </div>
        ) : isPending ? null : (
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
              <OrderChatLink tradeId={trade.id} />
            )}
          </div>
        )}

          </div>
            {canCancelOrder && (
              <button
                className="p2pGhostBtn p2pActionCancel"
                type="button"
                onClick={() => void handleStatusUpdate(3)}
                disabled={submitting !== null}
              >
                {submitting === 3 ? "Cancelling…" : "Cancel Order"}
              </button>
            )}
        </div>

        {/* <div className={`p2pSubRow ${isPending ? "p2pPendingOrderId" : ""}`}>
          <div className="p2pOrderNo">
            <span className="p2pMuted">Order ID</span>
            <span className="p2pOrderValue">{orderId}</span>
            <CopyBtn text={orderId} id="order_id" />
          </div>
        </div> */}
      </div>

      {hasTopActions && <div className="p2pMobileTopActions">{renderTopActions()}</div>}

      {uiStatus !== "rejected" && (
        <TradeProgressSteps tone="buy" currentStep={uiStatus === "completed" ? 3 : 2} />
      )}

      <TradeOrderSummary
        orderId={orderId}
        kind="buy"
        asset={asset}
        currency={fiat}
        fiatAmount={fiatAmount}
        price={price}
        priceLabel={trade.user_price_label}
        cryptoAmount={cryptoAmount}
        paymentTimeLimit={trade.p2p_ad?.payment_time_limit ?? 0}
        remainingSeconds={isPending ? pendingTimeLeft : trade.status === 2 ? secondsLeft : null}
        note={note}
        paymentMethod={methodName}
        paymentMethodIconImage={
          trade.p2p_ad?.payment_method?.sell_method?.icon_url ??
          trade.p2p_ad?.payment_method?.sell_method?.icon_image ??
          trade.user_payment_method?.sell_method?.icon_url ??
          trade.user_payment_method?.sell_method?.icon_image ??
          trade.method?.sell_method?.icon_url ??
          trade.method?.sell_method?.icon_image
        }
        paymentDetails={paymentDetails}
        showPaymentDetails={!isPending}
        bonusAmount={bonusAmount}
        bonusPercent={displayedBonusPercent}
      />

      {isPending && !canApprove && !canReject && (
        <div className="p2pApprovalWait" role="status" aria-live="polite">
          <span className="p2pApprovalWaitIcon" aria-hidden="true">
            <i className="fa-solid fa-hourglass-half" />
          </span>
          <div className="p2pApprovalWaitCopy">
            <span>Request submitted</span>
            <strong>Waiting for seller approval</strong>
            <small>Your request is being reviewed. This panel will update when the seller responds.</small>
          </div>
          <span className="p2pApprovalWaitDots" aria-hidden="true"><i /><i /><i /></span>
        </div>
      )}

      {canCancelOrder && (
        <div className={`${paymentTimeStyles.cancelOrderRow} p2pBottomCancel`}>
          <button
            className={paymentTimeStyles.cancelOrder}
            type="button"
            onClick={() => handleStatusUpdate(3)}
            disabled={submitting !== null}
          >
            {submitting === 3 ? (
              <>
                <span className="spinner-border spinner-border-sm" aria-hidden="true" />
                Cancelling…
              </>
            ) : (
              <>
                <i className="fa-regular fa-circle-xmark" aria-hidden="true" />
                Cancel Order
              </>
            )}
          </button>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          PAYMENT PHASE  (trade.status = 1 or 2)
      ══════════════════════════════════════════════════════════════════ */}
      {uiStatus === "payment" && (
        <div className="p2pStepWrap">
          <div className="p2pStepRow">
            {/* <div className="p2pStepNo d-flex justify-content-center align-items-center bg-warning">
              1
            </div> */}

            <div className="p2pStep2">
              <div className="p2pStep2Body">
                <div className="p2pActions">
                  {canDispatch && (
                    <button
                      className="p2pPrimaryBtn"
                      type="button"
                      onClick={() => setShowProofModal(true)}
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
                        "⏱ Time Expired — Appeal"
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
                            "Approve Order"
                          )}
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
          onStatusUpdate={async (status, notes) => {
            if (status === 6) {
              setShowPaymentReceivedModal(true);
              return;
            }
            await handleStatusUpdate(status, notes);
          }}
        />
      )}

      {/* ══════════════════════════════════════════════════════════════════
          COMPLETED  (status 6 or 9)
      ══════════════════════════════════════════════════════════════════ */}
      {uiStatus === "completed" && <OrderCompleted trade={trade} from="local" />}

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
              Back To Marketplace
            </Link>
          </div>
        </div>
      )}

      {hasTopActions && <div className="p2pDesktopBottomActions">{renderTopActions()}</div>}

      <PaymentProofModal
        isOpen={showProofModal}
        trade={trade}
        onClose={() => setShowProofModal(false)}
        onSuccess={() => {
          setShowProofModal(false);
          void fetchTrade();
        }}
      />
      <PaymentReceivedModel
        isOpen={showPaymentReceivedModal}
        onClose={() => setShowPaymentReceivedModal(false)}
        setConfirmPayment={() => {
          setShowPaymentReceivedModal(false);
          void handleStatusUpdate(6);
        }}
        buyerName={trade.customer?.name ?? "Buyer"}
        amount={fiatAmount}
        currency={fiat}
        details={[
          { label: "Order ID", value: trade.order_id || String(trade.id), icon: "fa-hashtag" },
          ...localOrderSummaryRows({
            side: "sell",
            fiat,
            asset,
            fiatAmount,
            assetAmount: cryptoAmount,
            price,
            priceLabel: trade.user_price_label,
            feeAmount: feeCryptoAmount,
            feePercent: displayedFeePercent,
            feeLabel: "Ad Fee (Already Paid)",
          }),
        ]}
      />
      {showTimeExtension && (
        <div className={`${paymentTimeStyles.modalOverlay} ${paymentTimeStyles.buy}`} onClick={() => !extendingTime && setShowTimeExtension(false)}>
          <section className={paymentTimeStyles.modal} role="dialog" aria-modal="true" aria-labelledby="buy-time-extension-title" onClick={event => event.stopPropagation()}>
            <button className={paymentTimeStyles.modalClose} type="button" aria-label="Close" onClick={() => setShowTimeExtension(false)} disabled={extendingTime}>
              <i className="fa-solid fa-xmark" aria-hidden="true" />
            </button>
            <span className={paymentTimeStyles.modalIcon}><i className="fa-solid fa-exclamation" aria-hidden="true" /></span>
            <h2 id="buy-time-extension-title">Need more time to pay?</h2>
            <p>Your payment window has 5 minutes or less remaining. You can request extra time to complete the payment.</p>
            <div className={paymentTimeStyles.modalChoices} role="group" aria-label="Additional payment time">
              {[5, 10, 15, 20, 30, 40].map(minutes => (
                <button
                  key={minutes}
                  type="button"
                  className={`${paymentTimeStyles.duration} ${extensionMinutes === minutes ? paymentTimeStyles.durationSelected : ""}`}
                  onClick={() => setExtensionMinutes(minutes)}
                  disabled={extendingTime}
                  aria-pressed={extensionMinutes === minutes}
                >
                  <b>{minutes}</b>
                  <small>minutes</small>
                </button>
              ))}
            </div>
            <div className={paymentTimeStyles.modalActions}>
              <button className={paymentTimeStyles.cancel} type="button" onClick={() => setShowTimeExtension(false)} disabled={extendingTime}>Continue Payment</button>
              <button className={paymentTimeStyles.submit} type="button" onClick={() => void handleExtendPaymentTime()} disabled={extendingTime}>
                {extendingTime ? <><span className="spinner-border spinner-border-sm" aria-hidden="true" /> Extending…</> : <>Request More Time <i className="fa-solid fa-arrow-right" aria-hidden="true" /></>}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
