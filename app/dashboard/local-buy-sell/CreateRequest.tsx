'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import ReactSelect from 'react-select';
import { toast } from 'react-toastify';
import { createAd, getAd, updateAd, P2pAdPayload } from '@/app/api/p2padsapi';
import { GetCurrencyLimitApi } from '@/app/api/p2p';
import { createUserPaymentMethod, getUserPaymentMethods } from '@/app/api/common';
import { ModalMode, PaymentFormData } from '@/types/P2PProfileTypes';
import PaymentModal from '@/components/dashboard/p2pProfile/Paymentmodal';
import AddSecurityMoneyModal from '@/app/dashboard/ads/AddSecurityMonyModal';
import { useAuth } from '@/hooks/useAuth';
import './CreateRequest.css';

/* ───────────── Types ───────────── */
interface Conditions { registered: boolean; registerDays: number; holdingsBTC: boolean; holdingsAmount: number; }

export interface FormData {
  type: 'buy' | 'sell';
  asset: string;
  withFlat: string;
  priceType: 'fixed' | 'floating';
  fixedPrice: number;
  totalAmount: string;          // always stored as ASSET amount
  orderLimitMin: number;        // always stored as ASSET amount
  orderLimitMax: number;        // always stored as ASSET amount
  paymentMethodId: number;
  paymentTimeLimit: string;
  terms: string[];
  remarks: string;
  autoReply: string;
  displayRegion: string;
  conditions: Conditions;
  status: boolean;
  ad_create_type: 'local' | 'merchant';
}
type Errors = Record<string, string>;
type CurrencyLimit = { currency_code: string; min_amount: string | number | null; max_amount: string | number | null; is_active: boolean };
type Option = { value: string; label: string };

/* ───────────── Constants ───────────── */
const CURRENCIES = [
  { code: 'USD', name: 'US Dollar', icon: '$', cc: 'us' },
  { code: 'EUR', name: 'Euro', icon: '€', cc: 'eu' },
  { code: 'GBP', name: 'British Pound', icon: '£', cc: 'gb' },
  { code: 'BDT', name: 'Bangladeshi Taka', icon: '৳', cc: 'bd' },
  { code: 'INR', name: 'Indian Rupee', icon: '₹', cc: 'in' },
  { code: 'PKR', name: 'Pakistani Rupee', icon: '₨', cc: 'pk' },
  { code: 'AUD', name: 'Australian Dollar', icon: '$', cc: 'au' },
  { code: 'CAD', name: 'Canadian Dollar', icon: '$', cc: 'ca' },
  { code: 'JPY', name: 'Japanese Yen', icon: '¥', cc: 'jp' },
  { code: 'CNY', name: 'Chinese Yuan', icon: '¥', cc: 'cn' },
  { code: 'CHF', name: 'Swiss Franc', icon: 'CHF', cc: 'ch' },
];
const REGIONS = [
  { value: 'all', label: 'All Regions' },
  { value: 'asia', label: 'Asia' },
  { value: 'europe', label: 'Europe' },
  { value: 'americas', label: 'Americas' },
];
const TIME_LIMITS = Array.from({ length: 144 }, (_, i) => (i + 1) * 5);

const DEFAULT_FORM: FormData = {
  type: 'buy', asset: 'USDT', withFlat: '', priceType: 'fixed', fixedPrice: 0,
  totalAmount: '', orderLimitMin: 0, orderLimitMax: 0, paymentMethodId: 0, paymentTimeLimit: '',
  terms: [], remarks: '', autoReply: '', displayRegion: 'all',
  conditions: { registered: false, registerDays: 0, holdingsBTC: false, holdingsAmount: 0 },
  status: true,
  ad_create_type: 'local',
};

/* ───────────── Validation (same rules as the 3 steps) ───────────── */
function validate(d: FormData): Errors {
  const e: Errors = {};
  if (!d.asset) e.asset = 'Asset is required.';
  if (!d.withFlat) e.withFlat = 'Fiat currency is required.';
  if (!d.priceType) e.priceType = 'Price type is required.';
  if (d.priceType === 'fixed' && d.fixedPrice <= 0) e.fixedPrice = 'Fixed price must be greater than 0.';

  if (!d.totalAmount || parseFloat(d.totalAmount) <= 0) e.totalAmount = 'Total amount must be greater than 0.';
  if (!d.orderLimitMin || d.orderLimitMin <= 0) e.orderLimitMin = 'Minimum order limit is required.';
  if (!d.orderLimitMax || d.orderLimitMax <= 0) e.orderLimitMax = 'Maximum order limit is required.';
  if (d.orderLimitMin > 0 && d.orderLimitMax > 0 && d.orderLimitMin >= d.orderLimitMax)
    e.orderLimitMax = 'Maximum must be greater than minimum.';
  if (!d.paymentMethodId) e.paymentMethodId = 'Please select a payment method.';
  if (!d.paymentTimeLimit) e.paymentTimeLimit = 'Payment time limit is required.';

  if (!d.displayRegion) e.displayRegion = 'Display region is required.';
  return e;
}

function toPayload(d: FormData): P2pAdPayload {
  return {
    type: d.type,
    asset: d.asset,
    with_fiat: d.withFlat,
    price_type: d.priceType,
    fixed_price: d.fixedPrice,
    total_amount: d.totalAmount,
    order_limit_min: d.orderLimitMin,
    order_limit_max: d.orderLimitMax,
    payment_method_id: d.paymentMethodId,
    payment_time_limit: d.paymentTimeLimit,
    terms: d.terms,
    remarks: d.remarks,
    auto_reply: d.autoReply,
    display_region: d.displayRegion,
    status: d.status,
    ad_create_type: d.ad_create_type,
  };
}

/* ───────────── Small parts ───────────── */
const Err = ({ m }: { m?: string }) =>
  m ? <div className="cr-err" role="alert"><i className="fa-solid fa-circle-exclamation" /> {m}</div> : null;

const Flag = ({ cc }: { cc: string }) => (
  <img className="pf-flag" src={`https://flagcdn.com/w40/${cc}.png`} srcSet={`https://flagcdn.com/w80/${cc}.png 2x`} width={18} height={18} alt="" />
);

const Card = ({ icon, title, hint, children }: { icon: string; title: string; hint?: string; children: React.ReactNode }) => (
  <section className="cr-card">
    <header className="cr-card-head">
      <span className="cr-card-icon"><i className={icon} /></span>
      <div><h3>{title}</h3>{hint && <p>{hint}</p>}</div>
    </header>
    <div className="cr-card-body">{children}</div>
  </section>
);

const num = (v: string) => (v === '' ? '' : v);
const money = (n: number, d = 2) => (Number.isFinite(n) ? n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }) : '0.00');

/* ───────────── Component ───────────── */
export default function CreateRequest({ onBack, onDone, editId }: { onBack: () => void; onDone?: () => void; editId?: number }) {
  const router = useRouter();
  const { user } = useAuth();
  const finish = onDone ?? (() => router.push('/dashboard/ads/'));
  const isEdit = Boolean(editId);
  const [loadingAd, setLoadingAd] = useState(isEdit);
  const skipSync = useRef(false);   // don't re-derive amounts from rounded inputs right after loading an ad

  const [formData, setFormData] = useState<FormData>(DEFAULT_FORM);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  // currency limits
  const [limit, setLimit] = useState<CurrencyLimit | null>(null);
  const [limitLoading, setLimitLoading] = useState(false);
  const [priceRangeError, setPriceRangeError] = useState<string | null>(null);

  // payment methods
  const [methods, setMethods] = useState<any[]>([]);
  const [loadingMethods, setLoadingMethods] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode | null>(null);
  const [saving, setSaving] = useState(false);

  // security deposit modal
  const [depositOpen, setDepositOpen] = useState(false);
  const [depositRequired, setDepositRequired] = useState(0);

  // typed (display) values — fiat for buy total, asset for sell total, fiat for limits
  const [totalIn, setTotalIn] = useState('');
  const [minIn, setMinIn] = useState('');
  const [maxIn, setMaxIn] = useState('');

  const isSell = formData.type === 'sell';
  const price = formData.fixedPrice;
  const cur = CURRENCIES.find(c => c.code === (formData.withFlat || 'BDT'));
  const fiatCode = formData.withFlat || 'BDT';
  const fiatIcon = cur?.icon ?? '';
  const assetCode = formData.asset || 'USDT';

  const change = (data: Partial<FormData>) => {
    setFormData(p => ({ ...p, ...data }));
    setErrors(p => { const n = { ...p }; Object.keys(data).forEach(k => delete n[k]); return n; });
  };

  /* ── currency limit fetch ── */
  useEffect(() => {
    if (!formData.withFlat) { setLimit(null); setPriceRangeError(null); return; }
    let cancelled = false;
    setLimitLoading(true);
    (async () => {
      try {
        const res = await GetCurrencyLimitApi({ currency: formData.withFlat, order_type: formData.type });
        if (cancelled) return;
        setLimit(!res?.error ? res.data : null);
      } catch {
        if (!cancelled) setLimit(null);
      } finally {
        if (!cancelled) setLimitLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [formData.withFlat, formData.type]);

  /* ── price vs limit ── */
  useEffect(() => {
    if (!limit || limit.min_amount === null) { setPriceRangeError(null); return; }
    const min = Number(limit.min_amount);
    const max = limit.max_amount === null ? null : Number(limit.max_amount);
    if (price < min) setPriceRangeError(`Price must be at least ${min.toLocaleString()} ${formData.withFlat}.`);
    else if (max !== null && price > max) setPriceRangeError(`Price must not exceed ${max.toLocaleString()} ${formData.withFlat}.`);
    else setPriceRangeError(null);
  }, [limit, price, formData.withFlat]);

  /* ── keep stored asset amounts correct when the price changes (all fields are on one page now) ── */
  useEffect(() => {
    if (skipSync.current) { skipSync.current = false; return; }
    if (!price) return;
    const patch: Partial<FormData> = {};
    if (totalIn && !isSell) patch.totalAmount = String((parseFloat(totalIn) || 0) / price);
    if (minIn) patch.orderLimitMin = (parseFloat(minIn) || 0) / price;
    if (maxIn) patch.orderLimitMax = (parseFloat(maxIn) || 0) / price;
    if (Object.keys(patch).length) change(patch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [price]);

  /* ── load the ad when editing ── */
  useEffect(() => {
    if (!editId) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await getAd(editId);
        const ad = res?.data;
        if (cancelled) return;
        if (!ad) throw new Error('not found');
        const p = Number(ad.fixed_price ?? 0);
        const total = Number(ad.total_amount ?? 0);
        const r = (n: number) => String(+n.toFixed(4));
        skipSync.current = p > 0;
        setFormData({
          ...DEFAULT_FORM,
          type: ad.type ?? 'buy',
          asset: ad.asset ?? 'USDT',
          withFlat: ad.with_fiat ?? '',
          priceType: ad.price_type ?? 'fixed',
          fixedPrice: p,
          totalAmount: String(ad.total_amount ?? ''),
          orderLimitMin: Number(ad.order_limit_min ?? 0),
          orderLimitMax: Number(ad.order_limit_max ?? 0),
          paymentMethodId: Number(ad.payment_method_id ?? 0),
          paymentTimeLimit: String(ad.payment_time_limit ?? ''),
          terms: Array.isArray(ad.terms) ? ad.terms : [],
          remarks: ad.remarks ?? '',
          autoReply: ad.auto_reply ?? '',
          displayRegion: ad.display_region ?? 'all',
          status: Boolean(ad.status),
        });
        setTotalIn(ad.type === 'sell' ? r(total) : r(total * p));
        setMinIn(r(Number(ad.order_limit_min ?? 0) * p));
        setMaxIn(r(Number(ad.order_limit_max ?? 0) * p));
      } catch {
        if (!cancelled) { toast.error('Ad data not found. Please try again.'); onBack(); }
      } finally {
        if (!cancelled) setLoadingAd(false);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editId]);

  /* ── payment methods ── */
  const loadMethods = useCallback(async () => {
    setLoadingMethods(true);
    try {
      const res = await getUserPaymentMethods();
      setMethods(res?.data ?? []);
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? e?.message ?? 'Failed to load payment methods.');
    } finally {
      setLoadingMethods(false);
    }
  }, []);
  useEffect(() => { loadMethods(); }, [loadMethods]);

  const handleModalSubmit = async (data: PaymentFormData) => {
    setSaving(true);
    try {
      if (modalMode === 'add') {
        const res = await createUserPaymentMethod(data);
        toast.success('Payment method added successfully.');
        setMethods(prev => [res.data, ...prev]);
        change({ paymentMethodId: Number(res.data?.id) || 0 });
      }
      setModalMode(null);
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? e?.message ?? 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  /* ── handlers ── */
  const handleType = (t: 'buy' | 'sell') => {
    if (isEdit || t === formData.type) return;
    setTotalIn(''); setMinIn(''); setMaxIn(''); setPriceRangeError(null);
    change({ type: t, fixedPrice: 0, totalAmount: '', orderLimitMin: 0, orderLimitMax: 0 });
  };

  const handleTotal = (v: string) => {
    setTotalIn(v);
    if (isSell) change({ totalAmount: v });
    else change({ totalAmount: v && price ? String(parseFloat(v) / price) : '' });
  };
  const handleMin = (v: string) => { setMinIn(v); change({ orderLimitMin: v && price ? parseFloat(v) / price || 0 : 0 }); };
  const handleMax = (v: string) => { setMaxIn(v); change({ orderLimitMax: v && price ? parseFloat(v) / price || 0 : 0 }); };

  const totalHelp = totalIn && price
    ? (isSell ? parseFloat(totalIn) * price : parseFloat(totalIn) / price)
    : 0;
  const minHelp = minIn && price ? parseFloat(minIn) / price : 0;
  const maxHelp = maxIn && price ? parseFloat(maxIn) / price : 0;

  const resetForm = () => {
    setFormData(DEFAULT_FORM); setErrors({}); setTotalIn(''); setMinIn(''); setMaxIn('');
  };

  const handleSubmit = async () => {
    const found = validate(formData);
    if (priceRangeError && !found.fixedPrice) found.fixedPrice = priceRangeError;
    if (Object.keys(found).length) {
      setErrors(found);
      toast.error('Please fix the highlighted errors.');
      requestAnimationFrame(() =>
        document.querySelector('.cr .cr-err')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      );
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      const payload = toPayload(formData);

      if (editId) {
        await updateAd(editId, payload);
        toast.success('Ad updated successfully!');
        finish();
        return;
      }

      await createAd({ ...payload, ad_create_type: 'local' });
      const required = payload.type === 'sell' ? Number(payload.total_amount || 0) : 0;
      resetForm();
      toast.success('Ad posted successfully!');
      if (required > 0) {
        setDepositRequired(required);
        setDepositOpen(true);
        return;
      }
      finish();
    } catch (e: any) {
      const laravel: Record<string, string[]> = e?.response?.data?.errors ?? {};
      if (Object.keys(laravel).length) {
        const flat: Errors = {};
        Object.entries(laravel).forEach(([k, msgs]) => {
          flat[k.replace(/_([a-z])/g, (_, c) => c.toUpperCase())] = msgs[0];
        });
        setErrors(flat);
        toast.error('Please fix the highlighted errors.');
      } else {
        toast.error(e?.response?.data?.message ?? e?.message ?? 'Something went wrong.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const fmtLimit = (v: string | number | null | undefined) => {
    if (v === null || v === undefined) return '-';
    const n = Number(v);
    return Number.isNaN(n) ? '-' : n.toLocaleString(undefined, { maximumFractionDigits: 2 });
  };

  const currencyOptions: Option[] = CURRENCIES.map(c => ({ value: c.code, label: `${c.code} — ${c.name}` }));
  const selectedMethod = methods.find(m => Number(m.id) === formData.paymentMethodId);

  /* ───────────── Render ───────────── */
  if (loadingAd) {
    return (
      <div className="cr">
        <div className="cr-card"><div className="cr-card-body cr-muted">Loading ad…</div></div>
      </div>
    );
  }

  return (
    <div className={`cr cr--${formData.type}`}>
      <div className="cr-head">
        <div>
          <h2>{isEdit ? 'Edit Request' : 'Create Your Own Request'}</h2>
          <p>{isEdit ? 'Update the details of your request.' : `Post a ${isSell ? 'withdraw' : 'deposit'} request and let traders come to you.`}</p>
        </div>
        <button type="button" className="cr-back" onClick={onBack}>
          <i className="fa-solid fa-arrow-left" /> {isEdit ? 'Back to my ads' : 'Back to market'}
        </button>
      </div>

      <div className="cr-grid">
        <div className="cr-main">

          {/* ── Type & price ── */}
          <Card icon="fa-solid fa-tag" title="Type &amp; price" hint="Choose what you want to do and set your price.">
            <div className="cr-type" role="radiogroup" aria-label="Request type">
              <button type="button" role="radio" aria-checked={!isSell} disabled={isEdit} className={`cr-type-btn cr-type-btn--buy ${!isSell ? 'is-active' : ''}`} onClick={() => handleType('buy')}>
                <b>Buy USDT</b><small>Deposit request</small>
              </button>
              <button type="button" role="radio" aria-checked={isSell} disabled={isEdit} className={`cr-type-btn cr-type-btn--sell ${isSell ? 'is-active' : ''}`} onClick={() => handleType('sell')}>
                <b>Sell USDT</b><small>Withdraw request</small>
              </button>
            </div>

            <div className="cr-two">
              <div className="cr-field">
                <label className="pf-label">Asset <span className="cr-req">*</span></label>
                <div className="pf-selwrap">
                  <select className={`pf-input pf-sel ${errors.asset ? 'is-invalid' : ''}`} value={formData.asset} onChange={e => change({ asset: e.target.value })}>
                    <option value="">Select asset</option>
                    <option value="USDT">USDT</option>
                  </select>
                  <i className="fa-solid fa-chevron-down cr-caret" />
                </div>
                <Err m={errors.asset} />
              </div>

              <div className="cr-field">
                <label className="pf-label">Your currency <span className="cr-req">*</span></label>
                <ReactSelect<Option>
                  instanceId="crCurrency"
                  classNamePrefix="pfs"
                  options={currencyOptions}
                  value={currencyOptions.find(o => o.value === formData.withFlat) ?? null}
                  onChange={v => change({ withFlat: (v as Option | null)?.value ?? '' })}
                  placeholder="Search currency"
                  isSearchable
                  components={{ IndicatorSeparator: null }}
                  formatOptionLabel={o => (
                    <span className="pfs-opt"><Flag cc={CURRENCIES.find(c => c.code === o.value)?.cc ?? 'un'} />{o.label}</span>
                  )}
                />
                <Err m={errors.withFlat} />
              </div>
            </div>

            <div className="cr-field">
              <label className="pf-label">{isSell ? 'Sell price' : 'Buy price'} <span className="cr-req">*</span></label>
              <div className={`cr-stepper ${errors.fixedPrice || priceRangeError ? 'is-invalid' : ''}`}>
                <button type="button" aria-label="Decrease price" onClick={() => change({ fixedPrice: Math.max(0, +(price - 1).toFixed(2)) })}><i className="fa-solid fa-minus" /></button>
                <input type="number" step="0.01" min="0" value={price || ''} placeholder="0.00" onChange={e => change({ fixedPrice: parseFloat(e.target.value) || 0 })} />
                <span className="cr-stepper-cur">{fiatCode}</span>
                <button type="button" aria-label="Increase price" onClick={() => change({ fixedPrice: +(price + 1).toFixed(2) })}><i className="fa-solid fa-plus" /></button>
              </div>
              <Err m={errors.fixedPrice || priceRangeError || undefined} />
            </div>

            <div className="cr-stats">
              <div><small>Your price</small><b>{formData.withFlat || 'USD'} {money(price)}</b></div>
              <div><small>Minimum price</small><b>{limitLoading ? '…' : fmtLimit(limit?.min_amount)}</b></div>
              <div><small>Maximum price</small><b>{limitLoading ? '…' : fmtLimit(limit?.max_amount)}</b></div>
            </div>
          </Card>

          {/* ── Amount & payment ── */}
          <Card icon="fa-solid fa-coins" title="Amount &amp; payment" hint="Set how much you trade and how you get paid.">
            <div className="cr-field">
              <label className="pf-label">Total {isSell ? 'sell' : 'buy'} amount <span className="cr-req">*</span></label>
              <div className={`cr-affix ${errors.totalAmount ? 'is-invalid' : ''}`}>
                <span className="cr-affix-pre">{isSell ? '$' : fiatIcon}</span>
                <input type="number" min="0" placeholder={`Enter total ${isSell ? 'sell' : 'buy'} amount`} value={totalIn} onChange={e => handleTotal(num(e.target.value))} />
                <span className="cr-affix-suf">{isSell ? assetCode : fiatCode}</span>
              </div>
              {errors.totalAmount ? <Err m={errors.totalAmount} /> : <div className="cr-help">≈ {money(totalHelp)} {isSell ? fiatCode : assetCode}</div>}
            </div>

            <div className="cr-two">
              <div className="cr-field">
                <label className="pf-label">Minimum order <span className="cr-req">*</span></label>
                <div className={`cr-affix ${errors.orderLimitMin ? 'is-invalid' : ''}`}>
                  <span className="cr-affix-pre">{fiatIcon}</span>
                  <input type="number" min="0" placeholder="Min" value={minIn} onChange={e => handleMin(num(e.target.value))} />
                  <span className="cr-affix-suf">{fiatCode}</span>
                </div>
                {errors.orderLimitMin ? <Err m={errors.orderLimitMin} /> : <div className="cr-help">≈ {money(minHelp)} {assetCode}</div>}
              </div>
              <div className="cr-field">
                <label className="pf-label">Maximum order <span className="cr-req">*</span></label>
                <div className={`cr-affix ${errors.orderLimitMax ? 'is-invalid' : ''}`}>
                  <span className="cr-affix-pre">{fiatIcon}</span>
                  <input type="number" min="0" placeholder="Max" value={maxIn} onChange={e => handleMax(num(e.target.value))} />
                  <span className="cr-affix-suf">{fiatCode}</span>
                </div>
                {errors.orderLimitMax ? <Err m={errors.orderLimitMax} /> : <div className="cr-help">≈ {money(maxHelp)} {assetCode}</div>}
              </div>
            </div>

            <div className="cr-field">
              <label className="pf-label">Payment method <span className="cr-req">*</span></label>
              <div className="cr-methods" role="radiogroup" aria-label="Payment method">
                {loadingMethods && <div className="cr-muted">Loading payment methods…</div>}
                {methods.map(m => {
                  const active = Number(m.id) === formData.paymentMethodId;
                  return (
                    <button key={m.id} type="button" role="radio" aria-checked={active} className={`cr-method ${active ? 'is-active' : ''}`} onClick={() => change({ paymentMethodId: Number(m.id) })}>
                      <span className="cr-method-dot" />
                      <span className="cr-method-text">
                        <b>{m?.method_name}</b>
                        <small>{[m?.walletNumber, m?.bankName].filter(Boolean).join(' · ') || '—'}</small>
                      </span>
                    </button>
                  );
                })}
                <button type="button" className="cr-method cr-method--add" onClick={() => setModalMode('add')}>
                  <i className="fa-solid fa-plus" /> Add payment method
                </button>
              </div>
              <Err m={errors.paymentMethodId} />
            </div>

            <div className="cr-field cr-field--narrow">
              <label className="pf-label">Order time limit <span className="cr-req">*</span></label>
              <div className="pf-selwrap">
                <select className={`pf-input pf-sel ${errors.paymentTimeLimit ? 'is-invalid' : ''}`} value={formData.paymentTimeLimit} onChange={e => change({ paymentTimeLimit: e.target.value })}>
                  <option value="">Select time limit</option>
                  {TIME_LIMITS.map(t => <option key={t} value={t}>{t} min</option>)}
                </select>
                <i className="fa-solid fa-chevron-down cr-caret" />
              </div>
              <Err m={errors.paymentTimeLimit} />
            </div>
          </Card>

          {/* ── Remarks & response ── */}
          <Card icon="fa-solid fa-message" title="Remarks &amp; response" hint="Optional notes the other trader will see.">
            <div className="cr-field">
              <label className="pf-label">Remarks (optional)</label>
              <textarea className="pf-input cr-textarea pt-1" placeholder="Do not include crypto-related words such as crypto, P2P, C2C, BTC, USDT or ETH." value={formData.remarks} onChange={e => e.target.value.length <= 1000 && change({ remarks: e.target.value })} />
              <div className="cr-count">{formData.remarks.length}/1000</div>
            </div>

            <div className="cr-field">
              <label className="pf-label">Auto reply (optional)</label>
              <textarea className="pf-input cr-textarea pt-1" placeholder="Sent to the other trader as soon as the order is created." value={formData.autoReply} onChange={e => e.target.value.length <= 1000 && change({ autoReply: e.target.value })} />
              <div className="cr-count">{formData.autoReply.length}/1000</div>
            </div>

            <div className="cr-two">
              <div className="cr-field">
                <label className="pf-label">Show to users in <span className="cr-req">*</span></label>
                <div className="pf-selwrap">
                  <select className={`pf-input pf-sel ${errors.displayRegion ? 'is-invalid' : ''}`} value={formData.displayRegion} onChange={e => change({ displayRegion: e.target.value })}>
                    <option value="">Select region</option>
                    {REGIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                  <i className="fa-solid fa-chevron-down cr-caret" />
                </div>
                <Err m={errors.displayRegion} />
              </div>

              <div className="cr-field">
                <label className="pf-label">Status <span className="cr-req">*</span></label>
                <div className="cr-seg" role="radiogroup" aria-label="Status">
                  {([true, false] as const).map(v => (
                    <button key={String(v)} type="button" role="radio" aria-checked={formData.status === v} className={formData.status === v ? 'is-active px-2' : 'px-2'} onClick={() => change({ status: v })}>
                      {v ? 'Active' : 'Inactive'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* ── Summary ── */}
        <aside className="cr-sum">
          <h3>Request summary</h3>
          <dl>
            <div><dt>Request</dt><dd className="cr-accent">{isSell ? 'Sell' : 'Buy'} {assetCode}</dd></div>
            <div><dt>Currency</dt><dd>{formData.withFlat || '—'}</dd></div>
            <div><dt>Price</dt><dd>{price ? `${money(price)} ${fiatCode}` : '—'}</dd></div>
            <div><dt>Total</dt><dd>{formData.totalAmount ? `${money(parseFloat(formData.totalAmount))} ${assetCode}` : '—'}</dd></div>
            <div><dt>Order limit</dt><dd>{minIn && maxIn ? `${minIn} – ${maxIn} ${fiatCode}` : '—'}</dd></div>
            <div><dt>Payment</dt><dd>{selectedMethod?.method_name ?? '—'}</dd></div>
            <div><dt>Time limit</dt><dd>{formData.paymentTimeLimit ? `${formData.paymentTimeLimit} min` : '—'}</dd></div>
            <div><dt>Status</dt><dd>{formData.status ? 'Active' : 'Inactive'}</dd></div>
          </dl>

          {isSell && !isEdit && (
            <p className="cr-note">
              <i className="fa-solid fa-circle-info" /> Sell requests lock the sell amount from your wallet as a security deposit after you post.
            </p>
          )}

          <button type="button" className="cr-submit" onClick={handleSubmit} disabled={submitting}>
            {submitting ? (isEdit ? 'Saving…' : 'Posting…') : (isEdit ? 'Update request' : 'Post request')}
            {!submitting && <i className="fa-solid fa-paper-plane" />}
          </button>
          {/* <button type="button" className="cr-cancel" onClick={onBack} disabled={submitting}>Cancel</button> */}
        </aside>
      </div>

      {modalMode !== null && (
        <PaymentModal mode={modalMode} initialData={undefined} onClose={() => setModalMode(null)} onSubmit={handleModalSubmit} />
      )}

      {depositOpen && (
        <AddSecurityMoneyModal
          walletBalance={user?.wallet?.amount ?? 0}
          currentSecurityDeposit={user?.wallet?.security_amount_for_ads ?? 0}
          requiredSecurityAmount={depositRequired}
          onClose={() => { setDepositOpen(false); setDepositRequired(0); finish(); }}
          onSuccess={() => { /* refetch wallet here if needed */ }}
        />
      )}
    </div>
  );
}