'use client';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import countryList from 'react-select-country-list';
import { toast } from 'react-toastify';
import { getLocalAds, LocalAdsParams, P2pAdsData } from '@/app/api/p2padsapi';
import { currencyOptions as getPaymentCurrencies, sellMethodsByCurrency } from '@/app/api/common';
import { getBonusFeesSettings } from '@/app/api/merchant';
import { CurrencyOption, SellMethodOption } from '@/types/P2PProfileTypes';
import LocalBuyModal from './localBuyModal';
import LocalSellModal from './localSellModal';
import RecentRequestsCard from './RecentRequestsCard';
import './localBuySell.css';
import Link from 'next/link';
import QuickBuyModal from './create-ad/QuickBuyModal';
import QuickSellModal from './create-ad/QuickSellModal';

/* ───────────────── Static data ───────────────── */
const CURRENCIES = [
  { code: 'USD', name: 'US Dollar' },
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'British Pound' },
  { code: 'BDT', name: 'Bangladeshi Taka' },
  { code: 'INR', name: 'Indian Rupee' },
  { code: 'PKR', name: 'Pakistani Rupee' },
  { code: 'AUD', name: 'Australian Dollar' },
  { code: 'CAD', name: 'Canadian Dollar' },
  { code: 'JPY', name: 'Japanese Yen' },
  { code: 'CNY', name: 'Chinese Yuan' },
  { code: 'CHF', name: 'Swiss Franc' },
];

const COUNTRY_CUR: Record<string, string> = {
  BD: 'BDT', IN: 'INR', PK: 'PKR', US: 'USD', GB: 'GBP', AU: 'AUD', CA: 'CAD', JP: 'JPY', CN: 'CNY', CH: 'CHF',
  ...Object.fromEntries(
    ['AT','BE','CY','EE','FI','FR','DE','GR','IE','IT','LV','LT','LU','MT','NL','PT','SK','SI','ES','HR'].map(c => [c, 'EUR'])
  ),
};
const CUR_HOME: Record<string, string> = { BDT: 'BD', INR: 'IN', PKR: 'PK', USD: 'US', GBP: 'GB', AUD: 'AU', CAD: 'CA', JPY: 'JP', CNY: 'CN', CHF: 'CH', EUR: '' };

const METHOD_STYLE: Record<string, { color: string; glyph: string }> = {
  bKash: { color: '#e2136e', glyph: 'b' },
  Nagad: { color: '#f26522', glyph: 'N' },
  Rocket: { color: '#8c3494', glyph: 'R' },
  'Bank Transfer': { color: '#1d6fe0', glyph: '⌂' },
};

type Option = { label: string; value: string };
type Kind = 'buy' | 'sell';
type OfferView = Kind | 'all';
const API_TYPE: Record<Kind, 'buy' | 'sell'> = { buy: 'sell', sell: 'buy' };

type Bucket = {
  items: P2pAdsData[];
  page: number;
  last: number;
  total: number;
  from: number;
  to: number;
  loading: boolean;
  updated: string;
};
const EMPTY: Bucket = { items: [], page: 1, last: 1, total: 0, from: 0, to: 0, loading: false, updated: '' };

const n2 = (v: number | string, d = 2) => {
  const n = Number(v);
  return Number.isFinite(n) ? n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }) : '-';
};
const apiMsg = (e: any, fb: string) => e?.response?.data?.message ?? e?.message ?? fb;
const clock = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

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

/* ───────────────── Icons ───────────────── */
const Flag = ({ cc, size = 20 }: { cc: string; size?: number }) => (
  <img className="lbs-flag" src={`https://flagcdn.com/w40/${cc.toLowerCase()}.png`} srcSet={`https://flagcdn.com/w80/${cc.toLowerCase()}.png 2x`} width={size} height={size} alt="" loading="lazy" />
);
const Chevron = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
);
const CartIcon = ({ size = 22 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="20" r="1.5" /><circle cx="18" cy="20" r="1.5" /><path d="M2 3h3l2.7 12.4a1 1 0 0 0 1 .8h8.9a1 1 0 0 0 1-.8L20 7H6" /></svg>
);
const DownloadIcon = ({ size = 22 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
);
const SearchIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.5" y2="16.5" /></svg>
);
const RefreshIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-3-6.7" /><polyline points="21 3 21 9 15 9" /></svg>
);

/* ───────────────── Row ───────────────── */
function Row({
  ad,
  kind,
  bonusPercent,
  feePercent,
  onTrade,
}: {
  ad: P2pAdsData;
  kind: Kind;
  bonusPercent: number;
  feePercent: number;
  onTrade: (ad: P2pAdsData, kind: Kind) => void;
}) {
  const method = ad.payment_method?.sell_method?.name ?? '—';
  const style = METHOD_STYLE[method] ?? { color: '#3b82f6', glyph: method[0] ?? '?' };

  const usdtAmount = Number(ad.total_amount ?? 0);
  const isBuy = kind === 'buy';
  const pct = isBuy ? bonusPercent : feePercent;
  const bonusFee = (usdtAmount * pct) / 100;

  return (
    <div className="lbs-row">
      <div className="lbs-cell lbs-cell--amount">
        <span className={`lbs-pill lbs-pill--${kind}`}>{n2(ad.fixed_price * ad.total_amount, 0)}</span>
      </div>
      <div className="lbs-cell lbs-cell--price">{n2(ad.fixed_price)}</div>
      <div className="lbs-cell lbs-cell--avail">{n2(ad.total_amount)}</div>

      <div className="lbs-cell lbs-cell--bonus">
        <span className={isBuy ? 'lbs-bonus-pos' : 'lbs-bonus-neg'}>
          {isBuy ? '+' : '-'}
          {n2(Math.abs(bonusFee), 2)}
        </span>
        <small className="lbs-bonus-pct">({n2(pct, 2)}%)</small>
      </div>

      <div className="lbs-cell lbs-cell--time">{ad.payment_time_limit}</div>
      <div className="lbs-cell lbs-cell--methods">
        <span className="lbs-mico" style={{ background: style.color }}>{style.glyph}</span>
      </div>
      <div className="lbs-cell lbs-cell--action">
        <button
          type="button"
          className={`lbs-trade-btn lbs-trade-btn--${kind}`}
          onClick={() => onTrade(ad, kind)}
        >
          {kind === 'buy' ? 'Buy' : 'Sell'}
        </button>
      </div>
    </div>
  );
}

/* ───────────────── Panel ───────────────── */
function Panel({
  kind,
  b,
  cur,
  bonusPercent,
  feePercent,
  onRefresh,
  onTrade,
  sentinelRef,
}: {
  kind: Kind;
  b: Bucket;
  cur: string;
  bonusPercent: number;
  feePercent: number;
  onRefresh: () => void;
  onTrade: (ad: P2pAdsData, kind: Kind) => void;
  sentinelRef?: (el: HTMLDivElement | null) => void;
}) {
  const buy = kind === 'buy';

  return (
    <section id={`lbs-panel-${kind}`} className={`lbs-panel lbs-panel--${kind}`}>
      <header className="lbs-panel-head">
        <span className="lbs-panel-icon">
          {buy ? <CartIcon size={20} /> : <DownloadIcon size={20} />}
        </span>
        <div className="lbs-panel-title">
          <h3>{buy ? 'BUY' : 'SELL'}</h3>
          <p>USDT {buy ? 'from Trusted Sellers' : 'to Trusted Buyers'}</p>
        </div>
        <div className="lbs-panel-meta">
          <span>Total Offers: <b>{b.total}</b></span>
          <Link href="/dashboard/local-buy-sell/my-orders" className="lbs-view-all">View All →</Link>
        </div>
        <button
          type="button"
          className={`lbs-refresh ${b.loading ? 'is-spinning' : ''}`}
          onClick={onRefresh}
          disabled={b.loading}
          aria-label="Refresh"
        >
          <RefreshIcon />
        </button>
      </header>

      <div className="lbs-scroll">
        <div className="lbs-table">
          <div className="lbs-row lbs-row--head">
            <div className="lbs-cell">{buy ? 'Buy Amount (BDT)' : 'Sell Amount (BDT)'}</div>
            <div className="lbs-cell">Price (BDT)</div>
            <div className="lbs-cell">USDT Amount</div>
            <div className="lbs-cell">{buy ? 'Bonus' : 'Fee'} (USDT)</div>
            <div className="lbs-cell">Time (Min)</div>
            <div className="lbs-cell">Payment Methods</div>
            <div className="lbs-cell">Action</div>
          </div>

          {b.loading && b.items.length === 0 &&
            [0, 1, 2, 3, 4, 5].map(i => (
              <div key={i} className="lbs-row lbs-row--skel">
                {Array.from({ length: 7 }).map((_, j) => <span key={j} />)}
              </div>
            ))}

          {!b.loading && b.items.length === 0 && (
            <div className="lbs-empty">No offers match these filters.</div>
          )}

          <div className={b.loading && b.items.length > 0 ? 'lbs-fading' : undefined}>
            {b.items.map((ad, i) => (
              <Row
                key={`${kind}-${ad.id ?? i}`}
                ad={ad}
                kind={kind}
                bonusPercent={bonusPercent}
                feePercent={feePercent}
                onTrade={onTrade}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Infinite scroll sentinel + status */}
      <div ref={sentinelRef} className="lbs-sentinel" aria-hidden="true">
        {b.loading && b.items.length > 0 && (
          <div className="lbs-loadmore">
            <span className="lbs-loadmore-spinner" />
            Loading more…
          </div>
        )}
        {!b.loading && b.items.length > 0 && b.page >= b.last && (
          <div className="lbs-loadmore lbs-loadmore--end">
            You’ve reached the end — {b.total} offer{b.total === 1 ? '' : 's'} total
          </div>
        )}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Page
   ═══════════════════════════════════════════════════════════════ */
export default function Page() {
  /* ── Filter state ── */
  const [country, setCountry] = useState('');
  const [filterFiat, setFilterFiat] = useState('');
  const [filterMethod, setFilterMethod] = useState('');
  const [amt, setAmt] = useState({ min: '', max: '' });
  const [sortBy, setSortBy] = useState<OfferView>('all');
  const [tradeModal, setTradeModal] = useState<{ ad: P2pAdsData; kind: Kind } | null>(null);

  /* ── Bonus / Fee settings ── */
  const [bonusPercent, setBonusPercent] = useState(0);
  const [feePercent, setFeePercent] = useState(0);

  /* ── Data ── */
  const [data, setData] = useState<Record<Kind, Bucket>>({ buy: EMPTY, sell: EMPTY });
  const [paymentCurrencies, setPaymentCurrencies] = useState<CurrencyOption[]>([]);
  const [currencyMethods, setCurrencyMethods] = useState<SellMethodOption[]>([]);
  const [paymentMethodsLoading, setPaymentMethodsLoading] = useState(false);
  const [paymentMethodsError, setPaymentMethodsError] = useState(false);
  const [tick, setTick] = useState(0);
  const reqId = useRef<Record<Kind, number>>({ buy: 0, sell: 0 });

  /* ── Modals ── */
  const [quickBuyOpen, setQuickBuyOpen] = useState(false);
  const [quickSellOpen, setQuickSellOpen] = useState(false);

  const countryOptions = useMemo(() => countryList().getData() as Option[], []);

  const [filters, flushFilters] = useDebounced(
    { fiat: filterFiat, method: filterMethod, amtMin: amt.min, amtMax: amt.max },
    400
  );

  /* ── Infinite scroll refs ── */
  const sentinelRef = useRef<Record<Kind, HTMLDivElement | null>>({ buy: null, sell: null });
  const observerRef = useRef<Record<Kind, IntersectionObserver | null>>({ buy: null, sell: null });

  /* ── Load Bonus & Fee settings once ── */
  useEffect(() => {
    let mounted = true;
    const loadSettings = async () => {
      try {
        const res = await getBonusFeesSettings();
        const settings = res?.data ?? {};
        if (!mounted) return;
        setBonusPercent(Number(settings?.user_buy_bonus ?? 0));
        setFeePercent(Number(settings?.user_sell_charge ?? 0));
      } catch (error) {
        console.error('Failed to load bonus & fees settings:', error);
        if (mounted) {
          setBonusPercent(0);
          setFeePercent(0);
        }
      }
    };
    void loadSettings();
    return () => { mounted = false; };
  }, []);

  /* ── Payment currencies ── */
  useEffect(() => {
    let cancelled = false;
    getPaymentCurrencies()
      .then(res => {
        if (!cancelled) setPaymentCurrencies(res?.data ?? []);
      })
      .catch(error => {
        console.error('Failed to load payment currencies:', error);
        if (!cancelled) toast.error('Failed to load payment currencies.');
      });
    return () => { cancelled = true; };
  }, []);

  const paymentCurrency = paymentCurrencies.find(
    currency => currency.label.trim().toUpperCase() === filterFiat
  );

  useEffect(() => {
    if (!paymentCurrency) {
      setCurrencyMethods([]);
      setPaymentMethodsLoading(false);
      setPaymentMethodsError(false);
      return;
    }

    let cancelled = false;
    setCurrencyMethods([]);
    setPaymentMethodsLoading(true);
    setPaymentMethodsError(false);

    sellMethodsByCurrency(paymentCurrency.value)
      .then(res => {
        if (!cancelled) setCurrencyMethods(res?.data ?? []);
      })
      .catch(error => {
        console.error(`Failed to load payment methods for ${filterFiat}:`, error);
        if (!cancelled) setPaymentMethodsError(true);
      })
      .finally(() => {
        if (!cancelled) setPaymentMethodsLoading(false);
      });

    return () => { cancelled = true; };
  }, [paymentCurrency, filterFiat]);

  /* ── Fetch first page ── */
  const fetchBucket = useCallback(async (kind: Kind, page = 1) => {
    if (!filters.fiat) {
      setData(previous => ({
        ...previous,
        [kind]: { ...EMPTY, loading: false },
      }));
      return;
    }

    const id = ++reqId.current[kind];
    setData(p => ({ ...p, [kind]: { ...p[kind], loading: true } }));

    try {
      const params: LocalAdsParams = {
        type: API_TYPE[kind],
        page,
        with_fiat: filters.fiat,
        payment_method: filters.method || undefined,
        amount_min: filters.amtMin || undefined,
        amount_max: filters.amtMax || undefined,
      };
      const res = await getLocalAds(params);
      if (id !== reqId.current[kind]) return;
      if (res?.error) throw new Error(res.message);

      const d = res?.data;
      const items: P2pAdsData[] = Array.isArray(d) ? d : d?.data ?? [];

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
      toast.error(apiMsg(e, 'Failed to load offers.'));
      setData(p => ({ ...p, [kind]: { ...p[kind], loading: false } }));
    }
  }, [filters]);

  /* ── Load next page (append) ── */
  const loadMore = useCallback(async (kind: Kind) => {
    const current = data[kind];
    if (current.loading) return;
    if (current.page >= current.last) return;
    if (!filters.fiat) return;

    const nextPage = current.page + 1;
    const id = ++reqId.current[kind];
    setData(p => ({ ...p, [kind]: { ...p[kind], loading: true } }));

    try {
      const params: LocalAdsParams = {
        type: API_TYPE[kind],
        page: nextPage,
        with_fiat: filters.fiat,
        payment_method: filters.method || undefined,
        amount_min: filters.amtMin || undefined,
        amount_max: filters.amtMax || undefined,
      };
      const res = await getLocalAds(params);
      if (id !== reqId.current[kind]) return;
      if (res?.error) throw new Error(res.message);

      const d = res?.data;
      const items: P2pAdsData[] = Array.isArray(d) ? d : d?.data ?? [];

      setData(p => ({
        ...p,
        [kind]: {
          ...p[kind],
          items: [...p[kind].items, ...items],
          page: d?.current_page ?? nextPage,
          last: d?.last_page ?? 1,
          total: d?.total ?? p[kind].total,
          to: d?.to ?? p[kind].items.length + items.length,
          loading: false,
          updated: clock(),
        },
      }));
    } catch (e: any) {
      if (id !== reqId.current[kind]) return;
      toast.error(apiMsg(e, 'Failed to load more offers.'));
      setData(p => ({ ...p, [kind]: { ...p[kind], loading: false } }));
    }
  }, [data, filters]);

  /* ── Initial fetch & refetch on filter change ── */
  useEffect(() => {
    if (!filters.fiat) {
      reqId.current.buy += 1;
      reqId.current.sell += 1;
      setData({ buy: { ...EMPTY }, sell: { ...EMPTY } });
      return;
    }
    fetchBucket('buy', 1);
    fetchBucket('sell', 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchBucket, filters.fiat, tick]);

  /* ── Infinite scroll observers ── */
  useEffect(() => {
    if (!filterFiat) return;

    (['buy', 'sell'] as const).forEach(kind => {
      observerRef.current[kind]?.disconnect();

      const el = sentinelRef.current[kind];
      if (!el) return;

      const observer = new IntersectionObserver(
        entries => {
          const entry = entries[0];
          if (!entry?.isIntersecting) return;
          const b = data[kind];
          if (!b.loading && b.items.length > 0 && b.page < b.last) {
            void loadMore(kind);
          }
        },
        { rootMargin: '120px 0px' }
      );

      observer.observe(el);
      observerRef.current[kind] = observer;
    });

    return () => {
      observerRef.current.buy?.disconnect();
      observerRef.current.sell?.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterFiat, data.buy.page, data.sell.page, data.buy.last, data.sell.last]);

  /* ── Handlers ── */
  const handleTrade = (ad: P2pAdsData, kind: Kind) => setTradeModal({ ad, kind });

  const handleCountry = (opt: Option | null) => {
    const cc = opt?.value ?? '';
    setCountry(cc);
    if (cc) {
      const cur = COUNTRY_CUR[cc] ?? '';
      if (cur !== filterFiat) {
        setFilterMethod('');
        reqId.current.buy += 1;
        reqId.current.sell += 1;
        setData({ buy: { ...EMPTY }, sell: { ...EMPTY } });
      }
      setFilterFiat(cur);
    }
  };

  const handleChange = (cur: string) => {
    if (cur !== filterFiat) {
      reqId.current.buy += 1;
      reqId.current.sell += 1;
      setData({ buy: { ...EMPTY }, sell: { ...EMPTY } });
    }
    setFilterFiat(cur);
    setFilterMethod('');
    setCountry(cur && cur in CUR_HOME ? CUR_HOME[cur] : '');
  };

  const handleSearch = () => { flushFilters(); setTick(t => t + 1); };

  const handleRefresh = () => {
    if (!filterFiat) return;
    reqId.current.buy += 1;
    reqId.current.sell += 1;
    setData({ buy: { ...EMPTY, loading: true }, sell: { ...EMPTY, loading: true } });
    fetchBucket('buy', 1);
    fetchBucket('sell', 1);
  };

  const num = (v: string) => v.replace(/[^\d.]/g, '');

  /* ───────────────── Render ───────────────── */
  return (
    <main className="lbs">
      {/* ═════════ HERO / HEADER BANNER ═════════ */}
      <section className="lbs-hero">
        <div className="lbs-hero-left">
          <span className="lbs-hero-icon"><CartIcon size={26} /></span>
          <div>
            <h1 className="lbs-hero-title">Local Buy &amp; Sell Marketplace</h1>
            <p className="lbs-hero-sub">
              Buy and sell USDT locally with verified users. Fast, secure and hassle-free transactions.
            </p>
          </div>
        </div>

        <div className="lbs-hero-stats">
          <div className="lbs-stat">
            <span className="lbs-stat-icon lbs-stat-icon--blue">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M12 12c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm0 2c-3.33 0-10 1.67-10 5v3h20v-3c0-3.33-6.67-5-10-5z" />
              </svg>
            </span>
            <div>
              <b>{data.buy.total + data.sell.total + 1284}</b>
              <small>Online Users</small>
            </div>
          </div>
          <div className="lbs-stat">
            <span className="lbs-stat-icon lbs-stat-icon--amber">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M16 11c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 3-1.34 3-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5C15 14.17 10.33 13 8 13zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
              </svg>
            </span>
            <div>
              <b>12,540</b>
              <small>Total Traders</small>
            </div>
          </div>
          <div className="lbs-stat">
            <span className="lbs-stat-icon lbs-stat-icon--green">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M5 9h3v11H5zM10.5 5h3v15h-3zM16 12h3v8h-3z" />
              </svg>
            </span>
            <div>
              <b>325,420 USDT</b>
              <small>24h Volume</small>
            </div>
          </div>
        </div>
      </section>

      {/* ═════════ TOP BAR ═════════ */}
      <section className="lbs-topbar">
        <div className="lbs-topbar-tabs">
          <button
            type="button"
            onClick={() => setQuickBuyOpen(true)}
            className="lbs-topbar-tab lbs-topbar-tab--buy is-active"
          >
            <CartIcon size={18} />
            <span>Buy USDT</span>
          </button>
          <button
            type="button"
            className="lbs-topbar-tab lbs-topbar-tab--sell"
            onClick={() => setQuickSellOpen(true)}
          >
            <DownloadIcon size={18} />
            <span>Sell USDT</span>
          </button>
        </div>

        <div className="lbs-topbar-right">
          <div className="lbs-topbar-select">
            <span className="lbs-topbar-icon lbs-topbar-icon--usdt">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="#fff">
                <path d="M12 2 2 12l10 10 10-10L12 2zm-1.5 6.5h-3v-1.5h7.5v1.5h-3v6.5h-1.5V8.5z" />
              </svg>
            </span>
            <select
              className="lbs-topbar-select-input"
              value={filterFiat}
              onChange={e => handleChange(e.target.value)}
            >
              <option value="">Select currency *</option>
              {CURRENCIES.map(c => (
                <option key={c.code} value={c.code}>{c.code}</option>
              ))}
            </select>
            <span className="lbs-topbar-chev"><Chevron /></span>
          </div>

          <div className="lbs-topbar-select">
            <span className="lbs-topbar-flag">
              <Flag cc={country || 'BD'} size={18} />
            </span>
            <select
              className="lbs-topbar-select-input"
              value={country}
              onChange={e => handleCountry({ label: '', value: e.target.value })}
            >
              <option value="">Select country (optional)</option>
              {countryOptions.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <span className="lbs-topbar-chev"><Chevron /></span>
          </div>

          <button type="button" className="lbs-topbar-refresh" onClick={handleRefresh}>
            <RefreshIcon />
            <span>Refresh</span>
          </button>
        </div>
      </section>

      {/* ═════════ FILTER ROW ═════════ */}
      <section className="lbs-filters">
        <div className="lbs-field">
          <label className="lbs-label">Deposit Amount ({filterFiat || 'BDT'})</label>
          <div className="lbs-range">
            <input
              className="lbs-input"
              inputMode="decimal"
              placeholder="Min"
              value={amt.min}
              onChange={e => setAmt({ ...amt, min: num(e.target.value) })}
            />
            <span className="lbs-range-sep">–</span>
            <input
              className="lbs-input"
              inputMode="decimal"
              placeholder="Max"
              value={amt.max}
              onChange={e => setAmt({ ...amt, max: num(e.target.value) })}
            />
          </div>
        </div>

        <div className="lbs-field">
          <label className="lbs-label">Payment Method</label>
          <div className="lbs-selwrap">
            <span className="lbs-sel-icon lbs-sel-icon--bank">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="#fff">
                <path d="M12 2 2 8v2h20V8L12 2zM4 12v6h3v-6H4zm6 0v6h4v-6h-4zm7 0v6h3v-6h-3zM2 20h20v2H2v-2z" />
              </svg>
            </span>
            <select
              className="lbs-input lbs-select"
              value={filterMethod}
              disabled={!filterFiat || paymentMethodsLoading || paymentMethodsError}
              onChange={e => setFilterMethod(e.target.value)}
            >
              <option value="">All Payment Methods</option>
              {currencyMethods.map(method => (
                <option key={method.value} value={method.label}>{method.label}</option>
              ))}
            </select>
            <span className="lbs-sel-chevron"><Chevron /></span>
          </div>
          {paymentMethodsLoading && <small className="lbs-filter-message">Loading methods for {filterFiat}…</small>}
          {paymentMethodsError && <small className="lbs-filter-message lbs-filter-message--error">Could not load methods for {filterFiat}.</small>}
          {!paymentMethodsLoading && !paymentMethodsError && filterFiat && currencyMethods.length === 0 && (
            <small className="lbs-filter-message">No payment methods available for {filterFiat}.</small>
          )}
        </div>

        <div className="lbs-field">
          <label className="lbs-label">Sort By</label>
          <div className="lbs-selwrap">
            <select
              className="lbs-input lbs-select lbs-select--plain"
              value={sortBy}
              onChange={e => setSortBy(e.target.value as OfferView)}
            >
              <option value="all">All</option>
              <option value="buy">Buy</option>
              <option value="sell">Sell</option>
            </select>
            <span className="lbs-sel-chevron"><Chevron /></span>
          </div>
        </div>

        <div className="lbs-field lbs-field--btn mt-4 pt-2">
          <button type="button" className="lbs-search-btn mt-4" onClick={handleSearch}>
            <SearchIcon /> Search Offers
          </button>
        </div>
      </section>

      {/* ═════════ TWO PANELS ═════════ */}
      {!filterFiat ? (
        <div className="lbs-empty lbs-currency-required">Select a currency to view offers.</div>
      ) : (
        <div className="lbs-panels">
          {(['buy', 'sell'] as const)
            .filter(kind => sortBy === 'all' || sortBy === kind)
            .map(kind => (
              <Panel
                key={kind}
                kind={kind}
                b={data[kind]}
                cur={filterFiat}
                bonusPercent={bonusPercent}
                feePercent={feePercent}
                onRefresh={() => fetchBucket(kind, 1)}
                onTrade={handleTrade}
                sentinelRef={el => { sentinelRef.current[kind] = el; }}
              />
            ))}
        </div>
      )}

      {/* ═════════ QUICK MODALS ═════════ */}
      {quickBuyOpen && (
        <QuickBuyModal
          onClose={() => setQuickBuyOpen(false)}
          onSuccess={() => {
            fetchBucket('buy', 1);
            fetchBucket('sell', 1);
          }}
        />
      )}

      {quickSellOpen && (
        <QuickSellModal
          onClose={() => setQuickSellOpen(false)}
          onSuccess={() => {
            fetchBucket('buy', 1);
            fetchBucket('sell', 1);
          }}
        />
      )}

      {/* ═════════ BOTTOM DASHBOARD ═════════ */}
      <div className="lbs-dashboard">
        <RecentRequestsCard />
      </div>

      {tradeModal && tradeModal.kind === 'buy' && (
        <LocalBuyModal ad={tradeModal.ad} onClose={() => setTradeModal(null)} />
      )}
      {tradeModal && tradeModal.kind === 'sell' && (
        <LocalSellModal ad={tradeModal.ad} onClose={() => setTradeModal(null)} />
      )}
    </main>
  );
}