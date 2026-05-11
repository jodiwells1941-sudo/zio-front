// "use client";

// import React, { useEffect, useState } from "react";
// import { PaymentReceivedModel } from "./PaymentReceivedModel";
// import PaymentCompleted from "./PaymentCompleted";
// import Link from "next/link";

// function pad(n: number) {
//   return String(n).padStart(2, "0");
// }

// export default function BuyerPaymentCard() {
//   const [paymentStatus, setPaymentStatus] = useState(false);
//   const [confirmPayment, setConfirmPayment] = useState(false);

//   // example: 14:50
//   const [secondsLeft, setSecondsLeft] = useState(14 * 60 + 50);

//   useEffect(() => {
//     const t = setInterval(() => {
//       setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
//     }, 1000);
//     return () => clearInterval(t);
//   }, []);

//   const mm = Math.floor(secondsLeft / 60);
//   const ss = secondsLeft % 60;

//   return (
//     <>
//       <div className="p2pOrderHeader">

//           <div className="toast-body p-2 rounded-2 text-white toast-bg-warning">
//             <div className="spinner-border spinner-border-sm me-2" role="status"></div>
//             Pending Your Sell Request
//           </div>

//           <div className="toast-body p-2 rounded-2 text-white toast-bg-success d-flex align-items-center">
//             <i className="fas fa-check me-2"></i>
//             Your Sell Request Is Accepted
//           </div>

//           {confirmPayment ? 
//             <div className="d-flex justify-content-between align-items-center">
//               <h2 className="p2pTitle text-white"> Payment Completed</h2>
//               <span className="w-15 h-15 border border-success rounded-pill d-flex justify-content-center align-items-center ">
//                 <span className="p-3 bg-success m-2 rounded-pill d-flex justify-content-center align-items-center ">
//                   <i className="fa-solid fa-check" />
//                 </span>
//               </span>

//               <Link href="/dashboard/chat/" className="chat-notification d-md-none">
//                 <i className="fa-solid fa-message"></i>
//                 <span className="chat-badge">2</span>
//               </Link>
//             </div>
//           :
//             <div className="d-flex justify-content-between align-items-center">
//               <h2 className="p2pTitle">
//                 {"Waiting Buyer's Payment"} <span className="p2pTimer">{pad(mm)}:{pad(ss)}</span>
//               </h2>

//               <Link href="/dashboard/chat/" className="chat-notification d-md-none">
//                 <i className="fa-solid fa-message"></i>
//                 <span className="chat-badge">2</span>
//               </Link>
//             </div>
//           }

//         <div className="p2pSubRow">
//           <div className="p2pOrderNo">
//             <span className="p2pMuted">Order number</span>
//             <span className="p2pOrderValue">22850881335842344960</span>
//             <button className="p2pCopyBtn" type="button" aria-label="copy order number">
//               <i className="fa-regular fa-copy" />
//             </button>
//           </div>
//         </div>
//       </div>

//       {!confirmPayment && (
//         <div className="p2pStepWrap">
//           {/* Step 1 */}
//           <div className="p2pStepRow">
//             <div className="p2pStepNo d-flex justify-content-center align-items-center bg-warning">1</div>
//             <div className="p2pStepContent">
//               <div className="">
//                 <div className="p2pStepTitle">
//                   <span className="p2pMethod fw-7 text-lg">Confirm payment from buyer: MD NAHIAN AL FARABI</span>
//                 </div>
//                 <p className="w-100 d-block text-reset">Log in to your payment account below and confirm that you have received the payment</p>
//                 <p className="text-danger py-2">* Scammers can send fake banking app notifications or SMS. Do not release your crypto before receiving the funds in your account</p>
//               </div>
//               <div className="">
//                 <div className="p2pCard p-0">
//                   <div className="p2pCardRow px-3 bg-dark rounded-top-3">
//                     <div className="p2pCardLabel">You Receive</div>
//                     <div className="p2pCardValue text-danger">
//                       Tk. 20,000.00
//                       <button className="p2pCopyBtn" type="button" aria-label="copy amount">
//                         <i className="fa-regular fa-copy" />
//                       </button>
//                     </div>
//                   </div>

//                   <div className="p2pCardRow px-3">
//                     <div className="p2pCardLabel">
//                         <div className="d-flex gap-1">
//                             <span className="methodIcon">i</span>
//                             <span>bKash</span>
//                         </div>
//                     </div>
//                   </div>

//                   <div className="p2pCardRow px-3">
//                     <div className="p2pCardLabel">
//                       Reference message <i className="fa-regular fa-circle-question p2pInfo" />
//                     </div>
//                     <div className="p2pCardValue">
//                       22850881335842344960
//                       <button className="p2pCopyBtn" type="button" aria-label="copy reference">
//                         <i className="fa-regular fa-copy" />
//                       </button>
//                     </div>
//                   </div>

//                   <div className="p2pCardRow px-3">
//                     <div className="p2pCardLabel">bKash Wallet Number</div>
//                         <div className="p2pCardValue">
//                         01707409839
//                         <button className="p2pCopyBtn" type="button" aria-label="copy wallet number">
//                             <i className="fa-regular fa-copy" />
//                         </button>
//                         </div>
//                     </div>

//                     <div className="px-2 pb-3">
//                         <div className="inputWrap">
//                             <input
//                                 className="input ccyText"
//                                 defaultValue="Buyer's name"
//                                 aria-label="you pay"
//                             />
//                             <div className="inputRight">
//                                 <span className="ccyText text-white">MD NAHIAN AL FARABI</span>
//                             </div>
//                         </div>
//                     </div>

//                 </div>

//                 <div className="p2pOrderDetails">
//                   <button className="p2pOrderDetailsHeader" type="button">
//                     <span>Order details</span>
//                     <i className="fa-solid fa-angle-down" />
//                   </button>

//                   <div className="p2pOrderDetailsBody">
//                     <div className="p2pDetailRow">
//                       <span className="p2pMuted">
//                         Fiat amount <i className="fa-regular fa-circle-question p2pInfo" />
//                       </span>
//                       <span className="p2pDetailVal text-danger">Tk. 20,000.00 <button className="p2pCopyBtn" type="button" aria-label="copy reference">
//                         <i className="fa-regular fa-copy" />
//                       </button></span>
//                     </div>
//                     <div className="p2pDetailRow">
//                       <span className="p2pMuted">Price</span>
//                       <span className="p2pDetailVal">Tk. 125.77</span>
//                     </div>
//                     <div className="p2pDetailRow">
//                       <span className="p2pMuted">Receive Quantity</span>
//                       <span className="p2pDetailVal">
//                         158.96 <span className="usdt">USDT</span> <i className="fa-solid fa-angle-down" />
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Step 2 */}
//           <div className="p2pStepRow mt-3">
//             <div className="mt-3 p2pStepNo d-flex justify-content-center align-items-center bg-warning">2</div>
//             <div className="">
//               <div className="p2pStep2">
//                 <div className="p2pStep2Body">
//                   <div className="p2pStepTitle">Confirm payment is received.</div>
//                   <div className="p2pMuted p2pSmall">
//                     Once you have confirmed that the payment has been credited to your account, click the button below to release the crypto.
//                   </div>

//                   <div className="p2pActions">
//                     <button className="p2pPrimaryBtn" type="button" onClick={()=> setPaymentStatus(true)}>
//                       Payment Received
//                     </button>
//                     <button className="p2pGhostBtn" type="button">
//                       Appeal After 08:23
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//         </div>
//       )}

//       {confirmPayment && (
//         <PaymentCompleted />
//       )}

//       {paymentStatus && (
//         <PaymentReceivedModel
//           isOpen={paymentStatus}
//           onClose={() => setPaymentStatus(false)}
//           setConfirmPayment={() => {setConfirmPayment(true); setPaymentStatus(false)}}
//           buyerName="MD NAHIAN AL FARABI"
//           amount={2000.00}
//           currency="TK"
//         />
//       )}

//     </>
//   );
// }


"use client";

import { getTrade, updateTradeStatus } from "@/app/api/trade";
import { useExpiryTimer } from "@/hooks/useExpiryTimer";
import { getTradeEcho } from "@/utils/tradeEcho";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import PaymentCompleted from "./PaymentCompleted";
import { PaymentReceivedModel } from "./PaymentReceivedModel";

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
  notes: string | null;
  is_client_seller: boolean;
  payment_expires_at: string | null; // ← new field
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
    payment_method?: {
      field_values?: { walletNumber?: string; bankName?: string };
      bankName?: string;
      sell_method?: { name: string };
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
    field_values: { walletNumber?: string; bankName?: string };
    sell_method?: { name: string };
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

export default function BuyerPaymentCard() {
  const searchParams = useSearchParams();
  const tradeId      = searchParams.get("trade_id");
  const tradeIdNum   = tradeId ? Number(tradeId) : NaN;

  const [trade,           setTrade]           = useState<TradeData | null>(null);
  const [loading,         setLoading]         = useState(true);
  const [submitting,      setSubmitting]      = useState(false);
  const [paymentReceived, setPaymentReceived] = useState(false);
  const [confirmPayment,  setConfirmPayment]  = useState(false);

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

  const mm = trade?.status === 5 ? releaseAppealTimer.mm : paymentTimer.mm;
  const ss = trade?.status === 5 ? releaseAppealTimer.ss : paymentTimer.ss;
  const appealCountdownBlocking =
    !!trade?.payment_expires_at && releasePhaseActive && !releaseAppealTimer.expired;

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
    await doUpdate(10, "Payment timeout claim submitted");
  };

  const handleApproveTrade = async () => {
    await doUpdate(2);
  };

  const handleRejectTrade = async () => {
    await doUpdate(3);
  };

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

  const byerPaymentMethod = trade.user_payment_method?.sell_method?.name;
  const byerWalletNumber  = trade.user_payment_method?.field_values?.walletNumber
                         ?? trade.user_payment_method?.field_values?.bankName
                         ?? '—';
  const methodName        = trade.current_status?.method
                         ?? trade.p2p_ad?.payment_method?.sell_method?.name
                         ?? 'N/A';
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
  const clientName        = trade.client?.name ?? 'Counterparty';
  const withFiatCurrency  = trade.p2p_ad?.asset ?? 'USDT';
  const isBuyerDispatched = trade.status === 5;
  const statusList = trade.status_list ?? [];
  const canRelease = statusList.includes(6);
  const canDispute = statusList.includes(7);
  const canClaim = statusList.includes(10);
  const canApprove = statusList.includes(2);
  const canReject = statusList.includes(3);
  const isPendingReview = trade.status === 1 && (canApprove || canReject);

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
     <>
      <div className="p2pOrderHeader">

        {/* Status toasts */}
        {trade.status === 1 && (
          <div className="toast-body p-2 rounded-2 text-white toast-bg-warning">
            <div className="spinner-border spinner-border-sm me-2" role="status" />
            {isPendingReview
              ? "Pending — approve or reject this trade request"
              : "Pending trade request"}
          </div>
        )}
        {trade.status === 2 && (
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
        {confirmPayment ? (
          <div className="d-flex justify-content-between align-items-center">
            <h2 className="p2pTitle text-white">Payment Completed</h2>
            <span className="w-15 h-15 border border-success rounded-pill d-flex justify-content-center align-items-center">
              <span className="p-3 bg-success m-2 rounded-pill d-flex justify-content-center align-items-center">
                <i className="fa-solid fa-check" />
              </span>
            </span>
            <Link href={`/dashboard/chat?trade_id=${trade.id}`} className="chat-notification d-md-none">
              <i className="fa-solid fa-message" />
            </Link>
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
            <Link href={`/dashboard/chat?trade_id=${trade.id}`} className="chat-notification d-md-none">
              <i className="fa-solid fa-message" />
            </Link>
          </div>
        )}

        {/* Order number */}
        <div className="p2pSubRow">
          <div className="p2pOrderNo">
            <span className="p2pMuted">Order number</span>
            <span className="p2pOrderValue">{orderId}</span>
            <CopyBtn text={orderId} />
          </div>
        </div>
      </div>

      {/* ── STEPS (shown while not yet completed; not when appealed status 10) ── */}
      {!confirmPayment && trade.status !== 10 && (
        isPendingReview ? (
          <div className="p2pStepWrap">
            <div className="p2pStepRow">
              <div className="p2pStepNo d-flex justify-content-center align-items-center bg-warning">1</div>
              <div className="p2pStep2 flex-grow-1">
                <div className="p2pStep2Body">
                  <div className="p2pStepTitle">Review trade request</div>
                  <div className="p2pMuted p2pSmall">
                    <strong>{buyerName}</strong> wants to buy{" "}
                    {cryptoAmountStr} {trade.p2p_ad?.asset ?? "USDT"} at your price. Approve to lock your crypto and start
                    the trade, or reject to decline.
                  </div>
                  <div className="p2pActions">
                    {canApprove && (
                      <button
                        className="p2pPrimaryBtn"
                        type="button"
                        onClick={() => void handleApproveTrade()}
                        disabled={submitting}
                      >
                        {submitting ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" />
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
                        onClick={() => void handleRejectTrade()}
                        disabled={submitting}
                      >
                        Reject Trade
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
        <div className="p2pStepWrap">

          {/* Step 1 */}
          <div className="p2pStepRow">
            <div className="p2pStepNo d-flex justify-content-center align-items-center bg-warning">1</div>
            <div className="p2pStepContent">
              <div className="p2pStepTitle">
                <span className="p2pMethod fw-7 text-lg">
                  Confirm payment from buyer: {buyerName}
                </span>
              </div>
              <p className="w-100 d-block text-reset">
                Log in to your payment account and confirm you have received the payment.
              </p>
              <p className="text-danger py-2">
                * Scammers can send fake banking app notifications or SMS. Do not release your crypto before receiving the funds in your account.
              </p>

              <div className="p2pCard p-0">
                {/* You Receive */}
                <div className="p2pCardRow px-3 bg-dark rounded-top-3">
                  <div className="p2pCardLabel">You Receive</div>
                  <div className="p2pCardValue text-danger">
                    {withFiat} {fiatAmountStr}
                    <CopyBtn text={String(trade.payable_amount)} />
                  </div>
                </div>

                {/* Method */}
                <div className="p2pCardRow px-3">
                  <div className="p2pCardLabel">
                    <div className="d-flex gap-1 align-items-center">
                      <span className="methodIcon">i</span>
                      <span>{methodName}</span>
                    </div>
                  </div>
                </div>

                {/* Reference */}
                <div className="p2pCardRow px-3">
                  <div className="p2pCardLabel">
                    Reference message <i className="fa-regular fa-circle-question p2pInfo" />
                  </div>
                  <div className="p2pCardValue">
                    {orderId}
                    <CopyBtn text={orderId} />
                  </div>
                </div>

                {/* Wallet */}
                {/* <div className="p2pCardRow px-3">
                  <div className="p2pCardLabel">{methodName} Number</div>
                  <div className="p2pCardValue">
                    {walletNumber}
                    <CopyBtn text={walletNumber} />
                  </div>
                </div> */}
                <div className="p2pCardRow px-3">
                  <div className="p2pCardLabel">{byerPaymentMethod} Number</div>
                  <div className="p2pCardValue">
                    {byerWalletNumber}
                    <CopyBtn text={byerWalletNumber} />
                  </div>
                </div>

                {/* Buyer name input */}
                <div className="px-2 pb-3">
                  <div className="inputWrap">
                    <input
                      className="input ccyText"
                      defaultValue="Buyer's name"
                      aria-label="buyer name"
                      readOnly
                    />
                    <div className="inputRight">
                      <span className="ccyText text-white">{buyerName}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order details */}
              <div className="p2pOrderDetails">
                <button className="p2pOrderDetailsHeader" type="button">
                  <span>Order details</span>
                  <i className="fa-solid fa-angle-down" />
                </button>
                <div className="p2pOrderDetailsBody">
                  <div className="p2pDetailRow">
                    <span className="p2pMuted">
                      Fiat amount <i className="fa-regular fa-circle-question p2pInfo" />
                    </span>
                    <span className="p2pDetailVal text-danger">
                      {withFiat} {fiatAmountStr}
                      <CopyBtn text={String(trade.payable_amount)} />
                    </span>
                  </div>
                  <div className="p2pDetailRow">
                    <span className="p2pMuted">Price</span>
                    <span className="p2pDetailVal">{withFiat} {price}</span>
                  </div>
                  <div className="p2pDetailRow">
                    <span className="p2pMuted">Receive Quantity</span>
                    <span className="p2pDetailVal">
                      {cryptoAmountStr} <span className="usdt">{trade.p2p_ad?.asset ?? 'USDT'}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2 — action buttons from backend status_list */}
          <div className="p2pStepRow mt-3">
              <div className="mt-3 p2pStepNo d-flex justify-content-center align-items-center bg-warning">2</div>
              <div>
                <div className="p2pStep2">
                  <div className="p2pStep2Body">
                    <div className="p2pStepTitle">Confirm payment is received.</div>
                    <div className="p2pMuted p2pSmall">
                      Once you have confirmed the payment has been credited to your account, click the button below to release the crypto.
                    </div>
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

          {/* {isClientDispatched && (
            <div className="p2pStepRow mt-3">
              <div className="mt-3 p2pStepNo d-flex justify-content-center align-items-center bg-warning">2</div>
              <div>
                <div className="p2pStep2">
                  <div className="p2pStep2Body">
                    <div className="p2pStepTitle">Confirm payment is received.</div>
                    <div className="p2pMuted p2pSmall">
                      Once you have confirmed the payment has been credited to your account, click the button below to release the crypto.
                    </div>
                    <div className="p2pActions">
                      <button
                        className="p2pPrimaryBtn"
                        type="button"
                        onClick={handlePaymentReceived}
                        disabled={submitting}
                      >
                        Payment Received
                      </button>
                      <button
                        className="p2pGhostBtn"
                        type="button"
                        onClick={handleAppeal}
                        disabled={submitting}
                      >
                        Appeal After {pad(mm)}:{pad(ss)}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )} */}

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
            <Link href="/dashboard/wallet/?tab=tab3" className="p2pPrimaryBtn d-inline-block mt-3">
              Back to P2P
            </Link>
          </div>
        </div>
      )}

      {/* ── COMPLETED ── */}
      {confirmPayment && <PaymentCompleted trade={trade} />}

      {/* ── PAYMENT RECEIVED MODAL ── */}
      {/* {paymentReceived  && (
        <PaymentReceivedModel
          isOpen={paymentReceived}
          onClose={() => setPaymentReceived(false)}
          setConfirmPayment={trade?.is_client === false ? handleConfirmPaymentReceived : handleConfirmPayment}
          buyerName={trade?.is_client === false ? clientName : buyerName}
          amount={trade?.is_client === false ? trade.payable_amount : trade.receivable_amount}
          currency={trade?.is_client === false ? withFiatCurrency : withFiat}
        />
      )} */}
      {paymentReceived && canRelease && (
        <PaymentReceivedModel
          isOpen={paymentReceived}
          onClose={() => setPaymentReceived(false)}
          setConfirmPayment={ handleConfirmPayment}
          buyerName={buyerName}
          amount={trade.payable_amount}
          currency={withFiat}
        />
      )}
    </>
  );
}

