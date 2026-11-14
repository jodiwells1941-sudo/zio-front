"use client";

import { getLocalTrades, getTrade, updateTradeStatus } from "@/app/api/trade";
import { getTradeEcho } from "@/utils/tradeEcho";
import { getUserInfo } from "@/utils/auth";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import styles from "./IncomingLocalOrderPrompt.module.css";
import { localOrderSummaryRows } from "@/app/dashboard/local-buy-sell/localOrderSummary";

interface Party {
  id?: number;
  name?: string;
}

interface IncomingLocalOrder {
  id: number;
  order_id?: string;
  type: "buy" | "sell";
  status: number;
  status_list?: number[];
  is_ad_owner?: boolean;
  created_by?: number;
  user_price?: number;
  payable_amount?: number;
  receivable_amount?: number;
  bonus_amount?: number | string | null;
  bonus_percent?: number | string | null;
  charge_amount?: number | string | null;
  charge_percent?: number | string | null;
  client?: Party | null;
  customer?: Party | null;
  p2p_ad?: {
    asset?: string;
    with_fiat?: string;
    payment_time_limit?: number;
    payment_method?: {
      sell_method?: { name?: string } | null;
    } | null;
  } | null;
}

interface IncomingLocalOrderEvent {
  order_id?: number | string;
  p2p_order_id?: number | string;
  data?: {
    order_id?: number | string;
    p2p_order_id?: number | string;
  };
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const formatAmount = (value: number | undefined, currency: string) =>
  `${Number(value ?? 0).toLocaleString("en-US", { maximumFractionDigits: 4 })} ${currency}`;

const playIncomingOrderSound = async () => {
  try {
    const audioWindow = window as Window & { webkitAudioContext?: typeof AudioContext };
    const AudioContextCtor = window.AudioContext || audioWindow.webkitAudioContext;
    if (!AudioContextCtor) return;

    const context = new AudioContextCtor();
    await context.resume();
    const now = context.currentTime;
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(880, now);
    oscillator.frequency.setValueAtTime(1174, now + 0.12);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.18, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.42);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.45);
    oscillator.addEventListener("ended", () => void context.close(), { once: true });
  } catch {
    // Browsers may block audio until the user interacts with the page.
  }
};

const showIncomingOrderNotification = (order: IncomingLocalOrder) => {
  if (!("Notification" in window)) return;

  const show = () => {
    if (Notification.permission !== "granted") return;
    const notification = new Notification("New local order", {
      body: `${order.type === "buy" ? "Buy" : "Sell"} request ${order.order_id || `#${order.id}`} is waiting for your approval.`,
      tag: `local-order-${order.id}`,
      icon: "/favicon.ico",
    });
    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  };

  if (Notification.permission === "default") {
    void Notification.requestPermission().then(show).catch(() => undefined);
  } else {
    show();
  }
};

export default function IncomingLocalOrderPrompt() {
  const router = useRouter();
  const [orders, setOrders] = useState<IncomingLocalOrder[]>([]);
  const [busy, setBusy] = useState(false);
  const [copiedOrderId, setCopiedOrderId] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const activeUserId = useRef<number | null>(null);
  const dismissedOrderIds = useRef<Set<number>>(new Set());
  const seenOrderIds = useRef<Set<number>>(new Set());
  const loadingOrderIds = useRef<Set<number>>(new Set());

  useEffect(() => {
    if (!("Notification" in window) || Notification.permission !== "default") return;

    const enableNotifications = () => {
      void Notification.requestPermission().catch(() => undefined);
    };

    // Browsers require a user gesture before allowing notification permission.
    window.addEventListener("pointerdown", enableNotifications, { once: true });
    return () => window.removeEventListener("pointerdown", enableNotifications);
  }, []);

  useEffect(() => {
    const syncUser = () => {
      const id = Number(getUserInfo()?.id);
      const nextUserId = Number.isSafeInteger(id) && id > 0 ? id : null;

      if (activeUserId.current !== nextUserId) {
        activeUserId.current = nextUserId;
        dismissedOrderIds.current.clear();
        seenOrderIds.current.clear();
        loadingOrderIds.current.clear();
        setOrders([]);
        setBusy(false);
      }
      setUserId(nextUserId);
    };

    syncUser();
    window.addEventListener("authStateChanged", syncUser);
    window.addEventListener("storage", syncUser);
    // The login flow can complete in another route before this root client
    // component hydrates. Re-read localStorage briefly so userId is never
    // stuck at null when the auth event was missed.
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

    const handleIncomingOrder = async (event: IncomingLocalOrderEvent, attempt = 0, announce = true) => {
      const id = Number(
        event?.order_id ??
        event?.p2p_order_id ??
        event?.data?.order_id ??
        event?.data?.p2p_order_id
      );
      if (!Number.isSafeInteger(id) || id < 1) return;
      if (dismissedOrderIds.current.has(id)) return;
      if (loadingOrderIds.current.has(id)) return;
      loadingOrderIds.current.add(id);

      // Reverb can retry/deliver the same event more than once. Keep the
      // popup queue idempotent and fetch the authorized, complete order view.
      try {
        const response = await getTrade(id);
        const order = response?.data as IncomingLocalOrder | undefined;
        if (!active || !order || Number(order.id) !== id || Number(order.status) !== 1) return;

        const isNewOrder = !seenOrderIds.current.has(id);
        seenOrderIds.current.add(id);
        setOrders(current => current.some(item => item.id === id) ? current : [...current, order]);
        if (announce && isNewOrder) {
          void playIncomingOrderSound();
          showIncomingOrderNotification(order);
        }
      } catch (error) {
        // The event is emitted after commit, but a short retry handles a
        // transient API/auth race without losing the incoming request.
        if (attempt < 3) {
          window.setTimeout(() => {
            if (active) void handleIncomingOrder(event, attempt + 1, announce);
          }, 750);
        }
        if (process.env.NODE_ENV === "development") {
          console.warn("Could not load incoming local order", id, error);
        }
      } finally {
        loadingOrderIds.current.delete(id);
      }
    };

    // Recover orders created while this layout was loading (or while the
    // websocket was disconnected). This also makes the popup work without a
    // websocket connection as long as the authenticated API is available.
    const loadPendingOrders = async () => {
      try {
        const response = await getLocalTrades({ page: 1 });
        const page = response?.data;
        const rows = Array.isArray(page)
          ? page
          : isRecord(page) && Array.isArray(page.data)
            ? page.data
            : [];
        const pendingOwnerOrders = rows.filter(isRecord).filter(row =>
          row.record_kind !== "ad" &&
          Number(row.status) === 1 &&
          (row.isCustomer === true || row.is_customer === true)
        );

        for (const row of pendingOwnerOrders) {
          if (!active) break;
          await handleIncomingOrder({ order_id: Number(row.id) });
        }
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.warn("Could not load pending local orders", error);
        }
      }
    };

    void loadPendingOrders();
    // Keep a small safety net for deployments where Reverb is temporarily
    // unavailable or the event was emitted before this root layout mounted.
    const pendingPoll = window.setInterval(() => {
      if (active) void loadPendingOrders();
    }, 5000);

    const echo = getTradeEcho();
    if (!echo) {
      console.error(
        "Incoming local-order alerts are disabled: NEXT_PUBLIC_REVERB_APP_KEY is not configured."
      );
      return () => {
        active = false;
        window.clearInterval(pendingPoll);
      };
    }

    const ownerChannelName = `local-order-owner.${userId}`;
    const userChannelName = `user.${userId}`;
    const ownerChannel = echo.private(ownerChannelName);
    const userChannel = echo.private(userChannelName);

    ownerChannel.subscribed(() => {
      if (process.env.NODE_ENV === "development") {
        console.log(`Subscribed to incoming local-order alerts for user ${userId}.`);
      }
    });
    ownerChannel.error((error: unknown) => {
      console.error("Could not subscribe to incoming local-order alerts:", error);
    });
    ownerChannel.listen(".p2p-local-order.created", handleIncomingOrder);
    userChannel.listen(".p2p-orders-list.updated", handleIncomingOrder);
    return () => {
      active = false;
      window.clearInterval(pendingPoll);
      ownerChannel.stopListening(".p2p-local-order.created", handleIncomingOrder);
      userChannel.stopListening(".p2p-orders-list.updated", handleIncomingOrder);
      echo.leave(ownerChannelName);
      echo.leave(userChannelName);
    };
  }, [userId]);

  const openOrderDetails = (order: IncomingLocalOrder) => {
    // Do not reveal another queued prompt while the details page is loading.
    dismissedOrderIds.current.add(order.id);
    setOrders([]);
    setBusy(false);

    const view = order.type === "buy" ? "sell-view" : "buy-view";
    router.push(`/dashboard/local-buy-sell/my-orders/${view}?trade_id=${order.id}`);
  };

  const copyOrderId = async (orderId: string) => {
    try {
      await navigator.clipboard.writeText(orderId);
      setCopiedOrderId(true);
      window.setTimeout(() => setCopiedOrderId(false), 1200);
    } catch {
      // Clipboard access is optional; the order ID remains visible to copy manually.
    }
  };

  const handleStatus = async (status: 2 | 3) => {
    const currentOrder = orders[0];
    if (!currentOrder || busy) return;

    setBusy(true);
    try {
      await updateTradeStatus(currentOrder.id, status);
      toast.success(status === 2 ? "Order accepted." : "Order cancelled.");
      openOrderDetails(currentOrder);
    } catch (error) {
      console.error(`Failed to ${status === 2 ? "accept" : "cancel"} incoming order ${currentOrder.id}:`, error);
      toast.error(
        isRecord(error) &&
          isRecord(error.response) &&
          isRecord(error.response.data) &&
          typeof error.response.data.message === "string"
          ? error.response.data.message
          : `Could not ${status === 2 ? "accept" : "cancel"} this order. Please try again.`
      );
      setBusy(false);
    }
  };

  const handleDismiss = () => {
    const order = orders[0];
    if (!order || busy) return;

    dismissedOrderIds.current.add(order.id);
    setOrders([]);
    setBusy(false);
  };

  const order = orders[0];
  if (!order) return null;

  const fiat = order.p2p_ad?.with_fiat ?? "";
  const rawAsset = order.p2p_ad?.asset ?? "USD";
  const asset = rawAsset.toUpperCase() === "USDT" ? "USD" : rawAsset;
  const orderNumber = order.order_id || `#${order.id}`;
  const paymentMethod = order.p2p_ad?.payment_method?.sell_method?.name || "Payment method";
  const baseAssetAmount = Number(order.receivable_amount ?? 0);
  const bonusAmount = Number(order.bonus_amount ?? 0);
  const feeAmount = Number(order.charge_amount ?? 0);
  const adjustmentAmount = order.type === "buy" ? feeAmount : bonusAmount;
  const totalAssetLabel = order.type === "buy" ? "Sell USD" : "Received USD";
  const summaryRows = localOrderSummaryRows({
    side: order.type === "buy" ? "sell" : "buy",
    fiat,
    asset,
    fiatAmount: Number(order.payable_amount ?? 0),
    assetAmount: baseAssetAmount,
    price: Number(order.user_price ?? 0),
    bonusAmount,
    feeAmount,
    feePercent: Number(order.charge_percent ?? 0),
  });
  const creator = [order.client, order.customer].find(
    party => Number(party?.id) === Number(order.created_by)
  );
  const action = order.type === "buy" ? "Sell" : "Deposit";

  return (
    <div className={styles.overlay}>
      <section
        className={`${styles.modal} ${order.type === "sell" ? styles.sellOrder : styles.buyOrder}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="incoming-local-order-title"
      >
        <button
          type="button"
          className={styles.closeButton}
          onClick={handleDismiss}
          disabled={busy}
          aria-label="Close incoming order notification"
          title="Close"
        >
          <i className="fa-solid fa-xmark" aria-hidden="true" />
        </button>
        <header className={styles.header}>
          <div className={styles.icon} aria-hidden="true">
            <i className="fa-solid fa-bell" />
            <span className={styles.iconPulse} />
          </div>
          <div className={styles.headerCopy}>
            <h2 id="incoming-local-order-title">Accept {action} Request </h2>
            <p className={styles.subtitle}>
              {creator?.name || "A user"} placed an order on your local ad.
            </p>
          </div>
        </header>

        <div className={`${styles.totalBanner} ${order.type === "buy" ? styles.buyTotalBanner : styles.sellTotalBanner}`}>
          <span className={styles.totalIcon}><i className="fa-solid fa-hand-holding-dollar" aria-hidden="true" /></span>
          <span className={`fs-5 fw-bold ${order.type === "buy" ? 'text-warning' : 'text-danger'}`}>
            {order.type === "buy" ? "Received Amount" : "Pay Amount"}
          </span>
          <strong className={`fs-4 fw-bold ${order.type === "buy" ? 'text-warning' : 'text-danger'}`}>
            {formatAmount(order.payable_amount, fiat)}
          </strong>
        </div>

        <details key={order.id} className={styles.orderSummary} aria-label="Order summary">
          <summary className={styles.summaryHeading}>
            <strong>Order Summary</strong>
            <i className="fa-solid fa-chevron-down" aria-hidden="true" />
          </summary>
          <div className={styles.summaryRows}>
            <div className={styles.summaryRow}>
              <span>Order ID</span>
              <strong className={styles.orderIdValue}>
                {orderNumber}
                <button
                  type="button"
                  className={styles.copyButton}
                  onClick={() => void copyOrderId(orderNumber)}
                  aria-label="Copy order ID"
                  title="Copy order ID"
                >
                  <i className={`fa-regular ${copiedOrderId ? "fa-circle-check" : "fa-copy"}`} aria-hidden="true" />
                </button>
              </strong>
            </div>
            {summaryRows.map(row => (
              <div className={`${styles.summaryRow} ${row.total ? styles.summaryTotal : ""}`} key={row.label}>
                <span>{row.label}</span>
                <strong className={row.tone === "negative" ? styles.feeValue : row.tone === "positive" ? styles.bonusValue : row.tone === "received" ? styles.receivedValue : undefined}>{row.value}</strong>
              </div>
            ))}
            
          </div>
        </details>
        
        <div className={styles.totalBanner}>
          <span className={styles.totalIcon}><i className="fa-solid fa-hand-holding-dollar" aria-hidden="true" /></span>
          <span className="fw-bold">{totalAssetLabel}</span>
          <strong>{order.type === "buy" ? "- " : "+"} {formatAmount(baseAssetAmount+adjustmentAmount, asset)}</strong>
        </div>

        <div className={styles.paymentCard}>
          <span className={styles.paymentIcon}><i className="fa-solid fa-building-columns" aria-hidden="true" /></span>
          <div>
            <strong>{paymentMethod}</strong>
            <small>{fiat || "Local currency"} payment details</small>
          </div>
        </div>

        <div className={styles.timeLimit}>
          <span>Order Time Limit</span>
          <strong>{order.p2p_ad?.payment_time_limit ?? "—"}{order.p2p_ad?.payment_time_limit ? " Min" : ""}</strong>
        </div>

        {orders.length > 1 && (
          <p className={styles.queueNote}>
            <i className="fa-solid fa-layer-group" /> {orders.length - 1} more request{orders.length - 1 === 1 ? "" : "s"} waiting
          </p>
        )}

        <div className={styles.actions}>
          <button type="button" className={`${styles.button} ${styles.cancel}`} disabled={busy} onClick={() => void handleStatus(3)}>
            <i className="fa-solid fa-xmark" />
            Cancel Request
          </button>
          <button type="button" className={`${styles.button} ${styles.accept}`} disabled={busy} onClick={() => void handleStatus(2)}>
            <i className={busy ? "fa-solid fa-spinner fa-spin" : "fa-solid fa-check"} />
            {busy ? "Processing…" : "Accept Request"}
          </button>
        </div>
      </section>
    </div>
  );
}
