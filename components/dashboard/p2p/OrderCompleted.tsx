// "use client";

// import React from "react";

// export default function OrderCompleted() {
//    return (
//         <>
//             <div className="p2pStepWrap">
//                 <div className="p2pStepRow">
//                     <div className="p2pStepContent">
//                         <div className="p2pCard p-0">
//                             <div className="p2pCardRow px-3 bg-dark rounded-top-3">
//                                 <div className="p2pCardValue green">
//                                     Buy <span className="text-light">USDT</span>
//                                 </div> 
//                             </div>
//                             <div className="p2pCardRow px-3">
//                                 <div className="p2pCardLabel">Flat Amount <i className="fa-regular fa-circle-question p2pInfo" /></div>
//                                 <div className="p2pCardValue green">
//                                     Tk. 20,000.00
//                                     <button className="p2pCopyBtn" type="button" aria-label="copy amount">
//                                     <i className="fa-regular fa-copy" />
//                                     </button>
//                                 </div>
//                             </div>

//                             <div className="p2pCardRow px-3">
//                                 <div className="p2pCardLabel">
//                                     price
//                                 </div>
//                                 <div className="p2pCardValue">
//                                     TK. 126.17
//                                 </div>
//                             </div>

//                             <div className="p2pCardRow px-3">
//                                 <div className="p2pCardLabel">Recived Quantity</div>
//                                 <div className="p2pCardValue">
//                                     5777.78 USDT
//                                     <button className="p2pCopyBtn" type="button" aria-label="copy wallet number">
//                                         <i className="fa-solid fa-angle-down" />
//                                     </button>
//                                 </div>
//                             </div>

//                             <div className="p2pCardRow px-3 border-top border-dark-light">
//                                 <div className="p2pCardLabel">
//                                     Time Created
//                                 </div>
//                                 <div className="p2pCardValue">
//                                     2025-01-09 19:33:32
//                                 </div>
//                             </div>

//                             <div className="p2pCardRow px-3">
//                                 <div className="p2pCardLabel">
//                                     Payment Method
//                                 </div>
//                                 <div className="p2pCardValue">
//                                     Bank Tarensfer
//                                 </div>
//                             </div>

//                         </div>
//                     </div>
//                 </div>

//                 {/* <div className="p2pCard mt-3 p-0">
//                     <div className="p2pCardRow px-3">
//                         <div className="p2pCardValue">
//                             Convert to the Hottest Crypto
//                         </div> 
//                     </div>

//                     <div className="p2pCardRow px-3">
//                         <div className="p2pCardLabel text-white fw-7">
//                             BNB/USDT <span className="px-2">$676.78</span> <span className="text-danger">-67.8%</span>
//                         </div>
//                         <div>
//                             <button className="bg-warning px-3 py-1 rounded-1 text-black">Convert</button>
//                         </div>
//                     </div>
//                 </div> */}
//             </div>

//             {/* <div className="p-3 d-flex  align-items-center">
//                 <button className="">Reorder <i className="fa-solid fa-angle-right ps-2 text-xs text-light" /></button>
//                 <span className="border border-dark-light py-2 mx-4"></span>
//                 <button className="">My Feedback <i className="fa-solid fa-angle-right ps-2 text-xs text-light" /></button>
//                 <span className="border border-dark-light py-2 mx-4"></span>
//                 <button className="">Need Help <i className="fa-solid fa-angle-right ps-2 text-xs text-light" /></button>
//             </div> */}

//             <div className="bg-dark p-3 rounded-3 mt-3">
//                 <h6 className="text-lg fw-6">Feedback</h6>
//                 <p className="text-white-50">Review Counterparty</p>

//                 <div className="pt-5 d-flex gap-3">
//                     <button className="btn--primary py-2 px-3 text-sm d-flex align-items-center justify-content-center ">
//                         <i className="fa-regular fa-thumbs-up pe-2"></i>
//                         Positive 
//                     </button>
//                     <button className="btn--primary py-2 px-3 text-sm d-flex align-items-center justify-content-center ">
//                         <i className="fa-regular fa-thumbs-down pe-2"></i>
//                         Negative 
//                     </button>
//                 </div>
//                 <div className="pt-4">
//                     <button className="btn--secondary py-lg-2 py-1 px-3 rounded-2 m-2">Fast transaction</button>
//                     <button className="btn--secondary py-lg-2 py-1 px-3 rounded-2 m-2">Polite and friendly</button>
//                     <button className="btn--secondary py-lg-2 py-1 px-3 rounded-2 m-2">Patient</button>
//                     <button className="btn--secondary py-lg-2 py-1 px-3 rounded-2 m-2">Good price</button>
//                     <button className="btn--secondary py-lg-2 py-1 px-3 rounded-2 m-2">Safe and trustworthy</button>
//                 </div>
//                 <div className="mt-3">
//                     <textarea className="copy-input px-3 form-control rounded-3 textarea-custom" placeholder="Let other users know about the positive experiency."></textarea>
//                 </div>

//                 <div className="d-flex justify-content-center mt-3">
//                     <button className="btn--primary text-sm d-flex align-items-center justify-content-center ">
//                         Leave comments
//                     </button>
//                 </div>
//             </div>
//         </>
//     )
//  }


"use client";

import React, { useState } from "react";
import FeedbackBox from "../wallet/sell/FeedbackBox";
import { useAuth } from "@/hooks/useAuth";
import { getViewerOrderAmountDisplay } from "./p2pOrderDisplay";

function CopyBtn({ text, id }: { text: string; id: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };
  return (
    <button className="p2pCopyBtn" type="button" aria-label="copy" onClick={handleCopy}>
      {copied
        ? <i className="fa-solid fa-check text-success" />
        : <i className="fa-regular fa-copy" />
      }
    </button>
  );
}

export default function OrderCompleted({ trade }: { trade?: any }) {
  const [feedback,   setFeedback]   = useState<"positive" | "negative" | null>(null);
  const [tags,       setTags]       = useState<string[]>([]);
  const [comment,    setComment]    = useState("");
  const [submitted,  setSubmitted]  = useState(false);

  // ── Derived values ─────────────────────────────────────────────────────────
  const methodName = trade?.p2p_ad?.payment_method?.sell_method?.name ?? "Bank Transfer";
  const createdAt  = trade?.created_at
    ? new Date(trade.created_at).toLocaleString()
    : "—";
  const { user } = useAuth();

  const vd = trade
    ? getViewerOrderAmountDisplay({
        payable_amount: trade.payable_amount,
        receivable_amount: trade.receivable_amount,
        user_price: trade.user_price,
        type: trade.type ?? "buy",
        is_client: Boolean(trade.is_client),
        p2p_ad: trade.p2p_ad,
      })
    : null;
  const asset = vd?.asset ?? "USDT";
  const orderSideLabel = trade?.type === "sell" ? "Sell" : "Buy";


  const feedbackTags = [
    "Fast transaction",
    "Polite and friendly",
    "Patient",
    "Good price",
    "Safe and trustworthy",
  ];

  const toggleTag = (tag: string) =>
    setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);

  const handleSubmitFeedback = () => {
    if (!feedback) return;
    // TODO: call feedback API
    setSubmitted(true);
  };

  return (
    <>
      <div className="p2pStepWrap">
        <div className="p2pStepRow">
          <div className="p2pStepContent">
            <div className="p2pCard p-0">

              {/* Header */}
              <div className="p2pCardRow px-3 bg-dark rounded-top-3">
                <div className="p2pCardValue green">
                  {orderSideLabel} <span className="text-light">{asset}</span>
                </div>
              </div>

              {vd?.detailRows.map((row, i) => (
                <div key={`${row.label}-${i}`} className="p2pCardRow px-3">
                  <div className="p2pCardLabel">{row.label}</div>
                  <div className={`p2pCardValue ${i === 0 ? "green" : ""}`}>
                    {row.value}
                    <CopyBtn text={row.copyText} id={`completed_row_${i}`} />
                  </div>
                </div>
              ))}

              {/* Time created */}
              <div className="p2pCardRow px-3 border-top border-dark-light">
                <div className="p2pCardLabel">Time Created</div>
                <div className="p2pCardValue">{createdAt}</div>
              </div>

              {/* Payment method */}
              <div className="p2pCardRow px-3">
                <div className="p2pCardLabel">Payment Method</div>
                <div className="p2pCardValue">{methodName}</div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* ── Feedback / reviews — only after order is fully completed (status 9) for buyer & seller ── */}
            {trade?.status === 9 && (() => {
              const currentUserId = user?.id; // from your auth context/hook
      
              const reviews: any[] = Array.isArray(trade.trade_review)
                ? trade.trade_review
                : trade.trade_review
                  ? [trade.trade_review]
                  : [];
      
              // Parse tags helper
              const parseTags = (raw: any): string[] => {
                if (!raw) return [];
                if (typeof raw === "string") {
                  try { return JSON.parse(raw); } catch { return []; }
                }
                return Array.isArray(raw) ? raw : [];
              };
      
              // Has the current user already submitted?
              const myReview = reviews.find(
                (r) => r.reviewer_id === currentUserId || r.user_id === currentUserId
              );
      
              // All reviews to display (both client & customer)
              const hasAnyReview = reviews.length > 0;
      
              return (
                <div className="mt-3">
      
                  {/* ── Show all submitted reviews (visible to both) ── */}
                  {hasAnyReview && (
                    <div className="bg-dark p-3 rounded-3 mb-3">
                      <h6 className="text-lg fw-6 mb-1">Reviews</h6>
                      <p className="text-white-50 text-sm mb-3">Feedback from trade parties</p>
      
                      <div className="d-flex flex-column gap-3">
                        {reviews.map((review) => {
                          const tags = parseTags(review.tags);
                          const isPositive = review.type === "positive";
                          const reviewerId = review.reviewer_id ?? review.user_id;
                          const isMe = reviewerId === currentUserId;
                          const isClient = reviewerId === trade.client_id;
      
                          return (
                            <div
                              key={review.id}
                              className="rounded-3 p-3"
                              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
                            >
                              {/* Review header */}
                              <div className="d-flex align-items-center justify-content-between mb-2">
                                <div className="d-flex align-items-center gap-2">
                                  <span className="text-sm fw-6 text-white">
                                    {isClient ? "Client" : "Customer"}
                                    {isMe && (
                                      <span className="text-white-50 fw-normal ms-1">(You)</span>
                                    )}
                                  </span>
                                </div>
                                <span
                                  className={`badge rounded-pill px-3 py-1 text-sm ${
                                    isPositive ? "bg-success" : "bg-danger"
                                  }`}
                                >
                                  {isPositive
                                    ? <><i className="fa-solid fa-thumbs-up me-1" />Positive</>
                                    : <><i className="fa-solid fa-thumbs-down me-1" />Negative</>
                                  }
                                </span>
                              </div>
      
                              {/* Tags */}
                              {tags.length > 0 && (
                                <div className="d-flex flex-wrap gap-2 mb-2">
                                  {tags.map((tag: string, i: number) => (
                                    <span
                                      key={`${tag}-${i}`}
                                      className="btn--secondary py-1 px-3 rounded-2 text-sm"
                                      style={{ cursor: "default", opacity: 0.85 }}
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}
      
                              {/* Comment */}
                              {review.comment && (
                                <div
                                  className="text-sm text-white-50 mt-1"
                                  style={{ lineHeight: "1.6", whiteSpace: "pre-wrap" }}
                                >
                                  {review.comment}
                                </div>
                              )}
      
                              {/* Timestamp */}
                              <p className="mb-0 mt-2" style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
                                {new Date(review.created_at).toLocaleDateString("en-US", {
                                  year: "numeric", month: "short", day: "numeric",
                                  hour: "2-digit", minute: "2-digit",
                                })}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
      
                  {/* ── Feedback form — only if current user hasn't reviewed yet ── */}
                  {!myReview ? (
                    <FeedbackBox
                      tradeId={trade.id}
                      buyerId={trade.customer_id}
                      clientId={trade.client_id}
                    />
                  ) : (
                    <div className="bg-dark p-3 rounded-3 text-center">
                      <i className="fa-solid fa-circle-check text-success mb-2" style={{ fontSize: 22 }} />
                      <p className="text-white-50 text-sm mb-0">You have already submitted your review.</p>
                    </div>
                  )}
      
                </div>
              );
            })()}
    </>
  );
}