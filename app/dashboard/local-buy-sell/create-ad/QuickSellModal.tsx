'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactSelect from 'react-select';
import { isAxiosError } from 'axios';
import { toast } from 'react-toastify';
import { createAd, getAd, updateAd, getLocalCurrencyRates, P2pAdPayload } from '@/app/api/p2padsapi';
import {
  currencyOptions as getPaymentCurrencies,
  getUserPaymentMethods,
  updateUserPaymentMethod,
} from '@/app/api/common';
import { CurrencyOption, PaymentFormData, SellMethodField, UserPaymentMethod } from '@/types/P2PProfileTypes';
import { getWithdrawChargeApi } from '@/app/api/wallet';
import './QuickSellModal.css';
import PaymentMethodIcon from '../PaymentMethodIcon';

/* ───────────── Types ───────────── */
type Option = { value: string; label: string };

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
const DISPLAY_ASSET_CODE = 'USD';
const MIN_AMOUNT_USDT = 10;
const MAX_AMOUNT_USDT = 500;
const FALLBACK_RATE = 121.5;
const DEFAULT_FEE_PCT = 3;
const TIME_LIMITS = Array.from({ length: 144 }, (_, i) => (i + 1) * 5);

const money = (n: number, d = 2) =>
  Number.isFinite(n)
    ? n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })
    : '0.00';

const num = (v: string) => v.replace(/[^\d.]/g, '');

// The payment methods API exposes saved field values as flat keys; newly
// created/updated methods may also have a nested field_values object.
const getSavedMethodValue = (method: UserPaymentMethod, key: string): string => {
  const flatValue = (method as UserPaymentMethod & Record<string, unknown>)[key];
  const value = method.field_values?.[key] ?? flatValue;
  return value === null || value === undefined ? '' : String(value);
};

const getInitialMethodValues = (method: UserPaymentMethod): Record<string, string> => {
  const values: Record<string, string> = {};
  for (const field of method.fields ?? []) {
    values[field.key] = getSavedMethodValue(method, field.key);
  }
  for (const [key, value] of Object.entries(method.field_values ?? {})) {
    if (values[key] === undefined) values[key] = String(value);
  }
  if (values.name === undefined && (method.fields ?? []).some(field => field.key === 'walletNumber')) {
    values.name = getSavedMethodValue(method, 'name');
  }
  return values;
};

/* ───────────── Component ───────────── */
export default function QuickSellModal({ onClose, onSuccess, editId }: Props) {
  const isEdit = Boolean(editId);
  const [loadingAd, setLoadingAd] = useState(isEdit);
  const [step, setStep] = useState<1 | 2>(1);

  /* ── step 1 ── */
  const [fiat, setFiat] = useState('BDT');
  const [amountFiat, setAmountFiat] = useState('');
  const editAssetAmount = useRef<number | null>(null);
  const amountEdited = useRef(false);

  const [rate, setRate] = useState(FALLBACK_RATE);
  const [rateLoading, setRateLoading] = useState(false);

  const [feePercent, setFeePercent] = useState<number>(DEFAULT_FEE_PCT);
  const [feeLoading, setFeeLoading] = useState(false);

  const [methods, setMethods] = useState<UserPaymentMethod[]>([]);
  const [paymentCurrencies, setPaymentCurrencies] = useState<CurrencyOption[]>([]);
  const [loadingMethods, setLoadingMethods] = useState(false);
  const [methodId, setMethodId] = useState<number>(0);
  const [methodFieldValues, setMethodFieldValues] = useState<Record<string, string>>({});
  const [methodRemarks, setMethodRemarks] = useState('');
  const [methodQrFile, setMethodQrFile] = useState<File | null>(null);
  const [methodFieldErrors, setMethodFieldErrors] = useState<Record<string, string>>({});
  const [methodSubmitting, setMethodSubmitting] = useState(false);
  const [methodDetailsDirty, setMethodDetailsDirty] = useState(false);
  const hydratedMethodId = useRef<number | null>(null);

  /* ── step 2 ── */
  const [remarks, setRemarks] = useState('');
  const [timeLimit, setTimeLimit] = useState('15');
  const [submitting, setSubmitting] = useState(false);

  const fiatAmount = parseFloat(amountFiat) || 0;
  const amountUsdtNum = rate > 0 ? Number((fiatAmount / rate).toFixed(8)) : 0;
  const feeUsdt = (amountUsdtNum * feePercent) / 100;
  const totalUsdtWithFee = amountUsdtNum + feeUsdt;
  const feeFiat = (fiatAmount   * feePercent) / 100;
  const receiveFiat = fiatAmount;
  const selectedPaymentCurrency = paymentCurrencies.find(
    currency => currency.label.trim().toUpperCase() === fiat
  );
  const currencyMethods = selectedPaymentCurrency
    ? methods.filter(method => method.currency_id === selectedPaymentCurrency.value && method.is_active)
    : [];
  const selectedMethod = currencyMethods.find(method => Number(method.id) === methodId);
  useEffect(() => {
    if (selectedMethod && hydratedMethodId.current !== Number(selectedMethod.id)) {
      hydratedMethodId.current = Number(selectedMethod.id);
      setMethodFieldValues(isEdit ? getInitialMethodValues(selectedMethod) : {});
    }
  }, [isEdit, selectedMethod]);
  const selectedMethodFields: SellMethodField[] = selectedMethod
    ? (selectedMethod.fields?.length
        ? selectedMethod.fields
        : Object.keys(selectedMethod.field_values ?? {}).map(key => ({
            key,
            label: key.replace(/[_-]+/g, ' ').replace(/\b\w/g, character => character.toUpperCase()),
            type: 'text' as const,
            required: false,
            placeholder: '',
          })))
    : [];
  const methodEditorFields = (() => {
    const walletNumberIndex = selectedMethodFields.findIndex(field => field.key === 'walletNumber');
    if (walletNumberIndex < 0) return selectedMethodFields;

    const configuredNameField = selectedMethodFields.find(field => field.key === 'name');
    const nameField: SellMethodField = configuredNameField
      ? { ...configuredNameField, label: configuredNameField.label || 'Name', required: false }
      : {
          key: 'name',
          label: 'Name',
          type: 'text',
          required: false,
          placeholder: 'Enter account holder name',
        };
    const fields = selectedMethodFields.filter(field => field.key !== 'name');
    const walletIndex = fields.findIndex(field => field.key === 'walletNumber');
    fields.splice(walletIndex + 1, 0, nameField);
    return fields;
  })();
  const selectedMethodDetails = selectedMethod
    ? methodEditorFields
        .map(field => ({
          key: field.key,
          label: field.label,
          value: String(
            getSavedMethodValue(selectedMethod, field.key)
          ).trim(),
        }))
        .filter(detail => Boolean(detail.value))
    : [];

  /* ── Load market price ── */
  useEffect(() => {
    let cancelled = false;
    setRateLoading(true);
    (async () => {
      try {
        const res = await getLocalCurrencyRates({ currency_code: fiat });
        const amount = Number(res?.data?.amount ?? 0);
        if (!cancelled && Number.isFinite(amount) && amount > 0) {
          setRate(amount);
          if (isEdit && !amountEdited.current && editAssetAmount.current !== null) {
            setAmountFiat(String(Number((editAssetAmount.current * amount).toFixed(2))));
          }
        }
      } catch { /* fallback */ }
      finally { if (!cancelled) setRateLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [fiat, isEdit]);

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
          setFeePercent(DEFAULT_FEE_PCT);
        }
      } catch {
        if (!cancelled) setFeePercent(DEFAULT_FEE_PCT);
      } finally {
        if (!cancelled) setFeeLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

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

        const adRate = Number(ad.fixed_price ?? FALLBACK_RATE);
        const adAmount = Number(ad.total_amount ?? 0);
        editAssetAmount.current = adAmount;
        amountEdited.current = false;
        setFiat(ad.with_fiat ?? 'BDT');
        setRate(adRate);
        setAmountFiat(ad.total_amount == null ? '' : String(Number((adAmount * adRate).toFixed(2))));
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

  /* ── Payment methods ── */
  const loadMethods = useCallback(async () => {
    setLoadingMethods(true);
    try {
      const [methodsRes, currenciesRes] = await Promise.all([
        getUserPaymentMethods(),
        getPaymentCurrencies(),
      ]);
      setMethods(methodsRes?.data ?? []);
      setPaymentCurrencies(currenciesRes?.data ?? []);
    } catch (e) {
      toast.error(isAxiosError<{ message?: string }>(e) ? e.response?.data?.message ?? 'Failed to load payment methods.' : 'Failed to load payment methods.');
    } finally {
      setLoadingMethods(false);
    }
  }, []);
  useEffect(() => { loadMethods(); }, [loadMethods]);

  const handleSelectMethod = (method: UserPaymentMethod) => {
    hydratedMethodId.current = Number(method.id);
    setMethodId(Number(method.id));
    setMethodFieldValues(isEdit ? getInitialMethodValues(method) : {});
    setMethodRemarks(method.remarks ?? '');
    setMethodQrFile(null);
    setMethodFieldErrors({});
    setMethodDetailsDirty(false);
  };

  const saveSelectedMethod = async (): Promise<boolean> => {
    if (!selectedMethod || !selectedPaymentCurrency) {
      toast.error('Select a payment method before saving its details.');
      return false;
    }

    const errors: Record<string, string> = {};
    for (const field of methodEditorFields) {
      const value = (methodFieldValues[field.key] ?? '').trim();
      if (field.required && !value) {
        errors[field.key] = `${field.label} is required.`;
      } else if (value && field.pattern) {
        try {
          if (!new RegExp(`^(?:${field.pattern})$`).test(value)) {
            errors[field.key] = `${field.label} format is invalid.`;
          }
        } catch (error) {
          console.error(`Invalid validation pattern for payment field "${field.key}":`, error);
        }
      }
    }
    setMethodFieldErrors(errors);
    if (Object.keys(errors).length > 0) return false;

    const payload: PaymentFormData = {
      sell_method_id: selectedMethod.sell_method_id,
      currency_id: selectedPaymentCurrency.value,
      field_values: methodFieldValues,
      remarks: methodRemarks.trim() || undefined,
      qr_code: methodQrFile,
    };

    setMethodSubmitting(true);
    try {
      const res = await updateUserPaymentMethod(selectedMethod.id, payload);
      const updatedMethod: UserPaymentMethod = {
        ...selectedMethod,
        ...(res?.data ?? {}),
        field_values: methodFieldValues,
        remarks: methodRemarks.trim(),
        qr_code: res?.data?.qr_code ?? selectedMethod.qr_code,
      };
      setMethods(prev => prev.map(method => method.id === selectedMethod.id ? updatedMethod : method));
      setMethodQrFile(null);
      setMethodDetailsDirty(false);
      toast.success('Payment method updated successfully.');
      return true;
    } catch (error) {
      console.error('Failed to update payment method:', error);
      toast.error('Failed to update payment method.');
      return false;
    } finally {
      setMethodSubmitting(false);
    }
  };

  /* ── Next / Submit ── */
  const validateAmount = () => {
    if (rateLoading || !Number.isFinite(rate) || rate <= 0) {
      toast.error('Please wait for a valid exchange rate.');
      return false;
    }
    if (!Number.isFinite(amountUsdtNum) || amountUsdtNum < MIN_AMOUNT_USDT || amountUsdtNum > MAX_AMOUNT_USDT) {
      toast.error(`Amount must be between ${money(MIN_AMOUNT_USDT * rate)} and ${money(MAX_AMOUNT_USDT * rate)} ${fiat}.`);
      return false;
    }
    return true;
  };

  const handleNext = async () => {
    if (!validateAmount()) return;
    if (!currencyMethods.some(method => method.id === methodId)) {
      toast.error('Please select a payment method for the selected currency.');
      return;
    }
    const missingFields = methodEditorFields.filter(field => field.required && !methodFieldValues[field.key]?.trim());
    if (missingFields.length) {
      setMethodFieldErrors(Object.fromEntries(missingFields.map(field => [field.key, `${field.label} is required.`])));
      toast.error(`Enter ${missingFields[0].label} for the selected payment method.`);
      return;
    }
    if (methodDetailsDirty) {
      const paymentMethodSaved = await saveSelectedMethod();
      if (!paymentMethodSaved) return;
    }
    setStep(2);
  };

  const handleSubmit = async () => {
    if (!validateAmount()) return;
    if (methodDetailsDirty) {
      const paymentMethodSaved = await saveSelectedMethod();
      if (!paymentMethodSaved) return;
    }

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

      if (isEdit && editId) {
        await updateAd(editId, payload);
        toast.success('Ad updated successfully!');
      } else {
        await createAd(payload);
        toast.success('Sell request created successfully!');
      }
      onSuccess?.();
      onClose();
    } catch (e) {
      const apiError = isAxiosError<{ message?: string; errors?: Record<string, string[]> }>(e) ? e.response?.data : undefined;
      const laravel = apiError?.errors ?? {};
      if (Object.keys(laravel).length) {
        toast.error(Object.values(laravel)[0][0]);
      } else {
        toast.error(apiError?.message ?? (e instanceof Error ? e.message : 'Something went wrong.'));
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
      <div className="qsm-overlay" role="dialog" aria-modal="true">
        <div className="qsm-modal">
          <div className="qsm-body" style={{ padding: 40, textAlign: 'center' }}>
            <div style={{ color: '#fca5a5', fontSize: 14, fontWeight: 600 }}>
              Loading ad…
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="qsm-overlay" role="dialog" aria-modal="true" aria-label={isEdit ? 'Edit Sell Request' : 'Create Sell Request'}>
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
            <h2>{isEdit ? 'Edit Sell Request' : 'Create Sell Request'}</h2>
            <p>{isEdit ? 'Update your sell request details.' : `Sell your ${DISPLAY_ASSET_CODE} and receive local currency.`}</p>
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
                  onChange={v => {
                    setFiat((v as Option)?.value ?? 'BDT');
                    setAmountFiat('');
                    amountEdited.current = true;
                    setRate(0);
                    setRateLoading(true);
                    setMethodId(0);
                  }}
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

              {/* Enter the selected fiat amount; the API still receives the USD asset amount. */}
              <div className="qsm-field">
                <label className="qsm-label">
                  <i className="fa-solid fa-coins" /> Enter Amount ({fiat})
                </label>
                <div className="qsm-amount mb-3">
                  <span className="qsm-amount-icon">{CURRENCIES.find(currency => currency.code === fiat)?.icon ?? fiat}</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={amountFiat}
                    onChange={e => { amountEdited.current = true; setAmountFiat(num(e.target.value)); }}
                    placeholder="Enter amount"
                  />
                  <span className="qsm-rate-label">
                    (1 {DISPLAY_ASSET_CODE} = {rateLoading ? '…' : `${money(rate)} ${fiat}`})
                  </span>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <small className="qsm-amount-limits">
                    {rateLoading || rate <= 0
                      ? 'Loading limits…'
                      : `Min ${money(MIN_AMOUNT_USDT * rate)} · Max ${money(MAX_AMOUNT_USDT * rate)} ${fiat}`}
                  </small>
                  <small className='p-2 text-warning'>Fees {money(feeUsdt)} USD ({money(feePercent, 2)}%)</small>
                </div>
              </div>

              {/* Breakdown */}
              <div className="qsm-breakdown">
                <div className="qsm-bd-row">
                  <span className="qsm-bd-ico"><i className="fa-solid fa-coins" /></span>
                  <span className="qsm-bd-label">Sell Amount</span>
                  <span className="qsm-bd-value">
                    {money(amountUsdtNum)} {DISPLAY_ASSET_CODE}
                    {/* <small className="qsm-bd-sub">Amount entered</small> */}
                  </span>
                </div>

                <div className="qsm-bd-row">
                  <span className="qsm-bd-ico"><i className="fa-solid fa-percent" /></span>
                  <span className="qsm-bd-label">
                    Fee <small>({money(feePercent, 2)}%)</small>
                  </span>
                  <span className="qsm-bd-value qsm-bd-value--green">
                    {feeLoading ? '…' : `+ ${money(feeUsdt)} ${DISPLAY_ASSET_CODE}`}
                    {/* {!feeLoading && (
                      <small className="qsm-bd-sub">
                        deducted from fiat received: {money(feeFiat)} {fiat}
                      </small>
                    )} */}
                  </span>
                </div>

                <div className="qsm-bd-row">
                  <span className="qsm-bd-ico"><i className="fa-solid fa-calculator" /></span>
                  <span className="qsm-bd-label">Total Amount</span>
                  <span className="qsm-bd-value qsm-bd-value--green">
                    {feeLoading ? '…' : `${money(totalUsdtWithFee)} ${DISPLAY_ASSET_CODE}`}
                  </span>
                </div>

                <div className="qsm-bd-row">
                  <span className="qsm-bd-ico"><i className="fa-solid fa-chart-line" /></span>
                  <span className="qsm-bd-label">
                    Market Price <small>(1 {DISPLAY_ASSET_CODE} = {money(rate)} {fiat})</small>
                  </span>
                  <span className="qsm-bd-value qsm-bd-value--price">
                    {rateLoading ? '…' : `${money(rate)} ${fiat}`}
                  </span>
                </div>

                <div className="qsm-bd-row">
                  <span className="qsm-bd-ico"><i className="fa-solid fa-money-bill-wave" /></span>
                  <span className="qsm-bd-label">Received Amount ({fiat})</span>
                  <span className="qsm-bd-value qsm-bd-value--green">
                    {feeLoading ? '…' : `${money(receiveFiat)} ${fiat}`}
                    {/* {!feeLoading && (
                      <small className="qsm-bd-sub">
                        {money(fiatAmount)} − {money(feeFiat)} fee
                      </small>
                    )} */}
                  </span>
                </div>
              </div>

              <div className="qsm-total qsm-total--hero qsm-total--sell-hero">
                <div className="qsm-total-left">
                  <span className="qsm-total-icon"><i className="fa-solid fa-hand-holding-dollar" /></span>
                  <span className='fw-bold fs-5'>Received</span>
                </div>
                <b className="qsm-total-value d-flex align-items-center gap-2">
                  <span className='fw-bold fs-5'>{feeLoading ? '…' : money(receiveFiat)}</span>
                  <span className='fw-bold fs-6'>{fiat}</span>
                </b>
              </div>

              {/* Payment method */}
              <div className="qsm-field">
                <label className="qsm-label">
                  <i className="fa-solid fa-credit-card" /> Select Payment Method (Required)
                </label>
                <div className="qsm-methods">
                  {loadingMethods && <div className="qsm-muted">Loading payment methods…</div>}

                  {!loadingMethods && !selectedPaymentCurrency && (
                    <div className="qsm-muted">Payment methods for {fiat} are unavailable.</div>
                  )}

                  {!loadingMethods && selectedPaymentCurrency && currencyMethods.length === 0 && (
                    <div className="qsm-muted">No saved payment methods for {fiat}. Add one to continue.</div>
                  )}

                  {currencyMethods.map(m => {
                    const active = Number(m.id) === methodId;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        className={`qsm-method ${active ? 'is-active' : ''}`}
                        onClick={() => handleSelectMethod(m)}
                        aria-label={`Select ${m.method_name} payment method`}
                        aria-pressed={active}
                      >
                        <PaymentMethodIcon
                          className="qsm-method-icon"
                          methodName={m?.method_name}
                          iconImage={
                            m.icon_url ??
                            m.icon_image ??
                            m.sell_method?.icon_url ??
                            m.sell_method?.icon_image
                          }
                          size={24}
                          fallbackMode="brand"
                        />
                        <span className="qsm-method-name">{m?.method_name ?? '—'}</span>
                      </button>
                    );
                  })}

                </div>
              </div>

              {selectedMethod && (
                <div className="qsm-method-editor">
                  {/* <div className="qsm-method-editor-head">
                    <span className="qsm-method-editor-head-icon">
                      <i className="fa-solid fa-building-columns" />
                    </span>
                    <div>
                      <span className="qsm-method-editor-eyebrow">Payment details</span>
                      <strong>Edit {selectedMethod.method_name} details</strong>
                      <small>These details are shared with buyers for this payment method.</small>
                    </div>
                  </div> */}

                  {methodEditorFields.length > 0 ? (
                    <div className="qsm-method-editor-fields">
                      {methodEditorFields.map(field => (
                        <label className="qsm-method-editor-field" key={field.key}>
                          <span>
                            {field.label}
                            {field.required && <b className="qsm-req"> *</b>}
                          </span>
                          <input
                            className={`qsm-input ${methodFieldErrors[field.key] ? 'is-invalid' : ''}`}
                            type={field.type}
                            value={methodFieldValues[field.key] ?? ''}
                            placeholder={field.placeholder}
                            onChange={event => {
                              setMethodFieldValues(previous => ({
                                ...previous,
                                [field.key]: event.target.value,
                              }));
                              setMethodDetailsDirty(true);
                              setMethodFieldErrors(previous => ({ ...previous, [field.key]: '' }));
                            }}
                          />
                          {methodFieldErrors[field.key] && (
                            <small className="qsm-err">{methodFieldErrors[field.key]}</small>
                          )}
                        </label>
                      ))}
                    </div>
                  ) : (
                    <p className="qsm-method-editor-empty">
                      This payment method has no editable fields.
                    </p>
                  )}

                  {/* <label className="qsm-method-editor-field qsm-method-editor-remarks">
                    <span>Remarks <small>(Optional)</small></span>
                    <textarea
                      className="qsm-textarea"
                      rows={2}
                      value={methodRemarks}
                      placeholder="Add a note visible to buyers"
                      onChange={event => {
                        setMethodRemarks(event.target.value);
                        setMethodDetailsDirty(true);
                      }}
                    />
                  </label> */}

                  {/* <label className="qsm-method-editor-field qsm-method-editor-qr">
                    <span>QR Code <small>(Optional)</small></span>
                    <input
                      className="qsm-input"
                      type="file"
                      accept="image/*"
                      onChange={event => {
                        setMethodQrFile(event.target.files?.[0] ?? null);
                        setMethodDetailsDirty(true);
                      }}
                    />
                    <small className="qsm-method-editor-hint">
                      {methodQrFile?.name ?? (selectedMethod.qr_code ? 'Current QR code is saved. Choose a file to replace it.' : 'Optional · PNG, JPG or WebP')}
                    </small>
                  </label> */}

                  {/* <div className="qsm-method-editor-actions">
                    <button
                      type="button"
                      className="qsm-method-save"
                      onClick={() => void saveSelectedMethod()}
                      disabled={methodSubmitting}
                    >
                      {methodSubmitting
                        ? <><i className="fa-solid fa-spinner fa-spin" /> Saving changes…</>
                        : <><i className="fa-solid fa-floppy-disk" /> Save Payment Method</>}
                    </button>
                    {methodDetailsDirty && !methodSubmitting && (
                      <small><i className="fa-solid fa-circle-info" /> Save your changes before continuing.</small>
                    )}
                  </div> */}

                </div>
              )}
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
                  <span>Sell Amount</span>
                  <b>
                    {money(amountUsdtNum)} {DISPLAY_ASSET_CODE}
                    {/* <small className="qsm-summary-sub">Amount entered</small> */}
                  </b>
                </div>
                <div className="qsm-summary-row">
                  <span>Fee ({money(feePercent, 2)}%)</span>
                  <b className="qsm-green">
                    + {money(feeUsdt)} {DISPLAY_ASSET_CODE}
                    {/* <small className="qsm-summary-sub">Deducted from fiat: {money(feeFiat)} {fiat}</small> */}
                  </b>
                </div>
                <div className="qsm-summary-row">
                  <span>Total Amount</span>
                  <b>{money(totalUsdtWithFee)} {DISPLAY_ASSET_CODE}</b>
                </div>
                <div className="qsm-summary-row">
                  <span>Market Price (1 {DISPLAY_ASSET_CODE})</span>
                  <b>{money(rate)} {fiat}</b>
                </div>
                <div className="qsm-summary-row">
                  <span className='fw-bold fs-5'>Received Amount ({fiat})</span>
                  <b className="qsm-green">
                    {money(receiveFiat)} {fiat}
                    {/* <small className="qsm-summary-sub">{money(fiatAmount)} − {money(feeFiat)} fee</small> */}
                  </b>
                </div>
              </div>

              <div className="qsm-total qsm-total--hero qsm-total--sell-hero qsm-total--confirm">
                <div className="qsm-total-left">
                  <span className="qsm-total-icon"><i className="fa-solid fa-hand-holding-dollar" /></span>
                  <span className='fw-bold fs-5'>Received Amount</span>
                </div>
                <b className="qsm-total-value d-flex align-items-center gap-2">
                  <span>{feeLoading ? '…' : money(receiveFiat)}</span>
                  <span>{fiat}</span>
                </b>
              </div>

              {selectedMethod && (
                <div className="qsm-payment-details">
                  <div className="qsm-payment-details-head">
                    <PaymentMethodIcon
                      className="qsm-payment-details-icon"
                      methodName={selectedMethod.method_name}
                      iconImage={
                        selectedMethod.icon_url ??
                        selectedMethod.icon_image ??
                        selectedMethod.sell_method?.icon_url ??
                        selectedMethod.sell_method?.icon_image
                      }
                      size={36}
                      fallbackMode="card"
                    />
                    <span>
                      <strong>{selectedMethod.method_name}</strong>
                      <small>{selectedMethod.currency_name || fiat} payment details</small>
                    </span>
                  </div>
                  {selectedMethodDetails.length > 0 ? (
                    <dl className="qsm-payment-details-list">
                      {selectedMethodDetails.map(detail => (
                        <div className="qsm-payment-details-row" key={detail.key}>
                          <dt>{detail.label}</dt>
                          <dd>{detail.value}</dd>
                        </div>
                      ))}
                    </dl>
                  ) : (
                    <p className="qsm-payment-details-empty">No saved payment details for this method.</p>
                  )}
                  {selectedMethod.remarks && (
                    <div className="qsm-payment-details-extra">
                      <span>Remarks</span>
                      <p>{selectedMethod.remarks}</p>
                    </div>
                  )}
                </div>
              )}

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
            <button
              type="button"
              className="qsm-next"
              onClick={() => void handleNext()}
              disabled={methodSubmitting}
            >
              {methodSubmitting ? 'Saving payment method…' : 'Next'}
              {!methodSubmitting && <i className="fa-solid fa-arrow-right" />}
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
                onClick={() => void handleSubmit()}
                disabled={submitting || methodSubmitting}
              >
                {submitting ? (isEdit ? 'Saving…' : 'Creating…') : (isEdit ? 'Confirm & Update' : 'Confirm & Create')}
                {!submitting && <i className="fa-solid fa-circle-check" />}
              </button>
            </div>
          )}
        </footer>
      </div>

    </div>
  );
}
