'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactSelect from 'react-select';
import { toast } from 'react-toastify';
import { createAd, getLocalCurrencyRates, P2pAdPayload } from '@/app/api/p2padsapi';
import { createUserPaymentMethod, getUserPaymentMethods } from '@/app/api/common';
import PaymentModal from '@/components/dashboard/p2pProfile/Paymentmodal';
import { ModalMode, PaymentFormData } from '@/types/P2PProfileTypes';
import { getWithdrawChargeApi } from '@/app/api/wallet';
import './QuickSellModal.css';

/* ───────────── Types ───────────── */
type Option = { value: string; label: string };

interface Props {
  onClose: () => void;
  onSuccess?: () => void;
}

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

const ASSET_CODE = 'USDT';
const QUICK_USDT = [10, 25, 50, 100, 500];
const FALLBACK_RATE = 121.5;
const DEFAULT_FEE_PCT = 3;   // fallback if API fails
const TIME_LIMITS = Array.from({ length: 144 }, (_, i) => (i + 1) * 5);

const PAYMENT_ICONS: Record<string, { glyph: string; color: string }> = {
  bkash:  { glyph: 'b', color: '#e2136e' },
  nagad:  { glyph: 'N', color: '#f26522' },
  rocket: { glyph: 'R', color: '#8c3494' },
  bank:   { glyph: '⌂', color: '#1d6fe0' },
  other:  { glyph: '…', color: '#4b5563' },
};

const iconFor = (name?: string) => {
  const n = (name ?? '').toLowerCase();
  if (n.includes('bkash'))  return PAYMENT_ICONS.bkash;
  if (n.includes('nagad'))  return PAYMENT_ICONS.nagad;
  if (n.includes('rocket')) return PAYMENT_ICONS.rocket;
  if (n.includes('bank'))   return PAYMENT_ICONS.bank;
  return PAYMENT_ICONS.other;
};

const money = (n: number, d = 2) =>
  Number.isFinite(n)
    ? n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })
    : '0.00';

const num = (v: string) => v.replace(/[^\d.]/g, '');

/* ───────────── Component ───────────── */
export default function QuickSellModal({ onClose, onSuccess }: Props) {
  const [step, setStep] = useState<1 | 2>(1);

  /* ── step 1 ── */
  const [fiat, setFiat] = useState('BDT');
  const [amountUsdt, setAmountUsdt] = useState('50');

  const [rate, setRate] = useState(FALLBACK_RATE);
  const [rateLoading, setRateLoading] = useState(false);

  // Fee percentage from API (e.g., 3 means 3%)
  const [feePercent, setFeePercent] = useState<number>(DEFAULT_FEE_PCT);
  const [feeLoading, setFeeLoading] = useState(false);

  const [methods, setMethods] = useState<any[]>([]);
  const [loadingMethods, setLoadingMethods] = useState(false);
  const [methodId, setMethodId] = useState<number>(0);
  const [modalMode, setModalMode] = useState<ModalMode | null>(null);

  /* ── step 2 ── */
  const [remarks, setRemarks] = useState('');
  const [timeLimit, setTimeLimit] = useState('15');
  const [submitting, setSubmitting] = useState(false);

  const cur = CURRENCIES.find(c => c.code === fiat) ?? CURRENCIES[3];
  const fiatIcon = cur.icon;

  const amountUsdtNum = parseFloat(amountUsdt) || 0;

  // Fiat value of the USDT amount
  const fiatAmount = amountUsdtNum * rate;

  // Fee calculated from percentage
  const feeUsdt = (amountUsdtNum * feePercent) / 100;
  const feeFiat = (fiatAmount   * feePercent) / 100;

  // User receives (fiat)
  const receiveFiat = fiatAmount - feeFiat;

  /* ── Load market price ── */
  useEffect(() => {
    let cancelled = false;
    setRateLoading(true);
    (async () => {
      try {
        const res = await getLocalCurrencyRates({ currency_code: fiat });
        const amount = Number(res?.data?.amount ?? 0);
        if (!cancelled && Number.isFinite(amount) && amount > 0) setRate(amount);
      } catch { /* fallback */ }
      finally { if (!cancelled) setRateLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [fiat]);

  /* ── Load withdraw charge percent (once) ── */
  useEffect(() => {
    let cancelled = false;
    setFeeLoading(true);
    (async () => {
      try {
        const res = await getWithdrawChargeApi();
        if (cancelled) return;
        if (!res?.error) {
          const pct = Number(res?.data?.withdraw_charge ?? DEFAULT_FEE_PCT);
          setFeePercent(Number.isFinite(pct) && pct >= 0 ? pct : DEFAULT_FEE_PCT);
        } else {
          console.error('Failed to fetch withdraw charge:', res?.message);
          setFeePercent(DEFAULT_FEE_PCT);
        }
      } catch (err) {
        console.error('withdraw-charge API error:', err);
        if (!cancelled) setFeePercent(DEFAULT_FEE_PCT);
      } finally {
        if (!cancelled) setFeeLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  /* ── Payment methods ── */
  const loadMethods = useCallback(async () => {
    setLoadingMethods(true);
    try {
      const res = await getUserPaymentMethods();
      const list = res?.data ?? [];
      setMethods(list);
      if (list.length && !methodId) setMethodId(Number(list[0].id));
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'Failed to load payment methods.');
    } finally {
      setLoadingMethods(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => { loadMethods(); }, [loadMethods]);

  const handleAddMethod = async (data: PaymentFormData) => {
    try {
      const res = await createUserPaymentMethod(data);
      toast.success('Payment method added.');
      setMethods(prev => [res.data, ...prev]);
      setMethodId(Number(res.data?.id) || 0);
      setModalMode(null);
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'Save failed.');
    }
  };

  /* ── Next ── */
  const handleNext = () => {
    if (amountUsdtNum <= 0) { toast.error('Please enter a valid USDT amount.'); return; }
    if (!methodId)          { toast.error('Please select a payment method.'); return; }
    setStep(2);
  };

  /* ── Submit ── */
  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload: P2pAdPayload = {
        type: 'sell',
        asset: ASSET_CODE,
        with_fiat: fiat,
        price_type: 'fixed',
        fixed_price: rate,
        total_amount: String(amountUsdtNum),
        order_limit_min: Number(amountUsdtNum),
        order_limit_max: Number(amountUsdtNum),
        payment_method_id: methodId,
        payment_time_limit: timeLimit,
        terms: [],
        remarks,
        auto_reply: '',
        display_region: 'all',
        status: true,
        ad_create_type: 'local',
      };

      await createAd(payload);
      toast.success('Sell request created successfully!');
      onSuccess?.();
      onClose();
    } catch (e: any) {
      const laravel: Record<string, string[]> = e?.response?.data?.errors ?? {};
      if (Object.keys(laravel).length) {
        toast.error(Object.values(laravel)[0][0]);
      } else {
        toast.error(e?.response?.data?.message ?? e?.message ?? 'Something went wrong.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const currencyOptions: Option[] = useMemo(
    () => CURRENCIES.map(c => ({ value: c.code, label: `${c.code} - ${c.name}` })),
    []
  );

  /* ───────────── Render ───────────── */
  return (
    <div className="qsm-overlay" role="dialog" aria-modal="true" aria-label="Create Sell Request">
      <div className="qsm-modal">

        {/* Header */}
        <header className="qsm-head">
          <span className="qsm-head-icon">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="20" r="1.5" />
              <circle cx="18" cy="20" r="1.5" />
              <path d="M2 3h3l2.7 12.4a1 1 0 0 0 1 .8h8.9a1 1 0 0 0 1-.8L20 7H6" />
            </svg>
            <span className="qsm-head-arrow">↑</span>
          </span>
          <div className="qsm-head-text">
            <h2>Create Sell Request</h2>
            <p>Sell your {ASSET_CODE} and receive local currency.</p>
          </div>
          <button type="button" className="qsm-close" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
              <line x1="18" y1="6"  x2="6"  y2="18" />
              <line x1="6"  y1="6"  x2="18" y2="18" />
            </svg>
          </button>
        </header>

        {/* Stepper */}
        <div className="qsm-steps">
          <div className={`qsm-step ${step === 1 ? 'is-active' : 'is-done'}`}>
            <span>1</span> Request Details
          </div>
          <div className="qsm-step-line" />
          <div className={`qsm-step ${step === 2 ? 'is-active' : ''}`}>
            <span>2</span> Confirm
          </div>
          <div className="qsm-step-line" />
          <div className="qsm-step"><span>3</span> Submitted</div>
        </div>

        {/* Body */}
        <div className="qsm-body">
          {step === 1 && (
            <>
              {/* Currency */}
              <div className="qsm-field">
                <label className="qsm-label">
                  <i className="fa-solid fa-gear" /> Select Currency
                </label>
                <ReactSelect<Option>
                  instanceId="qsmCurrency"
                  classNamePrefix="qsm-sel"
                  options={currencyOptions}
                  value={currencyOptions.find(o => o.value === fiat) ?? null}
                  onChange={v => setFiat((v as Option)?.value ?? 'BDT')}
                  isSearchable
                  components={{ IndicatorSeparator: null }}
                  formatOptionLabel={o => (
                    <span className="qsm-opt">
                      <img
                        src={`https://flagcdn.com/w40/${CURRENCIES.find(c => c.code === o.value)?.cc ?? 'un'}.png`}
                        width={18}
                        height={18}
                        alt=""
                      />
                      {o.label}
                    </span>
                  )}
                />
              </div>

              {/* Amount in USDT */}
              <div className="qsm-field">
                <label className="qsm-label">
                  <i className="fa-solid fa-coins" /> Enter Amount ({ASSET_CODE})
                </label>
                <div className="qsm-amount">
                  <span className="qsm-amount-icon">₮</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={amountUsdt}
                    onChange={e => setAmountUsdt(num(e.target.value))}
                    placeholder="0"
                  />
                </div>
                <div className="qsm-chips">
                  {QUICK_USDT.map(v => (
                    <button
                      key={v}
                      type="button"
                      className={`qsm-chip ${amountUsdtNum === v ? 'is-active' : ''}`}
                      onClick={() => setAmountUsdt(String(v))}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              {/* Breakdown */}
              <div className="qsm-breakdown">
                <div className="qsm-bd-row">
                  <span className="qsm-bd-ico"><i className="fa-solid fa-coins" /></span>
                  <span className="qsm-bd-label">{ASSET_CODE} Amount</span>
                  <span className="qsm-bd-value">{money(amountUsdtNum)} {ASSET_CODE}</span>
                </div>

                <div className="qsm-bd-row">
                  <span className="qsm-bd-ico"><i className="fa-solid fa-chart-line" /></span>
                  <span className="qsm-bd-label">
                    Market Price <small>(1 {ASSET_CODE} = {money(rate)} {fiat})</small>
                  </span>
                  <span className="qsm-bd-value qsm-bd-value--price">
                    {rateLoading ? '…' : `${money(rate)} ${fiat}`}
                  </span>
                </div>

                <div className="qsm-bd-row">
                  <span className="qsm-bd-ico"><i className="fa-solid fa-money-bill-wave" /></span>
                  <span className="qsm-bd-label">Amount ({fiat})</span>
                  <span className="qsm-bd-value qsm-bd-value--green">
                    {money(fiatAmount)} {fiat}
                    <small className="qsm-bd-sub">
                      {money(amountUsdtNum)} × {money(rate)}
                    </small>
                  </span>
                </div>

                {/* Fee — now shows % and calculated amount */}
                <div className="qsm-bd-row">
                  <span className="qsm-bd-ico qsm-bd-ico--red"><i className="fa-solid fa-percent" /></span>
                  <span className="qsm-bd-label">
                    Fee <small>({money(feePercent, 2)}%)</small>
                  </span>
                  <span className="qsm-bd-value qsm-bd-value--red">
                    {feeLoading ? '…' : `- ${money(feeFiat)} ${fiat}`}
                    {!feeLoading && (
                      <small className="qsm-bd-sub">
                        {money(feeUsdt)} {ASSET_CODE}
                      </small>
                    )}
                  </span>
                </div>
              </div>

              {/* Total */}
              <div className="qsm-total">
                <div className="qsm-total-left">
                  <span className="qsm-total-icon"><i className="fa-solid fa-hand-holding-dollar" /></span>
                  <span>Total You Will Receive</span>
                </div>
                <b className="qsm-total-value">
                  {feeLoading ? '…' : `${money(receiveFiat)} ${fiat}`}
                </b>
              </div>

              {/* Payment method */}
              <div className="qsm-field">
                <label className="qsm-label">
                  <i className="fa-solid fa-credit-card" /> Select Preferred Payment Method (Required)
                </label>
                <div className="qsm-methods">
                  {loadingMethods && <div className="qsm-muted">Loading payment methods…</div>}

                  {methods.map(m => {
                    const icon = iconFor(m?.method_name);
                    const active = Number(m.id) === methodId;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        className={`qsm-method ${active ? 'is-active' : ''}`}
                        onClick={() => setMethodId(Number(m.id))}
                      >
                        <span className="qsm-method-icon" style={{ background: icon.color }}>
                          {icon.glyph}
                        </span>
                        <span className="qsm-method-name">{m?.method_name ?? '—'}</span>
                        {active && (
                          <span className="qsm-method-check">
                            <i className="fa-solid fa-circle-check" />
                          </span>
                        )}
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    className="qsm-method qsm-method--add"
                    onClick={() => setModalMode('add')}
                  >
                    <span className="qsm-method-icon qsm-method-icon--add">
                      <i className="fa-solid fa-plus" />
                    </span>
                    <span className="qsm-method-name">Add Payment Method</span>
                  </button>
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              {/* Summary */}
              <div className="qsm-summary">
                <h4 className="qsm-summary-title">Order Summary</h4>

                <div className="qsm-summary-row">
                  <span>Currency</span><b>{fiat}</b>
                </div>
                <div className="qsm-summary-row">
                  <span>{ASSET_CODE} Amount</span><b>{money(amountUsdtNum)} {ASSET_CODE}</b>
                </div>
                <div className="qsm-summary-row">
                  <span>Market Price (1 {ASSET_CODE})</span>
                  <b>{money(rate)} {fiat}</b>
                </div>
                <div className="qsm-summary-row">
                  <span>Amount ({fiat})</span>
                  <b className="qsm-green">{money(fiatAmount)} {fiat}</b>
                </div>
                <div className="qsm-summary-row">
                  <span>Fee ({money(feePercent, 2)}%)</span>
                  <b className="qsm-red">- {money(feeFiat)} {fiat}</b>
                </div>
                <div className="qsm-summary-row">
                  <span>Payment Method</span>
                  <b>{methods.find(m => Number(m.id) === methodId)?.method_name ?? '—'}</b>
                </div>
                <div className="qsm-summary-row qsm-summary-row--total">
                  <span>Total You Will Receive</span>
                  <b>{money(receiveFiat)} {fiat}</b>
                </div>
              </div>

              {/* Time limit */}
              <div className="qsm-field">
                <label className="qsm-label">
                  <i className="fa-solid fa-hourglass-half" /> Order Time Limit
                </label>
                <div className="qsm-selwrap">
                  <select
                    className="qsm-select"
                    value={timeLimit}
                    onChange={e => setTimeLimit(e.target.value)}
                  >
                    <option value="">Select time limit</option>
                    {TIME_LIMITS.map(t => (
                      <option key={t} value={String(t)}>{t} min</option>
                    ))}
                  </select>
                  <i className="fa-solid fa-chevron-down qsm-caret" />
                </div>
              </div>

              {/* Additional note */}
              <div className="qsm-field">
                <label className="qsm-label">
                  <i className="fa-solid fa-note-sticky" /> Additional Note (Optional)
                </label>
                <textarea
                  className="qsm-textarea"
                  value={remarks}
                  onChange={e => e.target.value.length <= 200 && setRemarks(e.target.value)}
                  placeholder="e.g. Preferred buyer, available time, any other note..."
                  rows={3}
                />
                <div className="qsm-count">{remarks.length}/200</div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <footer className="qsm-footer">
          {step === 1 && (
            <button type="button" className="qsm-next" onClick={handleNext}>
              Next <i className="fa-solid fa-arrow-right" />
            </button>
          )}

          {step === 2 && (
            <div className="qsm-footer-row">
              <button
                type="button"
                className="qsm-back"
                onClick={() => setStep(1)}
                disabled={submitting}
              >
                <i className="fa-solid fa-arrow-left" /> Back
              </button>
              <button
                type="button"
                className="qsm-next"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? 'Creating…' : 'Confirm & Create'}
                {!submitting && <i className="fa-solid fa-circle-check" />}
              </button>
            </div>
          )}
        </footer>
      </div>

      {modalMode !== null && (
        <PaymentModal
          mode={modalMode}
          initialData={undefined}
          onClose={() => setModalMode(null)}
          onSubmit={handleAddMethod}
        />
      )}
    </div>
  );
}