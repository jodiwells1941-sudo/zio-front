"use client";

import { getMerchantOrders, updateTradeStatus } from "@/app/api/trade";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import Swal from "sweetalert2";
import { getUserInfo } from "@/utils/auth";
import { getTradeEcho } from "@/utils/tradeEcho";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Trade {
  id: number;
  type: string;
  /** `p2p_orders.side` — which flow this order is (distinct from list `type`). */
  order_side?: 'buy' | 'sell';
  /** Allowed actions for the current user (e.g. `[2, 3]` when ad owner may approve/reject). */
  status_list?: number[];
  asset: string;
  date: string;
  orderNumber: string;
  price: string;
  merchant_tier?: { bonus_percent: number; charge_percent: number; bonus_usd: number; charge_usd: number } | null;
  cryptoAmount: string;
  cryptoValue: string;
  counterparty: string;
  status: number;
  status_text: string;
  isCustomer: boolean;
}

type ActiveTab = 'all' | 'completed' | 'cancelled' | 'buy' | 'sell';

// ─── Status badge helper ──────────────────────────────────────────────────────

const getStatusUI = (trade: Trade): { text: string; className: string } => {
  const { status } = trade;
  switch (status) {
    case 1:  return { text: "Awaiting review", className: "trade-status-pending" };
    case 2:  return { text: "Approved",           className: "trade-status-approved"  };
    case 3:  return { text: "Rejected",           className: "trade-status-cancelled" };
    case 4:  return { text: "Refunded",           className: "trade-status-cancelled" };
    case 5:  return { text: "Payment sent",       className: "trade-status-progress"  };
    case 6:  return { text: "Payment received",   className: "trade-status-progress"  };
    case 7:  return { text: "Rejected",  className: "trade-status-cancelled" };
    case 8:  return { text: "Cancelled",          className: "trade-status-cancelled" };
    case 9:  return { text: "Completed",          className: "trade-status-completed" };
    case 10: return { text: "Appealed",           className: "trade-status-progress" };
    default: return { text: "Unknown",            className: ""                       };
  }
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function MerchantOrderTable() {
  const [trades,    setTrades]    = useState<Trade[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [syncing,   setSyncing]   = useState(false);
  const [error,     setError]     = useState("");
  const [total,     setTotal]     = useState(0);
  const [activeTab, setActiveTab] = useState<ActiveTab>('all');

  // Filters
  const [search,   setSearch]   = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate,   setToDate]   = useState("");
  const [appliedFilters, setAppliedFilters] = useState({ search: "", fromDate: "", toDate: "" });

  // Pagination
  const [page,     setPage]     = useState(1);
  const [lastPage, setLastPage] = useState(1);

  // ─── Fetch ──────────────────────────────────────────────────────────────────

  const fetchTrades = useCallback(async (silent = false) => {
    try {
      silent ? setSyncing(true) : setLoading(true);
      setError("");

      const params = {
        page,
        ...(activeTab !== 'all' ? { tab: activeTab } : {}),
        ...(appliedFilters.search ? { search: appliedFilters.search } : {}),
        ...(appliedFilters.fromDate ? { from_date: appliedFilters.fromDate } : {}),
        ...(appliedFilters.toDate ? { to_date: appliedFilters.toDate } : {}),
      };

      const res = await (getMerchantOrders as (args?: Record<string, string | number>) => Promise<unknown>)(params);

      const paginated = (res as any)?.data;
      setTrades(paginated?.data ?? paginated ?? []);
      setLastPage(paginated?.last_page ?? 1);
      setTotal(paginated?.total ?? 0);
    } catch (e) {
      console.error(e);
      setError("Could not load merchant orders. Please try again.");
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  }, [page, activeTab, appliedFilters]);

  useEffect(() => {
    void fetchTrades();
  }, [fetchTrades]);

  // Live refresh when a new P2P order is created (Reverb → private user.{id})
  useEffect(() => {
    const me = getUserInfo();
    const uid = me?.id != null ? Number(me.id) : NaN;
    if (!Number.isFinite(uid) || uid < 1) return;

    const echo = getTradeEcho();
    if (!echo) return;

    const channel = echo.private(`user.${uid}`);
    const onListUpdate = () => {
      void fetchTrades(true);
    };
    channel.listen(".p2p-orders-list.updated", onListUpdate);

    return () => {
      channel.stopListening(".p2p-orders-list.updated");
      echo.leave(`user.${uid}`);
    };
  }, [fetchTrades]);

  // ─── Filter / Reset ──────────────────────────────────────────────────────────

  const handleFilter = () => {
    setAppliedFilters({ search: search.trim(), fromDate, toDate });
    setPage(1);
  };

  const resetFilter = () => {
    setSearch("");
    setFromDate("");
    setToDate("");
    setAppliedFilters({ search: "", fromDate: "", toDate: "" });
    setPage(1);
  };

  // ─── Sync button ─────────────────────────────────────────────────────────────

  const handleSync = () => fetchTrades(true);

  // ─── Status update with Swal ─────────────────────────────────────────────────

  const handleStatusUpdate = async (trade: Trade, newStatus: number, label: string) => {
    const result = await Swal.fire({
      title: `${label} Trade?`,
      icon: "warning",
      html: `Are you sure you want to <strong>${label.toLowerCase()}</strong> order <strong>${trade.orderNumber}</strong>?`,
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: `Yes, ${label}!`,
      cancelButtonText: "Cancel",
      confirmButtonColor: newStatus === 3 ? "#dc3545" : "#198754",
      cancelButtonColor: "#6c757d",
    });

    if (!result.isConfirmed) return;

    try {
      await updateTradeStatus(trade.id, newStatus);
      Swal.fire({
        title: "Updated!",
        text: `Trade has been ${label.toLowerCase()}d.`,
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
      fetchTrades(true);
    } catch (e: any) {
      Swal.fire("Error!", e?.response?.data?.message ?? "Failed to update.", "error");
    }
  };

  // ─── Client-side tab filter ───────────────────────────────────────────────────

  const filteredTrades = trades;

  // ─── Action buttons per status ────────────────────────────────────────────────

  const renderActions = (trade: Trade) => {
    const sl = trade.status_list ?? [];

    // Status 1 (Pending) → Approve / Reject when backend allows this user
    if (trade.status === 1) {
      const canApr = sl.includes(2);
      const canRej = sl.includes(3);
      if (!canApr && !canRej) {
        return <span className="text-muted text-reset">—</span>;
      }
      return (
        <div className="d-flex gap-1 flex-wrap">
          {canApr && (
            <button
              className="btn btn-success btn-sm"
              type="button"
              onClick={() => handleStatusUpdate(trade, 2, 'Approve')}
            >
              Approve
            </button>
          )}
          {canRej && (
            <button
              className="btn btn-danger btn-sm"
              type="button"
              onClick={() => handleStatusUpdate(trade, 3, 'Reject')}
            >
              Reject
            </button>
          )}
        </div>
      );
    }

    // Status 5 → release / complete when API allows (or legacy: ad owner row)
    if (trade.status === 5) {
      const canComplete = sl.includes(6) || (sl.length === 0 && trade.isCustomer);
      if (!canComplete) {
        return <span className="text-muted text-reset">—</span>;
      }
      return (
        <button
          className="btn btn-primary btn-sm"
          type="button"
          onClick={() => handleStatusUpdate(trade, 6, 'Complete')}
        >
          Complete
        </button>
      );
    }

    return null;
  };

  /**
   * Fiat payer after approve uses P2PTransferCard (`/wallet/p2p`).
   * Crypto seller / fiat receiver for release step uses BuyerPaymentCard (`/wallet/sell`).
   */
  const getTradeDetailsPath = (trade: Trade) => {
    const side = trade.order_side;
    if (side === 'buy') return `/dashboard/merchant/ads/sell?trade_id=${trade.id}`;
    if (side === 'sell') return `/dashboard/merchant/ads/p2p?trade_id=${trade.id}`;
    if (trade?.isCustomer && trade.type === 'Sell') return `/dashboard/merchant/ads/p2p?trade_id=${trade.id}`;
    if (trade?.isCustomer && trade.type === 'Buy') return `/dashboard/merchant/ads/sell?trade_id=${trade.id}`;
    if (!trade?.isCustomer && trade.type === 'Buy') return `/dashboard/merchant/ads/p2p?trade_id=${trade.id}`;
    return `/dashboard/merchant/ads/sell?trade_id=${trade.id}`;
  };

  // ─── Copy helper ─────────────────────────────────────────────────────────────

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // ─── Render ───────────────────────────────────────────────────────────────────  

  return (
    <div className="merchant-orders-list">
      <div className="merchant-orders-overview"><div><span className="merchant-orders-overview-icon"><i className="fa-solid fa-layer-group" aria-hidden="true" /></span><div><strong>Orders on your merchant ads</strong><small>Review requests, track payments, and open order details.</small></div></div><span className="merchant-orders-count">{total} {total === 1 ? "order" : "orders"}</span></div>

      {/* ── Toolbar ── */}
      <div className="trades-toolbar">
        <div className="trades-filter-tabs">
          {(['all', 'completed', 'cancelled', 'buy', 'sell'] as ActiveTab[]).map(tab => (
            <button
              key={tab}
              className={`filter-tab-btn ${activeTab === tab ? 'active' : ''}`}
              type="button"
              onClick={() => { setActiveTab(tab); setPage(1); }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div className="trades-actions d-flex gap-2">
          {/* Sync button */}
          <button
            className="btn btn-outline-secondary btn-sm bg-light-white d-flex align-items-center gap-1"
            type="button"
            onClick={handleSync}
            disabled={syncing}
            title="Refresh trades"
          >
            <i className={`fa-solid fa-rotate-right ${syncing ? 'fa-spin' : ''}`} />
            <span className="d-none d-md-inline">{syncing ? 'Syncing...' : 'Sync'}</span>
          </button>

          {/* Create Ad */}
          <Link href="/dashboard/merchant/ads" className="btn btn-warning btn-sm d-flex align-items-center gap-1">
            <i className="fa-solid fa-plus" />
            <span className="d-none d-md-inline">Ads Create</span>
          </Link>
        </div>
      </div>

      {/* ── Filter Bar ── */}
      <div className="trades-filter-bar">
        <div className="filter-date-row">
          <input
            type="date"
            className="form-control-custom filter-date-input"
            value={fromDate}
            onChange={e => setFromDate(e.target.value)}
          />
          <span className="filter-date-arrow">
            <i className="fa-solid fa-arrow-right" />
          </span>
          <input
            type="date"
            className="form-control-custom filter-date-input"
            value={toDate}
            onChange={e => setToDate(e.target.value)}
          />
          <span className="filter-date-icon">
            <i className="fa-regular fa-calendar" />
          </span>
        </div>

        <input
          type="text"
          className="form-control-custom filter-search"
          placeholder="Search order no."
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleFilter()}
        />

        <button className="btn btn-primary btn-sm" onClick={handleFilter}>
          Filter
        </button>

        <button className="btn-reset" type="button" onClick={resetFilter}>
          Reset
        </button>
      </div>

      {/* ── Desktop Table ── */}
      {error && <div className="merchant-orders-error" role="alert">{error} <button type="button" onClick={() => void fetchTrades()}>Retry</button></div>}
      {loading ? (
        <p className="merchant-orders-empty"><i className="fa-solid fa-spinner fa-spin" aria-hidden="true" /> Loading merchant orders…</p>
      ) : filteredTrades.length === 0 ? (
        <p className="merchant-orders-empty"><i className="fa-solid fa-box-open" aria-hidden="true" /> {error ? "Orders are temporarily unavailable." : "No merchant orders found for this view."}</p>
      ) : (
        <>
          <div className="d-none d-lg-block merchant-orders-table-wrap">
            <table className="trades-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Side</th>
                  <th>Amount</th>
                  <th>Price</th>
                  <th>Counterparty</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredTrades.map(trade => {
                  const statusUI = getStatusUI(trade);
                  return (
                    <tr key={trade.id}>

                      {/* Type / Date */}
                      <td><div className="merchant-orders-order-cell"><div className="trade-order-cell"><Link href={getTradeDetailsPath(trade)} className="trade-link">
                            {trade.orderNumber}
                          </Link>
                          <button
                            className="trade-copy-icon"
                            type="button"
                            onClick={() => copyText(trade.orderNumber)}
                            title="Copy order number"
                          >
                            <i className="fa-regular fa-copy" />
                          </button>
                        </div><small>{trade.date}</small></div></td>
                      <td><span className={`merchant-orders-side merchant-orders-side--${trade.order_side ?? "buy"}`}>{trade.order_side === "sell" ? "Buy" : "Sell"} USD</span></td>
                      <td><strong className="merchant-orders-amount">{trade.cryptoValue.replace(/\bUSDT\b/g, "USD")}</strong><small className="merchant-orders-fiat">{trade.cryptoAmount}</small></td>
                      <td>{trade.price}{trade.merchant_tier && <small className="d-block text-white-50">Tier: <span className="text-success">+${Number(trade.merchant_tier.bonus_usd).toFixed(2)} ({trade.merchant_tier.bonus_percent}%)</span> · <span className="text-danger">-${Number(trade.merchant_tier.charge_usd).toFixed(2)} ({trade.merchant_tier.charge_percent}%)</span></small>}</td>

                      {/* Counterparty */}
                      <td>
                        <div className="trade-counterparty-cell">
                          <Link href={`/dashboard/chat?trade_id=${trade.id}`} className="trade-link">
                            {trade.counterparty}
                            <span className="trade-chat-icon">
                              <i className="fa-regular fa-comment" />
                            </span>
                          </Link>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="trade-status-cell">
                        <span className={statusUI.className}>{statusUI.text}</span>
                      </td>

                      {/* Action — driven by status_list so approve/reject match detail API */}
                      <td><div className="merchant-orders-actions"><Link href={getTradeDetailsPath(trade)} className="merchant-order-view">View <i className="fa-solid fa-arrow-up-right-from-square" aria-hidden="true" /></Link>{renderActions(trade)}</div></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ── Mobile Cards ── */}
          <div className="d-lg-none">
            {filteredTrades.map(trade => {
              const statusUI = getStatusUI(trade);
              return (
                <div className="card merchant-order-mobile-card mb-3" key={trade.id}>

                  <div className="d-flex justify-content-between align-items-center">
                    <span className={trade.order_side === 'sell' ? 'trade-type-buy' : 'trade-type-sell'}>
                      {trade.order_side === "sell" ? "Buy" : "Sell"}{' '}
                      <span className="text-white fw-7 text-xs">USD</span>
                    </span>
                    <span className={statusUI.className}>{statusUI.text}</span>
                  </div>

                  <div className="d-flex justify-content-between mt-3">
                    <span className="text-white-50">Fiat amount</span>
                    <span>{trade.cryptoAmount}</span>
                  </div>

                  <div className="d-flex justify-content-between mt-3">
                    <span className="text-white-50">Price</span>
                    <span>{trade.price}</span>
                  </div>
                  {trade.merchant_tier && <div className="d-flex justify-content-between mt-2"><span className="text-white-50">Tier bonus / charge</span><span><span className="text-success">+${Number(trade.merchant_tier.bonus_usd).toFixed(2)}</span> / <span className="text-danger">-${Number(trade.merchant_tier.charge_usd).toFixed(2)}</span></span></div>}

                  <div className="d-flex justify-content-between mt-3">
                    <span className="text-white-50">USD amount</span>
                    <span>{trade.cryptoValue.replace(/\bUSDT\b/g, "USD")}</span>
                  </div>

                  <div className="d-flex justify-content-between mt-3">
                    <span className="text-white-50">Order</span>
                    <div className="trade-order-cell">
                      <Link href={getTradeDetailsPath(trade)} className="text-xs">
                        {trade.orderNumber}
                      </Link>
                      <button
                        className="trade-copy-icon"
                        type="button"
                        onClick={() => copyText(trade.orderNumber)}
                      >
                        <i className="fa-regular fa-copy" />
                      </button>
                    </div>
                  </div>

                  <div className="d-flex justify-content-between mt-3">
                    <div className="trade-counterparty-cell">
                      <Link href={`/dashboard/chat?trade_id=${trade.id}`} className="text-xs text-white-50">
                        {trade.counterparty}
                      </Link>
                      <span className="trade-chat-icon"><i className="fa-solid fa-message text-white" /></span>
                    </div>
                    <div className="trade-date">{trade.date}</div>
                  </div>

                  {/* Mobile action buttons */}
                  <div className="merchant-orders-actions mt-3"><Link href={getTradeDetailsPath(trade)} className="merchant-order-view">View order <i className="fa-solid fa-arrow-up-right-from-square" aria-hidden="true" /></Link>{renderActions(trade)}</div>

                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ── Pagination ── */}
      <div className="d-flex justify-content-center align-items-center mt-4 gap-2">
        <button
          className="btn btn-secondary btn-sm"
          disabled={page === 1}
          onClick={() => setPage(p => p - 1)}
        >
          <i className="fa-solid fa-chevron-left" />
        </button>

        <span className="text-muted small text-reset">Page {page} / {lastPage}</span>

        <button
          className="btn btn-secondary btn-sm"
          disabled={page === lastPage}
          onClick={() => setPage(p => p + 1)}
        >
          <i className="fa-solid fa-chevron-right" />
        </button>
      </div>

    </div>
  );
}
