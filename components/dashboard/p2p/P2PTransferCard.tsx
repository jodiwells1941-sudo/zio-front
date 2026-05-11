// "use client";

// import React, { useEffect, useState } from "react";
// import P2PPendingAmmountCard from "./P2PPendingAmmountCard";
// import OrderCompleted from "./OrderCompleted";
// import Link from "next/link";

// function pad(n: number) {
//   return String(n).padStart(2, "0");
// }

// type PaymentStatus = "payment" | "pending" | "completed";

// export default function P2PTransferCard() {
// const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("payment");

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
        
//         <div className="toast-body p-2 rounded-2 text-white toast-bg-warning">
//           <div className="spinner-border spinner-border-sm me-2" role="status"></div>
//           Pending Your Buy Request
//         </div>

//         <div className="toast-body p-2 rounded-2 text-white toast-bg-success d-flex align-items-center">
//           <i className="fas fa-check me-2"></i>
//           Your Buy Request Is Accepted
//         </div>

//         {paymentStatus == 'completed' ? 
//           <div className="d-flex justify-content-between align-items-center">
//             <h2 className="p2pTitle text-white"> Order Completed</h2>
//             <span className="w-15 h-15 border border-success rounded-pill d-flex justify-content-center align-items-center ">
//               <span className="p-3 bg-success m-2 rounded-pill d-flex justify-content-center align-items-center ">
//                 <i className="fa-solid fa-check" />
//               </span>
//             </span>
//             <Link href="/dashboard/chat/" className="chat-notification d-md-none">
//               <i className="fa-solid fa-message"></i>
//               <span className="chat-badge">2</span>
//             </Link>
//           </div>
//         :
//           <div className="d-flex justify-content-between align-items-center">
//             <h2 className="p2pTitle">
//               {paymentStatus == 'payment' && (<>Pay the Seller within <span className="p2pTimer">{pad(mm)}:{pad(ss)}</span></>)}
//               {paymentStatus == 'pending' && (<>Pending the Seller to Release <i className="fa-regular fa-circle-question text-xs" /> </>)}
//             </h2>

//             <Link href="/dashboard/chat/" className="chat-notification d-md-none">
//               <i className="fa-solid fa-message"></i>
//               <span className="chat-badge">2</span>
//             </Link>
//           </div>
//         }

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

//       {paymentStatus == 'payment' && (
//         <div className="p2pStepWrap">
//           {/* Step 1 */}
//           <div className="p2pStepRow">
//             <div className="p2pStepNo d-flex justify-content-center align-items-center bg-warning">1</div>
//             <div className="p2pStepContent">
//               <div className="p2pStepTop">
//                 <div className="p2pStepTitle">
//                   Transfer via : <span className="p2pMethod">bKash</span>
//                 </div>
//                 <button className="p2pTipBtn" type="button">
//                   <i className="fa-regular fa-circle-question" /> Payment Tips
//                 </button>
//               </div>
//               <div className="">
//                 <div className="p2pCard p-0">
//                   <div className="p2pCardRow px-3 bg-dark rounded-top-3">
//                     <div className="p2pCardLabel">You Pay</div>
//                     <div className="p2pCardValue green">
//                       Tk. 20,000.00
//                       <button className="p2pCopyBtn" type="button" aria-label="copy amount">
//                         <i className="fa-regular fa-copy" />
//                       </button>
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
//                     <div className="p2pCardValue">
//                       01707409839
//                       <button className="p2pCopyBtn" type="button" aria-label="copy wallet number">
//                         <i className="fa-regular fa-copy" />
//                       </button>
//                     </div>
//                   </div>

//                   <div className="p2pCardRow px-3">
//                     <div className="p2pCardLabel">Remarks</div>
//                     <div className="p2pRemark">
//                       BKASH Personal <span className="xRed">✖</span> টেন্ডারে কথা না<br />
//                       বলে কেউ টাকা দিবেন না <span className="xRed">✖ ✖ ✖</span>
//                     </div>
//                   </div>
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
//                       <span className="p2pDetailVal green">Tk. 20,000.00</span>
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
//           <div className="p2pStepRow">
//             <div className=" p2pStepNo d-flex justify-content-center align-items-center bg-warning">2</div>
//             <div className="">
//               <div className="p2pStep2">
//                 <div className="p2pStep2Body">
//                   <div className="p2pStepTitle">Notify Seller</div>
//                   <div className="p2pMuted p2pSmall">
//                     After payment, click the button below so the seller can release the crypto.
//                   </div>

//                   <div className="p2pActions">
//                     <button className="p2pPrimaryBtn" type="button" onClick={()=> setPaymentStatus('pending')}>
//                       Transferred, Notify Seller
//                     </button>
//                     {/* <button className="p2pGhostBtn" type="button">
//                       I Have a Question
//                     </button> */}
//                     <button className="p2pLinkBtn" type="button">
//                       Cancel Order
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//         </div>
//       )}

//       {paymentStatus == 'pending' && (
//         <P2PPendingAmmountCard setPaymentStatus={setPaymentStatus} />
//       )}

//       {paymentStatus == 'completed' && (
//         <OrderCompleted />
//       )}
//     </>
//   );
// }


// =========================================================================== 


// "use client";

// import React, { useEffect, useState } from "react";
// import { useSearchParams } from "next/navigation";
// import Link from "next/link";
// import { toast } from "react-toastify";
// import P2PPendingAmmountCard from "./P2PPendingAmmountCard";
// import OrderCompleted from "./OrderCompleted";
// import { getTrade, TradeData, updateTradeStatus } from "@/app/api/trade";

// // ─── Helpers ──────────────────────────────────────────────────────────────────

// function pad(n: number) {
//   return String(n).padStart(2, "0");
// }

// type PaymentStatus = "payment" | "pending" | "completed";

// // Map trade.status (int) → PaymentStatus
// function resolvePaymentStatus(status: number): PaymentStatus {
//   if (status === 9) return "completed";
//   if (status >= 5)  return "pending";
//   return "payment";
// }

// // ─── Component ────────────────────────────────────────────────────────────────

// export default function P2PTransferCard() {
//   const searchParams     = useSearchParams();
//   const tradeId          = searchParams.get("trade_id");

//   const [trade,          setTrade]          = useState<TradeData | null>(null);
//   const [loading,        setLoading]        = useState(true);
//   const [paymentStatus,  setPaymentStatus]  = useState<PaymentStatus>("payment");
//   const [submitting,     setSubmitting]     = useState(false);
//   const [secondsLeft,    setSecondsLeft]    = useState(0);
//   const [copied,         setCopied]         = useState<string | null>(null);

//   console.log('trade', trade);
  

//   // ─── Fetch trade ────────────────────────────────────────────────────────────

//   useEffect(() => {
//     if (!tradeId) return;
//     const fetchTrade = async () => {
//       try {
//         setLoading(true);
//         const res = await getTrade(Number(tradeId));
//         const t: TradeData = res?.data;
//         setTrade(t);
//         setPaymentStatus(resolvePaymentStatus(t.status));
//         // Timer: payment_time_limit is in minutes
//         if (t.method?.duration) {
//           setSecondsLeft(t.method.duration * 60);
//         }
//       } catch (e: any) {
//         toast.error(e?.response?.data?.message ?? "Failed to load trade.");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchTrade();
//   }, [tradeId]);

//   // ─── Countdown timer ────────────────────────────────────────────────────────

//   useEffect(() => {
//     if (paymentStatus !== "payment" || secondsLeft <= 0) return;
//     const t = setInterval(() => {
//       setSecondsLeft(s => (s > 0 ? s - 1 : 0));
//     }, 1000);
//     return () => clearInterval(t);
//   }, [paymentStatus, secondsLeft]);

//   const mm = Math.floor(secondsLeft / 60);
//   const ss = secondsLeft % 60;

//   // ─── Copy helper ────────────────────────────────────────────────────────────

//   const copyText = (text: string, key: string) => {
//     navigator.clipboard.writeText(text).then(() => {
//       setCopied(key);
//       setTimeout(() => setCopied(null), 1500);
//     });
//   };

//   const CopyBtn = ({ text, id }: { text: string; id: string }) => (
//     <button
//       className="p2pCopyBtn"
//       type="button"
//       aria-label="copy"
//       onClick={() => copyText(text, id)}
//     >
//       {copied === id
//         ? <i className="fa-solid fa-check text-success" />
//         : <i className="fa-regular fa-copy" />
//       }
//     </button>
//   );

//   // ─── Notify seller (status → 5: dispatched) ─────────────────────────────────

//   const handleNotifySeller = async () => {
//     if (!trade) return;
//     setSubmitting(true);
//     try {
//       await updateTradeStatus(trade.id, 5);
//       setPaymentStatus("pending");
//       setTrade(prev => prev ? { ...prev, status: 5 } : prev);
//       toast.success("Seller notified successfully.");
//     } catch (e: any) {
//       toast.error(e?.response?.data?.message ?? "Failed to notify seller.");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   // ─── Cancel order (status → 3: rejected) ────────────────────────────────────

//   const handleCancel = async () => {
//     if (!trade) return;
//     setSubmitting(true);
//     try {
//       await updateTradeStatus(trade.id, 3);
//       toast.info("Order cancelled.");
//       setTrade(prev => prev ? { ...prev, status: 3 } : prev);
//     } catch (e: any) {
//       toast.error(e?.response?.data?.message ?? "Failed to cancel order.");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   // ─── Loading / error states ──────────────────────────────────────────────────

//   if (!tradeId) {
//     return <p className="text-center py-5 text-muted">No trade ID found in URL.</p>;
//   }

//   if (loading) {
//     return (
//       <div className="p2pOrderHeader">
//         <div className="placeholder-glow">
//           <span className="placeholder col-8 mb-2 d-block rounded"></span>
//           <span className="placeholder col-5 mb-2 d-block rounded"></span>
//           <span className="placeholder col-6 d-block rounded"></span>
//         </div>
//       </div>
//     );
//   }

//   if (!trade) {
//     return <p className="text-center py-5 text-danger">Trade not found.</p>;
//   }

//   const methodName    = trade.method?.sell_method?.name ?? 'N/A';
//   const walletNumber  = trade.method?.walletNumber ?? trade.method?.bankName ?? '—';
//   const orderId       = trade.order_id;
//   const payable       = Number(trade.payable_amount).toLocaleString(undefined, { minimumFractionDigits: 2 });
//   const receivable    = Number(trade.receivable_amount).toFixed(2);
//   const price         = Number(trade.user_price).toFixed(2);

//   // ─── Render ─────────────────────────────────────────────────────────────────

//   return (
//     <>
//       <div className="p2pOrderHeader">

//         {/* Status toasts */}
//         {trade.status === 1 && (
//           <div className="toast-body p-2 rounded-2 text-white toast-bg-warning">
//             <div className="spinner-border spinner-border-sm me-2" role="status"></div>
//             Pending Your Buy Request
//           </div>
//         )}

//         {trade.status === 2 && (
//           <div className="toast-body p-2 rounded-2 text-white toast-bg-success d-flex align-items-center">
//             <i className="fas fa-check me-2"></i>
//             Your Buy Request Is Accepted
//           </div>
//         )}

//         {/* Title row */}
//         {paymentStatus === 'completed' ? (
//           <div className="d-flex justify-content-between align-items-center">
//             <h2 className="p2pTitle text-white">Order Completed</h2>
//             <span className="w-15 h-15 border border-success rounded-pill d-flex justify-content-center align-items-center">
//               <span className="p-3 bg-success m-2 rounded-pill d-flex justify-content-center align-items-center">
//                 <i className="fa-solid fa-check" />
//               </span>
//             </span>
//             <Link href="/dashboard/chat/" className="chat-notification d-md-none">
//               <i className="fa-solid fa-message"></i>
//               <span className="chat-badge">2</span>
//             </Link>
//           </div>
//         ) : (
//           <div className="d-flex justify-content-between align-items-center">
//             <h2 className="p2pTitle">
//               {paymentStatus === 'payment' && (
//                 <>Pay the Seller within <span className="p2pTimer">{pad(mm)}:{pad(ss)}</span></>
//               )}
//               {paymentStatus === 'pending' && (
//                 <>Pending the Seller to Release <i className="fa-regular fa-circle-question text-xs" /></>
//               )}
//             </h2>
//             <Link href="/dashboard/chat/" className="chat-notification d-md-none">
//               <i className="fa-solid fa-message"></i>
//               <span className="chat-badge">2</span>
//             </Link>
//           </div>
//         )}

//         {/* Order number row */}
//         <div className="p2pSubRow">
//           <div className="p2pOrderNo">
//             <span className="p2pMuted">Order number</span>
//             <span className="p2pOrderValue">{orderId}</span>
//             <CopyBtn text={orderId} id="order_id" />
//           </div>
//         </div>
//       </div>

//       {/* ── PAYMENT STEP ── */}
//       {paymentStatus === 'payment' && (
//         <div className="p2pStepWrap">

//           {/* Step 1 */}
//           <div className="p2pStepRow">
//             <div className="p2pStepNo d-flex justify-content-center align-items-center bg-warning">1</div>
//             <div className="p2pStepContent">
//               <div className="p2pStepTop">
//                 <div className="p2pStepTitle">
//                   Transfer via : <span className="p2pMethod">{methodName}</span>
//                 </div>
//                 <button className="p2pTipBtn" type="button">
//                   <i className="fa-regular fa-circle-question" /> Payment Tips
//                 </button>
//               </div>

//               <div>
//                 <div className="p2pCard p-0">
//                   {/* You Pay */}
//                   <div className="p2pCardRow px-3 bg-dark rounded-top-3">
//                     <div className="p2pCardLabel">You Pay</div>
//                     <div className="p2pCardValue green">
//                       Tk. {payable}
//                       <CopyBtn text={payable} id="payable" />
//                     </div>
//                   </div>

//                   {/* Reference */}
//                   <div className="p2pCardRow px-3">
//                     <div className="p2pCardLabel">
//                       Reference message <i className="fa-regular fa-circle-question p2pInfo" />
//                     </div>
//                     <div className="p2pCardValue">
//                       {orderId}
//                       <CopyBtn text={orderId} id="ref" />
//                     </div>
//                   </div>

//                   {/* Wallet number */}
//                   <div className="p2pCardRow px-3">
//                     <div className="p2pCardLabel">{methodName} Number</div>
//                     <div className="p2pCardValue">
//                       {walletNumber}
//                       <CopyBtn text={walletNumber} id="wallet" />
//                     </div>
//                   </div>

//                   {/* Remarks */}
//                   {trade.notes && (
//                     <div className="p2pCardRow px-3">
//                       <div className="p2pCardLabel">Remarks</div>
//                       <div className="p2pRemark">{trade.notes}</div>
//                     </div>
//                   )}
//                 </div>

//                 {/* Order details accordion */}
//                 <div className="p2pOrderDetails">
//                   <button className="p2pOrderDetailsHeader" type="button">
//                     <span>Order details</span>
//                     <i className="fa-solid fa-angle-down" />
//                   </button>
//                   <div className="p2pOrderDetailsBody">
//                     <div className="p2pDetailRow">
//                       <span className="p2pMuted">Fiat amount</span>
//                       <span className="p2pDetailVal green">Tk. {payable}</span>
//                     </div>
//                     <div className="p2pDetailRow">
//                       <span className="p2pMuted">Price</span>
//                       <span className="p2pDetailVal">Tk. {price}</span>
//                     </div>
//                     <div className="p2pDetailRow">
//                       <span className="p2pMuted">Receive Quantity</span>
//                       <span className="p2pDetailVal">
//                         {receivable} <span className="usdt">USDT</span>
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Step 2 */}
//           <div className="p2pStepRow">
//             <div className="p2pStepNo d-flex justify-content-center align-items-center bg-warning">2</div>
//             <div>
//               <div className="p2pStep2">
//                 <div className="p2pStep2Body">
//                   <div className="p2pStepTitle">Notify Seller</div>
//                   <div className="p2pMuted p2pSmall">
//                     After payment, click the button below so the seller can release the crypto.
//                   </div>
//                   <div className="p2pActions">
//                     <button
//                       className="p2pPrimaryBtn"
//                       type="button"
//                       onClick={handleNotifySeller}
//                       disabled={submitting}
//                     >
//                       {submitting ? 'Notifying...' : 'Transferred, Notify Seller'}
//                     </button>
//                     <button
//                       className="p2pLinkBtn"
//                       type="button"
//                       onClick={handleCancel}
//                       disabled={submitting}
//                     >
//                       Cancel Order
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//         </div>
//       )}

//       {/* ── PENDING STEP ── */}
//       {/* {paymentStatus === 'pending' && (
//         <P2PPendingAmmountCard
//           trade={trade}
//           setPaymentStatus={setPaymentStatus}
//           setTrade={setTrade}
//         />
//       )} */}

//       {/* ── COMPLETED STEP ── */}
//       {/* {paymentStatus === 'completed' && (
//         <OrderCompleted trade={trade} />
//       )} */}
//     </>
//   );
// }
// =========================================================================== 



"use client";

import { getTrade, updateTradeStatus } from "@/app/api/trade";
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
  type: string;             // "buy" | "sell"
  is_client_seller: boolean;
  created_at: string;
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
  client:   { id: number; name: string; avatar: string };
  customer: { id: number; name: string; avatar: string };
  trade_review?: any;
}

// ─── Status helpers ───────────────────────────────────────────────────────────

/**
 * Map trade.status (integer) → frontend UI phase
 *
 *  1 pending          → payment  (buyer pays, seller approves)
 *  2 approved         → payment  (buyer pays now)
 *  5 dispatched       → pending  (seller releases)
 *  6 dispatch_approved
 *  9 completed        → completed 
 * 10 claimed_by_buyer
 *  3,4,7,8            → rejected
 */
function resolveUIStatus(status: number): PaymentStatus {
  if ([9, 6].includes(status))     return "completed";
  if (status === 5)                return "pending";
  if ([3, 4, 7, 8, 10].includes(status)) return "rejected";
  return "payment";                // 1, 2
}

function pad(n: number) { return String(n).padStart(2, "0"); }

function parseApiDateToMs(dateStr?: string | null): number | null {
  if (!dateStr) return null;
  const direct = new Date(dateStr).getTime();
  if (!Number.isNaN(direct)) return direct;
  const normalized = dateStr.includes("T") ? dateStr : dateStr.replace(" ", "T");
  const retry = new Date(normalized).getTime();
  return Number.isNaN(retry) ? null : retry;
}

// ─── Status Banner ─────────────────────────────────────────────────────────────

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
      {copied
        ? <i className="fa-solid fa-check text-success" />
        : <i className="fa-regular fa-copy" />}
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
      <button className="p2pOrderDetailsHeader" type="button" onClick={() => setOpen(o => !o)}>
        <span>Order details</span>
        <i className={`fa-solid fa-angle-${open ? "up" : "down"}`} />
      </button>
      {open && (
        <div className="p2pOrderDetailsBody">
          {rows.map((row, i) => (
            <div key={`${row.label}-${i}`} className="p2pDetailRow">
              <span className="p2pMuted">{row.label}</span>
              <span className={`p2pDetailVal ${i === 0 ? "green" : ""}`}>{row.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Payment Info Card (shared between payment + pending views) ───────────────

export function PaymentInfoCard({
  trade,
  view,
}: {
  trade: TradeData;
  view: ReturnType<typeof getViewerOrderAmountDisplay>;
}) {
  const pm          = trade.p2p_ad?.payment_method;
  const sellMethod  = pm?.sell_method;
  const fieldDefs   = sellMethod?.fields   ?? [];
  const fieldValues = pm?.field_values     ?? {};
  const remarks     = pm?.remarks;
  const qrCode      = pm?.qr_code;
  const orderId     = trade.order_id;

  return (
    <div className="p2pCard p-0">

      {/* You Pay — fiat for buyer, crypto for seller */}
      <div className="p2pCardRow px-3 bg-dark rounded-top-3">
        <div className="p2pCardLabel">{view.youPayLabel}</div>
        <div className="p2pCardValue green">
          {view.youPayLine}
          <CopyBtn text={view.youPayCopyText} id="payable" />
        </div>
      </div>

      {/* Reference */}
      <div className="p2pCardRow px-3">
        <div className="p2pCardLabel">
          Reference message <i className="fa-regular fa-circle-question p2pInfo" />
        </div>
        <div className="p2pCardValue">
          {orderId}
          <CopyBtn text={orderId} id="ref" />
        </div>
      </div>

      {/*
        Dynamic fields — driven by sell_method.fields schema + field_values data
        Works for: walletNumber (Nagad/Bkash), accountHolder+bankName+branch+iban
        (Bank Transfer), email (PayPal), cashtag (CashApp) — anything automatically
      */}
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

      {/* QR Code */}
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

      {/* Remarks */}
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

export default function P2PTransferCard() {
  const searchParams = useSearchParams();
  const tradeId      = searchParams.get("trade_id");

  const [trade,       setTrade]       = useState<TradeData | null>(null);
  const [uiStatus,    setUiStatus]    = useState<PaymentStatus>("payment");
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [loading,     setLoading]     = useState(true);
  const [submitting,  setSubmitting]  = useState<number | null>(null);
  const [timerExpired, setTimerExpired] = useState(false);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchTrade = useCallback(async () => {
    if (!tradeId) return;
    try {
      setLoading(true);
      const res      = await getTrade(Number(tradeId));
      const t: TradeData = res?.data;
      setTrade(t);
      setUiStatus(resolveUIStatus(t.status));
      if (t.status === 2 && t.payment_expires_at) {
        const expiresAtMs = parseApiDateToMs(t.payment_expires_at);
        const sec = expiresAtMs ? Math.max(0, Math.floor((expiresAtMs - Date.now()) / 1000)) : 0;
        setSecondsLeft(sec);
        setTimerExpired(sec <= 0);
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Failed to load trade.");
    } finally {
      setLoading(false);
    }
  }, [tradeId]);

  useEffect(() => { fetchTrade(); }, [fetchTrade]);

  // ── Realtime: approve, payment sent/received, appeal, admin resolve, feedback ──
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

  // ── Countdown ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!tradeId || !trade || trade.status !== 1) return;

    const poll = setInterval(async () => {
      try {
        const res = await getTrade(Number(tradeId));
        const t: TradeData = res?.data;

        if (t.status === 2) {
          // Seller approved → stop polling, start countdown
          setTrade(t);
          setUiStatus(resolveUIStatus(t.status));
          if (t.payment_expires_at) {
            const expiresAtMs = parseApiDateToMs(t.payment_expires_at);
            const sec = expiresAtMs ? Math.max(0, Math.floor((expiresAtMs - Date.now()) / 1000)) : 0;
            setSecondsLeft(sec);
            setTimerExpired(sec <= 0);
          }
          toast.success("Your request has been approved! Please complete the payment.");
          clearInterval(poll);
        }

        // Any terminal status → stop polling
        if ([3, 4, 5, 6, 7, 8, 9].includes(t.status)) {
          setTrade(t);
          setUiStatus(resolveUIStatus(t.status));
          clearInterval(poll);
        }
      } catch {
        // silent — don't toast on poll failures
      }
    }, 2000);

    return () => clearInterval(poll);
  }, [trade?.status, tradeId]);

  // Countdown — only runs when status=2 (approved, buyer must pay)
  useEffect(() => {
    if (trade?.status !== 2 || secondsLeft <= 0) return;

    const t = setInterval(() => {
      setSecondsLeft(s => {
        if (s <= 1) {
          clearInterval(t);
          setTimerExpired(true); // unlock Claim button
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
      const sec = expiresAtMs ? Math.max(0, Math.floor((expiresAtMs - Date.now()) / 1000)) : 0;
      setTimerExpired(sec <= 0);
    } else {
      setTimerExpired(false);
    }
  }, [trade?.status, trade?.payment_expires_at]);

  // ── Status Update ──────────────────────────────────────────────────────────
  /**
   * Mirrors backend update() transitions:
   *   1 → 2  seller approves       (wallet deduct)
   *   1 → 3  seller/buyer rejects
   *   2 → 5  buyer dispatches      (notifies seller)
   *   5 → 6  seller releases       (wallet credit + transactions)
   *   5 → 7  seller disputes
   */

  // const handleStatusUpdate = async (newStatus: number, notes?: string) => {
  //   if (!trade) return;
  //   setSubmitting(newStatus);
  //   try {
  //     await updateTradeStatus(trade.id, newStatus, notes);
  //     const updated = { ...trade, status: newStatus };
  //     setTrade(updated as TradeData);
  //     setUiStatus(resolveUIStatus(newStatus));

  //     const msgs: Record<number, string> = {
  //       2: "Trade approved! Buyer can now send payment.",
  //       3: "Order rejected.",
  //       5: "Seller notified. Waiting for crypto release.",
  //       6: "Crypto released successfully. Trade complete!",
  //       7: "Dispatch disputed. Admin will review.",
  //     };
  //     toast.success(msgs[newStatus] ?? "Status updated.");
  //   } catch (e: any) {
  //     toast.error(e?.response?.data?.message ?? "Failed to update status.");
  //   } finally {
  //     setSubmitting(null);
  //   }
  // };

  const handleStatusUpdate = async (newStatus: number, notes?: string) => {
    if (!trade) return;

    const v = getViewerOrderAmountDisplay(trade);

    // ── Confirmation messages per action ──────────────────────────────────────
    const confirmMap: Record<number, { title: string; html: string; confirmText: string; icon: "warning" | "question" | "info" }> = {
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

    // Show Swal only for actions that have a confirmation defined
    if (confirm) {
      const result = await Swal.fire({
        title: confirm.title,
        html: confirm.html,
        icon: confirm.icon,
        showCloseButton: true,
        showCancelButton: true,
        confirmButtonText: confirm.confirmText,
        cancelButtonText: "No, Go Back!",
        confirmButtonColor: [3, 7, 10].includes(newStatus) ? "#dc3545" : "#198754",
      });

      if (!result.isConfirmed) return; // user cancelled — stop here
    }

    // ── Proceed with API call ─────────────────────────────────────────────────
    setSubmitting(newStatus);
    try {
      await updateTradeStatus(trade.id, newStatus, notes);
      const updated = { ...trade, status: newStatus };
      setTrade(updated as TradeData);
      setUiStatus(resolveUIStatus(newStatus));

      const msgs: Record<number, string> = {
        2: "Trade approved! Buyer can now send payment.",
        3: "Order rejected.",
        5: trade.type === "buy"
          ? "Seller notified. Waiting for crypto release."
          : "Buyer notified. Waiting for you to confirm receipt.",
        6: trade.type === "buy"
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

  // ── Guards ─────────────────────────────────────────────────────────────────
  if (!tradeId) return (
    <p className="text-center py-5 text-muted">No trade ID found in URL.</p>
  );

  if (loading) return (
    <div className="p2pOrderHeader placeholder-glow">
      <span className="placeholder col-8 mb-2 d-block rounded" />
      <span className="placeholder col-5 mb-2 d-block rounded" />
      <span className="placeholder col-6 d-block rounded" />
    </div>
  );

  if (!trade) return (
    <p className="text-center py-5 text-danger">Trade not found.</p>
  );

  // ── Derived ────────────────────────────────────────────────────────────────
  const orderId    = trade.order_id;
  const vd         = getViewerOrderAmountDisplay(trade);
  const fiat       = vd.fiat;
  const asset      = vd.asset;
  const methodName = trade.p2p_ad?.payment_method?.sell_method?.name ?? "N/A";
  const mm         = Math.floor(secondsLeft / 60);
  const ss         = secondsLeft % 60;

  /**
   * status_list is set by the backend per-user:
   *   Seller at status=1 → [2, 3]  (approve / reject)
   *   Buy flow: creator at status=2 → [5]; owner at status=5 → [6,7]
   *   Sell flow: owner at status=2 → [5]; creator at status=5 → [6,7]
   */
  const statusList  = trade.status_list ?? [];
  const canApprove  = statusList.includes(2);
  const canReject   = statusList.includes(3);
  const canDispatch = statusList.includes(5);
  const canRelease  = statusList.includes(6);
  const canDispute  = statusList.includes(7);
  const canClaim    = statusList.includes(10);
  const isBuyFlow   = trade.type === "buy";
  const notifyTransferredLabel = isBuyFlow
    ? "Transferred, Notify Seller"
    : "Transferred, Notify Buyer";

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="p2pOrderHeader">

        <StatusBanner status={trade.status} />

        {uiStatus === "completed" ? (
          <div className="d-flex justify-content-between align-items-center">
            <h2 className="p2pTitle text-white">Order Completed</h2>
            <span className="w-15 h-15 border border-success rounded-pill d-flex justify-content-center align-items-center">
              <span className="p-3 bg-success m-2 rounded-pill d-flex justify-content-center align-items-center">
                <i className="fa-solid fa-check" />
              </span>
            </span>
            <Link href="/dashboard/chat/" className="chat-notification d-md-none">
              <i className="fa-solid fa-message" /><span className="chat-badge">2</span>
            </Link>
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
              {uiStatus === "payment" && (
                isBuyFlow
                  ? <>Pay the Seller within <span className="p2pTimer">{pad(mm)}:{pad(ss)}</span></>
                  : <>Pay the Buyer within <span className="p2pTimer">{pad(mm)}:{pad(ss)}</span></>
              )}
              {uiStatus === "pending" && (
                isBuyFlow
                  ? <>Pending the Seller to Release <i className="fa-regular fa-circle-question text-xs" /></>
                  : <>Pending the Buyer to Confirm <i className="fa-regular fa-circle-question text-xs" /></>
              )}
            </h2>
            <Link href="/dashboard/chat/" className="chat-notification d-md-none">
              <i className="fa-solid fa-message" /><span className="chat-badge">2</span>
            </Link>
          </div>
        )}

        <div className="p2pSubRow">
          <div className="p2pOrderNo">
            <span className="p2pMuted">Order number</span>
            <span className="p2pOrderValue">{orderId}</span>
            <CopyBtn text={orderId} id="order_id" />
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          PAYMENT PHASE  (trade.status = 1 or 2)

          • Seller view (status=1): sees approve / reject buttons  [2, 3]
          • Buyer  view (status=2): sees payment info + notify btn [5]
          • Buyer  view (status=1): sees loading spinner (waiting for approval)
      ══════════════════════════════════════════════════════════════════════ */}
      {uiStatus === "payment" && (
        <div className="p2pStepWrap">

          {/* Step 1 — Payment info (visible to all parties) */}
          <div className="p2pStepRow">
            <div className="p2pStepNo d-flex justify-content-center align-items-center bg-warning">1</div>
            <div className="p2pStepContent">

              <div className="p2pStepTop">
                <div className="p2pStepTitle">
                  Transfer via : <span className="p2pMethod">{methodName}</span>
                </div>
                <button className="p2pTipBtn" type="button">
                  <i className="fa-regular fa-circle-question" /> Payment Tips
                </button>
              </div>

              <PaymentInfoCard trade={trade} view={vd} />

              <OrderDetailsAccordion rows={vd.detailRows} />
            </div>
          </div>

          {/* Step 2 — Action buttons (driven by status_list) */}
          <div className="p2pStepRow">
            <div className="p2pStepNo d-flex justify-content-center align-items-center bg-warning">2</div>

            <div className="p2pStep2">
              <div className="p2pStep2Body">

                {/* ── Fiat payer: notify transfer stays available after timer; claim when API allows 10 ── */}
                <div className="p2pActions">
                  {canDispatch && (
                    <button
                      className="p2pPrimaryBtn"
                      type="button"
                      onClick={() => handleStatusUpdate(5)}
                      disabled={submitting !== null}
                    >
                      {submitting === 5
                        ? <><span className="spinner-border spinner-border-sm me-2" />Notifying…</>
                        : notifyTransferredLabel}
                    </button>
                  )}
                  {timerExpired && canClaim && (
                    <button
                      className="p2pPrimaryBtn bg-danger"
                      type="button"
                      onClick={() => handleStatusUpdate(10)}
                      disabled={submitting !== null}
                    >
                      {submitting === 10
                        ? <><span className="spinner-border spinner-border-sm me-2" />Submitting Claim…</>
                        : "⏱ Time Expired — Claim to Admin"}
                    </button>
                  )}
                </div>

                {/* ── SELLER: status=1 → can approve or reject ── */}
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
                          {submitting === 2
                            ? <><span className="spinner-border spinner-border-sm me-2" />Approving…</>
                            : "Approve Trade"}
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

                {/* ── BUYER: status=1 → waiting for seller approval ── */}
                {/* {!canDispatch && !canApprove && !canReject && (
                  <div className="p2pMuted p2pSmall d-flex align-items-center gap-2 py-2">
                    <span className="spinner-border spinner-border-sm" />
                    Waiting for seller to approve your request…
                  </div>
                )} */}

              </div>
            </div>
          </div>

        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          PENDING PHASE  (trade.status = 5)

          • Seller view: release [6] or dispute [7]
          • Buyer  view: waiting spinner
      ══════════════════════════════════════════════════════════════════════ */}
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

      {/* ══════════════════════════════════════════════════════════════════════
          COMPLETED  (status 6 or 9)
      ══════════════════════════════════════════════════════════════════════ */}
      {uiStatus === "completed" && (
        <OrderCompleted trade={trade} />
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          REJECTED / CANCELLED  (status 3, 4, 7, 8)
      ══════════════════════════════════════════════════════════════════════ */}
      {uiStatus === "rejected" && (
        <div className="p2pStepWrap">
          <div className="p2pCard p-3 text-center">
            <i className="fa-solid fa-circle-xmark text-danger fs-1 mb-3 d-block" />
            <div className="p2pStepTitle text-danger mb-1">
              {trade.current_status?.status_text ?? "Order Cancelled"}
            </div>
            <p className="p2pMuted p2pSmall">{trade.current_status?.note}</p>
            <Link href="/dashboard/wallet/?tab=tab3" className="p2pPrimaryBtn d-inline-block mt-3">
              Back to P2P Market
            </Link>
          </div>
        </div>
      )}
    </>
  );
}