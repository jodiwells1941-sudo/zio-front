"use client";

import { getLocalMyTrades, updateTradeStatus } from "@/app/api/trade";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import Swal from "sweetalert2";
import { getUserInfo } from "@/utils/auth";
import { getTradeEcho } from "@/utils/tradeEcho";
import QuickBuyModal from "../create-ad/QuickBuyModal";
import QuickSellModal from "../create-ad/QuickSellModal";
import OrderUnreadBadge from "../my-orders/OrderUnreadBadge";
import OrderStatusWithTimer from "../my-orders/OrderStatusWithTimer";
import { formatRelativeTime, STATUS_OPTIONS, type OrderSideFilter, type OrderStatusFilter } from "../my-orders/orderListUi";
import '../my-orders/myOrders.css';

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
  created_at?: string | null;
  orderNumber: string;
  price: string;
  cryptoAmount: string;
  cryptoValue: string;
  counterparty: string;
  unread_messages_count?: number;
  pending_time_limit?: string | null;
  payment_expires_at?: string | null;
  status: number;
  status_text: string;
  isCustomer: boolean;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

// ─── Component ────────────────────────────────────────────────────────────────

export default function Page() {
  const [trades,    setTrades]    = useState<Trade[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [syncing,   setSyncing]   = useState(false);
  const [activeTab, setActiveTab] = useState<OrderSideFilter>('all');
  const [statusFilter, setStatusFilter] = useState<OrderStatusFilter>('all');
  const [requestModal, setRequestModal] = useState<'buy' | 'sell' | null>(null);
  const [nowMs, setNowMs] = useState(0);

  useEffect(() => {
    setNowMs(Date.now());
    const timer = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  // Filters
  const [search,   setSearch]   = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate,   setToDate]   = useState("");
  const [appliedFilters, setAppliedFilters] = useState({ search: '', fromDate: '', toDate: '' });

  // Pagination
  const [page,     setPage]     = useState(1);
  const [lastPage, setLastPage] = useState(1);

  // ─── Fetch ──────────────────────────────────────────────────────────────────

  const fetchTrades = useCallback(async (silent = false) => {
    try {
      if (silent) setSyncing(true);
      else setLoading(true);

      const params = {
        page,
        ...(activeTab !== 'all' ? { side: activeTab } : {}),
        ...(statusFilter !== 'all' ? { status: statusFilter } : {}),
        ...(appliedFilters.search ? { search: appliedFilters.search } : {}),
        ...(appliedFilters.fromDate ? { from_date: appliedFilters.fromDate } : {}),
        ...(appliedFilters.toDate ? { to_date: appliedFilters.toDate } : {}),
      };

      const res = await (getLocalMyTrades as (args?: Record<string, string | number>) => Promise<unknown>)(params);

      const payload = isRecord(res) ? res.data : null;
      const paginated = isRecord(payload) ? payload : null;
      const rows = Array.isArray(payload) ? payload : paginated?.data;
      setTrades(Array.isArray(rows) ? rows as Trade[] : []);
      setLastPage(typeof paginated?.last_page === 'number' ? paginated.last_page : 1);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  }, [page, activeTab, statusFilter, appliedFilters]);

  useEffect(() => {
    void fetchTrades();
  }, [fetchTrades]);

  useEffect(() => {
    const uid = Number(getUserInfo()?.id);
    if (!Number.isFinite(uid) || uid < 1) return;

    const channel = getTradeEcho()?.private(`chat-user.${uid}`);
    const refresh = () => { void fetchTrades(true); };
    const onMessage = (payload: { data?: { sender_id?: number } }) => {
      if (payload.data && Number(payload.data.sender_id) !== uid) refresh();
    };
    channel?.listen('.p2p-order-message.update', onMessage);
    window.addEventListener('trade-chat-read', refresh);
    window.addEventListener('focus', refresh);
    const poll = window.setInterval(() => {
      if (!document.hidden) refresh();
    }, 30000);

    return () => {
      channel?.stopListening('.p2p-order-message.update', onMessage);
      window.removeEventListener('trade-chat-read', refresh);
      window.removeEventListener('focus', refresh);
      window.clearInterval(poll);
    };
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
    setPage(1);
    setAppliedFilters({ search: search.trim(), fromDate, toDate });
  };

  const resetFilter = () => {
    setSearch("");
    setFromDate("");
    setToDate("");
    setPage(1);
    setActiveTab('all');
    setStatusFilter('all');
    setAppliedFilters({ search: '', fromDate: '', toDate: '' });
  };

  // ─── Sync button ─────────────────────────────────────────────────────────────

  const handleSync = () => fetchTrades(true);
  const handleRequestCreated = () => {
    setPage(1);
    if (page === 1) void fetchTrades(true);
  };

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
    } catch (error) {
      const e = error as { response?: { data?: { message?: string } } };
      Swal.fire("Error!", e?.response?.data?.message ?? "Failed to update.", "error");
    }
  };

  // ─── Client-side tab filter ───────────────────────────────────────────────────

  const filteredTrades = trades;

  // ─── Action buttons per status ────────────────────────────────────────────────

  const renderActions = (trade: Trade) => {
    const sl = trade.status_list ?? [];
    const viewLink = (
      <Link
        className="btn btn-info btn-sm"
        href={getTradeDetailsPath(trade)}
        aria-label={`View order ${trade.orderNumber}`}
      >
        View
      </Link>
    );

    // Status 1 (Pending) → Approve / Reject when backend allows this user
    if (trade.status === 1) {
      const canApr = sl.includes(2);
      const canRej = sl.includes(3);
      if (!canApr && !canRej) {
        return viewLink;
      }
      return (
        <div className="d-flex gap-1 flex-wrap">
          {viewLink}
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
        return viewLink;
      }
      return (
        <div className="d-flex gap-1 flex-wrap">
          {viewLink}
          <button
            className="btn btn-primary btn-sm"
            type="button"
            onClick={() => handleStatusUpdate(trade, 6, 'Complete')}
          >
            Complete
          </button>
        </div>
      );
    }

    return viewLink;
  };

  /**
   * Fiat payer after approve uses P2PTransferCard (`/local-buy-sell/my-orders/buy-view`).
   * Crypto seller / fiat receiver for release step uses BuyerPaymentCard (`/wallet/sell`).
   */
  const getTradeDetailsPath = (trade: Trade) => {
    const side = trade.order_side;
    if (side === 'buy' || side === 'sell') {
      const useP2p =
        (side === 'buy' && !trade.isCustomer) || (side === 'sell' && trade.isCustomer);
      return useP2p
        ? `/dashboard/local-buy-sell/my-orders/buy-view?trade_id=${trade.id}`
        : `/dashboard/local-buy-sell/my-orders/sell-view?trade_id=${trade.id}`;
    }
    if (trade?.isCustomer && trade.type === 'Sell') return `/dashboard/local-buy-sell/my-orders/buy-view?trade_id=${trade.id}`;
    if (trade?.isCustomer && trade.type === 'Buy') return `/dashboard/local-buy-sell/my-orders/sell-view?trade_id=${trade.id}`;
    if (!trade?.isCustomer && trade.type === 'Buy') return `/dashboard/local-buy-sell/my-orders/buy-view?trade_id=${trade.id}`;
    return `/dashboard/local-buy-sell/my-orders/sell-view?trade_id=${trade.id}`;
  };

  // ─── Copy helper ─────────────────────────────────────────────────────────────

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // ─── Render ───────────────────────────────────────────────────────────────────  

  return (
    <div className="local-orders-page local-requests-page">
      <div className="local-orders-heading">
        <span className="local-orders-heading-icon" aria-hidden="true"><i className="fa-solid fa-paper-plane" /></span>
        <div>
          <span className="local-orders-eyebrow">LOCAL MARKETPLACE</span>
          <h1>My Requests</h1>
          <p>Review the requests you sent and follow each trade.</p>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className="trades-toolbar">
        <div className="trades-filter-tabs">
          {(['all', 'buy', 'sell'] as OrderSideFilter[]).map(tab => (
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
            className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
            type="button"
            onClick={handleSync}
            disabled={syncing}
            title="Refresh trades"
          >
            <i className={`fa-solid fa-rotate-right ${syncing ? 'fa-spin' : ''}`} />
            <span className="d-none d-md-inline">{syncing ? 'Syncing...' : 'Sync'}</span>
          </button>

          <button type="button" className="local-orders-create local-orders-create--buy" onClick={() => setRequestModal('buy')}>
            <i className="fa-solid fa-plus" aria-hidden="true" /> Create Buy Request
          </button>
          <button type="button" className="local-orders-create local-orders-create--sell" onClick={() => setRequestModal('sell')}>
            <i className="fa-solid fa-plus" aria-hidden="true" /> Create Sell Request
          </button>
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

        <select
          className="form-control-custom local-orders-status-select"
          aria-label="Filter by order status"
          value={statusFilter}
          onChange={event => { setStatusFilter(event.target.value as OrderStatusFilter); setPage(1); }}
        >
          {STATUS_OPTIONS.filter(option => option.value !== 'no_order').map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>

        <button className="btn btn-primary btn-sm" onClick={handleFilter}>
          Filter
        </button>

        <button className="btn-reset" type="button" onClick={resetFilter}>
          Reset
        </button>
      </div>

      {/* ── Desktop Table ── */}
      {loading ? (
        <p className="text-center py-5">Loading...</p>
      ) : filteredTrades.length === 0 ? (
        <p className="text-center py-5 text-warning">No trades found.</p>
      ) : (
        <>
          <div className="d-none d-md-block local-orders-table-wrap">
            <table className="trades-table">
              <thead>
                <tr>
                  <th>Type / Date</th>
                  <th>Order Number</th>
                  <th>Price</th>
                  <th>Fiat / Crypto Amount</th>
                  <th>Counterparty</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredTrades.map(trade => {
                  return (
                    <tr key={trade.id}>

                      {/* Type / Date */}
                      <td className="trade-type-date">
                        <span className={trade.type === 'Buy' ? 'trade-type-buy' : 'trade-type-sell'}>
                          {trade.type} {trade.asset}
                        </span>
                        <time className="trade-date" dateTime={trade.created_at ?? undefined} title={trade.created_at ?? trade.date}>{formatRelativeTime(trade, nowMs)}</time>
                      </td>

                      {/* Order Number */}
                      <td>
                        <div className="trade-order-cell">

                          <Link href={getTradeDetailsPath(trade)} className="trade-link ms-2">
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
                        </div>
                      </td>
                      
                      {/* Price */}
                      <td>{trade.price}</td>

                      {/* Fiat / Crypto */}
                      <td>
                        <div>{trade.cryptoAmount}</div>
                        <div className="trade-crypto-sub">{trade.cryptoValue}</div>
                      </td>

                      {/* Counterparty */}
                      <td>
                        <div className="trade-counterparty-cell">
                          <Link href={`/dashboard/local-buy-sell/chat-list?trade_id=${trade.id}`} className="trade-link">
                            {trade.counterparty}
                            <span className="trade-chat-icon">
                              <i className="fa-regular fa-comment" />
                            </span>
                            <OrderUnreadBadge count={trade.unread_messages_count} />
                          </Link>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="trade-status-cell">
                        <OrderStatusWithTimer trade={trade} nowMs={nowMs} />
                      </td>

                      {/* Action — driven by status_list so approve/reject match detail API */}
                      <td>{renderActions(trade)}</td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ── Mobile Cards ── */}
          <div className="d-md-none">
            {filteredTrades.map(trade => {
              return (
                <div className="card local-order-card mb-3" key={trade.id}>

                  <div className="d-flex justify-content-between align-items-center">
                    <span className={trade.type === 'Sell' ? 'trade-type-sell' : 'trade-type-buy'}>
                      {trade.type}{' '}
                      <span className="text-white fw-7 text-xs">{trade.asset}</span>
                    </span>
                    <OrderStatusWithTimer trade={trade} nowMs={nowMs} />
                  </div>

                  <div className="d-flex justify-content-between mt-3">
                    <span className="text-white-50">Amount</span>
                    <span>{trade.cryptoAmount}</span>
                  </div>

                  <div className="d-flex justify-content-between mt-3">
                    <span className="text-white-50">Price</span>
                    <span>{trade.price}</span>
                  </div>

                  <div className="d-flex justify-content-between mt-3">
                    <span className="text-white-50">Total Quantity</span>
                    <span>{trade.cryptoValue}</span>
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
                      <Link href={`/dashboard/local-buy-sell/chat-list?trade_id=${trade.id}`} className="text-xs text-white-50">
                        {trade.counterparty}
                      </Link>
                      <Link href={`/dashboard/local-buy-sell/chat-list?trade_id=${trade.id}`} className="trade-chat-icon" aria-label={`Open chat with ${trade.counterparty}`}>
                        <i className="fa-solid fa-message text-white" />
                        <OrderUnreadBadge count={trade.unread_messages_count} />
                      </Link>
                    </div>
                    <time className="trade-date" dateTime={trade.created_at ?? undefined} title={trade.created_at ?? trade.date}>{formatRelativeTime(trade, nowMs)}</time>
                  </div>

                  {/* Mobile action buttons */}
                  <div className="mt-3">{renderActions(trade)}</div>

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

      {requestModal === 'buy' && (
        <QuickBuyModal onClose={() => setRequestModal(null)} onSuccess={handleRequestCreated} />
      )}
      {requestModal === 'sell' && (
        <QuickSellModal onClose={() => setRequestModal(null)} onSuccess={handleRequestCreated} />
      )}

    </div>
  );
}
