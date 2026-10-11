"use client";

import { useExpiryTimer } from "@/hooks/useExpiryTimer";
import { getViewerOrderAmountDisplay } from "@/components/dashboard/p2p/p2pOrderDisplay";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Trade = {
  id: number;
  order_id: string;
  user_price: string | number;
  payable_amount: string | number;
  receivable_amount: string | number;
  is_client: boolean;
  type: string;
  status: number;
  created_at: string;
  payment_expires_at?: string | null;
  p2p_ad?: { asset?: string; with_fiat?: string; payment_method?: { sell_method?: { name?: string } } };
};

type Props = {
  trade: Trade;
  canRelease: boolean;
  canDispute: boolean;
  canClaim: boolean;
  submitting: number | null;
  onStatusUpdate: (newStatus: number, notes?: string) => Promise<void>;
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      console.error("Could not copy order value:", error);
    }
  };

  return (
    <button className="p2pCopyBtn" type="button" aria-label="Copy value" onClick={() => void copy()}>
      {copied ? <i className="fa-solid fa-check text-success" /> : <i className="fa-regular fa-copy" />}
    </button>
  );
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

export default function P2PPendingAmmountCard({
  trade,
  canRelease,
  canDispute,
  canClaim,
  submitting,
  onStatusUpdate,
}: Props) {
  const router = useRouter();
  const releaseTimer = useExpiryTimer(
    trade.payment_expires_at ?? null,
    trade.status === 5 && (canDispute || canRelease || canClaim),
  );
  const appealBlocked = canDispute && !!trade.payment_expires_at && !releaseTimer.expired;
  const view = getViewerOrderAmountDisplay(trade);
  const paymentMethod = trade.p2p_ad?.payment_method?.sell_method?.name ?? "N/A";
  const createdAt = trade.created_at ? new Date(trade.created_at).toLocaleString() : "—";

  return (
    <div className="p2pStepWrap">
      <div className="p2pStepRow">
        <div className="p2pStepContent">
          <div className="p2pCard p-0">
            <div className="p2pCardRow px-3 bg-dark rounded-top-3">
              <div className="p2pCardValue green">
                {trade.type === "sell" ? "Sell" : "Buy"} <span className="text-light">{view.asset}</span>
              </div>
            </div>
            {view.detailRows.map((row, index) => (
              <div key={`${row.label}-${index}`} className="p2pCardRow px-3">
                <div className="p2pCardLabel">{row.label}</div>
                <div className={`p2pCardValue ${index === 0 ? "green" : ""}`}>
                  {row.value}
                  <CopyButton text={row.copyText} />
                </div>
              </div>
            ))}
            <div className="p2pCardRow px-3 border-top border-dark-light">
              <div className="p2pCardLabel">Time Created</div>
              <div className="p2pCardValue">{createdAt}</div>
            </div>
            <div className="p2pCardRow px-3">
              <div className="p2pCardLabel">Payment Method</div>
              <div className="p2pCardValue">{paymentMethod}</div>
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
                    onClick={() => void onStatusUpdate(6)}
                    disabled={submitting !== null}
                  >
                    {submitting === 6 ? "Processing..." : "Payment Received"}
                  </button>
                )}
                {canDispute && (
                  <button
                    className="p2pGhostBtn"
                    type="button"
                    onClick={() => void onStatusUpdate(7)}
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
                    onClick={() => {
                      const orderId = trade.order_id || String(trade.id);
                      router.push(`/dashboard/merchant/appeal-center/create?order_id=${encodeURIComponent(orderId)}&trade_id=${trade.id}`);
                    }}
                    disabled={submitting !== null}
                  >
                    {submitting === 10 ? "Submitting..." : "Time expired — appeal to admin"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
