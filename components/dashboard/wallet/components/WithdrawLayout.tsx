import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { TabKey } from '../types';
import WithdrawSubmitProcessingModel from './WithdrawSubmitProcessingModel';
import { SubmitDepositWithdrawApi } from '@/app/api/wallet';

interface FormData {
  coin: string;
  network: string;
  depositAddress: string;
  binanceId: string;
}

interface FormErrors {
  amount?: string;
  coin?: string;
  network?: string;
  depositAddress?: string;
  binanceId?: string;
}

export default function WithdrawLayout({
  title,
  actionLabel,
  paymentMethods,
  amountPreset,
  selectedPayment,
  setSelectedPayment,
  selectedAmount,
  setSelectedAmount,
  setActiveTabValue,
}: {
  title: string;
  actionLabel: string;
  paymentMethods: string[];
  amountPreset: number[];
  selectedPayment: string;
  setSelectedPayment: (v: string) => void;
  selectedAmount: number;
  setSelectedAmount: (v: number) => void;
  setActiveTabValue: (v: TabKey) => void;
}) {
  const [submitDeposit, setSubmitDeposit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const [formData, setFormData] = useState<FormData>({
    coin: '',
    network: '',
    depositAddress: '',
    binanceId: '',
  });

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  // ── Validation ───────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!selectedAmount || selectedAmount < 20) {
      newErrors.amount = 'Minimum withdrawal amount is 20 USD.';
    } else if (selectedAmount > 4000) {
      newErrors.amount = 'Maximum withdrawal amount is 4,000 USD.';
    }

    if (!formData.coin) {
      newErrors.coin = 'Please select a coin.';
    }

    const hasBinance = formData.binanceId.trim() !== '';
    const hasWallet = formData.network.trim() !== '' && formData.depositAddress.trim() !== '';

    if (!hasBinance && !hasWallet) {
      if (!formData.network) newErrors.network = 'Select a network.';
      if (!formData.depositAddress) newErrors.depositAddress = 'Enter deposit address.';
      if (!formData.network && !formData.depositAddress) {
        newErrors.binanceId = 'Provide either a Binance ID or wallet address + network.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── Submit ───────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validate()) return;

    const confirm = await Swal.fire({
      title: 'Confirm Withdrawal',
      html: `
        <p style="color:#999999;font-size:14px;">You are about to withdraw <strong>${selectedAmount} USD</strong>.</p>
        <p style="color:#e74c3c;font-size:13px;">This action cannot be undone.</p>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, Withdraw!',
      cancelButtonText: 'Cancel',
    });

    if (!confirm.isConfirmed) return;

    setLoading(true);

    try {
      const payload: Record<string, unknown> = {
        type: 'withdraw',
        amount: selectedAmount,
        coin: formData.coin,
      };

      if (formData.binanceId.trim()) {
        payload.binance_id = formData.binanceId.trim();
      } 
      payload.network = formData.network;
      payload.wallet_address = formData.depositAddress;

      const res = await SubmitDepositWithdrawApi(payload);

      await Swal.fire(
        'Withdrawal Submitted!',
        res?.message ?? 'Your withdrawal is being processed.',
        'success'
      );

      setSubmitDeposit(true);

    } catch (err: any) {
      const data = err?.response?.data;

      // Laravel field-level validation errors
      if (data?.errors) {
        const serverErrors: FormErrors = {};
        Object.entries(data.errors).forEach(([key, msgs]) => {
          serverErrors[key as keyof FormErrors] = Array.isArray(msgs)
            ? (msgs as string[])[0]
            : String(msgs);
        });
        setErrors(serverErrors);
        Swal.fire('Validation Error', data?.message ?? 'Please fix the errors.', 'error');
      } else {
        Swal.fire('Error', data?.message ?? 'Something went wrong. Please try again.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="deposit-wrapper">
        {/* ── Balance Card ── */}
        <div className="balance-card">
          <div className="balance-header">
            <h4>Balance</h4>
            <span>0 EUR ▾</span>
          </div>
          <div className="payment-grid">
            {paymentMethods.map((m) => (
              <button
                key={m}
                type="button"
                className={`pay-item ${selectedPayment === m ? 'active' : ''}`}
                onClick={() => setSelectedPayment(m)}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* ── Withdraw Card ── */}
        <div className="deposit-card">
          <h2>{title}</h2>

          {/* Amount */}
          <div className="amount-head">
            <span>Amount</span>
            <small>Instant | Min: 20 - Max: 4,000</small>
          </div>

          <div className="amount-select">
            {amountPreset.map((n) => (
              <button
                key={n}
                type="button"
                className={`${selectedAmount === n ? 'active' : ''} d-none d-md-block`}
                onClick={() => {
                  setSelectedAmount(n);
                  setErrors((e) => ({ ...e, amount: undefined }));
                }}
              >
                {n}
              </button>
            ))}
          </div>

          <div className="amount-input mb-2">
            <input
              type="text"
              value={String(selectedAmount)}
              onChange={(e) => {
                const v = Number(e.target.value.replace(/[^\d.]/g, ''));
                if (!Number.isNaN(v)) {
                  setSelectedAmount(v);
                  setErrors((err) => ({ ...err, amount: undefined }));
                }
              }}
            />
            <span>USDT</span>
          </div>
          {errors.amount && <small className="text-danger d-block">{errors.amount}</small>}

          {/* Coin */}
          <div className="form-group-custom mt-3">
            <label>Select Coin: <small className="text-danger fs-4">*</small></label>
            <select
              className="select-custom form-control-custom rounded-4"
              value={formData.coin}
              onChange={(e) => handleChange('coin', e.target.value)}
            >
              <option value="">Select Coin</option>
              <option value="USDT">USDT</option>
            </select>
            {errors.coin && <small className="text-danger d-block">{errors.coin}</small>}
          </div>

          {/* Network */}
          <div className="form-group-custom mt-3">
            <label>Select Network: <small className="text-danger fs-4">*</small></label>
            <select
              className="select-custom form-control-custom rounded-4"
              value={formData.network}
              onChange={(e) => handleChange('network', e.target.value)}
            >
              <option value="">Select Network</option>
              <option value="TRX Tron (TRC20)">TRX Tron (TRC20)</option>
            </select>
            {errors.network && <small className="text-danger d-block">{errors.network}</small>}
          </div>

          {/* Deposit Address */}
          <div className="field-group mt-3">
            <label>Deposit Address: <small className="text-danger fs-4">*</small></label>
            <div className="amount-input mb-1">
              <input
                type="text"
                value={formData.depositAddress}
                placeholder="Enter wallet address"
                onChange={(e) => handleChange('depositAddress', e.target.value)}
              />
            </div>
            {errors.depositAddress && (
              <small className="text-danger d-block">{errors.depositAddress}</small>
            )}
          </div>

          {/* Binance ID */}
          <div className="field-group mt-3 mb-4">
            <label>
              Binance ID: <small className="text-danger fs-4">*</small>
            </label>
            <div className="amount-input mb-1">
              <input
                type="text"
                value={formData.binanceId}
                placeholder="Enter Binance ID"
                onChange={(e) => handleChange('binanceId', e.target.value)}
              />
            </div>
            {errors.binanceId && (
              <small className="text-danger d-block">{errors.binanceId}</small>
            )}
          </div>

          <button
            type="button"
            className="deposit-btn"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Processing…' : `${actionLabel} ${selectedAmount} USD`}
          </button>
        </div>
      </div>

      {/* {submitDeposit && (
        <WithdrawSubmitProcessingModel
          onClose={() => setSubmitDeposit(false)}
          setActiveTab={setActiveTabValue}
        />
      )} */}
    </>
  );
}