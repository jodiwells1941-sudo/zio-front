'use client';

import { StepErrors } from "@/app/dashboard/ads/AdsPage";



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

export default function StepOne({ formData, onFormChange, errors = {} }: StepOneProps) {
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
              With Fiat <span className="text-danger fs-4">*</span>
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

        {/* Price Type */}
        <div className="form-group-custom">
          <label>Price Type <span className="text-danger fs-4">*</span></label>
          <div className="radio-group-custom">
            {(['fixed', 'floating'] as const).map(pt => (
              <label key={pt} className="radio-item-custom">
                <input
                  type="radio"
                  className="radio-custom"
                  checked={formData.priceType === pt}
                  onChange={() => onFormChange({ priceType: pt })}
                />
                {pt.charAt(0).toUpperCase() + pt.slice(1)}
              </label>
            ))}
          </div>
        </div>

        {/* Fixed Price */}
        {formData.priceType === 'fixed' && (
          <div className="form-group-custom">
            <label>Fixed Price <span className="text-danger fs-4">*</span></label>
            <div className={`number-input-group ${errors.fixedPrice ? 'border border-danger rounded' : ''}`}>
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
            {/* {errors.fixedPrice
              ? <div className="invalid-feedback d-block">{errors.fixedPrice}</div>
              : <div className="help-text">The fixed price should be between 97.75 - 152.72</div>
            } */}
          </div>
        )}

        {/* Price display */}
        <div className="price-display-row">
          <div className="price-display-item">
            <div className="price-label">Your Price</div>
            <div className="price-value"> {formData?.withFlat || 'USD'} {formData.fixedPrice.toFixed(2)}</div>
          </div>
          <div className="price-display-item">
            <div className="price-label">Highest Order Price</div>
            <div className="price-value">-</div>
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