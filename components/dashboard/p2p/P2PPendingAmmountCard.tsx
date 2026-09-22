"use client";

import React from "react";
import { useExpiryTimer } from "@/hooks/useExpiryTimer";
import { CopyBtn, TradeData } from "./P2PTransferCard";
import { getViewerOrderAmountDisplay } from "./p2pOrderDisplay";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

interface Props {
  trade: TradeData;
  canRelease: boolean;
  canDispute: boolean;
  canClaim: boolean;
  submitting: number | null;
  onStatusUpdate: (newStatus: number, notes?: string) => Promise<void>;
}

export default function P2PPendingAmmountCard({
  trade, canRelease, canDispute, canClaim, submitting, onStatusUpdate,
}: Props) {
  const releaseTimer = useExpiryTimer(
    trade.payment_expires_at ?? null,
    trade.status === 5 && (canDispute || canRelease || canClaim)
  );
  const appealBlocked =
    canDispute && !!trade.payment_expires_at && !releaseTimer.expired;

  // ── Derived ──────────────────────────────────────────────────────────────
  const vd         = getViewerOrderAmountDisplay(trade);
  const asset      = vd.asset;
  const methodName = trade.p2p_ad?.payment_method?.sell_method?.name ?? "N/A";
  const createdAt  = trade.created_at
    ? new Date(trade.created_at).toLocaleString()
    : "—";
  const orderSideLabel = trade.type === "sell" ? "Sell" : "Buy";

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

              {vd.detailRows.map((row, i) => (
                <div key={`${row.label}-${i}`} className="p2pCardRow px-3">
                  <div className="p2pCardLabel">{row.label}</div>
                  <div className={`p2pCardValue ${i === 0 ? "green" : ""}`}>
                    {row.value}
                    <CopyBtn text={row.copyText} id={`comp_row_${i}`} />
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

        <div className="p2pStepRow mt-3">
          <div className="p2pStepContent">
            <div className="p2pStep2">
              <div className="p2pStep2Body">
                <div className="p2pStepTitle">Confirm payment is received.</div>
                <div className="p2pMuted p2pSmall">
                  Once the transfer is received in your account, confirm to complete the order.
                </div>
                <div className="p2pActions">
                  {canRelease && (
                    <button
                      className="p2pPrimaryBtn"
                      type="button"
                      onClick={() => onStatusUpdate(6)}
                      disabled={submitting !== null}
                    >
                      {submitting === 6 ? "Processing..." : "Payment Received"}
                    </button>
                  )}
                  {canDispute && (
                    <button
                      className="p2pGhostBtn"
                      type="button"
                      onClick={() => onStatusUpdate(7)}
                      disabled={submitting !== null || appealBlocked}
                    >
                      {submitting === 7
                        ? "Submitting..."
                        : appealBlocked
                          ? `Appeal after ${pad(releaseTimer.mm)}:${pad(releaseTimer.ss)}`
                          : "Appeal"}
                    </button>
                  )}
                  {canClaim && (
                    <button
                      className="p2pGhostBtn"
                      type="button"
                      onClick={() => onStatusUpdate(10, "Payment / release window expired — claim to admin")}
                      disabled={submitting !== null}
                    >
                      {submitting === 10
                        ? "Submitting..."
                        : "Time expired — appeal to admin"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}