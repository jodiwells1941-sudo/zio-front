"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { getTrade } from "@/app/api/trade";
import P2PTransferCard, {
  PaymentStatus,
  type TradeData,
  resolveUIStatus,
} from "@/components/dashboard/p2p/P2PTransferCard";
import P2PChatPanel from "@/components/dashboard/p2p/P2PChatPanel";
import P2PTopNav from "@/components/dashboard/p2p/P2PTopNav";
import { useSearchParams } from "next/navigation";

const PENDING_STATUS = 1;

// Small tolerance so clock skew / rounding right at the boundary doesn't
// cause a false-positive expire the instant the page loads.
const GRACE_MS = 2000;

/**
 * The backend sends naive timestamps ("YYYY-MM-DD HH:mm:ss", no timezone)
 * that represent UTC. If we hand that straight to `new Date(...)`, most
 * browsers parse the non-ISO format as *local* time instead of UTC — in a
 * UTC+6 timezone that silently shifts every deadline 6 hours earlier,
 * which makes fresh, still-valid trades look already expired the instant
 * the page loads. Parse explicitly as UTC to avoid that.
 */
function parseUtcToMs(dateStr: string | null | undefined): number | null {
  if (!dateStr) return null;
  const trimmed = dateStr.trim();
  // Already has a timezone marker (Z or +HH:MM) — don't double-append Z.
  const hasTz = /Z$|[+-]\d{2}:?\d{2}$/.test(trimmed);
  const iso = hasTz
    ? trimmed.replace(" ", "T")
    : trimmed.replace(" ", "T") + "Z";
  const ms = Date.parse(iso);
  return Number.isNaN(ms) ? null : ms;
}

export default function P2POrderPage() {
  const searchParams = useSearchParams();
  const tradeId = searchParams.get("trade_id");

  const [uiStatus, setUiStatus] = useState<PaymentStatus>("payment");
  const [tradeStatus, setTradeStatus] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [pendingExpire, setPendingExpire] = useState<{
    status: number;
    expireTime: string | null;
  }>({
    status: 0,
    expireTime: null,
  });

  const [pendingTimeLeft, setPendingTimeLeft] = useState(0);
  const expireCalledRef = useRef(false);

  // serverNow - clientNow, in ms, from the API response's `Date` header
  // (if the backend exposes it via CORS). Stays 0 — i.e. a no-op — if not.
  const serverOffsetRef = useRef(0);
  const now = useCallback(() => Date.now() + serverOffsetRef.current, []);

  const showChatPanel = tradeStatus !== 1 && tradeStatus !== 8 && tradeStatus !== 3;

  const handleAutoExpire = useCallback(() => {
    if (!tradeId || expireCalledRef.current) return;
    expireCalledRef.current = true;
    setPendingTimeLeft(0);
  }, [tradeId]);

  // fetchTrade ONLY fetches and sets state. It does NOT decide whether to
  // expire — that decision lives in exactly one place: the countdown effect
  // below. Having two decision points was the source of the premature
  // auto-call on load.
  const fetchTrade = useCallback(async () => {
    if (!tradeId) return;
    try {
      setLoading(true);
      const res = await getTrade(Number(tradeId));

      const serverDateHeader = (res as any)?.headers?.date;
      if (serverDateHeader) {
        const serverMs = Date.parse(serverDateHeader);
        if (!Number.isNaN(serverMs)) {
          serverOffsetRef.current = serverMs - Date.now();
        }
      }

      const t: TradeData = res?.data;
      const nextStatus = t?.status ?? 0;

      setTradeStatus(nextStatus);
      setUiStatus(resolveUIStatus(nextStatus));
      setPendingExpire({
        status: nextStatus,
        expireTime: t?.pending_time_limit ?? null,
      });

      // Reset the guard whenever a fresh trade loads and it is genuinely
      // still pending. If it's not pending (e.g. already 8, or 2, 5, etc.)
      // there is nothing to expire, so leave the guard alone.
      if (t?.status === PENDING_STATUS) {
        expireCalledRef.current = false;
      }

      if (t?.status === 2 && t.payment_expires_at) {
        const expiresAtMs = parseUtcToMs(t.payment_expires_at);
        const sec = expiresAtMs
          ? Math.max(0, Math.floor((expiresAtMs - now()) / 1000))
          : 0;
        if (sec <= 0) setUiStatus("pending");
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Failed to load trade.");
    } finally {
      setLoading(false);
    }
  }, [tradeId, now]);

  useEffect(() => {
    void fetchTrade();
  }, [fetchTrade]);

  /**
   * SINGLE source of truth for pending-window expiry.
   * - Computes remaining time whenever pendingExpire changes (i.e. right
   *   after every fetchTrade).
   * - Logs every value it uses, so a premature fire is always explainable
   *   from the console instead of being a mystery.
   * - Only calls handleAutoExpire once `now() >= endMs + GRACE_MS`, never
   *   from a "was already past when we loaded" shortcut elsewhere.
   */
  useEffect(() => {
    if (pendingExpire.status !== PENDING_STATUS || !pendingExpire.expireTime) {
      setPendingTimeLeft(0);
      return;
    }

    const endMs = parseUtcToMs(pendingExpire.expireTime);
    if (endMs === null) {
      console.warn(
        "[p2p pending-expire] could not parse pending_time_limit, skipping expiry check:",
        pendingExpire.expireTime
      );
      setPendingTimeLeft(0);
      return;
    }

    const tick = () => {
      const nowMs = now();
      const diff = Math.max(0, Math.floor((endMs - nowMs) / 1000));
      setPendingTimeLeft(diff);
      return { diff, nowMs };
    };

    const { diff: initialDiff, nowMs: initialNow } = tick();

    console.debug("[p2p pending-expire check]", {
      expireTime: pendingExpire.expireTime,
      endMs,
      nowMs: initialNow,
      offsetMs: serverOffsetRef.current,
      diffSeconds: initialDiff,
      willExpireNow: initialNow >= endMs + GRACE_MS,
    });

    if (initialNow >= endMs + GRACE_MS) {
      void handleAutoExpire();
      return;
    }

    const id = setInterval(() => {
      const { diff, nowMs } = tick();
      if (diff <= 0 && nowMs >= endMs + GRACE_MS) {
        clearInterval(id);
        void handleAutoExpire();
      }
    }, 1000);

    return () => clearInterval(id);
  }, [pendingExpire.status, pendingExpire.expireTime, handleAutoExpire, now]);

  return (
    <div className="p2pPage mt-5">
      <P2PTopNav />

      <div className="container p2pContainer">
        <div className="row g-4">
          <div className={showChatPanel ? "col-lg-7" : "col-12 w-100"}>
            <P2PTransferCard
              pendingStatus={pendingExpire.status}
              pendingTimeLeft={pendingTimeLeft}
              pendingExpireTime={pendingExpire.expireTime}
              onTradeExpired={handleAutoExpire}
            />
          </div>

          {showChatPanel && (
            <div className="col-lg-5 d-none d-md-block">
              <P2PChatPanel />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}