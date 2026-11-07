"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getLocalPaymentHistory } from "@/app/api/trade";
import { getUserInfo } from "@/utils/auth";
import { getTradeEcho } from "@/utils/tradeEcho";
import "./localHistory.css";

type TransactionRow = {
  id: number;
  trx_id: string | null;
  case_type: string;
  type: "credit" | "debit";
  amount: number | string;
  display_amount?: number | string;
  asset: string;
  status: number;
  description: string | null;
  case: string;
  case_id: number;
  ad_id: number | null;
  order_id: string | null;
  order_side: "buy" | "sell" | null;
  can_view_order: number | boolean;
  can_view_ad: number | boolean;
  created_at: string;
};
type SummaryRow = { case_type: string; type: "credit" | "debit"; asset: string; entries: number | string; amount: number | string };
type Payload = {
  records: { data: TransactionRow[]; total: number; current_page: number; last_page: number };
  summary: SummaryRow[];
  case_types: string[];
};

const labels: Record<string, string> = {
  local_buy: "Local Buy",
  local_buy_bonus: "Buy Bonus",
  local_sell_fee: "Sell Fee",
  local_sell_ad: "Sell Ad Lock / Return",
  local_sell_lock: "Sell Amount (Locked)",
  local_sell_refund: "Sell Order Refund",
};
const label = (value: string) => labels[value] || value.replaceAll("_", " ").replace(/\b\w/g, char => char.toUpperCase());
const formatAmount = (value: number | string, asset: string) => `${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 })} ${asset}`;
const dateTime = (value: string) => new Date(value).toLocaleString();

export default function LocalPaymentHistory() {
  const blank = { search: "", case_type: "", direction: "", source: "", from_date: "", to_date: "" };
  const [draft, setDraft] = useState(blank);
  const [filters, setFilters] = useState(blank);
  const [page, setPage] = useState(1);
  const [payload, setPayload] = useState<Payload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);

  const fetchHistory = useCallback(async () => {
    setError("");
    try {
      const params: Record<string, string | number> = { page };
      for (const [key, value] of Object.entries(filters)) if (value) params[key] = value;
      const response = await getLocalPaymentHistory(params);
      setPayload(response.data as Payload);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load local transactions.");
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

  const caseTotals = useMemo(() => {
    const grouped = new Map<string, { caseType: string; asset: string; credits: number; debits: number; entries: number }>();
    for (const item of payload?.summary || []) {
      const key = `${item.case_type}:${item.asset}`;
      const current = grouped.get(key) || { caseType: item.case_type, asset: item.asset, credits: 0, debits: 0, entries: 0 };
      current.entries += Number(item.entries);
      if (item.type === "credit") current.credits += Number(item.amount);
      else current.debits += Number(item.amount);
      grouped.set(key, current);
    }
    return [...grouped.values()];
  }, [payload]);

  const apply = (event: React.FormEvent) => {
    event.preventDefault();
    if (draft.from_date && draft.to_date && draft.from_date > draft.to_date) {
      setError("The start date must be before the end date."); return;
    }
    setPayload(null); setLoading(true); setPage(1); setFilters({ ...draft });
  };
  const reset = () => { setDraft({ ...blank }); setFilters({ ...blank }); setPage(1); setPayload(null); setLoading(true); };
  const records = payload?.records?.data || [];
  const lastPage = payload?.records?.last_page || 1;

  return <main className="local-history-page local-payment-page">
    <header className="local-history-heading">
      <span className="local-history-heading-icon"><i className="fa-solid fa-money-bill-transfer" aria-hidden="true" /></span>
      <div><span className="local-history-eyebrow">LOCAL BUY &amp; SELL</span><h1>Payment History</h1>
        <p>Every local wallet credit and debit, including ad locks, buy bonuses, sell fees and refunds.</p></div>
    </header>
    <nav className="local-history-tabs" aria-label="History pages">
      <Link href="/dashboard/local-buy-sell/history">Buy &amp; Sell History</Link>
      <Link className="active" href="/dashboard/local-buy-sell/payment-history">Payment History</Link>
    </nav>
    <form className="local-history-filters" onSubmit={apply}>
      <label>Search<input value={draft.search} onChange={event => setDraft({ ...draft, search: event.target.value })} placeholder="TX ID, order ID, ad ID" /></label>
      <label>Transaction type<select value={draft.case_type} onChange={event => setDraft({ ...draft, case_type: event.target.value })}>
        <option value="">All types</option>{(payload?.case_types || Object.keys(labels)).map(type => <option value={type} key={type}>{label(type)}</option>)}
      </select></label>
      <label>Direction<select value={draft.direction} onChange={event => setDraft({ ...draft, direction: event.target.value })}><option value="">Credit &amp; debit</option><option value="credit">Credit</option><option value="debit">Debit</option></select></label>
      <label>Source<select value={draft.source} onChange={event => setDraft({ ...draft, source: event.target.value })}><option value="">Ads &amp; orders</option><option value="ad">Ads</option><option value="order">Orders</option></select></label>
      <label>From<input type="date" value={draft.from_date} onChange={event => setDraft({ ...draft, from_date: event.target.value })} /></label>
      <label>To<input type="date" value={draft.to_date} onChange={event => setDraft({ ...draft, to_date: event.target.value })} /></label>
      <div className="local-history-filter-actions"><button type="submit">Apply</button><button type="button" onClick={reset}>Reset</button></div>
    </form>
    {error && <div className="local-history-error" role="alert">{error} <button type="button" onClick={() => setRevision(value => value + 1)}>Retry</button></div>}
    <section className="local-history-overview" aria-label="Filtered transaction totals">
      <div className="local-history-count"><span>Matching transactions</span><strong>{payload?.records?.total ?? 0}</strong><small>Main amount, fee and bonus are listed separately below.</small></div>
    </section>
    {caseTotals.length > 0 && <section className="local-payment-breakdown" aria-label="Totals by transaction type">
      <div className="local-history-list-title"><strong>By transaction type</strong><span>All matching pages</span></div>
      <div className="local-payment-breakdown-grid">{caseTotals.map(item => <div className="local-payment-breakdown-card" key={`${item.caseType}:${item.asset}`}>
        <div><strong>{label(item.caseType)}</strong><small>{item.entries} entries · {item.asset}</small></div>
        <div><span>Credit</span><b className="local-history-yellow">+ {formatAmount(item.credits, item.asset)}</b></div>
        <div><span>Debit</span><b className="local-history-red">− {formatAmount(item.debits, item.asset)}</b></div>
      </div>)}</div>
    </section>}
    <section className="local-history-list" aria-label="Individual local transactions">
      <div className="local-history-list-title"><strong>Individual transactions</strong><span>{loading ? "Loading…" : `${payload?.records?.total ?? 0} records`}</span></div>
      {!loading && records.length === 0 && <div className="local-history-empty">No local transactions match these filters.</div>}
      <div className="local-history-grid">{records.map(row => {
        const orderPath = `/dashboard/local-buy-sell/my-orders/${row.order_side === "buy" ? "buy-view" : "sell-view"}/?trade_id=${row.case_id}`;
        const source = row.order_id || (row.ad_id ? `AD-${String(row.ad_id).padStart(6, "0")}` : `#${row.case_id}`);
        return <article className="local-history-row local-payment-row" key={row.id}>
          <div className="local-history-row-top"><span className={`local-history-side ${row.type === "credit" ? "buy" : "sell"}`}>{row.type === "credit" ? "Credit" : "Debit"}</span>
            <strong>{label(row.case_type)}</strong><span className={`local-history-status ${row.status === 1 ? "completed" : "pending"}`}>{row.status === 1 ? "Completed" : row.status === 3 ? "Pending" : "Rejected"}</span></div>
          <div className="local-history-row-body">
            <div><small>Amount</small><strong className={row.type === "credit" ? "local-history-yellow" : "local-history-red"}>{row.type === "credit" ? "+" : "−"} {formatAmount(row.display_amount ?? row.amount, row.asset)}</strong><em>{row.type === "credit" ? "Added to wallet" : "Deducted from wallet"}</em></div>
            <div><small>Transaction ID</small><strong>{row.trx_id || `#${row.id}`}</strong><em>{dateTime(row.created_at)}</em></div>
            <div><small>{row.case === "p2p_order" ? "Order" : "Ad"}</small><strong>{row.case === "p2p_order" && row.order_id && Number(row.can_view_order) === 1 ? <Link className="local-history-source-link" href={orderPath}>{source} <i className="fa-solid fa-arrow-up-right-from-square" aria-hidden="true" /></Link> : row.case !== "p2p_order" && row.ad_id && Number(row.can_view_ad) === 1 ? <Link className="local-history-source-link" href="/dashboard/local-buy-sell/my-ads">{source}</Link> : source}</strong><em>{row.case === "p2p_order" ? "Order transaction" : "Ad transaction"}</em></div>
            <div className="local-payment-description"><small>Details</small><strong>{row.description || label(row.case_type)}</strong><em>Type: {row.case_type}</em></div>
          </div>
        </article>;
      })}</div>
    </section>
    {lastPage > 1 && <div className="local-history-pagination"><button type="button" disabled={page <= 1} onClick={() => { setPage(value => value - 1); setPayload(null); setLoading(true); }}>Previous</button><span>Page {page} of {lastPage}</span><button type="button" disabled={page >= lastPage} onClick={() => { setPage(value => value + 1); setPayload(null); setLoading(true); }}>Next</button></div>}
  </main>;
}
