"use client";

import { getNotifications, type UserNotification } from "@/app/api/notifications";
import { getTrade } from "@/app/api/trade";
import { localOrderSummaryRows } from "@/app/dashboard/local-buy-sell/localOrderSummary";
import { getUserInfo } from "@/utils/auth";
import { getTradeEcho } from "@/utils/tradeEcho";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import styles from "./PaymentProofSubmittedPrompt.module.css";

type ProofOrder = {
  notificationId: number;
  id: number;
  orderId: string;
  type: "buy" | "sell";
  fiatAmount: number;
  fiat: string;
  asset: string;
  price: number;
  assetAmount: number;
  bonusAmount: number;
  feeAmount: number;
  feePercent: number;
  paymentMethod: string;
};

type TradeResponse = {
  id: number;
  order_id?: string;
  type: "buy" | "sell";
  status: number;
  created_by: number;
  is_ad_owner?: boolean;
  payable_amount?: number;
  receivable_amount?: number;
  user_price?: number | string;
  user_price_label?: string;
  bonus_amount?: number | string | null;
  charge_amount?: number | string | null;
  charge_percent?: number | string | null;
  ad_fee_amount?: number | string | null;
  p2p_ad?: {
    with_fiat?: string;
    asset?: string;
    payment_method?: { method_name?: string; sell_method?: { name?: string } } | null;
  } | null;
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
  const [summaryOpen, setSummaryOpen] = useState(false);
  const summaryId = useId();
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
            asset: (trade.p2p_ad?.asset || "USD").toUpperCase().replace("USDT", "USD"),
            price: Number(trade.user_price ?? 0),
            assetAmount: Number(trade.receivable_amount ?? 0),
            bonusAmount: Number(trade.bonus_amount ?? 0),
            feeAmount: Number(trade.type === "sell" ? trade.charge_amount ?? 0 : trade.ad_fee_amount ?? trade.charge_amount ?? 0),
            feePercent: Number(trade.charge_percent ?? 0),
            paymentMethod: trade.p2p_ad?.payment_method?.method_name || trade.p2p_ad?.payment_method?.sell_method?.name || "—",
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
    router.push(`/dashboard/local-buy-sell/my-orders/${order.type === "buy" ? "sell-view" : "buy-view"}/?trade_id=${order.id}`);
  };

  const summarySide = order.type === "buy" ? "sell" : "buy";
  const summaryRows = localOrderSummaryRows({
    side: summarySide,
    fiat: order.fiat,
    asset: order.asset,
    fiatAmount: order.fiatAmount,
    assetAmount: order.assetAmount,
    price: order.price,
    priceLabel: order.user_price_label,
    bonusAmount: order.bonusAmount,
    feeAmount: order.feeAmount,
    feePercent: order.feePercent,
  });

  return (
    <div className={styles.overlay}>
      <section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="local-proof-prompt-title">
        <button type="button" className={styles.close} onClick={dismiss} aria-label="Close payment proof notification">×</button>
        <span className={styles.icon} aria-hidden="true"><i className="fa-solid fa-receipt" /></span>
        <p className={styles.eyebrow}>LOCAL BUY &amp; SELL</p>
        <h2 id="local-proof-prompt-title">Payment Proof Submitted</h2>
        <p className={styles.subtitle}>Payment proof was submitted. Review the order and proof before releasing the order.</p>
        <section className={styles.orderSummary}>
          <button type="button" className={styles.summaryToggle} aria-expanded={summaryOpen} aria-controls={summaryId} onClick={() => setSummaryOpen(open => !open)}>
            <span><i className="fa-solid fa-clipboard-list" aria-hidden="true" /> Order Summary</span>
            <i className={`fa-solid ${summaryOpen ? "fa-chevron-up" : "fa-chevron-down"}`} aria-hidden="true" />
          </button>
          {summaryOpen && <div className={styles.summaryRows} id={summaryId}>
            <div className={styles.summaryRow}><span><i className="fa-solid fa-hashtag" aria-hidden="true" />Order ID</span><strong>{order.orderId}</strong></div>
            <div className={styles.summaryRow}><span><i className="fa-solid fa-credit-card" aria-hidden="true" />Payment Method</span><strong>{order.paymentMethod}</strong></div>
            {summaryRows.map((row, index) => <div key={`${row.label}-${index}`} className={`${styles.summaryRow} ${row.total ? styles.summaryTotal : ""} ${row.tone === "negative" ? styles.summaryNegative : ""} ${row.tone === "positive" || row.tone === "received" ? styles.summaryPositive : ""}`}>
              <span><i className={`fa-solid ${row.icon}`} aria-hidden="true" />{row.label}</span><strong>{row.value}</strong>
            </div>)}
          </div>}
        </section>
        {orders.length > 1 && <p className={styles.queueNote}>{orders.length - 1} more payment proof{orders.length > 2 ? "s" : ""}</p>}
        <button type="button" className={styles.viewButton} onClick={viewOrder} autoFocus>
          Release Order <i className="fa-solid fa-arrow-right" aria-hidden="true" />
        </button>
      </section>
    </div>
  );
}
