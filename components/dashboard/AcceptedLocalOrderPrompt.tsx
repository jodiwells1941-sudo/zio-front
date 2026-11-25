"use client";

import { getNotifications } from "@/app/api/notifications";
import { getTrade } from "@/app/api/trade";
import { getUserInfo } from "@/utils/auth";
import { getTradeEcho } from "@/utils/tradeEcho";
import { localOrderSummaryRows } from "@/app/dashboard/local-buy-sell/localOrderSummary";
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
  user_price?: number | string;
  bonus_amount?: number | string | null;
  charge_amount?: number | string | null;
  ad_fee_amount?: number | string | null;
  charge_percent?: number | string | null;
  p2p_ad?: {
    asset?: string;
    with_fiat?: string;
    payment_method?: { method_name?: string; sell_method?: { name?: string } } | null;
  } | null;
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
  const fiat = order.p2p_ad?.with_fiat || "BDT";
  const paymentMethod = order.p2p_ad?.payment_method?.method_name || order.p2p_ad?.payment_method?.sell_method?.name;
  const asset = (order.p2p_ad?.asset || "USD").toUpperCase().replace("USDT", "USD");
  const baseAmount = Number(order.receivable_amount ?? 0);
  const bonusAmount = Number(order.bonus_amount ?? 0);
  const feeAmount = Number(isBuy ? order.ad_fee_amount ?? order.charge_amount ?? 0 : order.charge_amount ?? 0);
  const summaryRows = localOrderSummaryRows({
    side: order.type,
    fiat,
    asset,
    fiatAmount: Number(order.payable_amount ?? 0),
    assetAmount: baseAmount,
    price: Number(order.user_price ?? 0),
    bonusAmount,
    feeAmount,
    feePercent: Number(order.charge_percent ?? 0),
    feeLabel: isBuy ? "Ad Fee (Already Paid)" : undefined,
  });

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
        <h2 id="accepted-local-order-title">Your Request Accepted</h2>
        <p className={styles.subtitle}>Your {isBuy ? "buy" : "sell"} request has been accepted. Open the order to continue.</p>

        <div className={`${styles.amountCard} ${styles.payCard}`}>
          <span>Pay Amount</span>
          <strong>{formatAmount(order.payable_amount, fiat)}</strong>
        </div>
        <details className={styles.orderSummary}>
          <summary><span><i className="fa-solid fa-clipboard-list" aria-hidden="true" /> Order Summary</span><i className="fa-solid fa-chevron-down" aria-hidden="true" /></summary>
          <div className={styles.details}>
            <div><span><i className="fa-solid fa-hashtag" aria-hidden="true" />Order ID</span><strong className={styles.orderIdValue}>{order.order_id || `#${order.id}`}<button type="button" aria-label="Copy order ID" onClick={() => { void navigator.clipboard?.writeText(order.order_id || `#${order.id}`); }}><i className="fa-regular fa-copy" aria-hidden="true" /></button></strong></div>
            {paymentMethod && <div><span><i className="fa-solid fa-credit-card" aria-hidden="true" />Payment Method</span><strong>{paymentMethod}</strong></div>}
            {summaryRows.map((row, index) => (
              <div className={`${styles.summaryRow} ${row.total ? styles.summaryTotal : ""} ${row.tone === "negative" ? styles.summaryNegative : ""} ${row.tone === "positive" || row.tone === "received" ? styles.summaryPositive : ""}`} key={`${row.label}-${index}`}>
                <span><i className={`fa-solid ${row.icon}`} aria-hidden="true" />{row.label}</span>
                <strong>{row.value}</strong>
              </div>
            ))}
          </div>
        </details>

        {orders.length > 1 && <p className={styles.queueNote}>{orders.length - 1} more accepted order{orders.length > 2 ? "s" : ""}</p>}
        <button type="button" className={styles.viewButton} onClick={viewOrder} autoFocus>
          View Order <i className="fa-solid fa-arrow-right" aria-hidden="true" />
        </button>
      </section>
    </div>
  );
}
