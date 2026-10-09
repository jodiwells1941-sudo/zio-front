'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactSelect from 'react-select';
import { toast } from 'react-toastify';
import { createAd, getAd, updateAd, getLocalCurrencyRates, P2pAdPayload } from '@/app/api/p2padsapi';
import { createUserPaymentMethod, getUserPaymentMethods } from '@/app/api/common';
import PaymentModal from '@/components/dashboard/p2pProfile/Paymentmodal';
import { ModalMode, PaymentFormData } from '@/types/P2PProfileTypes';
import './QuickBuyModal.css';
import { getDepositBonusApi } from '@/app/api/wallet';

/* ───────────── Types ───────────── */
type Option = { value: string; label: string };

type DepositBonusData = {
  deposit_amount: number;
  bonus_amount: number;
  total_credit: number;
  tier_id: number | null;
};

interface Props {
  onClose: () => void;
  onSuccess?: () => void;
  editId?: number;
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
const QUICK_BDT = [500, 1000, 5000, 10000, 50000];
const FALLBACK_RATE = 121.5;
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
export default function QuickBuyModal({ onClose, onSuccess, editId }: Props) {
  const isEdit = Boolean(editId);
  const [loadingAd, setLoadingAd] = useState(isEdit);
  const [step, setStep] = useState<1 | 2>(1);

  /* ── step 1 state ── */
  const [fiat, setFiat] = useState('BDT');
  const [amountBdt, setAmountBdt] = useState('5000');

  const [rate, setRate] = useState(FALLBACK_RATE);
  const [rateLoading, setRateLoading] = useState(false);

  const [bonus, setBonus] = useState<DepositBonusData>({
    deposit_amount: 0,
    bonus_amount: 0,
    total_credit: 0,
    tier_id: null,
  });
  const [bonusLoading, setBonusLoading] = useState(false);

  const [methods, setMethods] = useState<any[]>([]);
  const [loadingMethods, setLoadingMethods] = useState(false);
  const [methodId, setMethodId] = useState<number>(0);
  const [modalMode, setModalMode] = useState<ModalMode | null>(null);

  /* ── step 2 state ── */
  const [remarks, setRemarks] = useState('');
  const [timeLimit, setTimeLimit] = useState('15');
  const [submitting, setSubmitting] = useState(false);

  const cur = CURRENCIES.find(c => c.code === fiat) ?? CURRENCIES[3];
  const fiatIcon = cur.icon;

  const amountBdtNum = parseFloat(amountBdt) || 0;
  const baseUsdt = rate > 0 ? amountBdtNum / rate : 0;
  const bonusUsdt = Number(bonus.bonus_amount ?? 0);
  const totalUsdt = baseUsdt + bonusUsdt;

  /* ── Load market price ── */
  useEffect(() => {
    let cancelled = false;
    setRateLoading(true);
    (async () => {
      try {
        const res = await getLocalCurrencyRates({ currency_code: fiat });
        const amount = Number(res?.data?.amount ?? 0);
        if (!cancelled && Number.isFinite(amount) && amount > 0) setRate(amount);
      } catch { /* keep fallback */ }
      finally { if (!cancelled) setRateLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [fiat]);

  /* ── Load ad when editing ── */
  useEffect(() => {
    if (!editId) return;
    let cancelled = false;
    (async () => {
      setLoadingAd(true);
      try {
        const res = await getAd(editId);
        const ad = res?.data;
        if (cancelled) return;
        if (!ad) throw new Error('not found');

        const p = Number(ad.fixed_price ?? 0);
        const totalUsdtVal = Number(ad.total_amount ?? 0);
        setFiat(ad.with_fiat ?? 'BDT');
        setRate(p > 0 ? p : FALLBACK_RATE);
        setAmountBdt(String(+(totalUsdtVal * p).toFixed(2)));
        setMethodId(Number(ad.payment_method_id ?? 0));
        setTimeLimit(String(ad.payment_time_limit ?? '15'));
        setRemarks(ad.remarks ?? '');
      } catch {
        if (!cancelled) {
          toast.error('Ad not found.');
          onClose();
        }
      } finally {
        if (!cancelled) setLoadingAd(false);
      }
    })();
    return () => { cancelled = true; };
  }, [editId, onClose]);

  /* ── Load deposit bonus (debounced, USDT) ── */
  const bonusTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (bonusTimer.current) clearTimeout(bonusTimer.current);

    if (amountBdtNum <= 0) {
      setBonus({ deposit_amount: 0, bonus_amount: 0, total_credit: 0, tier_id: null });
      return;
    }
    const baseUsdtForBonus = rate > 0 ? amountBdtNum / rate : 0;

    setBonusLoading(true);
    bonusTimer.current = setTimeout(async () => {
      try {
        const res = await getDepositBonusApi(baseUsdtForBonus);
        const d = res?.data ?? {};
        setBonus({
          deposit_amount: Number(d.deposit_amount ?? amountBdtNum),
          bonus_amount:   Number(d.bonus_amount ?? 0),
          total_credit:   Number(d.total_credit ?? 0),
          tier_id:        d.tier_id ?? null,
        });
      } catch {
        setBonus({ deposit_amount: amountBdtNum, bonus_amount: 0, total_credit: 0, tier_id: null });
      } finally {
        setBonusLoading(false);
      }
    }, 400);

    return () => { if (bonusTimer.current) clearTimeout(bonusTimer.current); };
  }, [amountBdtNum]);

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

  /* ── Next / Submit ── */
  const handleNext = () => {
    if (amountBdtNum <= 0) { toast.error('Please enter a valid amount.'); return; }
    // if (!methodId)         { toast.error('Please select a payment method.'); return; }
    setStep(2);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const usdtAmount = baseUsdt;

      const payload: P2pAdPayload = {
        type: 'buy',
        asset: ASSET_CODE,
        with_fiat: fiat,
        price_type: 'fixed',
        fixed_price: rate,
        total_amount: String(usdtAmount),
        order_limit_min: Number(usdtAmount),
        order_limit_max: Number(usdtAmount),
        payment_method_id: methodId,
        payment_time_limit: timeLimit,
        terms: [],
        remarks,
        auto_reply: '',
        display_region: 'all',
        status: true,
        ad_create_type: 'local',
      };

      if (isEdit && editId) {
        await updateAd(editId, payload);
        toast.success('Ad updated successfully!');
      } else {
        await createAd(payload);
        toast.success('Buy request created successfully!');
      }
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
  if (loadingAd) {
    return (
      <div className="qbm-overlay mt-5" role="dialog" aria-modal="true">
        <div className="qbm-modal">
          <div className="qbm-body" style={{ padding: 40, textAlign: 'center' }}>
            <div style={{ color: '#34d399', fontSize: 14, fontWeight: 600 }}>
              Loading ad…
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="qbm-overlay mt-5" role="dialog" aria-modal="true" aria-label={isEdit ? 'Edit Buy Request' : 'Create Buy Request'}>
      <div className="qbm-modal">

        {/* Header */}
        <header className="qbm-head">
          <span className="qbm-head-icon">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="20" r="1.5" />
              <circle cx="18" cy="20" r="1.5" />
              <path d="M2 3h3l2.7 12.4a1 1 0 0 0 1 .8h8.9a1 1 0 0 0 1-.8L20 7H6" />
            </svg>
            <span className="qbm-head-plus">+</span>
          </span>
          <div className="qbm-head-text">
            <h2 className='fs-5'><b>{isEdit ? 'Edit Buy Request' : 'Create Buy Request'}</b></h2>
            <p>{isEdit ? 'Update your buy request details.' : `Buy ${ASSET_CODE} from trusted sellers and add to your wallet.`}</p>
          </div>
          <button type="button" className="qbm-close" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
              <line x1="18" y1="6"  x2="6"  y2="18" />
              <line x1="6"  y1="6"  x2="18" y2="18" />
            </svg>
          </button>
        </header>

        {/* Stepper */}
        <div className="qbm-steps">
          <div className={`qbm-step ${step === 1 ? 'is-active' : 'is-done'}`}>
            <span>1</span> Request Details
          </div>
          <div className="qbm-step-line" />
          <div className={`qbm-step ${step === 2 ? 'is-active' : ''}`}>
            <span>2</span> Confirm
          </div>
          <div className="qbm-step-line" />
          <div className="qbm-step"><span>3</span> Submitted</div>
        </div>

        {/* Body */}
        <div className="qbm-body">
          {step === 1 && (
            <>
              {/* Select Currency */}
              <div className="qbm-field">
                <label className="qbm-label">
                  <i className="fa-solid fa-gear" /> Select Currency
                </label>
                <ReactSelect<Option>
                  instanceId="qbmCurrency"
                  classNamePrefix="qbm-sel"
                  options={currencyOptions}
                  value={currencyOptions.find(o => o.value === fiat) ?? null}
                  onChange={v => setFiat((v as Option)?.value ?? 'BDT')}
                  isSearchable
                  components={{ IndicatorSeparator: null }}
                  formatOptionLabel={o => (
                    <span className="qbm-opt">
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

              {/* Amount */}
              <div className="qbm-field">
                <label className="qbm-label">
                  <i className="fa-solid fa-coins" /> Enter Amount ({fiat})
                </label>
                <div className="qbm-amount">
                  <span className="qbm-amount-icon">{fiatIcon}</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={amountBdt}
                    onChange={e => setAmountBdt(num(e.target.value))}
                    placeholder="0"
                  />
                </div>
                <div className="qbm-chips">
                  {QUICK_BDT.map(v => (
                    <button
                      key={v}
                      type="button"
                      className={`qbm-chip ${amountBdtNum === v ? 'is-active' : ''}`}
                      onClick={() => setAmountBdt(String(v))}
                    >
                      {v.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Breakdown */}
              <div className="qbm-breakdown">
                <div className="qbm-bd-row">
                  <span className="qbm-bd-ico"><i className="fa-solid fa-coins" /></span>
                  <span className="qbm-bd-label">Amount ({fiat})</span>
                  <span className="qbm-bd-value">{money(amountBdtNum)} {fiat}</span>
                </div>

                <div className="qbm-bd-row">
                  <span className="qbm-bd-ico"><i className="fa-solid fa-chart-line" /></span>
                  <span className="qbm-bd-label">
                    Market Price <small>(1 {ASSET_CODE} = {money(rate)} {fiat})</small>
                  </span>
                  <span className="qbm-bd-value qbm-bd-value--price">
                    {rateLoading ? '…' : `${money(rate)} ${fiat}`}
                  </span>
                </div>

                <div className="qbm-bd-row">
                  <span className="qbm-bd-ico"><i className="fa-solid fa-coins" /></span>
                  <span className="qbm-bd-label">
                    {ASSET_CODE} Amount <small>(Base)</small>
                  </span>
                  <span className="qbm-bd-value qbm-bd-value--green">
                    {money(baseUsdt)} {ASSET_CODE}
                    <small className="qbm-bd-sub">
                      {money(amountBdtNum, 0)} ÷ {money(rate)}
                    </small>
                  </span>
                </div>

                <div className="qbm-bd-row">
                  <span className="qbm-bd-ico"><i className="fa-solid fa-gift" /></span>
                  <span className="qbm-bd-label">Bonus</span>
                  <span className="qbm-bd-value qbm-bd-value--green">
                    {bonusLoading ? '…' : `+ ${money(bonusUsdt)} ${ASSET_CODE}`}
                  </span>
                </div>
              </div>

              {/* Total */}
              <div className="qbm-total">
                <div className="qbm-total-left">
                  <span className="qbm-total-icon"><i className="fa-solid fa-sack-dollar" /></span>
                  <span>Total You Will Receive</span>
                </div>
                <b className="qbm-total-value">
                  {bonusLoading ? '…' : `${money(totalUsdt)} ${ASSET_CODE}`}
                </b>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              {/* Summary */}
              <div className="qbm-summary">
                <h4 className="qbm-summary-title">Order Summary</h4>

                <div className="qbm-summary-row">
                  <span>Currency</span><b>{fiat}</b>
                </div>
                <div className="qbm-summary-row">
                  <span>Amount</span><b>{money(amountBdtNum)} {fiat}</b>
                </div>
                <div className="qbm-summary-row">
                  <span>Market Price (1 {ASSET_CODE})</span>
                  <b>{money(rate)} {fiat}</b>
                </div>
                <div className="qbm-summary-row">
                  <span>{ASSET_CODE} Amount</span>
                  <b className="qbm-green">{money(baseUsdt)} {ASSET_CODE}</b>
                </div>
                <div className="qbm-summary-row">
                  <span>Bonus</span>
                  <b className="qbm-green">+ {money(bonusUsdt)} {ASSET_CODE}</b>
                </div>
                <div className="qbm-summary-row qbm-summary-row--total">
                  <span>Total You Will Receive</span>
                  <b>{money(totalUsdt)} {ASSET_CODE}</b>
                </div>
              </div>

              {/* Order time limit */}
              <div className="qbm-field">
                <label className="qbm-label">
                  <i className="fa-solid fa-hourglass-half" /> Order Time Limit
                </label>
                <div className="qbm-selwrap">
                  <select
                    className="qbm-select"
                    value={timeLimit}
                    onChange={e => setTimeLimit(e.target.value)}
                  >
                    <option value="">Select time limit</option>
                    {TIME_LIMITS.map(t => (
                      <option key={t} value={String(t)}>{t} min</option>
                    ))}
                  </select>
                  <i className="fa-solid fa-chevron-down qbm-caret" />
                </div>
              </div>

              {/* Additional note */}
              <div className="qbm-field">
                <label className="qbm-label">
                  <i className="fa-solid fa-note-sticky" /> Additional Note (Optional)
                </label>
                <textarea
                  className="qbm-textarea"
                  value={remarks}
                  onChange={e => e.target.value.length <= 200 && setRemarks(e.target.value)}
                  placeholder="e.g. Preferred verified seller, available time, any other note..."
                  rows={3}
                />
                <div className="qbm-count">{remarks.length}/200</div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <footer className="qbm-footer mt-0 pt-0">
          {step === 1 && (
            <button type="button" className="qbm-next" onClick={handleNext}>
              Next <i className="fa-solid fa-arrow-right" />
            </button>
          )}

          {step === 2 && (
            <div className="qbm-footer-row">
              <button
                type="button"
                className="qbm-back"
                onClick={() => setStep(1)}
                disabled={submitting}
              >
                <i className="fa-solid fa-arrow-left" /> Back
              </button>
              <button
                type="button"
                className="qbm-next"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? (isEdit ? 'Saving…' : 'Creating…') : (isEdit ? 'Confirm & Update' : 'Confirm & Create')}
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