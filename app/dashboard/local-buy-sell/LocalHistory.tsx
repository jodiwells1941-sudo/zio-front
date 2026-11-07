"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { getLocalOrderHistory } from "@/app/api/trade";
import { getUserInfo } from "@/utils/auth";
import { getTradeEcho } from "@/utils/tradeEcho";
import "./localHistory.css";

type Side = "buy" | "sell";
type Row = {
  id: number; order_id: string; side: Side; order_side: Side; status: string;
  counterparty: string | null; asset: string | null; fiat: string | null;
  asset_amount: string | number; fiat_amount: string | number; unit_price: string | number;
  bonus_amount: string | number | null; charge_amount: string | number | null;
  asset_total: number; payment_method: string | null;
  created_at: string | null; payment_sent_at: string | null;
  payment_received_at: string | null; completed_at: string | null;
};
type Summary = {
  asset: string; fiat: string; orders_count: number | string;
  asset_received: number | string; asset_paid: number | string;
  fiat_received: number | string; fiat_paid: number | string;
  bonus_received: number | string; fee_paid: number | string;
};
type HistoryPayload = {
  records: { data: Row[]; current_page: number; last_page: number; total: number };
  total: number; settled: Summary[];
};

const money = (value: number | string | null | undefined, currency?: string | null) => {
  const amount = Number(value ?? 0);
  return `${Number.isFinite(amount) ? amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 }) : "0.00"} ${currency || ""}`.trim();
};
const dateTime = (value: string | null) => value ? new Date(value).toLocaleString() : "—";
const statusLabel = (value: string) => ({ payment_sent: "Payment sent", payment_received: "Payment confirmed" }[value] || value.replaceAll("_", " "));

export default function LocalHistory() {
  const [draft, setDraft] = useState({ search: "", from_date: "", to_date: "", side: "", status: "" });
  const [filters, setFilters] = useState(draft);
  const [page, setPage] = useState(1);
  const [payload, setPayload] = useState<HistoryPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);

  const fetchHistory = useCallback(async () => {
    setError("");
    try {
      const params: Record<string, string | number> = { page };
      for (const [key, value] of Object.entries(filters)) if (value) params[key] = value;
      const response = await getLocalOrderHistory(params);
      setPayload(response.data as HistoryPayload);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load history.");
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => { void fetchHistory(); }, [fetchHistory, revision]);
  useEffect(() => {
    const uid = Number(getUserInfo()?.id);
    if (!Number.isFinite(uid) || uid < 1) return;
    const echo = getTradeEcho();
    if (!echo) return;
    const channelName = `user.${uid}`;
    const channel = echo.private(channelName);
    const refresh = () => setRevision(value => value + 1);
    channel.listen(".p2p-orders-list.updated", refresh);
    return () => { channel.stopListening(".p2p-orders-list.updated"); echo.leave(channelName); };
  }, []);

  const applyFilters = (event: React.FormEvent) => {
    event.preventDefault();
    if (draft.from_date && draft.to_date && draft.from_date > draft.to_date) {
      setError("The start date must be before the end date."); return;
    }
    setLoading(true); setPage(1); setFilters({ ...draft });
  };
  const reset = () => { const empty = { search: "", from_date: "", to_date: "", side: "", status: "" }; setDraft(empty); setFilters(empty); setPage(1); setLoading(true); };
  const title = "All Buy & Sell History";
  const rows = payload?.records?.data || [];
  const pageCount = payload?.records?.last_page || 1;

  return <main className="local-history-page">
    <header className="local-history-heading">
      <span className="local-history-heading-icon"><i className="fa-solid fa-clock-rotate-left" aria-hidden="true" /></span>
      <div><span className="local-history-eyebrow">LOCAL BUY & SELL</span><h1>{title}</h1>
        <p>Your local orders, with settled amounts calculated from completed trades.</p></div>
    </header>

    <nav className="local-history-tabs" aria-label="History pages">
      <Link className="active" href="/dashboard/local-buy-sell/history">Buy &amp; Sell History</Link>
      <Link href="/dashboard/local-buy-sell/payment-history">Payment History</Link>
    </nav>

    <form className="local-history-filters" onSubmit={applyFilters}>
      <label>Order ID<input value={draft.search} onChange={e => setDraft({ ...draft, search: e.target.value })} placeholder="Search order ID" /></label>
      <label>From<input type="date" value={draft.from_date} onChange={e => setDraft({ ...draft, from_date: e.target.value })} /></label>
      <label>To<input type="date" value={draft.to_date} onChange={e => setDraft({ ...draft, to_date: e.target.value })} /></label>
      <label>My side<select value={draft.side} onChange={e => setDraft({ ...draft, side: e.target.value })}><option value="">All sides</option><option value="buy">Buy</option><option value="sell">Sell</option></select></label>
      <label>Status<select value={draft.status} onChange={e => setDraft({ ...draft, status: e.target.value })}><option value="">All statuses</option>{["pending", "approved", "payment_sent", "payment_received", "completed", "appealed", "cancelled", "rejected", "refunded"].map(status => <option key={status} value={status}>{statusLabel(status)}</option>)}</select></label>
      <div className="local-history-filter-actions"><button type="submit">Apply</button><button type="button" onClick={reset}>Reset</button></div>
    </form>

    {error && <div className="local-history-error" role="alert">{error} <button type="button" onClick={() => setRevision(v => v + 1)}>Retry</button></div>}

    <section className="local-history-overview" aria-label="Filtered history totals">
      <div className="local-history-count"><span>Matching orders</span><strong>{payload?.total ?? 0}</strong><small>Across all matching pages</small></div>
      <div className="local-history-count"><span>Completed orders</span><strong>{(payload?.settled || []).reduce((sum, item) => sum + Number(item.orders_count), 0)}</strong><small>Only these count in totals</small></div>
      {(payload?.settled || []).map(item => <div className="local-history-summary" key={`${item.asset}:${item.fiat}`}>
        <strong>{item.asset} / {item.fiat}</strong>
        <div><span>Asset received</span><b>{money(item.asset_received, item.asset)}</b></div>
        <div><span>Asset paid</span><b>{money(item.asset_paid, item.asset)}</b></div>
        <div><span>Fiat received</span><b>{money(item.fiat_received, item.fiat)}</b></div>
        <div><span>Fiat paid</span><b>{money(item.fiat_paid, item.fiat)}</b></div>
        <small>Includes {money(item.bonus_received, item.asset)} bonus received and {money(item.fee_paid, item.asset)} fee paid.</small>
      </div>)}
    </section>

    <section className="local-history-list" aria-label={title}>
      <div className="local-history-list-title"><strong>{title}</strong><span>{loading ? "Loading…" : `${payload?.records?.total ?? 0} records`}</span></div>
      {!loading && rows.length === 0 && <div className="local-history-empty">No orders match these filters.</div>}
      <div className="local-history-grid">
        {rows.map(row => {
          const asset = row.asset || "asset";
          const fiat = row.fiat || "fiat";
          const path = `/dashboard/local-buy-sell/my-orders/${row.order_side === "buy" ? "buy-view" : "sell-view"}/?trade_id=${row.id}`;
          return <article className="local-history-row" key={row.id}>
            <div className="local-history-row-top"><span className={`local-history-side ${row.side}`}>{row.side === "buy" ? "Buy" : "Sell"}</span><Link href={path}>{row.order_id} <i className="fa-solid fa-arrow-up-right-from-square" aria-hidden="true" /></Link><span className={`local-history-status ${row.status}`}>{statusLabel(row.status)}</span></div>
            <div className="local-history-row-body">
              <div><small>Order created</small><strong>{dateTime(row.created_at)}</strong></div>
              <div><small>Counterparty</small><strong>{row.counterparty || "—"}</strong></div>
              <div><small>{row.side === "buy" ? "Asset received on completion" : "Asset paid on completion"}</small><strong className={row.side === "buy" ? "local-history-yellow" : "local-history-red"}>{money(row.asset_total, asset)}</strong><em>{row.side === "buy" ? `Base ${money(row.asset_amount, asset)} + bonus ${money(row.bonus_amount, asset)}` : `Base ${money(row.asset_amount, asset)} + fee ${money(row.charge_amount, asset)}`}</em></div>
              <div><small>{row.side === "buy" ? "Fiat payable" : "Fiat receivable"}</small><strong>{money(row.fiat_amount, fiat)}</strong><em>Rate {money(row.unit_price, fiat)} / {asset}</em></div>
            </div>
          </article>;
        })}
      </div>
    </section>

    {pageCount > 1 && <div className="local-history-pagination"><button type="button" disabled={page <= 1} onClick={() => { setPage(p => p - 1); setLoading(true); }}>Previous</button><span>Page {page} of {pageCount}</span><button type="button" disabled={page >= pageCount} onClick={() => { setPage(p => p + 1); setLoading(true); }}>Next</button></div>}
  </main>;
}
