'use client';
import React, { useMemo, useState } from "react";
import ReactSelect from "react-select";
import countryList from "react-select-country-list";
import CreateRequest from "./CreateRequest";
import "./localBuySell.css";

/* ---------------- Data ---------------- */
// Your currency list
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
// currency -> home country (EUR has no single country)
const CUR_HOME: Record<string, string> = { BDT: "BD", INR: "IN", PKR: "PK", USD: "US", GBP: "GB", AUD: "AU", CAD: "CA", JPY: "JP", CNY: "CN", CHF: "CH", EUR: "" };
// currency -> flag file
const CUR_FLAG: Record<string, string> = { BDT: "bd", INR: "in", PKR: "pk", USD: "us", GBP: "gb", EUR: "eu", AUD: "au", CAD: "ca", JPY: "jp", CNY: "cn", CHF: "ch" };

// quick pills (country code "" = Euro zone)
const PILLS = [
  { cc: "BD", name: "Bangladesh", cur: "BDT" },
  { cc: "IN", name: "India", cur: "INR" },
  { cc: "PK", name: "Pakistan", cur: "PKR" },
  { cc: "US", name: "USA", cur: "USD" },
  { cc: "GB", name: "UK", cur: "GBP" },
  { cc: "", name: "Europe", cur: "EUR" },
  { cc: "AU", name: "Australia", cur: "AUD" },
  { cc: "CA", name: "Canada", cur: "CAD" },
  { cc: "JP", name: "Japan", cur: "JPY" },
  { cc: "CN", name: "China", cur: "CNY" },
  { cc: "CH", name: "Switzerland", cur: "CHF" },
];

const METHODS: Record<string, { label: string; color: string; glyph: string }> = {
  bKash: { label: "bKash", color: "#e2136e", glyph: "b" },
  Nagad: { label: "Nagad", color: "#f26522", glyph: "N" },
  Rocket: { label: "Rocket", color: "#8c3494", glyph: "R" },
  "Bank Transfer": { label: "Bank Transfer", color: "#1d6fe0", glyph: "⌂" },
};

type Offer = { user: string; rating: number; trades: number; rate: number; available: number; min: number; max: number; method: string };
type Option = { label: string; value: string };

const BUY: Offer[] = [
  { user: "Alamin H.", rating: 4.9, trades: 125, rate: 121.5, available: 500, min: 10, max: 500, method: "bKash" },
  { user: "Nusrat F.", rating: 5.0, trades: 320, rate: 121.8, available: 1200, min: 50, max: 1000, method: "Nagad" },
  { user: "Rashid K.", rating: 4.8, trades: 210, rate: 122.0, available: 800, min: 20, max: 800, method: "Bank Transfer" },
  { user: "Shakil A.", rating: 4.7, trades: 98, rate: 122.1, available: 300, min: 10, max: 300, method: "Rocket" },
  { user: "Tanvir H.", rating: 4.9, trades: 178, rate: 122.2, available: 1000, min: 50, max: 1000, method: "Bank Transfer" },
  { user: "Mahmud R.", rating: 4.8, trades: 96, rate: 122.3, available: 650, min: 20, max: 650, method: "bKash" },
  { user: "Tania R.", rating: 4.9, trades: 290, rate: 122.5, available: 400, min: 10, max: 400, method: "Nagad" },
  { user: "Karim S.", rating: 4.7, trades: 75, rate: 122.6, available: 900, min: 50, max: 900, method: "Bank Transfer" },
];
const SELL: Offer[] = [
  { user: "Karim S.", rating: 4.8, trades: 112, rate: 122.8, available: 300, min: 10, max: 300, method: "bKash" },
  { user: "Mim A.", rating: 4.9, trades: 205, rate: 123.0, available: 600, min: 20, max: 600, method: "Bank Transfer" },
  { user: "Rasel M.", rating: 4.7, trades: 78, rate: 123.1, available: 250, min: 10, max: 250, method: "Nagad" },
  { user: "Nayeem H.", rating: 4.8, trades: 130, rate: 123.2, available: 1000, min: 50, max: 1000, method: "Rocket" },
  { user: "Shuvo D.", rating: 4.6, trades: 52, rate: 123.3, available: 500, min: 20, max: 500, method: "bKash" },
  { user: "Parvez K.", rating: 4.8, trades: 98, rate: 123.5, available: 350, min: 10, max: 350, method: "Bank Transfer" },
  { user: "Rita S.", rating: 4.9, trades: 165, rate: 123.6, available: 800, min: 50, max: 800, method: "Nagad" },
  { user: "Jahid H.", rating: 4.8, trades: 88, rate: 123.8, available: 450, min: 20, max: 450, method: "Rocket" },
];

// what your API would return for the selected currency
const availableMethods = Object.keys(METHODS).map(name => ({ name }));

const AVATAR_COLORS = ["#2563eb", "#0d9488", "#7c3aed", "#db2777", "#ea580c", "#16a34a"];
const fmt = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 0 });

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

function Row({ o, kind, idx }: { o: Offer; kind: "buy" | "sell"; idx: number }) {
  const m = METHODS[o.method];
  return (
    <div className="pf-row">
      <div className="pf-user">
        <span className="pf-avatar" style={{ background: AVATAR_COLORS[(o.user.charCodeAt(0) + idx) % AVATAR_COLORS.length] }}>{o.user[0]}</span>
        <div>
          <div className="pf-name">{o.user}</div>
          <div className="pf-rating"><span className="pf-star">★</span> {o.rating.toFixed(1)} ({o.trades} trades)</div>
        </div>
      </div>
      <div className={`pf-rate pf-rate--${kind}`}>{o.rate.toFixed(2)}</div>
      <div className="pf-cell">{o.available.toLocaleString("en-US", { minimumFractionDigits: 2 })}</div>
      <div className="pf-cell">{o.min} – {fmt(o.max)}</div>
      <div className="pf-method"><span className="pf-mico" style={{ background: m.color }}>{m.glyph}</span>{m.label}</div>
      <button className={`pf-cta pf-cta--${kind}`}>{kind === "buy" ? "Buy" : "Sell"} USDT</button>
    </div>
  );
}

function Panel({ kind, offers, cur }: { kind: "buy" | "sell"; offers: Offer[]; cur: string }) {
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
          <span>Total Offers: <b>{offers.length}</b></span>
          <span className="pf-muted">Update: Just now</span>
        </div>
        <button className="pf-refresh" aria-label="Refresh offers">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-3-6.7" /><polyline points="21 3 21 9 15 9" /></svg>
        </button>
      </header>

      <div className="pf-scroll">
        <div className="pf-table">
          <div className="pf-row pf-row--head">
            <div>User</div><div>Rate ({cur || "—"})</div><div>Available (USDT)</div><div>Limit (USDT)</div><div>Payment Method</div><div>Action</div>
          </div>
          {offers.length === 0 && <div className="pf-empty">No offers match these filters. Try widening the amount or rate range.</div>}
          {offers.map((o, i) => <Row key={o.user + i} o={o} kind={kind} idx={i} />)}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Page ---------------- */
export default function Page() {
  // filters (same names as your original filter code)
  const [country, setCountry] = useState("BD");           // ISO2, "" = none
  const [filterFiat, setFilterFiat] = useState("BDT");
  const [filterMethod, setFilterMethod] = useState("");
  const [amt, setAmt] = useState({ min: "", max: "" });
  const [rate, setRate] = useState({ min: "", max: "" });

  const [tab, setTab] = useState<"buy" | "sell">("buy");
  const [more, setMore] = useState(false);
  const [view, setView] = useState<"market" | "create">("market");

  const countryOptions = useMemo(() => countryList().getData() as Option[], []);
  const currencyOptions = useMemo<Option[]>(
    () => CURRENCIES.map(c => ({ value: c.code, label: `${c.code} — ${c.name}` })),
    []
  );

  const countryValue = countryOptions.find(o => o.value === country) ?? null;
  const currencyValue = currencyOptions.find(o => o.value === filterFiat) ?? null;
  const methods = useMemo(() => [...new Map(availableMethods.map(m => [m.name, m])).values()], []);
  const pills = more ? PILLS : PILLS.slice(0, 6);

  /* handlers */
  const handleCountry = (opt: Option | null) => {
    const cc = opt?.value ?? "";
    setCountry(cc);
    if (cc) {
      const cur = COUNTRY_CUR[cc] ?? "";               // unsupported country -> pick a currency yourself
      if (cur !== filterFiat) setFilterMethod("");
      setFilterFiat(cur);
    }
  };
  const handleChange = (cur: string) => {              // currency changed
    setFilterFiat(cur);
    setFilterMethod("");
    if (cur && cur in CUR_HOME) setCountry(CUR_HOME[cur]);
  };
  const clearFilters = () => {
    setCountry(""); setFilterFiat(""); setFilterMethod("");
    setAmt({ min: "", max: "" }); setRate({ min: "", max: "" });
  };

  const hasFilter = !!(filterFiat || filterMethod || amt.min || amt.max || rate.min || rate.max);

  const run = (list: Offer[]) =>
    list.filter(o =>
      (!filterMethod || o.method === filterMethod) &&
      (!amt.min || o.max >= +amt.min) && (!amt.max || o.min <= +amt.max) &&
      (!rate.min || o.rate >= +rate.min) && (!rate.max || o.rate <= +rate.max)
    );
  const buy = useMemo(() => run(BUY), [filterMethod, amt, rate]);
  const sell = useMemo(() => run(SELL), [filterMethod, amt, rate]);
  const num = (v: string) => v.replace(/[^\d.]/g, "");

  const formatOption = (o: Option, flag: string) => (
    <span className="pfs-opt"><Flag cc={flag} size={18} />{o.label}</span>
  );

  if (view === "create") {
    return (
      <main className="pf">
        <CreateRequest onBack={() => setView("market")} />
      </main>
    );
  }

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
              {methods.map(m => <option key={m.name} value={m.name}>{m.name}</option>)}
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
          <button type="button" className="pf-search">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.5" y2="16.5" /></svg>
            Search
          </button>
        </div>
      </div>

      {/* Country pills */}
      {/* <div className="pf-pills">
        {pills.map(p => {
          const active = p.cc ? country === p.cc : filterFiat === p.cur && !country;
          return (
            <button
              key={p.name}
              type="button"
              className={`pf-pill ${active ? "is-active" : ""}`}
              aria-pressed={active}
              onClick={() => { setCountry(p.cc); setFilterFiat(p.cur); setFilterMethod(""); }}
            >
              <Flag cc={p.cc || "eu"} size={18} />{p.name}
            </button>
          );
        })}
        <button type="button" className="pf-pill pf-pill--more" onClick={() => setMore(m => !m)}>{more ? "Less" : "More"} <Chevron /></button>
      </div> */}

      {/* Action cards (tabs) */}
      <div className="pf-actions mt-3" role="tablist" aria-label="Offer type">
        <button role="tab" aria-selected={tab === "buy"} className={`pf-action pf-action--buy ${tab === "buy" ? "is-active" : ""}`} onClick={() => setTab("buy")}>
          <span className="pf-bigicon"><Cart /></span>
          <span className="pf-action-text"><b>I Want to Buy USDT</b><small>Find users who want to sell (Deposit Requests)</small></span>
          <span className="pf-count">{buy.length}</span>
        </button>
        <button role="tab" aria-selected={tab === "sell"} className={`pf-action pf-action--sell ${tab === "sell" ? "is-active" : ""}`} onClick={() => setTab("sell")}>
          <span className="pf-bigicon"><Cart /></span>
          <span className="pf-action-text"><b>I Want to Sell USDT</b><small>Find users who want to buy (Withdraw Requests)</small></span>
          <span className="pf-count">{sell.length}</span>
        </button>
        <button type="button" className="pf-action pf-action--create" onClick={() => setView("create")}>
          <span className="pf-bigicon pf-bigicon--plus">+</span>
          <span className="pf-action-text"><b>Create Your Own Request</b><small>Create Deposit or Withdraw request</small></span>
          <span className="pf-arrow"><Chevron /></span>
        </button>
      </div>

      {/* Table for the active tab */}
      <div className="pf-tables" role="tabpanel">
        {tab === "buy"
          ? <Panel kind="buy" offers={buy} cur={filterFiat} />
          : <Panel kind="sell" offers={sell} cur={filterFiat} />}
      </div>
    </main>
  );
}