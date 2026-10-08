'use client';
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactSelect from "react-select";
import countryList from "react-select-country-list";
import { toast } from "react-toastify";
import { getLocalAds, P2pAdsData } from "@/app/api/p2padsapi";
import LocalBuyModal from "./localBuyModal";
import LocalSellModal from "./localSellModal";
import "./localBuySell.css";
import Link from "next/link";

/* ---------------- Static data ---------------- */
const CURRENCIES = [
  { code: "USD", name: "US Dollar" },
  { code: "EUR", name: "Euro" },
  { code: "GBP", name: "British Pound" },
  { code: "BDT", name: "Bangladeshi Taka" },
  { code: "INR", name: "Indian Rupee" },
  { code: "PKR", name: "Pakistani Rupee" },
  { code: "AUD", name: "Australian Dollar" },
  { code: "CAD", name: "Canadian Dollar" },
  { code: "JPY", name: "Japanese Yen" },
  { code: "CNY", name: "Chinese Yuan" },
  { code: "CHF", name: "Swiss Franc" },
];

// country (ISO2, upper) -> one of the currencies above
const COUNTRY_CUR: Record<string, string> = {
  BD: "BDT", IN: "INR", PK: "PKR", US: "USD", GB: "GBP", AU: "AUD", CA: "CAD", JP: "JPY", CN: "CNY", CH: "CHF",
  ...Object.fromEntries(
    ["AT", "BE", "CY", "EE", "FI", "FR", "DE", "GR", "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PT", "SK", "SI", "ES", "HR"].map(c => [c, "EUR"])
  ),
};
const CUR_HOME: Record<string, string> = { BDT: "BD", INR: "IN", PKR: "PK", USD: "US", GBP: "GB", AUD: "AU", CAD: "CA", JPY: "JP", CNY: "CN", CHF: "CH", EUR: "" };
const CUR_FLAG: Record<string, string> = { BDT: "bd", INR: "in", PKR: "pk", USD: "us", GBP: "gb", EUR: "eu", AUD: "au", CAD: "ca", JPY: "jp", CNY: "cn", CHF: "ch" };

// icon colours for well-known methods; anything else gets a neutral tile
const METHOD_STYLE: Record<string, { color: string; glyph: string }> = {
  bKash: { color: "#e2136e", glyph: "b" },
  Nagad: { color: "#f26522", glyph: "N" },
  Rocket: { color: "#8c3494", glyph: "R" },
  "Bank Transfer": { color: "#1d6fe0", glyph: "⌂" },
};
const AVATAR_COLORS = ["#2563eb", "#0d9488", "#7c3aed", "#db2777", "#ea580c", "#16a34a"];

type Option = { label: string; value: string };
type Kind = "buy" | "sell";   // what the VIEWER wants to do

// A viewer who wants to BUY USDT needs ads where the owner wants to SELL, and vice-versa.
const API_TYPE: Record<Kind, "buy" | "sell"> = { buy: "sell", sell: "buy" };

type Bucket = {
  items: P2pAdsData[]; page: number; last: number; total: number;
  from: number; to: number; loading: boolean; updated: string;
};
const EMPTY: Bucket = { items: [], page: 1, last: 1, total: 0, from: 0, to: 0, loading: true, updated: "" };

const n2 = (v: number | string, d = 2) => {
  const n = Number(v);
  return Number.isFinite(n) ? n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }) : "-";
};
const apiMsg = (e: any, fb: string) => e?.response?.data?.message ?? e?.message ?? fb;
const clock = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

/** value after `ms` of quiet; `flush()` applies the latest value immediately */
function useDebounced<T>(value: T, ms: number): [T, () => void] {
  const [v, setV] = useState(value);
  const key = JSON.stringify(value);
  const latest = useRef(value);
  latest.current = value;
  useEffect(() => {
    const t = setTimeout(() => setV(latest.current), ms);
    return () => clearTimeout(t);
  }, [key, ms]);
  return [v, () => setV(latest.current)];
}

/** 1 … 4 5 6 … 20 */
function pageItems(page: number, last: number): (number | "…")[] {
  const set = new Set([1, last, page - 1, page, page + 1]);
  if (page <= 3) { set.add(2); set.add(3); }
  if (page >= last - 2) { set.add(last - 1); set.add(last - 2); }
  const nums = [...set].filter(n => n >= 1 && n <= last).sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  nums.forEach((n, i) => { if (i && n - nums[i - 1] > 1) out.push("…"); out.push(n); });
  return out;
}

/* ---------------- Small parts ---------------- */
const Flag = ({ cc, size = 20 }: { cc: string; size?: number }) => (
  <img className="pf-flag" src={`https://flagcdn.com/w40/${cc.toLowerCase()}.png`} srcSet={`https://flagcdn.com/w80/${cc.toLowerCase()}.png 2x`} width={size} height={size} alt="" loading="lazy" />
);
const Chevron = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
);
const Cart = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="20" r="1.5" /><circle cx="18" cy="20" r="1.5" /><path d="M2 3h3l2.7 12.4a1 1 0 0 0 1 .8h8.9a1 1 0 0 0 1-.8L20 7H6" /></svg>
);

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="pf-field"><label className="pf-label">{label}</label>{children}</div>;
}

function Row({ ad, kind, onTrade }: { ad: P2pAdsData; kind: Kind; onTrade: (ad: P2pAdsData, kind: Kind) => void }) {
  const method = ad.payment_method?.sell_method?.name ?? "—";
  const style = METHOD_STYLE[method] ?? { color: "#3b82f6", glyph: method[0] ?? "?" };
  const name = ad.user?.name ?? "—";
  return (
    <div className="pf-row">
      <div className="pf-user">
        {ad.user?.avatar
          ? <img className="pf-avatar pf-avatar--img" src={ad.user.avatar} alt="" loading="lazy" />
          : <span className="pf-avatar" style={{ background: AVATAR_COLORS[(name.charCodeAt(0) + ad.id) % AVATAR_COLORS.length] }}>{name[0]}</span>}
        <div>
          <div className="pf-name">{name}</div>
          <div className="pf-rating"><i className="fa-regular fa-clock" /> {ad.payment_time_limit} min</div>
        </div>
      </div>
      <div className={`pf-rate pf-rate--${kind}`}>{n2(ad.fixed_price)} <small className="pf-unit">{ad.with_fiat}</small></div>
      <div className="pf-cell">{n2(ad.total_amount)}</div>
      <div className="pf-cell">{n2(ad.order_limit_min, 0)} – {n2(ad.order_limit_max, 0)}</div>
      <div className="pf-method"><span className="pf-mico" style={{ background: style.color }}>{style.glyph}</span>{method}</div>
      <button type="button" className={`pf-cta pf-cta--${kind}`} onClick={() => onTrade(ad, kind)}>{kind === "buy" ? "Buy" : "Sell"} USDT</button>
    </div>
  );
}

function Pager({ b, onPage }: { b: Bucket; onPage: (p: number) => void }) {
  if (b.total === 0) return null;
  return (
    <nav className="pf-pager" aria-label="Offers pagination">
      <span className="pf-pager-info">Showing <b>{b.from}–{b.to}</b> of <b>{b.total}</b> offers</span>
      {b.last > 1 && (
        <div className="pf-pager-btns">
          <button type="button" className="pf-pg" disabled={b.page <= 1 || b.loading} onClick={() => onPage(b.page - 1)} aria-label="Previous page">
            <i className="fa-solid fa-chevron-left" />
          </button>
          {pageItems(b.page, b.last).map((it, i) =>
            it === "…"
              ? <span key={`e${i}`} className="pf-pg-gap">…</span>
              : <button key={it} type="button" className={`pf-pg ${it === b.page ? "is-active" : ""}`} aria-current={it === b.page ? "page" : undefined} disabled={b.loading} onClick={() => onPage(it)}>{it}</button>
          )}
          <button type="button" className="pf-pg" disabled={b.page >= b.last || b.loading} onClick={() => onPage(b.page + 1)} aria-label="Next page">
            <i className="fa-solid fa-chevron-right" />
          </button>
        </div>
      )}
    </nav>
  );
}

function Panel({ kind, b, cur, onRefresh, onPage, onTrade }: {
  kind: Kind; b: Bucket; cur: string;
  onRefresh: () => void; onPage: (p: number) => void; onTrade: (ad: P2pAdsData, kind: Kind) => void;
}) {
  const buy = kind === "buy";
  return (
    <section className={`pf-panel pf-panel--${kind}`}>
      <header className="pf-panel-head">
        <span className="pf-bigicon"><Cart /></span>
        <div className="pf-panel-title">
          <h3>{buy ? "Buy USDT" : "Sell USDT"} <small>{buy ? "(From Sellers)" : "(To Buyers)"}</small></h3>
          <p>{buy ? "Pay with your local currency to buy USDT" : "Receive your local currency by selling USDT"}</p>
        </div>
        <div className="pf-panel-meta">
          <span>Total Offers: <b>{b.total}</b></span>
          <span className="pf-muted">{b.updated ? `Updated ${b.updated}` : "Loading…"}</span>
        </div>
        <button type="button" className={`pf-refresh ${b.loading ? "is-spinning" : ""}`} aria-label="Refresh offers" onClick={onRefresh} disabled={b.loading}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-3-6.7" /><polyline points="21 3 21 9 15 9" /></svg>
        </button>
      </header>

      <div className="pf-scroll">
        <div className="pf-table">
          <div className="pf-row pf-row--head">
            <div>User</div><div>Rate{cur ? ` (${cur})` : ""}</div><div>Available (USDT)</div><div>Limit (USDT)</div><div>Payment Method</div><div>Action</div>
          </div>

          {b.loading && b.items.length === 0 &&
            [0, 1, 2, 3, 4].map(i => <div key={i} className="pf-row pf-skel"><span /><span /><span /><span /><span /><span /></div>)}

          {!b.loading && b.items.length === 0 && (
            <div className="pf-empty">No offers match these filters. Try widening the amount or rate range.</div>
          )}

          <div className={b.loading && b.items.length > 0 ? "pf-fading" : undefined}>
            {b.items.map(ad => <Row key={ad.id} ad={ad} kind={kind} onTrade={onTrade} />)}
          </div>
        </div>
      </div>

      <Pager b={b} onPage={onPage} />
    </section>
  );
}

/* ---------------- Page ---------------- */
export default function Page() {
  // filters
  const [country, setCountry] = useState("BD");           // ISO2, "" = none
  const [filterFiat, setFilterFiat] = useState("BDT");
  const [filterMethod, setFilterMethod] = useState("");
  const [amt, setAmt] = useState({ min: "", max: "" });
  const [rate, setRate] = useState({ min: "", max: "" });

  const [tab, setTab] = useState<Kind>("buy");
  const [view, setView] = useState<"market" | "create">("market");
  const [tradeModal, setTradeModal] = useState<{ ad: P2pAdsData; kind: Kind } | null>(null);

  // data
  const [data, setData] = useState<Record<Kind, Bucket>>({ buy: EMPTY, sell: EMPTY });
  const [methodNames, setMethodNames] = useState<string[]>([]);
  const [tick, setTick] = useState(0);
  const reqId = useRef<Record<Kind, number>>({ buy: 0, sell: 0 });

  const countryOptions = useMemo(() => countryList().getData() as Option[], []);
  const currencyOptions = useMemo<Option[]>(() => CURRENCIES.map(c => ({ value: c.code, label: `${c.code} — ${c.name}` })), []);
  const countryValue = countryOptions.find(o => o.value === country) ?? null;
  const currencyValue = currencyOptions.find(o => o.value === filterFiat) ?? null;

  // selects apply instantly, typed ranges after a short pause
  const [filters, flushFilters] = useDebounced(
    { fiat: filterFiat, method: filterMethod, amtMin: amt.min, amtMax: amt.max, rateMin: rate.min, rateMax: rate.max },
    400
  );

  const methodOptions = useMemo(
    () => (filterMethod && !methodNames.includes(filterMethod) ? [...methodNames, filterMethod] : methodNames),
    [methodNames, filterMethod]
  );

  /* ---- fetching ---- */
  const fetchBucket = useCallback(async (kind: Kind, page = 1) => {
    const id = ++reqId.current[kind];
    setData(p => ({ ...p, [kind]: { ...p[kind], loading: true } }));
    try {
      const params: Record<string, string | number | undefined> = {
        type: API_TYPE[kind],
        page,
        withFiat: filters.fiat || undefined,
        payment_method: filters.method || undefined,
        amount_min: filters.amtMin || undefined,
        amount_max: filters.amtMax || undefined,
        rate_min: filters.rateMin || undefined,
        rate_max: filters.rateMax || undefined,
      };
      const res = await getLocalAds(params as any);
      if (id !== reqId.current[kind]) return;             // a newer request is in flight
      if (res?.error) throw new Error(res.message);

      const d = res?.data;
      const items: P2pAdsData[] = Array.isArray(d) ? d : d?.data ?? [];

      setMethodNames(prev => {
        const set = new Set(prev);
        items.forEach(a => { const n = a.payment_method?.sell_method?.name; if (n) set.add(n); });
        return set.size === prev.length ? prev : [...set].sort();
      });

      setData(p => ({
        ...p,
        [kind]: {
          items,
          page: d?.current_page ?? page,
          last: d?.last_page ?? 1,
          total: d?.total ?? items.length,
          from: d?.from ?? (items.length ? 1 : 0),
          to: d?.to ?? items.length,
          loading: false,
          updated: clock(),
        },
      }));
    } catch (e: any) {
      if (id !== reqId.current[kind]) return;
      toast.error(apiMsg(e, "Failed to load offers."));
      setData(p => ({ ...p, [kind]: { ...p[kind], loading: false } }));
    }
  }, [filters]);

  // new filters / Search / coming back from the create form -> reload both tabs from page 1
  useEffect(() => {
    if (view !== "market") return;
    fetchBucket("buy", 1);
    fetchBucket("sell", 1);
  }, [fetchBucket, tick, view]);

  const goToPage = (kind: Kind, p: number) => {
    fetchBucket(kind, p);
    document.getElementById("pf-offers")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleTrade = (ad: P2pAdsData, kind: Kind) => {
    setTradeModal({ ad, kind });
  };

  /* ---- filter handlers ---- */
  const handleCountry = (opt: Option | null) => {
    const cc = opt?.value ?? "";
    setCountry(cc);
    if (cc) {
      const cur = COUNTRY_CUR[cc] ?? "";               // unsupported country -> pick a currency yourself
      if (cur !== filterFiat) setFilterMethod("");
      setFilterFiat(cur);
    }
  };
  const handleChange = (cur: string) => {
    setFilterFiat(cur);
    setFilterMethod("");
    if (cur && cur in CUR_HOME) setCountry(CUR_HOME[cur]);
  };
  const clearFilters = () => {
    setCountry(""); setFilterFiat(""); setFilterMethod("");
    setAmt({ min: "", max: "" }); setRate({ min: "", max: "" });
  };
  const handleSearch = () => { flushFilters(); setTick(t => t + 1); };

  const hasFilter = !!(filterFiat || filterMethod || amt.min || amt.max || rate.min || rate.max);
  const num = (v: string) => v.replace(/[^\d.]/g, "");
  const formatOption = (o: Option, flag: string) => (
    <span className="pfs-opt"><Flag cc={flag} size={18} />{o.label}</span>
  );

  const cur = data[tab];

  return (
    <main className="pf">
      {/* Filter bar */}
      <div className="pf-filters">
        <Field label="Country">
          <ReactSelect<Option>
            instanceId="p2pCountry"
            classNamePrefix="pfs"
            options={countryOptions}
            value={countryValue}
            onChange={v => handleCountry(v as Option | null)}
            placeholder="Search country"
            isSearchable
            isClearable
            components={{ IndicatorSeparator: null }}
            formatOptionLabel={o => formatOption(o, o.value)}
          />
        </Field>

        <Field label="Currency">
          <ReactSelect<Option>
            instanceId="p2pCurrency"
            classNamePrefix="pfs"
            options={currencyOptions}
            value={currencyValue}
            onChange={v => handleChange((v as Option | null)?.value ?? "")}
            placeholder="Select currency"
            isSearchable
            isClearable
            components={{ IndicatorSeparator: null }}
            formatOptionLabel={o => formatOption(o, CUR_FLAG[o.value])}
          />
        </Field>

        <Field label="Payment Method">
          <div className="pf-selwrap">
            <select className="pf-input pf-sel" value={filterMethod} onChange={e => setFilterMethod(e.target.value)} disabled={!filterFiat}>
              <option value="">{filterFiat ? "All Methods" : "Select currency first"}</option>
              {methodOptions.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <Chevron />
          </div>
        </Field>

        <Field label="Amount (USDT)">
          <div className="pf-pair">
            <input className="pf-input" inputMode="decimal" placeholder="Min" value={amt.min} disabled={!filterFiat} onChange={e => setAmt({ ...amt, min: num(e.target.value) })} />
            <span>–</span>
            <input className="pf-input" inputMode="decimal" placeholder="Max" value={amt.max} disabled={!filterFiat} onChange={e => setAmt({ ...amt, max: num(e.target.value) })} />
          </div>
        </Field>

        <Field label={`Rate Range (${filterFiat || "—"})`}>
          <div className="pf-pair">
            <input className="pf-input" inputMode="decimal" placeholder="Min" value={rate.min} disabled={!filterFiat} onChange={e => setRate({ ...rate, min: num(e.target.value) })} />
            <span>–</span>
            <input className="pf-input" inputMode="decimal" placeholder="Max" value={rate.max} disabled={!filterFiat} onChange={e => setRate({ ...rate, max: num(e.target.value) })} />
          </div>
        </Field>

        <div className="pf-fact">
          {hasFilter && (
            <button type="button" className="pf-clear" onClick={clearFilters}>Clear filters</button>
          )}
          <button type="button" className="pf-search" onClick={handleSearch}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.5" y2="16.5" /></svg>
            Search
          </button>
        </div>
      </div>

      {/* Action cards (tabs) */}
      <div className="pf-actions mt-3" role="tablist" aria-label="Offer type">
        <button type="button" role="tab" aria-selected={tab === "buy"} className={`pf-action pf-action--buy ${tab === "buy" ? "is-active" : ""}`} onClick={() => setTab("buy")}>
          <span className="pf-bigicon"><Cart /></span>
          <span className="pf-action-text"><b>I Want to Buy USDT</b><small>Find users who want to sell (Deposit Requests)</small></span>
          <span className="pf-count">{data.buy.loading && !data.buy.total ? "…" : data.buy.total}</span>
        </button>
        <button type="button" role="tab" aria-selected={tab === "sell"} className={`pf-action pf-action--sell ${tab === "sell" ? "is-active" : ""}`} onClick={() => setTab("sell")}>
          <span className="pf-bigicon"><Cart /></span>
          <span className="pf-action-text"><b>I Want to Sell USDT</b><small>Find users who want to buy (Withdraw Requests)</small></span>
          <span className="pf-count">{data.sell.loading && !data.sell.total ? "…" : data.sell.total}</span>
        </button>
        <Link href="/dashboard/local-buy-sell/create-ad" className="pf-action pf-action--create">
          <span className="pf-bigicon pf-bigicon--plus">+</span>
          <span className="pf-action-text"><b>Create Your Own Request</b><small>Create Deposit or Withdraw request</small></span>
          <span className="pf-arrow"><Chevron /></span>
        </Link>
      </div>

      {/* Table for the active tab */}
      <div id="pf-offers" className="pf-tables" role="tabpanel">
        <Panel
          kind={tab}
          b={cur}
          cur={filterFiat}
          onRefresh={() => fetchBucket(tab, cur.page)}
          onPage={p => goToPage(tab, p)}
          onTrade={handleTrade}
        />
      </div>

      {tradeModal && tradeModal.kind === "buy" && (
        <LocalBuyModal ad={tradeModal.ad} onClose={() => setTradeModal(null)} />
      )}

      {tradeModal && tradeModal.kind === "sell" && (
        <LocalSellModal ad={tradeModal.ad} onClose={() => setTradeModal(null)} />
      )}
    </main>
  );
}