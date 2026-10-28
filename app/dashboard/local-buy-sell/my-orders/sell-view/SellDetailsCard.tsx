 "use client";

import { getBonusFeesSettings } from "@/app/api/merchant";
import { extendTradePaymentTime, getTrade, updateTradeStatus } from "@/app/api/trade";
import { normalizeCryptoAsset } from "@/components/dashboard/p2p/p2pOrderDisplay";
import TradeOrderSummary from "./TradeOrderSummary";
import TradeProgressSteps from "../TradeProgressSteps";
import paymentTimeStyles from "../PaymentTimeExtension.module.css";
import PaymentCompleted from "./PaymentCompleted";
import { PaymentReceivedModel } from "./PaymentReceivedModel";
import { useExpiryTimer } from "@/hooks/useExpiryTimer";
import { getTradeEcho } from "@/utils/tradeEcho";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TradeData {
  id: number;
  order_id: string;
  type: string;
  status: number;
  is_client: boolean;
  status_list: number[];
  payable_amount: number;
  receivable_amount: number;
  user_price: number;
  created_at: string;
  bonus_amount: number | null;
  notes: string | null;
  is_client_seller: boolean;
  pending_time_limit?: string | null;
  payment_expires_at: string | null; // ← new field
  charge_amount?: number; // ← fee shown in Order details (release quantity / fee breakdown)
  client: { id: number; name: string; avatar?: string };
  customer: { id: number; name: string; avatar?: string };
  customer_id: number;
  client_id: number;
  p2p_ad?: {
    asset: string;
    with_fiat: string;
    order_limit_min: number;
    order_limit_max: number;
    payment_time_limit: number;
    remarks?: string | null;
    payment_method?: {
      field_values?: Record<string, string>;
      bankName?: string;
      remarks?: string | null;
      sell_method?: { name: string; icon_image?: string | null; icon_url?: string | null };
    };
  };
  current_status?: {
    status: number;
    status_text: string;
    method?: string;
    with_fiat?: string;
    note?: string;
    user?: { id: number; name: string; avatar?: string };
  };
  user_payment_method?: {
    icon_image?: string | null;
    icon_url?: string | null;
    field_values: { walletNumber?: string; bankName?: string };
    sell_method?: { name: string; icon_image?: string | null; icon_url?: string | null };
  };
  trade_review?: any;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function copyText(text: string) {
  navigator.clipboard.writeText(text);
}

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handle = () => {
    copyText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button className="p2pCopyBtn" type="button" aria-label="copy" onClick={handle}>
      {copied
        ? <i className="fa-solid fa-check text-success" />
        : <i className="fa-regular fa-copy" />
      }
    </button>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function SellDetailsCard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tradeId      = searchParams.get("trade_id");
  const tradeIdNum   = tradeId ? Number(tradeId) : NaN;

  const [trade,           setTrade]           = useState<TradeData | null>(null);
  const [loading,         setLoading]         = useState(true);
  const [submitting,      setSubmitting]      = useState(false);
  const [paymentReceived, setPaymentReceived] = useState(false);
  const [confirmPayment,  setConfirmPayment]  = useState(false);
  const [sellFeePercent,  setSellFeePercent]  = useState(0);
  const [showTimeExtension, setShowTimeExtension] = useState(false);
  const [extensionMinutes, setExtensionMinutes] = useState(5);
  const [extendingTime, setExtendingTime] = useState(false);
  const autoExtensionPromptedFor = useRef<string | null>(null);


  useEffect(() => {
    let mounted = true;

    const loadSettings = async () => {
      try {
        const res = await getBonusFeesSettings();
        const settings = res?.data ?? {};
        const nextFee = Number(settings?.user_sell_charge ?? 0);

        if (!mounted) return;
        setSellFeePercent(trade?.type === "sell" ? nextFee : 0);
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
  }, [trade?.type]);

  // ─── Fetch trade ────────────────────────────────────────────────────────────

  const fetchTrade = useCallback(async () => {
    if (!Number.isFinite(tradeIdNum) || tradeIdNum < 1) return;
    try {
      setLoading(true);
      const res = await getTrade(tradeIdNum);

      const t: TradeData = res?.data;
      setTrade(t);
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Failed to load trade.");
    } finally {
      setLoading(false);
    }
  }, [tradeIdNum]);

  useEffect(() => {
    if (!Number.isFinite(tradeIdNum) || tradeIdNum < 1) return;
    setTrade(null);
    setConfirmPayment(false);
    setPaymentReceived(false);
    setLoading(true);
    const timer = window.setTimeout(() => { void fetchTrade(); }, 2000);
    return () => window.clearTimeout(timer);
  }, [tradeIdNum, fetchTrade]);

  useEffect(() => {
    if (!Number.isFinite(tradeIdNum) || tradeIdNum < 1) return;

    const echo = getTradeEcho();
    if (!echo) return;

    const channelName = `trade.${tradeIdNum}`;
    const channel = echo.private(channelName);
    const onStatusUpdate = (payload: { data?: { refresh?: boolean } }) => {
      if (payload?.data?.refresh) {
        void fetchTrade();
      }
    };

    channel.listen(".p2p-order-details.update", onStatusUpdate);

    return () => {
      channel.stopListening(".p2p-order-details.update");
      echo.leave(channelName);
    };
  }, [tradeIdNum, fetchTrade]);

  // 6 = payment received (release path); 9 = completed. 10 = appealed/claimed — not "Payment Completed".
  useEffect(() => {
    if (!trade) return;
    setConfirmPayment(trade.status === 6 || trade.status === 9);
  }, [trade?.status]);

  const sl = trade?.status_list ?? [];
  const releasePhaseActive =
    !!trade && trade.status === 5 && (sl.includes(6) || sl.includes(7) || sl.includes(10));

  // Status 2: payment window. Status 5: release / appeal window (expires_at refreshed on PAYMENT_SENT).
  const paymentTimer = useExpiryTimer(
    trade?.payment_expires_at ?? null,
    !!trade && trade.status === 2 && !confirmPayment
  );
  const releaseAppealTimer = useExpiryTimer(
    trade?.payment_expires_at ?? null,
    releasePhaseActive
  );
  const pendingApprovalTimer = useExpiryTimer(
    trade?.pending_time_limit ?? null,
    !!trade && trade.status === 1
  );

  const mm = trade?.status === 5 ? releaseAppealTimer.mm : paymentTimer.mm;
  const ss = trade?.status === 5 ? releaseAppealTimer.ss : paymentTimer.ss;
  const appealCountdownBlocking =
    !!trade?.payment_expires_at && releasePhaseActive && !releaseAppealTimer.expired;
  const pendingApprovalMm = pendingApprovalTimer.mm;
  const pendingApprovalSs = pendingApprovalTimer.ss;

  // ─── Status update ───────────────────────────────────────────────────────────

  const doUpdate = async (newStatus: number, notes?: string) => {
    if (!trade) return false;
    setSubmitting(true);
    try {
      const res = await updateTradeStatus(trade.id, newStatus, notes);
      // Use fresh trade from response so payment_expires_at is up to date
      const updated: TradeData = res?.data ?? { ...trade, status: newStatus };
      setTrade(updated);
      toast.success("Status updated.");
      return true;
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Failed to update status.");
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const handlePaymentReceived    = () => setPaymentReceived(true);
  const handleConfirmPayment     = async () => {
    const ok = await doUpdate(6, "Seller confirms payment received, releasing crypto");
    if (ok) { setPaymentReceived(false); setConfirmPayment(true); }
  };

  const handleAppeal = async () => {
    await doUpdate(7, "Dispute raised by seller");
  };

  const handleClaimToAdmin = async () => {
    if (!trade) return;
    const orderId = trade.order_id || String(trade.id);
    router.push(`/dashboard/local-buy-sell/appeal-center/create?order_id=${encodeURIComponent(orderId)}&trade_id=${trade.id}`);
  };

  const handleApproveTrade = async () => {
    await doUpdate(2);
  };

  const handleRejectTrade = async () => {
    const result = await Swal.fire({
      title: "Cancel Order?",
      html: "Are you sure you want to <strong>cancel this order</strong>? This action cannot be undone.",
      icon: "warning",
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: "Yes, Cancel!",
      cancelButtonText: "No, Go Back!",
      confirmButtonColor: "#dc3545",
    });

    if (!result.isConfirmed) return;
    await doUpdate(3);
  };

  const handleExtendPaymentTime = async (requestedMinutes = extensionMinutes) => {
    if (!trade || ![5, 10, 15, 30].includes(requestedMinutes)) return;

    setExtendingTime(true);
    try {
      await extendTradePaymentTime(trade.id, requestedMinutes);
      setShowTimeExtension(false);
      try {
        const response = await getTrade(trade.id);
        const updatedTrade: TradeData = response?.data;
        setTrade(updatedTrade);
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
    const expiresAt = trade?.payment_expires_at;
    if (
      trade?.status !== 2 ||
      !expiresAt ||
      paymentTimer.secondsLeft <= 0 ||
      paymentTimer.secondsLeft > 5 * 60 ||
      autoExtensionPromptedFor.current === expiresAt
    ) {
      return;
    }

    autoExtensionPromptedFor.current = expiresAt;
    void (async () => {
      const result = await Swal.fire({
        title: "Need more time to pay?",
        text: "Your payment window has 5 minutes or less remaining. You can request extra time to complete the payment.",
        icon: "warning",
        input: "select",
        inputOptions: {
          5: "5 more minutes",
          10: "10 more minutes",
          15: "15 more minutes",
          30: "30 more minutes",
        },
        inputValue: "5",
        inputPlaceholder: "Choose extra time",
        showCancelButton: true,
        confirmButtonText: "Request More Time",
        cancelButtonText: "Continue Payment",
        confirmButtonColor: "#19a979",
        cancelButtonColor: "#6c757d",
        allowOutsideClick: false,
        inputValidator: value =>
          [5, 10, 15, 30].includes(Number(value)) ? undefined : "Choose a valid extension time.",
      });

      if (result.isConfirmed) {
        await handleExtendPaymentTime(Number(result.value));
      }
    })();
  }, [trade?.status, trade?.payment_expires_at, paymentTimer.secondsLeft, handleExtendPaymentTime]);

  // ─── Guards ──────────────────────────────────────────────────────────────────

  if (!tradeId) return <p className="text-center py-5 text-muted">No trade ID in URL.</p>;

  if (loading) {
    return (
      <div className="p2pOrderHeader placeholder-glow">
        <span className="placeholder col-8 mb-2 d-block rounded" />
        <span className="placeholder col-5 mb-2 d-block rounded" />
        <span className="placeholder col-6 d-block rounded" />
      </div>
    );
  }

  if (!trade) return <p className="text-center py-5 text-danger">Trade not found.</p>;

  // ─── Derived values ──────────────────────────────────────────────────────────

  const methodName        = trade.p2p_ad?.payment_method?.sell_method?.name
                         ?? trade.current_status?.method
                         ?? 'N/A';
  const asset = normalizeCryptoAsset(trade.p2p_ad?.asset);
  const orderId           = trade.order_id;
  const fiatAmountStr = Number(trade.payable_amount).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const cryptoAmountStr = Number(trade.receivable_amount).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  });
  const price             = Number(trade.user_price).toFixed(2);
  const withFiat          = trade.current_status?.with_fiat ?? trade.p2p_ad?.with_fiat ?? '';
  const buyerName         = trade.customer?.name ?? 'Buyer';
  const isBuyerDispatched = trade.status === 5;
  const statusList = trade.status_list ?? [];
  const canRelease = statusList.includes(6);
  const canDispute = statusList.includes(7);
  const canClaim = statusList.includes(10);
  const canApprove = statusList.includes(2);
  const canReject = statusList.includes(3);
  const canCancelOrder = ![3, 4, 6, 7, 8, 9].includes(trade.status);
  const isPendingReview = trade.status === 1 && (canApprove || canReject);
  const approvalWindowExpired =
    trade.status === 1 && !!trade.pending_time_limit && pendingApprovalTimer.expired;
  const showExpiredPendingState = approvalWindowExpired || trade.status === 3 || trade.status === 4 || trade.status === 8;
  const backToP2PHref = "/dashboard/local-buy-sell/my-orders";

  // "From" is always the seller side, "To" is always the buyer side.
  const fiatAmount = Number(trade.payable_amount);
  const cryptoAmount = Number(trade.receivable_amount);
  const feeCryptoAmount = Number(trade.charge_amount ?? 0);
  const feeAmount = feeCryptoAmount > 0
    ? feeCryptoAmount * Number(trade.user_price)
    : fiatAmount * sellFeePercent / 100;
  const displayedFeePercent =
    fiatAmount > 0 && feeAmount > 0
      ? feeAmount / fiatAmount * 100
      : sellFeePercent;
  const note = trade.p2p_ad?.remarks ?? trade.p2p_ad?.payment_method?.remarks;
  const paymentDetails = Object.entries(trade.p2p_ad?.payment_method?.field_values ?? {})
    .filter(([key, value]) => Boolean(value?.trim()) && /(number|wallet|phone|mobile|account)/i.test(key))
    .map(([label, value]) => ({
      label: label
        .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
        .replace(/[_-]/g, " ")
        .replace(/\b\w/g, character => character.toUpperCase()),
      value,
    }));

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
     <>
      <div className="p2pOrderHeader">

        {trade.status === 1 ? (
          <div className={`p2pPendingCard ${pendingApprovalTimer.secondsLeft > 0 && pendingApprovalTimer.secondsLeft <= 60 ? "is-urgent" : ""}`}>
            <div className="p2pPendingMain">
              <span className="p2pPendingIcon" aria-hidden="true">
                <i className={`fa-solid ${isPendingReview ? "fa-clipboard-check" : "fa-hourglass-half"}`} />
              </span>
              <div className="p2pPendingCopy" role="status">
                <span className="p2pPendingEyebrow">
                  {isPendingReview ? "Action required" : "Request submitted"}
                </span>
                <h3>{isPendingReview ? "Review trade request" : "Waiting for seller approval"}</h3>
                <p>
                  {isPendingReview
                    ? "Review the order details below and accept or decline this request."
                    : "Your request is with the seller. We'll update you as soon as it's reviewed."}
                </p>
              </div>
            </div>
            {trade.pending_time_limit && (
              <div className="p2pPendingCountdown" role="timer" aria-live="off">
                <span className="p2pCountdownIcon" aria-hidden="true">
                  <i className="fa-regular fa-clock" />
                </span>
                <span className="p2pCountdownLabel">Time left</span>
                <strong aria-label={`${pad(pendingApprovalMm)} minutes ${pad(pendingApprovalSs)} seconds remaining`}>
                  {pad(pendingApprovalMm)}:{pad(pendingApprovalSs)}
                </strong>
              </div>
            )}
          </div>
        ) : trade.status === 2 && (
          <div className="toast-body p-2 rounded-2 text-white toast-bg-success d-flex align-items-center">
            <i className="fas fa-check me-2" />
            Your Sell Request Is Accepted
          </div>
        )}
        {trade.status === 10 && (
          <div className="toast-body p-2 rounded-2 text-white toast-bg-warning d-flex align-items-center">
            <i className="fa-solid fa-scale-balanced me-2" />
            {trade.current_status?.status_text ?? "Appealed"} — awaiting admin review
          </div>
        )}

        {/* Title */}
        {trade.status === 1 ? null : confirmPayment ? (
          <div className="d-flex justify-content-between align-items-center">
            <h2 className="p2pTitle text-white">Payment Completed</h2>
            <span className="w-15 h-15 mt-3 border border-success rounded-pill d-flex justify-content-center align-items-center">
              <span className="p-3 bg-success m-2 rounded-pill d-flex justify-content-center align-items-center">
                <i className="fa-solid fa-check" />
              </span>
            </span>
            {trade.status != 1 && (
              <Link href={`/dashboard/local-buy-sell/chat-list?trade_id=${trade.id}`} className="chat-notification d-md-none">
                <i className="fa-solid fa-message" />
              </Link>
            )}
          </div>
        ) : (
          <div className="d-flex justify-content-between align-items-center">
            <h2 className="p2pTitle">
              {isPendingReview ? (
                <>Review trade request</>
              ) : trade.status === 10 ? (
                <>{trade.current_status?.status_text ?? "Appealed"}</>
              ) : isBuyerDispatched ? (
                <>Buyer has paid — verify &amp; release crypto <i className="fa-regular fa-circle-question text-xs" /> <span className="p2pTimer">{pad(mm)}:{pad(ss)}</span></>
              ) : (
                <>{`Waiting Buyer's Payment`} <span className="p2pTimer">{pad(mm)}:{pad(ss)}</span></>
              )}
            </h2>
            {trade.status != 1 && (
              <Link href={`/dashboard/local-buy-sell/chat-list?trade_id=${trade.id}`} className="chat-notification d-md-none">
                <i className="fa-solid fa-message" />
              </Link>
            )}
          </div>
        )}

        {/* Order number */}
        {/* <div className={`p2pSubRow ${trade.status === 1 ? "p2pPendingOrderId" : ""}`}>
          <div className="p2pOrderNo">
            <span className="p2pMuted">Order ID</span>
            <span className="p2pOrderValue">{orderId}</span>
            <CopyBtn text={orderId} />
          </div>
        </div> */}
      </div>

      {![3, 4, 7, 8, 10].includes(trade.status) && (
        <TradeProgressSteps
          tone="sell"
          currentStep={confirmPayment || [6, 9].includes(trade.status) ? 3 : 2}
        />
      )}

      <TradeOrderSummary
        orderId={orderId}
        kind="sell"
        asset={asset}
        currency={withFiat}
        fiatAmount={fiatAmount}
        price={Number(trade.user_price)}
        cryptoAmount={cryptoAmount}
        paymentTimeLimit={trade.p2p_ad?.payment_time_limit ?? 0}
        note={note}
        paymentMethod={methodName}
        paymentMethodIconImage={
          trade.p2p_ad?.payment_method?.sell_method?.icon_url ??
          trade.p2p_ad?.payment_method?.sell_method?.icon_image ??
          trade.user_payment_method?.sell_method?.icon_url ??
          trade.user_payment_method?.sell_method?.icon_image ??
          trade.user_payment_method?.icon_url ??
          trade.user_payment_method?.icon_image
        }
        paymentDetails={paymentDetails}
        showPaymentDetails={trade.status !== 1}
        feeAmount={feeAmount}
        feePercent={displayedFeePercent}
      />

      {canCancelOrder && (
        <div className={paymentTimeStyles.cancelOrderRow}>
          <button
            className={paymentTimeStyles.cancelOrder}
            type="button"
            onClick={() => void handleRejectTrade()}
            disabled={submitting}
          >
            {submitting ? (
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

      {/* ── STEPS (shown while not yet completed; not when appealed status 10) ── */}
      {!confirmPayment && trade.status !== 10 && showExpiredPendingState ? (
        <div className="p2pStepWrap">
          <div className="p2pCard p-3 text-center">
            <i className="fa-solid fa-circle-xmark text-danger fs-1 mb-3 d-block" />
            <div className="p2pStepTitle text-danger mb-1">
              {trade.current_status?.status_text ?? "Order Cancelled"}
            </div>
            <p className="p2pMuted p2pSmall">{trade.current_status?.note ?? "The pending approval time has expired."}</p>
            <Link
              href={backToP2PHref}
              className="p2pPrimaryBtn d-inline-block mt-3"
            >
              Back to P2P Market
            </Link>
          </div>
        </div>
      ) : !confirmPayment && trade.status !== 10 && (
        isPendingReview ? (
          <div className="p2pStepWrap">
            <div className="p2pStepRow">
              <div className="p2pStepNo d-flex justify-content-center align-items-center bg-warning">1</div>
              <div className="p2pStep2 flex-grow-1">
                <div className="p2pStep2Body">
                  <div className="p2pStepTitle">Review trade request</div>
                  <div className="p2pMuted p2pSmall">
                    <strong>{buyerName}</strong> wants to buy{" "}
                    {cryptoAmountStr} {asset} at your price. Approve to lock your crypto and start
                    the trade, or reject to decline.
                  </div>
                  <div className="p2pActions">
                    {canApprove && (
                      <button
                        className="p2pPrimaryBtn"
                        type="button"
                        onClick={() => void handleApproveTrade()}
                        disabled={submitting || approvalWindowExpired}
                      >
                        {submitting ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" />
                            Approving…
                          </>
                        ) : approvalWindowExpired ? (
                          "Time Expired"
                        ) : (
                          "Approve Trade"
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
        <div className="p2pStepWrap">

          {/* Payment confirmation actions from backend status_list */}
          <div className="p2pStepRow">
            {/* <div className="p2pStepNo d-flex justify-content-center align-items-center bg-warning">1</div> */}
            <div>
              <div className="p2pStep2">
                <div className="p2pStep2Body">
                  {trade.status === 2 && (
                    <div className={`${paymentTimeStyles.extension} ${paymentTimeStyles.sell}`}>
                      {!showTimeExtension ? (
                        <button
                          className={paymentTimeStyles.trigger}
                          type="button"
                          onClick={() => setShowTimeExtension(true)}
                          disabled={extendingTime || submitting}
                          aria-expanded="false"
                        >
                          <span className={paymentTimeStyles.icon} aria-hidden="true">
                            <i className="fa-regular fa-clock" />
                          </span>
                          <span className={paymentTimeStyles.copy}>
                            <span className={paymentTimeStyles.title}>Need more time to pay?</span>
                            <span className={paymentTimeStyles.hint}>Request an extension to complete the payment.</span>
                          </span>
                          <i className={`fa-solid fa-chevron-down ${paymentTimeStyles.triggerChevron}`} aria-hidden="true" />
                        </button>
                      ) : (
                        <div className={paymentTimeStyles.options} role="group" aria-label="Choose additional payment time">
                          {[5, 10, 15, 30].map(minutes => (
                            <button
                              key={minutes}
                              className={`${paymentTimeStyles.duration} ${extensionMinutes === minutes ? paymentTimeStyles.durationSelected : ""}`}
                              type="button"
                              onClick={() => setExtensionMinutes(minutes)}
                              disabled={extendingTime}
                              aria-pressed={extensionMinutes === minutes}
                            >
                              {minutes} min
                            </button>
                          ))}
                          <div className={paymentTimeStyles.actions}>
                            <button
                              className={paymentTimeStyles.cancel}
                              type="button"
                              onClick={() => setShowTimeExtension(false)}
                              disabled={extendingTime}
                            >
                              Cancel
                            </button>
                            <button
                              className={paymentTimeStyles.submit}
                              type="button"
                              onClick={() => void handleExtendPaymentTime()}
                              disabled={extendingTime || submitting}
                            >
                              {extendingTime ? "Extending…" : "Request Time"}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  {/* <div className="p2pStepTitle">Confirm payment is received.</div>
                  <div className="p2pMuted p2pSmall">
                    Once you have confirmed the payment has been credited to your account, click the button below to release the crypto.
                  </div> */}
                  <div className="p2pActions">
                    {isBuyerDispatched && canRelease && (
                      <button
                        className="p2pPrimaryBtn"
                        type="button"
                        onClick={handlePaymentReceived}
                        disabled={submitting}
                      >
                        Payment Received
                      </button>
                    )}
                    {canDispute && (
                      <button
                        className="p2pGhostBtn"
                        type="button"
                        onClick={handleAppeal}
                        disabled={submitting || appealCountdownBlocking}
                      >
                        {appealCountdownBlocking
                          ? `Appeal after ${pad(mm)}:${pad(ss)}`
                          : "Appeal"}
                      </button>
                    )}
                    {canClaim && (
                      <button
                        className="p2pGhostBtn"
                        type="button"
                        onClick={handleClaimToAdmin}
                        disabled={submitting}
                      >
                        Time Expired, Claim to Admin
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
        )
      )}

      {!confirmPayment && trade.status === 10 && (
        <div className="p2pStepWrap mt-3">
          <div className="p2pCard p-3">
            <div className="p2pStepTitle">Order in admin review</div>
            {(trade.current_status?.note ?? trade.notes) && (
              <p className="p2pMuted p2pSmall mt-2 mb-0">{trade.current_status?.note ?? trade.notes}</p>
            )}
            <Link href={backToP2PHref} className="p2pPrimaryBtn d-inline-block mt-3">
              Back to P2P
            </Link>
          </div>
        </div>
      )}

      {/* ── COMPLETED ── */}
      {confirmPayment && <PaymentCompleted trade={trade} from="local" />}

      {/* ── PAYMENT RECEIVED MODAL ── */}
      {paymentReceived && canRelease && (
        <PaymentReceivedModel
          isOpen={paymentReceived}
          onClose={() => setPaymentReceived(false)}
          setConfirmPayment={handleConfirmPayment}
          buyerName={buyerName}
          amount={trade.payable_amount}
          currency={withFiat}
        />
      )}
    </>
  );
}