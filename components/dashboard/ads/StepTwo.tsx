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

  // Only the TOTAL AMOUNT field switches to asset-wise input for sell ads.
  // Order Limit Min/Max always stay fiat (currency)-wise input, for both
  // buy and sell — same behavior as before, on purpose.
  const isSell = formData.type === 'sell';

  // ─── Local "typed" state ────────────────────────────────────────────────
  // totalAmountInput: fiat for buy, asset for sell (see isSell above).
  // orderLimitMin/MaxInput: always fiat (currency), for both buy and sell.
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

  // Total Amount: swaps prefix/suffix for sell (asset-wise).
  const totalInputPrefix = isSell ? assetIcon : fiatIcon;
  const totalInputSuffixLabel = isSell ? (formData?.asset || 'USDT') : (formData?.withFlat || 'BDT');
  const totalHelpSuffixLabel = isSell ? (formData?.withFlat || 'BDT') : (formData?.asset || 'USDT');

  // Order Limit Min/Max: always fiat-wise (currency), regardless of buy/sell.
  const limitInputPrefix = fiatIcon;
  const limitInputSuffixLabel = formData?.withFlat || 'BDT';
  const limitHelpSuffixLabel = formData?.asset || 'USDT';

  // ─── One-time sync from formData (e.g. when editing an existing ad) ───────
  useEffect(() => {
    if (formData.totalAmount) {
      const assetVal = parseFloat(formData.totalAmount);
      setTotalAmountInput(isSell ? formData.totalAmount : (assetVal * price).toFixed(2));
    }
    if (formData.orderLimitMin) {
      setOrderLimitMinInput((formData.orderLimitMin * price).toFixed(2));
    }
    if (formData.orderLimitMax) {
      setOrderLimitMaxInput((formData.orderLimitMax * price).toFixed(2));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Input change handlers ─────────────────────────────────────────────

  // Total Amount: SELL -> typed value IS the asset amount, store directly.
  //               BUY  -> typed value is fiat, convert to asset before storing.
  const handleTotalAmountInputChange = (val: string) => {
    setTotalAmountInput(val);
    if (isSell) {
      onFormChange({ totalAmount: val });
    } else {
      const assetVal = val && price ? (parseFloat(val) / price).toString() : '';
      onFormChange({ totalAmount: assetVal });
    }
  };

  // Order Limit Min/Max: always fiat typed -> convert to asset before storing.
  const handleOrderLimitMinInputChange = (val: string) => {
    setOrderLimitMinInput(val);
    const assetVal = val && price ? parseFloat(val) / price : 0;
    onFormChange({ orderLimitMin: assetVal || 0 });
  };

  const handleOrderLimitMaxInputChange = (val: string) => {
    setOrderLimitMaxInput(val);
    const assetVal = val && price ? parseFloat(val) / price : 0;
    onFormChange({ orderLimitMax: assetVal || 0 });
  };

  // ─── Equivalent shown under each input ─────────────────────────────────

  // Total Amount: SELL -> input is asset, show fiat equivalent (asset * price).
  //               BUY  -> input is fiat, show asset equivalent (fiat / price).
  const totalHelpEquivalent = totalAmountInput && price
    ? (isSell ? (parseFloat(totalAmountInput) * price) : (parseFloat(totalAmountInput) / price)).toFixed(2)
    : '0';

  // Order Limit Min/Max: input is always fiat, show asset equivalent (fiat / price).
  const minHelpEquivalent = orderLimitMinInput && price
    ? (parseFloat(orderLimitMinInput) / price).toFixed(2)
    : '0';
  const maxHelpEquivalent = orderLimitMaxInput && price
    ? (parseFloat(orderLimitMaxInput) / price).toFixed(2)
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
                {totalInputPrefix}
              </span>
              <input
                type="number"
                className="input fw-5 text-light placeholder-texr-color"
                placeholder={`Please Enter Total ${formData.type === 'buy' ? 'Buy' : 'Sell'} Amount`}
                value={totalAmountInput}
                onChange={e => handleTotalAmountInputChange(e.target.value)}
                style={{ paddingLeft: 32 }}
              />
              <div className="inputRight"><span className="ccyText text-white">{totalInputSuffixLabel}</span></div>
            </div>
          </div>
          {errors.totalAmount
            ? <div className="invalid-feedback d-block">{errors.totalAmount}</div>
            : <div className="help-text">≈ {totalHelpEquivalent} {totalHelpSuffixLabel}</div>
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
                    {limitInputPrefix}
                  </span>
                  <input
                    type="number"
                    className={`form-control-custom ps-5 bg-dark ${errors.orderLimitMin ? 'is-invalid' : ''}`}
                    value={orderLimitMinInput}
                    onChange={e => handleOrderLimitMinInputChange(e.target.value)}
                    style={{ paddingLeft: 26 }}
                  />
                </div>
                {limitInputSuffixLabel}
              </div>
              {errors.orderLimitMin
                ? <div className="invalid-feedback d-block">{errors.orderLimitMin}</div>
                : <div className="help-text">≈ {minHelpEquivalent} {limitHelpSuffixLabel}</div>
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
                    {limitInputPrefix}
                  </span>
                  <input
                    type="number"
                    className={`form-control-custom ps-5 bg-dark ${errors.orderLimitMax ? 'is-invalid' : ''}`}
                    value={orderLimitMaxInput}
                    onChange={e => handleOrderLimitMaxInputChange(e.target.value)}
                    style={{ paddingLeft: 26 }}
                  />
                </div>
                {limitInputSuffixLabel}
              </div>
              {errors.orderLimitMax
                ? <div className="invalid-feedback d-block">{errors.orderLimitMax}</div>
                : <div className="help-text">≈ {maxHelpEquivalent} {limitHelpSuffixLabel}</div>
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