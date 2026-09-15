'use client';

import { useEffect, useState } from "react";
import { StepErrors } from "@/app/dashboard/ads/AdsPage";
import { GetCurrencyLimitApi } from "@/app/api/p2p";

interface StepOneProps {
  formData: {
    type: 'buy' | 'sell';
    asset: string;
    withFlat: string;
    priceType: 'fixed' | 'floating';
    fixedPrice: number;
  };
  onFormChange: (data: Partial<StepOneProps['formData']>) => void;
  errors?: StepErrors;
}

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

type CurrencyLimit = {
  currency_code: string;
  min_amount: string | number | null;
  max_amount: string | number | null;
  is_active: boolean;
};

export default function StepOne({ formData, onFormChange, errors = {} }: StepOneProps) {
  const [limit, setLimit] = useState<CurrencyLimit | null>(null);
  const [limitLoading, setLimitLoading] = useState(false);
  const [priceRangeError, setPriceRangeError] = useState<string | null>(null);

  // ── Fetch min/max whenever the selected currency changes ──
  useEffect(() => {
    if (!formData.withFlat) {
      setLimit(null);
      setPriceRangeError(null);
      return;
    }

    let cancelled = false;
    setLimitLoading(true);

    (async () => {
      try {
        const res = await GetCurrencyLimitApi({ params: { currency: formData.withFlat } });
        if (cancelled) return;

        if (!res?.error) {
          setLimit(res.data);
        } else {
          setLimit(null);
        }
      } catch {
        if (!cancelled) setLimit(null);
      } finally {
        if (!cancelled) setLimitLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [formData.withFlat]);

  // ── Validate price against fetched min/max as it changes ──
  useEffect(() => {
    if (!limit || limit.min_amount === null) {
      setPriceRangeError(null);
      return;
    }

    const min = Number(limit.min_amount);
    const max = limit.max_amount === null ? null : Number(limit.max_amount);
    const price = formData.fixedPrice;

    if (price < min) {
      setPriceRangeError(`Price must be at least ${min.toLocaleString()} ${formData.withFlat}.`);
    } else if (max !== null && price > max) {
      setPriceRangeError(`Price must not exceed ${max.toLocaleString()} ${formData.withFlat}.`);
    } else {
      setPriceRangeError(null);
    }
  }, [limit, formData.fixedPrice, formData.withFlat]);

  const formatLimit = (value: string | number | null) => {
    if (value === null || value === undefined) return '-';
    const n = Number(value);
    return Number.isNaN(n) ? '-' : n.toLocaleString(undefined, { maximumFractionDigits: 2 });
  };

  return (
    <>
      <div className="step-one-container border rounded-3 p-3 border-dark-light">

        {/* Buy / Sell toggle */}
        <label className="w-100">
          I want to <span className="text-danger fs-4">*</span>
        </label>
        <div className="tabs-container d-inline-block">
          {(['buy', 'sell'] as const).map(t => (
            <button
              key={t}
              className={`tab-button ${formData.type === t ? 'active' : ''}`}
              onClick={() => onFormChange({ type: t })}
              type="button"
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Asset & Fiat */}
        <div className="form-row-custom">
          {/* Asset */}
          <div className="form-group-custom">
            <label>Asset <span className="text-danger fs-4">*</span></label>
            <div className="token-selector">
              <div className="token-icon"><i className="fa-solid fa-chevron-down" /></div>
              <select
                className={`select-custom form-control-custom ${errors.asset ? 'is-invalid' : ''}`}
                value={formData.asset}
                onChange={e => onFormChange({ asset: e.target.value })}
              >
                <option value="">Select Asset</option>
                <option value="USDT">USDT</option>
              </select>
            </div>
            {errors.asset && <div className="invalid-feedback d-block">{errors.asset}</div>}
          </div>

          {/* With Fiat */}
          <div className="form-group-custom">
            <label>
              Select Your Currency  <span className="text-danger fs-4">*</span>
              <span className="label-icon"><i className="fa-solid fa-circle-info" /></span>
            </label>
            <div className="token-selector">
              <div className="token-icon"><i className="fa-solid fa-chevron-down" /></div>
              <select
                className={`select-custom form-control-custom ${errors.withFlat ? 'is-invalid' : ''}`}
                value={formData.withFlat}
                onChange={e => onFormChange({ withFlat: e.target.value })}
              >
                <option value="">Select Currency</option>
                {CURRENCIES.map(c => (
                  <option key={c.code} value={c.code}>{c.code} - {c.name}</option>
                ))}
              </select>
            </div>
            {errors.withFlat && <div className="invalid-feedback d-block">{errors.withFlat}</div>}
          </div>
        </div>

        {/* Fixed Price */}
        {formData.priceType === 'fixed' && (
          <div className="form-group-custom">
            <label>{formData.type == 'buy' ? 'Buy Price' : 'Sell Price'} <span className="text-danger fs-4">*</span></label>
            <div className={`number-input-group ${(errors.fixedPrice || priceRangeError) ? 'border border-danger rounded' : ''}`}>
              <button
                className="number-input-btn"
                onClick={() => onFormChange({ fixedPrice: Math.max(97.75, formData.fixedPrice - 1) })}
                type="button"
              >
                <i className="fa-solid fa-minus" />
              </button>
              <input
                type="number"
                className="number-input-display"
                value={formData.fixedPrice}
                onChange={e => onFormChange({ fixedPrice: parseFloat(e.target.value) || 0 })}
              />
              <button
                className="number-input-btn"
                onClick={() => onFormChange({ fixedPrice: formData.fixedPrice + 1 })}
                type="button"
              >
                <i className="fa-solid fa-plus" />
              </button>
            </div>
            {priceRangeError && (
              <div className="invalid-feedback d-block">{priceRangeError}</div>
            )}
          </div>
        )}

        {/* Price display */}
        <div className="price-display-row">
          <div className="price-display-item">
            <div className="price-label">Your Price</div>
            <div className="price-value"> {formData?.withFlat || 'USD'} {formData.fixedPrice.toFixed(2)}</div>
          </div>
          <div className="price-display-item">
            <div className="price-label">Minimum Currency Price</div>
            <div className="price-value">
              {limitLoading ? '...' : formatLimit(limit?.min_amount ?? null)}
            </div>
          </div>
          <div className="price-display-item">
            <div className="price-label">Maximum Currency Price</div>
            <div className="price-value">
              {limitLoading ? '...' : formatLimit(limit?.max_amount ?? null)}
            </div>
          </div>
        </div>

      </div>

      <a href="#" className="help-guide-link">
        <span className="help-icon"><i className="fa-regular fa-circle-question" /></span>
        Help &amp; Guide
      </a>
    </>
  );
}