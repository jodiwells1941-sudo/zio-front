import React, { useState } from 'react';
import DepositModal from './DepositModel';
import DepositSubmitProcessingModel from "./DepositSubmitProcessingModel";
import { TabKey } from '../types';
import Swal from 'sweetalert2';
import { SubmitInitialDepositApi } from '@/app/api/wallet';

export default function DepositLayout({
  title,
  actionLabel,
  paymentMethods,
  amountPreset,
  selectedPayment,
  setSelectedPayment,
  selectedAmount,
  setSelectedAmount,
  setActiveTabValue
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

  const [depositModalOpen, setDepositModalOpen] = useState<boolean>(false);
  const [submitDeposit, setSubmitDeposit] = useState<boolean>(false); 
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [depositInfo, setDepositInfo] = useState({
        amount: "",
        coin: "",
        token: "",
        address: "",
        qr_code: ""
    });

  const createDiposit = async () => {
    setIsLoading(true);

    const data = {
        amount: Number(selectedAmount),
    };

    try {
        const response = await SubmitInitialDepositApi(data);

        if (!response.error) {
            setDepositInfo(response.data);
            setDepositModalOpen(true);
        } else {
            Swal.fire(
                'Failed',
                response.message || 'Transaction failed. Please try again.',
                'error'
            );
        }
    } catch (error) {
        Swal.fire('Error', 'A network error occurred during submission.', 'error');
    } finally {
        setIsLoading(false);
    }
  };

  const handleDiposit = async () => {
    const result = await Swal.fire({
      title: "Deposit Confirmation",
      icon: "info",
      html: ` Are you sure you want to deposit <strong>${selectedAmount} USD</strong>?`,
      showCloseButton: true,
      showCancelButton: true,
      focusConfirm: false,
      confirmButtonAriaLabel: "Thumbs up, great!",
      cancelButtonText: `No, Cancel!`,
      confirmButtonText: `Yes, Deposit!`,
      cancelButtonAriaLabel: "Thumbs down"
    });

    if (result.isConfirmed) {
      await createDiposit();
    }
  };
  
  return (
    <>
      <div className="deposit-wrapper">
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

        <div className="deposit-card">
          <h2>{title}</h2>

          <div className="amount-head">
            <span>Amount</span>
            <small>Instant | Min: 20 - Max: 4,000</small>
          </div>

          <div className="amount-select">
            {amountPreset.map((n) => (
              <button
                key={n}
                type="button"
                className={`${selectedAmount === n  ? 'active' : ''} d-none d-md-block` }
                onClick={() => setSelectedAmount(n)}
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
                if (!Number.isNaN(v)) setSelectedAmount(v);
              }}
            />
            <span>EUR</span>
          </div>

          <div className="form-group-custom mt-3">
            <label>
            Select Network:
            </label>
            <select
              className="select-custom form-control-custom rounded-4"
              // value={formData.withFlat}
              // onChange={(e) => handleFlatChange(e.target.value)}
            >
              <option>TRX Tron (TRC20)</option>
            </select>
          </div>

          {/* <button type="button" className="deposit-btn" onClick={()=>setDepositModalOpen(true)} disabled={selectedAmount <= 0}>
            {actionLabel} {selectedAmount} USD
          </button> */}
          <button type="button" className="deposit-btn" onClick={()=>handleDiposit()} disabled={selectedAmount <= 0}>
            {actionLabel} {selectedAmount} USD
          </button>
        </div>
      </div>

      {depositModalOpen && (
        <DepositModal
          depositInfo={depositInfo}
          setDepositInfo={setDepositInfo}
          onClose={() => setDepositModalOpen(false)}
          // onSubmitDeposit={() => {
          //   setDepositModalOpen(false);
          //   setSubmitDeposit(true);
          // }}
        />
      )}

      {submitDeposit && (
        <DepositSubmitProcessingModel onClose={()=>setSubmitDeposit(false)} setActiveTab={setActiveTabValue}/>
      )}   
    </>
  );
}