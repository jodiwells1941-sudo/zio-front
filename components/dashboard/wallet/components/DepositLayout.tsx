import React, { useEffect, useState } from 'react';
import DepositModal from './DepositModel';
import DepositSubmitProcessingModel from "./DepositSubmitProcessingModel";
import { TabKey } from '../types';
import Swal from 'sweetalert2';
import { SubmitInitialDepositApi, VerifyDepositApi } from '@/app/api/wallet';
import { toast } from 'react-toastify';

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
  const [depositAmount, setDepositAmount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [depositInfo, setDepositInfo] = useState({
        amount: "",
        coin: "",
        token: "",
        address: "",
        qr_code: ""
    });

  const createDiposit = async () => {
    const amount = Number(depositAmount);

    if (isNaN(amount)) {
        toast.error("Please enter a valid amount.");
        return;
    }

    if (amount <= 0) {
        toast.error("Amount must be greater than 0.");
        return;
    }

    // Optional: minimum amount
    // if (amount < 100) {
    //     toast.error("Minimum deposit amount is 100.");
    //     return;
    // }

    setIsLoading(true);

    try {
        const response = await SubmitInitialDepositApi({
            amount,
        });

        if (!response.error) {
            setDepositInfo(response.data);
            setDepositModalOpen(true);
        } else {
            Swal.fire(
                "Failed",
                response.message || "Transaction failed. Please try again.",
                "error"
            );
        }
    } catch (error) {
        Swal.fire(
            "Error",
            "A network error occurred during submission.",
            "error"
        );
    } finally {
        setIsLoading(false);
    }
  };

  const handleDiposit = async () => {

    if (isNaN(depositAmount)) {
        toast.error("Please enter a valid amount.");
        return;
    }

    if (depositAmount <= 0) {
        toast.error("Amount must be greater than 0.");
        return;
    }

    const result = await Swal.fire({
      title: "Deposit Confirmation",
      icon: "info",
      html: ` Are you sure you want to deposit <strong>${depositAmount} USD</strong>?`,
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

  useEffect(() => {
    if (!depositInfo.token) return;

    const interval = setInterval(async () => {
      try {
        const res = await VerifyDepositApi({ token: depositInfo.token });

        if (res?.data?.verified) {
          clearInterval(interval);

          Swal.fire({
            icon: "success",
            title: "Deposit Successful",
          });

          setDepositModalOpen(false);
        }
      } catch (err) {
        console.error('Verify poll failed', err);
        // transient network error — just let the next tick try again
      }
    }, 8000);

    return () => clearInterval(interval);
  }, [depositInfo.token]);

  
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
            <span>Amount <small className="text-danger fs-4">*</small></span>
            <small>Instant | Min: 20 - Max: 4,000</small>
          </div>

          {/* <div className="amount-select">
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
          </div> */}

          <div className="amount-input mb-2">
            <input
              type="text"
              // value={String(selectedAmount)}
              required
              onChange={(e) => {
                const v = Number(e.target.value.replace(/[^\d.]/g, ''));
                if (!Number.isNaN(v)) setDepositAmount(v);
              }}
            />
            <span>EUR</span>
          </div>

          {/* Coin */}
          <div className="form-group-custom mt-3">
            <label>Select Coin: <small className="text-danger fs-4">*</small></label>
            <select
              className="select-custom form-control-custom rounded-4"
              required
              // value={formData.coin}
              // onChange={(e) => handleChange('coin', e.target.value)}
              >
              {/* <option value="">Select Coin</option> */}
              <option value="USDT">USDT</option>
            </select>
            {/* {errors.coin && <small className="text-danger d-block">{errors.coin}</small>} */}
          </div>

          <div className="form-group-custom mt-3">
            <label>
            Select Network:
             <small className="text-danger fs-4">*</small>
            </label>
            <select required
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
            {actionLabel} USD
          </button>
        </div>
      </div>

      {depositModalOpen && (
        <DepositModal
          depositInfo={depositInfo}
          setDepositInfo={setDepositInfo}
          onClose={() => setDepositModalOpen(false)}
        />
      )}

      {submitDeposit && (
        <DepositSubmitProcessingModel onClose={()=>setSubmitDeposit(false)} setActiveTab={setActiveTabValue}/>
      )}   
    </>
  );
}