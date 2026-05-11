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

  const closeModal = () => { setModalMode(null); setEditTarget(undefined); };

  const totalEstimatedFee = formData.totalAmount
    ? (parseFloat(formData.totalAmount) * (formData.fixedPrice ?? 0.004)).toFixed(2)
    : '0';    
  const minInFiat = (formData.orderLimitMin * (formData.fixedPrice ?? 0)).toFixed(2);
  const maxInFiat = (formData.orderLimitMax * (formData.fixedPrice ?? 0)).toFixed(2);

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
                value={formData.totalAmount}
                onChange={e => onFormChange({ totalAmount: e.target.value })}
              />
              <div className="inputRight"><span className="ccyText text-white">{formData?.asset || 'USD'}</span></div>
            </div>
          </div>
          {errors.totalAmount
            ? <div className="invalid-feedback d-block">{errors.totalAmount}</div>
            : <div className="help-text">≈ {totalEstimatedFee} {formData?.withFlat || 'USD'}</div>
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
                  value={formData.orderLimitMin}
                  onChange={e => onFormChange({ orderLimitMin: parseFloat(e.target.value) || 0 })}
                />
                {formData?.asset || 'USD'}
              </div>
              {errors.orderLimitMin
                ? <div className="invalid-feedback d-block">{errors.orderLimitMin}</div>
                : <div className="help-text">≈ {minInFiat} {formData?.withFlat || 'BDT'}</div>
              }
            </div>

            <span className="order-limit-dash pb-4">-</span>

            Max
            <div>
              <div className="d-flex align-items-center gap-2">
                <input
                  type="number"
                  className={`form-control-custom bg-dark ${errors.orderLimitMax ? 'is-invalid' : ''}`}
                  value={formData.orderLimitMax}
                  onChange={e => onFormChange({ orderLimitMax: parseFloat(e.target.value) || 0 })}
                />
                {formData?.asset || 'USD'}
              </div>
              {errors.orderLimitMax
                ? <div className="invalid-feedback d-block">{errors.orderLimitMax}</div>
                : <div className="help-text">≈ {maxInFiat} {formData?.withFlat || 'BDT'}</div>
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
          <label>Payment Time Limit <span className="text-danger fs-4">*</span></label>
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