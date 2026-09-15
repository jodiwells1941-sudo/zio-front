'use client';

import { createUserPaymentMethod, getUserPaymentMethods } from '@/app/api/common';
import { StepErrors } from '@/app/dashboard/ads/AdsPage';
import { ModalMode, PaymentFormData, UserPaymentMethod } from '@/types/P2PProfileTypes';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import PaymentModal from '../p2pProfile/Paymentmodal';

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

  // ─── Local "fiat typed" state ──────────────────────────────────────────────
  // The user now types the withFlat (fiat) amount in these fields.
  // formData.totalAmount / orderLimitMin / orderLimitMax keep storing the
  // asset (USD/USDT) amount, exactly like before — nothing downstream changes.
  const [totalAmountFlat,  setTotalAmountFlat]  = useState('');
  const [orderLimitMinFlat, setOrderLimitMinFlat] = useState('');
  const [orderLimitMaxFlat, setOrderLimitMaxFlat] = useState('');

  const closeModal = () => { setModalMode(null); setEditTarget(undefined); };

  const price = formData.fixedPrice ?? 0.004;

  // ─── One-time sync from formData (e.g. when editing an existing ad) ───────
  useEffect(() => {
    if (formData.totalAmount) {
      setTotalAmountFlat((parseFloat(formData.totalAmount) * price).toFixed(2));
    }
    if (formData.orderLimitMin) {
      setOrderLimitMinFlat((formData.orderLimitMin * price).toFixed(2));
    }
    if (formData.orderLimitMax) {
      setOrderLimitMaxFlat((formData.orderLimitMax * price).toFixed(2));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Reverse-conversion handlers (fiat typed -> asset stored) ─────────────

  const handleTotalAmountFlatChange = (val: string) => {
    setTotalAmountFlat(val);
    const assetVal = val && price ? (parseFloat(val) / price).toString() : '';
    onFormChange({ totalAmount: assetVal });
  };

  const handleOrderLimitMinFlatChange = (val: string) => {
    setOrderLimitMinFlat(val);
    const assetVal = val && price ? parseFloat(val) / price : 0;
    onFormChange({ orderLimitMin: assetVal || 0 });
  };

  const handleOrderLimitMaxFlatChange = (val: string) => {
    setOrderLimitMaxFlat(val);
    const assetVal = val && price ? parseFloat(val) / price : 0;
    onFormChange({ orderLimitMax: assetVal || 0 });
  };

  // ─── Asset equivalents shown under each input (reversed from before) ──────

  const totalAssetEquivalent = totalAmountFlat && price
    ? (parseFloat(totalAmountFlat) / price).toFixed(2)
    : '0';
  const minAssetEquivalent = orderLimitMinFlat && price
    ? (parseFloat(orderLimitMinFlat) / price).toFixed(2)
    : '0';
  const maxAssetEquivalent = orderLimitMaxFlat && price
    ? (parseFloat(orderLimitMaxFlat) / price).toFixed(2)
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
            <div className={`inputWrap w-100 w-md-50 rounded bg-dark ${errors.totalAmount ? 'border border-danger' : ''}`}>
              <input
                type="number"
                className="input fw-5 text-light placeholder-texr-color"
                placeholder={`Please Enter Total ${formData.type === 'buy' ? 'Buy' : 'Sell'} Amount`}
                value={totalAmountFlat}
                onChange={e => handleTotalAmountFlatChange(e.target.value)}
              />
              <div className="inputRight"><span className="ccyText text-white">{formData?.withFlat || 'BDT'}</span></div>
            </div>
          </div>
          {errors.totalAmount
            ? <div className="invalid-feedback d-block">{errors.totalAmount}</div>
            : <div className="help-text">≈ {totalAssetEquivalent} {formData?.asset || 'USDT'}</div>
          }
        </div>

        {/* Order Limit */}
        <div className="form-group-custom">
          <label>Order Limit <span className="text-danger fs-4">*</span></label>
          <div className="order-limit-row">
            Min
            <div>
              <div className="d-flex align-items-center gap-2">
                <input
                  type="number"
                  className={`form-control-custom bg-dark ${errors.orderLimitMin ? 'is-invalid' : ''}`}
                  value={orderLimitMinFlat}
                  onChange={e => handleOrderLimitMinFlatChange(e.target.value)}
                />
                {formData?.withFlat || 'BDT'}
              </div>
              {errors.orderLimitMin
                ? <div className="invalid-feedback d-block">{errors.orderLimitMin}</div>
                : <div className="help-text">≈ {minAssetEquivalent} {formData?.asset || 'USDT'}</div>
              }
            </div>

            <span className="order-limit-dash pb-4">-</span>

            Max
            <div>
              <div className="d-flex align-items-center gap-2">
                <input
                  type="number"
                  className={`form-control-custom bg-dark ${errors.orderLimitMax ? 'is-invalid' : ''}`}
                  value={orderLimitMaxFlat}
                  onChange={e => handleOrderLimitMaxFlatChange(e.target.value)}
                />
                {formData?.withFlat || 'BDT'}
              </div>
              {errors.orderLimitMax
                ? <div className="invalid-feedback d-block">{errors.orderLimitMax}</div>
                : <div className="help-text">≈ {maxAssetEquivalent} {formData?.asset || 'USDT'}</div>
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