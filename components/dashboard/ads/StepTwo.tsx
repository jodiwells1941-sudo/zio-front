'use client';

import { createUserPaymentMethod, getUserPaymentMethods } from '@/app/api/common';
import { StepErrors } from '@/app/dashboard/ads/AdsPage';
import { ModalMode, PaymentFormData, UserPaymentMethod } from '@/types/P2PProfileTypes';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import PaymentModal from '../p2pProfile/Paymentmodal';

const CURRENCIES = [
  { code: 'USD', name: 'US Dollar', icon: '$' },
  { code: 'EUR', name: 'Euro', icon: '€' },
  { code: 'GBP', name: 'British Pound', icon: '£' },
  { code: 'BDT', name: 'Bangladeshi Taka', icon: '৳' },
  { code: 'INR', name: 'Indian Rupee', icon: '₹' },
  { code: 'PKR', name: 'Pakistani Rupee', icon: '₨' },
  { code: 'AUD', name: 'Australian Dollar', icon: '$' },
  { code: 'CAD', name: 'Canadian Dollar', icon: '$' },
  { code: 'JPY', name: 'Japanese Yen', icon: '¥' },
  { code: 'CNY', name: 'Chinese Yuan', icon: '¥' },
  { code: 'CHF', name: 'Swiss Franc', icon: 'CHF' },
];

interface StepTwoProps {
  formData: {
    totalAmount: string;
    orderLimitMin: number;
    orderLimitMax: number;
    paymentTimeLimit: string;
    paymentMethodId: number;
    type: 'buy' | 'sell';
    fixedPrice?: number;
    withFlat?: string;
    asset?: string;
  };
  onFormChange: (data: Partial<StepTwoProps['formData']>) => void;
  errors?: StepErrors;
}

export default function StepTwo({ formData, onFormChange, errors = {} }: StepTwoProps) {
  const [modalMode,      setModalMode]      = useState<ModalMode | null>(null);
  const [editTarget,     setEditTarget]     = useState<UserPaymentMethod | undefined>();
  const [methods,        setMethods]        = useState<any[]>([]);
  const [loadingMethods, setLoadingMethods] = useState(false);
  const [saving,         setSaving]         = useState(false);

  // Whether the user is creating a SELL ad. For sell ads, the user types the
  // amount directly in the asset (USD/USDT), and we show the converted
  // fiat (withFlat) amount underneath. For buy ads, behavior is unchanged:
  // the user types the fiat amount and we show the converted asset amount.
  const isSell = formData.type === 'sell';

  // ─── Local "typed" state ────────────────────────────────────────────────
  // For BUY: these hold the fiat (withFlat) amount the user types.
  // For SELL: these hold the asset (USD/USDT) amount the user types.
  // formData.totalAmount / orderLimitMin / orderLimitMax always keep storing
  // the asset amount, exactly like before — nothing downstream changes.
  const [totalAmountInput,   setTotalAmountInput]   = useState('');
  const [orderLimitMinInput, setOrderLimitMinInput] = useState('');
  const [orderLimitMaxInput, setOrderLimitMaxInput] = useState('');

  const closeModal = () => { setModalMode(null); setEditTarget(undefined); };

  const price = formData.fixedPrice ?? 0.004;

  // ─── Currency icon lookup (shown as a prefix right before the amount) ─────
  const fiatIcon = CURRENCIES.find(c => c.code === (formData?.withFlat || 'BDT'))?.icon ?? '';
  const assetIcon = '$';

  // What's typed into the input, and what's shown underneath, swap for sell.
  const inputPrefix = isSell ? assetIcon : fiatIcon;
  const inputSuffixLabel = isSell ? (formData?.asset || 'USDT') : (formData?.withFlat || 'BDT');
  const helpSuffixLabel = isSell ? (formData?.withFlat || 'BDT') : (formData?.asset || 'USDT');

  // ─── One-time sync from formData (e.g. when editing an existing ad) ───────
  useEffect(() => {
    if (formData.totalAmount) {
      const assetVal = parseFloat(formData.totalAmount);
      setTotalAmountInput(isSell ? formData.totalAmount : (assetVal * price).toFixed(2));
    }
    if (formData.orderLimitMin) {
      setOrderLimitMinInput(isSell ? String(formData.orderLimitMin) : (formData.orderLimitMin * price).toFixed(2));
    }
    if (formData.orderLimitMax) {
      setOrderLimitMaxInput(isSell ? String(formData.orderLimitMax) : (formData.orderLimitMax * price).toFixed(2));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Input change handlers ─────────────────────────────────────────────
  // SELL: typed value IS the asset amount -> store it directly.
  // BUY: typed value is the fiat amount -> convert to asset before storing.

  const handleTotalAmountInputChange = (val: string) => {
    setTotalAmountInput(val);
    if (isSell) {
      onFormChange({ totalAmount: val });
    } else {
      const assetVal = val && price ? (parseFloat(val) / price).toString() : '';
      onFormChange({ totalAmount: assetVal });
    }
  };

  const handleOrderLimitMinInputChange = (val: string) => {
    setOrderLimitMinInput(val);
    if (isSell) {
      onFormChange({ orderLimitMin: val ? parseFloat(val) : 0 });
    } else {
      const assetVal = val && price ? parseFloat(val) / price : 0;
      onFormChange({ orderLimitMin: assetVal || 0 });
    }
  };

  const handleOrderLimitMaxInputChange = (val: string) => {
    setOrderLimitMaxInput(val);
    if (isSell) {
      onFormChange({ orderLimitMax: val ? parseFloat(val) : 0 });
    } else {
      const assetVal = val && price ? parseFloat(val) / price : 0;
      onFormChange({ orderLimitMax: assetVal || 0 });
    }
  };

  // ─── Equivalent shown under each input ─────────────────────────────────
  // SELL: input is asset -> show fiat equivalent (asset * price).
  // BUY: input is fiat -> show asset equivalent (fiat / price), same as before.

  const totalHelpEquivalent = totalAmountInput && price
    ? (isSell ? (parseFloat(totalAmountInput) * price) : (parseFloat(totalAmountInput) / price)).toFixed(2)
    : '0';
  const minHelpEquivalent = orderLimitMinInput && price
    ? (isSell ? (parseFloat(orderLimitMinInput) * price) : (parseFloat(orderLimitMinInput) / price)).toFixed(2)
    : '0';
  const maxHelpEquivalent = orderLimitMaxInput && price
    ? (isSell ? (parseFloat(orderLimitMaxInput) * price) : (parseFloat(orderLimitMaxInput) / price)).toFixed(2)
    : '0';

  // ─── Load payment methods ──────────────────────────────────────────────────

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

  // ─── Handle modal submit (add / edit) ──────────────────────────────────────

  const handleModalSubmit = async (data: PaymentFormData) => {
    setSaving(true);
    try {
      if (modalMode === 'add') {
        const res = await createUserPaymentMethod(data);
        toast.success('Payment method added successfully.');
        setMethods(prev => [res.data, ...prev]);
      }
      // If you add edit support: else if (modalMode === 'edit') { ... }
      closeModal();
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? e?.message ?? 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="step-two-container border rounded-3 p-3 border-dark-light">

        {/* Total Amount */}
        <div className="form-group-custom">
          <label>
            Total {formData.type === 'buy' ? 'Buy' : 'Sell'} Amount{' '}
            <span className="text-danger fs-4">*</span>
          </label>
          <div className="total-amount-row">
            <div
              className={`inputWrap w-100 w-md-50 rounded bg-dark ${errors.totalAmount ? 'border border-danger' : ''}`}
              style={{ position: 'relative' }}
            >
              <span
                className="ccyPrefix text-white"
                style={{
                  position: 'absolute',
                  left: 14,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontWeight: 700,
                  pointerEvents: 'none',
                }}
              >
                {inputPrefix}
              </span>
              <input
                type="number"
                className="input fw-5 text-light placeholder-texr-color"
                placeholder={`Please Enter Total ${formData.type === 'buy' ? 'Buy' : 'Sell'} Amount`}
                value={totalAmountInput}
                onChange={e => handleTotalAmountInputChange(e.target.value)}
                style={{ paddingLeft: 32 }}
              />
              <div className="inputRight"><span className="ccyText text-white">{inputSuffixLabel}</span></div>
            </div>
          </div>
          {errors.totalAmount
            ? <div className="invalid-feedback d-block">{errors.totalAmount}</div>
            : <div className="help-text">≈ {totalHelpEquivalent} {helpSuffixLabel}</div>
          }
        </div>

        {/* Order Limit */}
        <div className="form-group-custom">
          <label>Order Limit <span className="text-danger fs-4">*</span></label>
          <div className="order-limit-row">
            Min
            <div>
              <div className="d-flex align-items-center gap-2">
                <div style={{ position: 'relative' }}>
                  <span
                    className="ccyPrefix text-white"
                    style={{
                      position: 'absolute',
                      left: 10,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      fontWeight: 700,
                      pointerEvents: 'none',
                    }}
                  >
                    {inputPrefix}
                  </span>
                  <input
                    type="number"
                    className={`form-control-custom ps-5 bg-dark ${errors.orderLimitMin ? 'is-invalid' : ''}`}
                    value={orderLimitMinInput}
                    onChange={e => handleOrderLimitMinInputChange(e.target.value)}
                    style={{ paddingLeft: 26 }}
                  />
                </div>
                {inputSuffixLabel}
              </div>
              {errors.orderLimitMin
                ? <div className="invalid-feedback d-block">{errors.orderLimitMin}</div>
                : <div className="help-text">≈ {minHelpEquivalent} {helpSuffixLabel}</div>
              }
            </div>

            <span className="order-limit-dash pb-4">-</span>

            Max
            <div>
              <div className="d-flex align-items-center gap-2">
                <div style={{ position: 'relative' }}>
                  <span
                    className="ccyPrefix text-white"
                    style={{
                      position: 'absolute',
                      left: 10,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      fontWeight: 700,
                      pointerEvents: 'none',
                    }}
                  >
                    {inputPrefix}
                  </span>
                  <input
                    type="number"
                    className={`form-control-custom ps-5 bg-dark ${errors.orderLimitMax ? 'is-invalid' : ''}`}
                    value={orderLimitMaxInput}
                    onChange={e => handleOrderLimitMaxInputChange(e.target.value)}
                    style={{ paddingLeft: 26 }}
                  />
                </div>
                {inputSuffixLabel}
              </div>
              {errors.orderLimitMax
                ? <div className="invalid-feedback d-block">{errors.orderLimitMax}</div>
                : <div className="help-text">≈ {maxHelpEquivalent} {helpSuffixLabel}</div>
              }
            </div>
          </div>
        </div>

        {/* Add Payment Method */}
        <div className="form-group-custom">
          <label>Payment Method</label>
          <p className="payment-hint">Select up to 5 methods</p>
          <button className="add-button" type="button" onClick={() => setModalMode('add')}>
            <span className="add-button-icon"><i className="fa-solid fa-plus" /></span>
            Add
          </button>
        </div>

        {/* Select Payment Method */}
        <div className="mb-4">
          <label>Select Payment Method <span className="text-danger fs-4">*</span></label>
          <select
            className={`select-custom form-control-custom w-100 w-md-25 d-block ${errors.paymentMethodId ? 'is-invalid' : ''}`}
            value={formData.paymentMethodId}
            onChange={e => onFormChange({ paymentMethodId: Number(e.target.value) })}
            disabled={loadingMethods}
          >
            <option value={0}>{loadingMethods ? 'Loading...' : 'Select Payment Method'}</option>
            {methods.map(m => (
              <option key={m.id} value={m.id}>
                {m?.method_name} - {m?.walletNumber} {m?.bankName}
              </option>
            ))}
          </select>
          {errors.paymentMethodId && (
            <div className="invalid-feedback d-block">{errors.paymentMethodId}</div>
          )}
        </div>

        {/* Payment Time Limit */}
        <div className="form-group-custom">
          <label>Order Time Limit <span className="text-danger fs-4">*</span></label>
          <select
            className={`select-custom form-control-custom w-100 w-md-25 ${errors.paymentTimeLimit ? 'is-invalid' : ''}`}
            value={formData.paymentTimeLimit}
            onChange={e => onFormChange({ paymentTimeLimit: e.target.value })}
          >
            <option value="">Select Time Limit</option>
            {Array.from({ length: 144 }, (_, i) => (i + 1) * 5).map(t => (
              <option key={t} value={t}>{t} min</option>
            ))}
          </select>
          {errors.paymentTimeLimit && (
            <div className="invalid-feedback d-block">{errors.paymentTimeLimit}</div>
          )}
        </div>

      </div>

      {modalMode !== null && (
        <PaymentModal
          mode={modalMode}
          initialData={editTarget}
          onClose={closeModal}
          onSubmit={handleModalSubmit}
        />
      )}
    </>
  );
}