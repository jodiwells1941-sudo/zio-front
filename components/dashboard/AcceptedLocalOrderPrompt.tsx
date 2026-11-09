"use client";

import { getNotifications } from "@/app/api/notifications";
import { getTrade } from "@/app/api/trade";
import { getUserInfo } from "@/utils/auth";
import { getTradeEcho } from "@/utils/tradeEcho";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import styles from "./AcceptedLocalOrderPrompt.module.css";

type AcceptedOrder = {
  id: number;
  order_id?: string;
  type: "buy" | "sell";
  status: number;
  created_by: number;
  payable_amount?: number;
  receivable_amount?: number;
  payment_expires_at?: string | null;
  p2p_ad?: { asset?: string; with_fiat?: string } | null;
};

const formatAmount = (value: number | undefined, currency: string) =>
  `${Number(value ?? 0).toLocaleString("en-US", { maximumFractionDigits: 4 })} ${currency}`;

export default function AcceptedLocalOrderPrompt() {
  const router = useRouter();
  const [userId, setUserId] = useState<number | null>(null);
  const [orders, setOrders] = useState<AcceptedOrder[]>([]);
  const activeUserId = useRef<number | null>(null);
  const seenIds = useRef<Set<number>>(new Set());
  const viewedIds = useRef<Set<number>>(new Set());
  const loadingIds = useRef<Set<number>>(new Set());

  useEffect(() => {
    const syncUser = () => {
      const id = Number(getUserInfo()?.id);
      const next = Number.isSafeInteger(id) && id > 0 ? id : null;
      if (activeUserId.current !== next) {
        activeUserId.current = next;
        setOrders([]);
        loadingIds.current.clear();
        try {
          const saved = next ? JSON.parse(sessionStorage.getItem(`accepted-local-orders-${next}`) || "[]") : [];
          viewedIds.current = new Set(Array.isArray(saved) ? saved.map(Number) : []);
          seenIds.current = new Set(viewedIds.current);
        } catch {
          viewedIds.current = new Set();
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

    const loadAcceptedOrder = async (rawId: number | string) => {
      const id = Number(rawId);
      if (!Number.isSafeInteger(id) || id < 1 || seenIds.current.has(id) || loadingIds.current.has(id)) return;
      loadingIds.current.add(id);
      try {
        const response = await getTrade(id);
        const order = response?.data as AcceptedOrder | undefined;
        if (!active || !order || Number(order.id) !== id || Number(order.created_by) !== userId ||
            order.status !== 2 || !["buy", "sell"].includes(order.type)) return;
        seenIds.current.add(id);
        setOrders(current => current.some(item => item.id === id) ? current : [...current, order]);
      } catch {
        // The next notification poll will retry a transient API failure.
      } finally {
        loadingIds.current.delete(id);
      }
    };

    const recoverAcceptedOrders = async () => {
      try {
        const response = await getNotifications(100);
        for (const item of response.items) {
          if (!active) break;
          if (item.type === "p2p.approved" && item.data?.scope === "Local Buy & Sell" &&
              !item.read_at && item.data.trade_id) {
            await loadAcceptedOrder(item.data.trade_id);
          }
        }
      } catch {
        // The private websocket remains active if notification history is temporarily unavailable.
      }
    };

    void recoverAcceptedOrders();
    const poll = window.setInterval(() => {
      if (!document.hidden) void recoverAcceptedOrders();
    }, 15000);
    const channel = getTradeEcho()?.private(`local-order-creator.${userId}`);
    const onApproved = (event: { order_id?: number | string }) => {
      if (event?.order_id) void loadAcceptedOrder(event.order_id);
    };
    channel?.listen(".p2p-local-order.approved", onApproved);

    return () => {
      active = false;
      window.clearInterval(poll);
      channel?.stopListening(".p2p-local-order.approved", onApproved);
    };
  }, [userId]);

  const order = orders[0];
  if (!order) return null;

  const isBuy = order.type === "buy";
  const asset = order.p2p_ad?.asset || "USD";
  const fiat = order.p2p_ad?.with_fiat || "BDT";
  const deadline = order.payment_expires_at ? new Date(order.payment_expires_at) : null;

  const viewOrder = () => {
    viewedIds.current.add(order.id);
    try {
      sessionStorage.setItem(`accepted-local-orders-${userId}`, JSON.stringify([...viewedIds.current]));
    } catch { /* Navigation still works when session storage is unavailable. */ }
    setOrders(current => current.slice(1));
    router.push(`/dashboard/local-buy-sell/my-orders/${isBuy ? "buy-view" : "sell-view"}/?trade_id=${order.id}`);
  };

  return (
    <div className={styles.overlay}>
      <section className={`${styles.modal} ${isBuy ? styles.buy : styles.sell}`}
        role="dialog" aria-modal="true" aria-labelledby="accepted-local-order-title">
        <div className={styles.icon} aria-hidden="true"><i className="fa-solid fa-circle-check" /></div>
        <p className={styles.eyebrow}>LOCAL BUY &amp; SELL</p>
        <h2 id="accepted-local-order-title">Your Order Accepted</h2>
        <p className={styles.subtitle}>Your {isBuy ? "buy" : "sell"} request has been accepted. Open the order to continue.</p>

        <div className={styles.amountCard}>
          <span>{isBuy ? "Buy" : "Sell"} Amount</span>
          <strong>{formatAmount(order.receivable_amount, asset)}</strong>
        </div>
        <div className={styles.details}>
          <div><span>Order ID</span><strong>{order.order_id || `#${order.id}`}</strong></div>
          <div><span>{isBuy ? "Pay Amount" : "Receive Amount"}</span><strong>{formatAmount(order.payable_amount, fiat)}</strong></div>
          {deadline && !Number.isNaN(deadline.getTime()) && (
            <div><span>Payment deadline</span><strong>{deadline.toLocaleString()}</strong></div>
          )}
        </div>

        {orders.length > 1 && <p className={styles.queueNote}>{orders.length - 1} more accepted order{orders.length > 2 ? "s" : ""}</p>}
        <button type="button" className={styles.viewButton} onClick={viewOrder} autoFocus>
          View Order <i className="fa-solid fa-arrow-right" aria-hidden="true" />
        </button>
      </section>
    </div>
  );
}
