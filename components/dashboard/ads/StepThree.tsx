'use client';

import { StepErrors } from "@/app/dashboard/ads/AdsPage";



interface Conditions {
  registered: boolean;
  registerDays: number;
  holdingsBTC: boolean;
  holdingsAmount: number;
}

interface StepThreeProps {
  formData: {
    remarks: string;
    autoReply: string;
    displayRegion: string;
    conditions: Conditions;
    status: boolean;
  };
  onFormChange: (data: Partial<StepThreeProps['formData']>) => void;
  errors?: StepErrors;
}

const REGIONS = [
  { value: 'all',      label: 'All Regions' },
  { value: 'asia',     label: 'Asia' },
  { value: 'europe',   label: 'Europe' },
  { value: 'americas', label: 'Americas' },
];

export default function StepThree({ formData, onFormChange, errors = {} }: StepThreeProps) {
  return (
    <div className="step-three-container border rounded-3 p-3 border-dark-light">

      {/* Terms Tags */}
      <div className="form-group-custom">
        <label>Terms Tags (Optional)</label>
        <select className="select-custom form-control-custom">
          <option>Add tags</option>
        </select>
        <div className="help-text">Select up to 3 tags</div>
      </div>

      {/* Remarks */}
      <div className="form-group-custom">
        <label>Remarks (Optional)</label>
        <textarea
          className="textarea-custom"
          placeholder="Please do not include any crypto-related words, such as crypto, P2P, C2C, BTC, USDT, ETH etc."
          value={formData.remarks}
          onChange={e => {
            if (e.target.value.length <= 1000) onFormChange({ remarks: e.target.value });
          }}
        />
        <div className="textarea-char-count">{formData.remarks.length}/1000</div>
      </div>

      {/* Auto Reply */}
      <div className="form-group-custom">
        <label>Auto Reply (Optional)</label>
        <textarea
          className="textarea-custom"
          placeholder="Auto-reply message will be sent to the counterparty once the order is created"
          value={formData.autoReply}
          onChange={e => {
            if (e.target.value.length <= 1000) onFormChange({ autoReply: e.target.value });
          }}
        />
        <div className="textarea-char-count">{formData.autoReply.length}/1000</div>
      </div>

      {/* Display Region */}
      <div className="form-group-custom">
        <label>
          Display to users in <span className="text-danger fs-4">*</span>
        </label>
        <select
          className={`select-custom form-control-custom ${errors.displayRegion ? 'is-invalid' : ''}`}
          value={formData.displayRegion}
          onChange={e => onFormChange({ displayRegion: e.target.value })}
        >
          <option value="">Select Region</option>
          {REGIONS.map(r => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
        {errors.displayRegion && (
          <div className="invalid-feedback d-block">{errors.displayRegion}</div>
        )}
      </div>

      {/* Status */}
      <div className="form-group-custom">
        <label>Status <span className="text-danger fs-4">*</span></label>
        <div className="radio-group-custom">
          {([true, false] as const).map(val => (
            <label key={String(val)} className="radio-item-custom">
              <input
                type="radio"
                className="radio-custom"
                checked={formData.status === val}
                onChange={() => onFormChange({ status: val })}
              />
              {val ? 'Active' : 'Inactive'}
            </label>
          ))}
        </div>
      </div>

      {/* Help & Guide */}
      <a href="#" className="help-guide-link">
        <span className="help-icon"><i className="fa-regular fa-circle-question" /></span>
        Help &amp; Guide
      </a>
    </div>
  );
}