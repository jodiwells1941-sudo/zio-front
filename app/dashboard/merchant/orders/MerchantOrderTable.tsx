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
  const { status, type } = trade;
  switch (status) {
    case 1:  return {
      text: type === "Sell" ? "Waiting for seller to release crypto" : "Pending",
      className: "trade-status-pending",
    };
    case 2:  return { text: "Approved",           className: "trade-status-approved"  };
    case 3:  return { text: "Cancelled",          className: "trade-status-cancelled" };
    case 4:  return { text: "Rej. Balance",       className: "trade-status-cancelled" };
    case 5:  return { text: "Paid",               className: "trade-status-progress"  };
    case 6:  return { text: "Dispatch Approved",  className: "trade-status-progress"  };
    case 7:  return { text: "Dispatch Rejected",  className: "trade-status-cancelled" };
    case 8:  return { text: "Dispatch Timeout",   className: "trade-status-cancelled" };
    case 9:  return { text: "Completed",          className: "trade-status-completed" };
    case 10: return { text: "Claimed",            className: "trade-status-completed" };
    default: return { text: "Unknown",            className: ""                       };
  }
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function MerchantOrderTable() {
  const [trades,    setTrades]    = useState<Trade[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [syncing,   setSyncing]   = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('all');

  // Filters
  const [search,   setSearch]   = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate,   setToDate]   = useState("");

  // Pagination
  const [page,     setPage]     = useState(1);
  const [lastPage, setLastPage] = useState(1);

  // ─── Fetch ──────────────────────────────────────────────────────────────────

  const fetchTrades = useCallback(async (silent = false) => {
    try {
      silent ? setSyncing(true) : setLoading(true);

      const params = {
        page,
        ...(search   ? { search }    : {}),
        ...(fromDate ? { from_date: fromDate } : {}),
        ...(toDate   ? { to_date: toDate }     : {}),
      };

      const res = await (getMerchantOrders as (args?: Record<string, string | number>) => Promise<unknown>)(params);

      const paginated = (res as any)?.data;
      setTrades(paginated?.data ?? paginated ?? []);
      setLastPage(paginated?.last_page ?? 1);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  }, [page, search, fromDate, toDate]);

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
    setPage(1);
    fetchTrades();
  };

  const resetFilter = () => {
    setSearch("");
    setFromDate("");
    setToDate("");
    setPage(1);
    fetchTrades();
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

  const filteredTrades = trades.filter(t => {
    if (activeTab === 'completed') return t.status === 9 || t.status === 10;
    if (activeTab === 'cancelled') return t.status === 3 || t.status === 4 || t.status === 7 || t.status === 8;
    if (activeTab === 'buy') {
      return t.order_side === 'buy' || (!t.order_side && t.type === 'Buy');
    }
    if (activeTab === 'sell') {
      return t.order_side === 'sell' || (!t.order_side && t.type === 'Sell');
    }
    return true;
  });

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

    return <span className="text-muted text-reset">—</span>;
  };

  /**
   * Fiat payer after approve uses P2PTransferCard (`/wallet/p2p`).
   * Crypto seller / fiat receiver for release step uses BuyerPaymentCard (`/wallet/sell`).
   */
  const getTradeDetailsPath = (trade: Trade) => {
    const side = trade.order_side;
    if (side === 'buy' || side === 'sell') {
      const useP2p =
        (side === 'buy' && !trade.isCustomer) || (side === 'sell' && trade.isCustomer);
      return useP2p
        ? `/dashboard/wallet/p2p?trade_id=${trade.id}`
        : `/dashboard/wallet/sell?trade_id=${trade.id}`;
    }
    if (trade?.isCustomer && trade.type === 'Sell') return `/dashboard/wallet/p2p?trade_id=${trade.id}`;
    if (trade?.isCustomer && trade.type === 'Buy') return `/dashboard/wallet/sell?trade_id=${trade.id}`;
    if (!trade?.isCustomer && trade.type === 'Buy') return `/dashboard/wallet/p2p?trade_id=${trade.id}`;
    return `/dashboard/wallet/sell?trade_id=${trade.id}`;
  };

  // ─── Copy helper ─────────────────────────────────────────────────────────────

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // ─── Render ───────────────────────────────────────────────────────────────────  

  return (
    <div>

      {/* ── Toolbar ── */}
      <div className="trades-toolbar">
        <div className="trades-filter-tabs">
          {(['all', 'completed', 'cancelled', 'buy', 'sell'] as ActiveTab[]).map(tab => (
            <button
              key={tab}
              className={`filter-tab-btn ${activeTab === tab ? 'active' : ''}`}
              type="button"
              onClick={() => setActiveTab(tab)}
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
          <Link href="/dashboard/ads" className="btn btn-warning btn-sm d-flex align-items-center gap-1">
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
      {loading ? (
        <p className="text-center py-5">Loading...</p>
      ) : filteredTrades.length === 0 ? (
        <p className="text-center py-5 text-muted">No trades found.</p>
      ) : (
        <>
          <div className="d-none d-md-block">
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
                  const statusUI = getStatusUI(trade);
                  return (
                    <tr key={trade.id}>

                      {/* Type / Date */}
                      <td className="trade-type-date">
                        <span className={trade.type === 'Buy' ? 'trade-type-buy' : 'trade-type-sell'}>
                          {trade.type} {trade.asset}
                        </span>
                        <div className="trade-date">{trade.date}</div>
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
                        <div className="trade-receipt">Receipt</div>
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
              const statusUI = getStatusUI(trade);
              return (
                <div className="card mb-4" key={trade.id}>

                  <div className="d-flex justify-content-between align-items-center">
                    <span className={trade.type === 'Sell' ? 'trade-type-sell' : 'trade-type-buy'}>
                      {trade.type}{' '}
                      <span className="text-white fw-7 text-xs">{trade.asset}</span>
                    </span>
                    <span className={statusUI.className}>{statusUI.text}</span>
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
                      <Link href={`/dashboard/chat?trade_id=${trade.id}`} className="text-xs text-white-50">
                        {trade.counterparty}
                      </Link>
                      <span className="trade-chat-icon">
                        <i className="fa-solid fa-message text-white" />
                        <small className="text-black bg-warning px-1 rounded-pill top-0">2</small>
                      </span>
                    </div>
                    <div className="trade-date">{trade.date}</div>
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

    </div>
  );
}