"use client";

import { getNotifications, type UserNotification } from "@/app/api/notifications";
import { getTrade } from "@/app/api/trade";
import { getUserInfo } from "@/utils/auth";
import { getTradeEcho } from "@/utils/tradeEcho";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import styles from "./PaymentProofSubmittedPrompt.module.css";

type ProofOrder = {
  notificationId: number;
  id: number;
  orderId: string;
  type: "buy" | "sell";
  fiatAmount: number;
  fiat: string;
};

type TradeResponse = {
  id: number;
  order_id?: string;
  type: "buy" | "sell";
  status: number;
  created_by: number;
  is_ad_owner?: boolean;
  payable_amount?: number;
  p2p_ad?: { with_fiat?: string } | null;
};

const isLocalProofNotice = (item: UserNotification) =>
  item.type === "p2p.payment_sent" &&
  item.data?.scope === "Local Buy & Sell" &&
  Number.isSafeInteger(Number(item.data?.trade_id)) &&
  Number(item.data?.trade_id) > 0;

export default function PaymentProofSubmittedPrompt() {
  const router = useRouter();
  const [userId, setUserId] = useState<number | null>(null);
  const [orders, setOrders] = useState<ProofOrder[]>([]);
  const activeUserId = useRef<number | null>(null);
  const seenIds = useRef<Set<number>>(new Set());
  const dismissedIds = useRef<Set<number>>(new Set());
  const loadingIds = useRef<Set<number>>(new Set());

  useEffect(() => {
    const syncUser = () => {
      const rawId = Number(getUserInfo()?.id);
      const next = Number.isSafeInteger(rawId) && rawId > 0 ? rawId : null;
      if (activeUserId.current !== next) {
        activeUserId.current = next;
        setOrders([]);
        loadingIds.current.clear();
        try {
          const saved = next ? JSON.parse(sessionStorage.getItem(`local-proof-prompts-${next}`) || "[]") : [];
          dismissedIds.current = new Set(Array.isArray(saved) ? saved.map(Number) : []);
          seenIds.current = new Set(dismissedIds.current);
        } catch {
          dismissedIds.current = new Set();
          seenIds.current = new Set();
        }
      }
      setUserId(next);
    };

    syncUser();
    window.addEventListener("authStateChanged", syncUser);
    window.addEventListener("storage", syncUser);
    const authPoll = window.setInterval(syncUser, 1000);
    return () => {
      window.removeEventListener("authStateChanged", syncUser);
      window.removeEventListener("storage", syncUser);
      window.clearInterval(authPoll);
    };
  }, []);

  useEffect(() => {
    if (userId === null) return;
    let active = true;

    const loadProof = async (notice: UserNotification) => {
      const noticeId = Number(notice.id);
      const tradeId = Number(notice.data?.trade_id);
      if (!isLocalProofNotice(notice) || !Number.isSafeInteger(noticeId) || noticeId < 1 ||
          seenIds.current.has(noticeId) || loadingIds.current.has(noticeId)) return;

      loadingIds.current.add(noticeId);
      try {
        const response = await getTrade(tradeId);
        const trade = response?.data as TradeResponse | undefined;
        if (!active || !trade || Number(trade.id) !== tradeId || trade.status !== 5 ||
            !["buy", "sell"].includes(trade.type)) return;

        // Older notifications may also exist on the submitter's account.
        const isRecipient = trade.type === "buy"
          ? trade.is_ad_owner === true
          : Number(trade.created_by) === userId;
        if (!isRecipient) return;

        seenIds.current.add(noticeId);
        setOrders(current => current.some(item => item.notificationId === noticeId) ? current : [
          ...current,
          {
            notificationId: noticeId,
            id: tradeId,
            orderId: trade.order_id || `#${tradeId}`,
            type: trade.type,
            fiatAmount: Number(trade.payable_amount ?? 0),
            fiat: trade.p2p_ad?.with_fiat || "BDT",
          },
        ]);
      } catch {
        // An unread notification can be retried by the next inbox poll.
      } finally {
        loadingIds.current.delete(noticeId);
      }
    };

    const recoverProofs = async () => {
      try {
        const response = await getNotifications(100);
        for (const notice of response.items) {
          if (!active) break;
          if (!notice.read_at && isLocalProofNotice(notice)) await loadProof(notice);
        }
      } catch {
        // Realtime delivery remains available while the inbox request fails.
      }
    };

    void recoverProofs();
    const poll = window.setInterval(() => {
      if (!document.hidden) void recoverProofs();
    }, 15000);

    const channel = getTradeEcho()?.private(`user.${userId}`);
    const onNotification = (payload: { notification?: UserNotification }) => {
      if (payload.notification) void loadProof(payload.notification);
    };
    channel?.listen(".notification.created", onNotification);

    return () => {
      active = false;
      window.clearInterval(poll);
      channel?.stopListening(".notification.created", onNotification);
    };
  }, [userId]);

  const order = orders[0];
  if (!order) return null;

  const dismiss = () => {
    dismissedIds.current.add(order.notificationId);
    try {
      sessionStorage.setItem(`local-proof-prompts-${userId}`, JSON.stringify([...dismissedIds.current]));
    } catch { /* Closing still works if session storage is unavailable. */ }
    setOrders(current => current.slice(1));
  };

  const viewOrder = () => {
    dismiss();
    router.push(`/dashboard/local-buy-sell/my-orders/${order.type === "buy" ? "buy-view" : "sell-view"}/?trade_id=${order.id}`);
  };

  return (
    <div className={styles.overlay}>
      <section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="local-proof-prompt-title">
        <button type="button" className={styles.close} onClick={dismiss} aria-label="Close payment proof notification">×</button>
        <span className={styles.icon} aria-hidden="true"><i className="fa-solid fa-receipt" /></span>
        <p className={styles.eyebrow}>LOCAL BUY &amp; SELL</p>
        <h2 id="local-proof-prompt-title">Payment Proof Submitted</h2>
        <p className={styles.subtitle}>The other user submitted payment proof. Review it before confirming the payment.</p>
        <div className={styles.details}>
          <div><span>Order ID</span><strong>{order.orderId}</strong></div>
          <div><span>Payment amount</span><strong>{order.fiatAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {order.fiat}</strong></div>
        </div>
        {orders.length > 1 && <p className={styles.queueNote}>{orders.length - 1} more payment proof{orders.length > 2 ? "s" : ""}</p>}
        <button type="button" className={styles.viewButton} onClick={viewOrder} autoFocus>
          View Order <i className="fa-solid fa-arrow-right" aria-hidden="true" />
        </button>
      </section>
    </div>
  );
}
