"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { getTrade, type TradeData } from "@/app/api/trade";
import P2PTransferCard, {
  PaymentStatus,
  resolveUIStatus,
} from "@/components/dashboard/p2p/P2PTransferCard";
import P2PChatPanel from "@/components/dashboard/p2p/P2PChatPanel";

const PENDING_STATUS = 1;
const GRACE_MS = 2000;

type MerchantTradeResponse = TradeData & {
  pending_time_limit?: string | null;
};

function parseUtcToMs(dateStr: string | null | undefined): number | null {
  if (!dateStr) return null;
  const trimmed = dateStr.trim();
  const hasTz = /Z$|[+-]\d{2}:?\d{2}$/.test(trimmed);
  const iso = hasTz ? trimmed.replace(" ", "T") : trimmed.replace(" ", "T") + "Z";
  const ms = Date.parse(iso);
  return Number.isNaN(ms) ? null : ms;
}

export default function P2POrderPage() {
  const searchParams = useSearchParams();
  const tradeId = searchParams.get("trade_id");
  const [uiStatus, setUiStatus] = useState<PaymentStatus>("payment");
  const [tradeStatus, setTradeStatus] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [pendingExpire, setPendingExpire] = useState({
    status: 0,
    expireTime: null as string | null,
  });
  const [pendingTimeLeft, setPendingTimeLeft] = useState(0);
  const expireCalledRef = useRef(false);
  const serverOffsetRef = useRef(0);

  const now = useCallback(() => Date.now() + serverOffsetRef.current, []);

  const showChatPanel = tradeStatus !== 1 && tradeStatus !== 8 && tradeStatus !== 3;

  const handleAutoExpire = useCallback(() => {
    if (!tradeId || expireCalledRef.current) return;
    expireCalledRef.current = true;
    setPendingTimeLeft(0);
  }, [tradeId]);

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

      const t = res?.data as MerchantTradeResponse | undefined;
      const nextStatus = t?.status ?? 0;
      setTradeStatus(nextStatus);
      setUiStatus(resolveUIStatus(nextStatus));
      setPendingExpire({
        status: nextStatus,
        expireTime: t?.pending_time_limit ?? null,
      });

      if (t?.status === PENDING_STATUS) {
        expireCalledRef.current = false;
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Failed to load trade.");
    } finally {
      setLoading(false);
    }
  }, [tradeId]);

  useEffect(() => {
    void fetchTrade();
  }, [fetchTrade]);

  useEffect(() => {
    if (pendingExpire.status !== PENDING_STATUS || !pendingExpire.expireTime) {
      setPendingTimeLeft(0);
      return;
    }

    const endMs = parseUtcToMs(pendingExpire.expireTime);
    if (endMs === null) {
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

    if (initialDiff <= 0 && initialNow >= endMs + GRACE_MS) {
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

  if (loading) {
    return (
      <div className="p2pPage mt-5">
        <div className="container p2pContainer">
          <div className="placeholder-glow">
            <span className="placeholder col-8 mb-3 d-block rounded" />
            <span className="placeholder col-5 mb-3 d-block rounded" />
            <span className="placeholder col-7 d-block rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p2pPage mt-5">
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