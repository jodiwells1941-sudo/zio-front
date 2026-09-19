"use client";

import React from "react";
import FeedbackBox from "./FeedbackBox";
import { useAuth } from "@/hooks/useAuth";

interface TradeData {
  id: number;
  order_id: string;
  payable_amount: number;
  receivable_amount: number;
  user_price: number;
  created_at: string;
  p2pAd?: {
    asset: string;
    with_fiat: string;
    paymentMethod?: {
      sellMethod?: { name: string };
      method_name?: string;
    };
  };
  current_status?: {
    method?: string;
    with_fiat?: string;
  };
  customer_id: number;
  client_id: number;
  /** Legacy P2P status; feedback only when 9 (completed). */
  status?: number;
  trade_review?: any;
}

type Props = {
  trade: TradeData;
};

export default function PaymentCompleted({ trade }: Props) {
  const withFiat     = trade.current_status?.with_fiat ?? trade.p2pAd?.with_fiat ?? '';
  const asset        = trade.p2pAd?.asset ?? 'USDT';
  const methodName   = trade.current_status?.method
                    ?? trade.p2pAd?.paymentMethod?.sellMethod?.name
                    ?? trade.p2pAd?.paymentMethod?.method_name
                    ?? 'N/A';
  const payable      = Number(trade.payable_amount).toLocaleString(undefined, { minimumFractionDigits: 2 });
  const receivable   = Number(trade.receivable_amount).toFixed(6);
  const price        = Number(trade.user_price).toFixed(2);
  const timeCreated  = trade.created_at
    ? new Date(trade.created_at).toLocaleString()
    : '—';
  const { user } = useAuth();
    
  return (
    <>
      <div className="p2pStepWrap">
        <div className="p2pStepRow">
          <div className="p2pStepContent">
            <div className="p2pCard p-0">

              {/* Header */}
              <div className="p2pCardRow px-3 bg-dark rounded-top-3">
                <div className="p2pCardValue text-danger">
                  Sell <span className="text-light">{asset}</span>
                </div>
              </div>

              {/* Fiat Amount */}
              <div className="p2pCardRow px-3">
                <div className="p2pCardLabel">
                  Fiat Amount <i className="fa-regular fa-circle-question p2pInfo" />
                </div>
                <div className="p2pCardValue text-danger">
                  {withFiat} {payable}
                </div>
              </div>

              {/* Price */}
              <div className="p2pCardRow px-3">
                <div className="p2pCardLabel">Price</div>
                <div className="p2pCardValue">{withFiat} {price}</div>
              </div>

              {/* Total Quantity */}
              <div className="p2pCardRow px-3">
                <div className="p2pCardLabel">Total Quantity</div>
                <div className="p2pCardValue">{receivable} {asset}</div>
              </div>

              {/* Time Created */}
              <div className="p2pCardRow px-3 border-top border-dark-light">
                <div className="p2pCardLabel">Time Created</div>
                <div className="p2pCardValue">{timeCreated}</div>
              </div>

              {/* Payment Method */}
              <div className="p2pCardRow px-3">
                <div className="p2pCardLabel">Payment Method</div>
                <div className="p2pCardValue">{methodName}</div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* ── Review Section — only when order is completed (status 9) ── */}
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