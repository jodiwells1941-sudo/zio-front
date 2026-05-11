"use client";

import { VerifyDepositApi } from "@/app/api/wallet";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

type Props = {
  onClose: () => void;
  // onSubmitDeposit: () => void;
  depositInfo: {
    amount: string;
    coin: string;
    token: string;
    address: string;
    qr_code: string;
  };
  setDepositInfo: React.Dispatch<React.SetStateAction<{
    amount: string;
    coin: string;
    token: string;
    address: string;
    qr_code: string;
  }>>;

};

type PaymentMethod = {
  id: number;
  name: string;
  type: string;
  icon: string;
  className: string;
};

export default function DepositModal({depositInfo, setDepositInfo, onClose }: Props) {

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const paymentMethods: PaymentMethod[] = [
    { id: 5, name: "Binance", type: "online", icon: "fab fa-binance", className: "paypal" },
  ];

  const onSubmitDeposit = async () => {
    // if (!selectedPayment) {
    //   alert("Please select a payment method.");
    //   return;
    // }

    if (isLoading) return;
    setIsLoading(true);
    try {
        const response = await VerifyDepositApi({ token: depositInfo.token });
        if (!response.error && response.data?.verified) {
            toast.success("Deposit verified successfully!");
            setDepositInfo({
                amount: "",
                coin: "",
                token: "",
                address: "",
                qr_code: "",
            });
            onClose();
            // fetchUserData();
        } else {
            toast.info("Deposit is pending verification.");
        }
    } catch {
        toast.error("Failed to verify deposit. Please try again.");
    } finally {
        setIsLoading(false);
    }
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(depositInfo.address)
      .then(() => {
        toast.success("Address copied to clipboard!");
      })
      .catch(() => {
        toast.error("Failed to copy address.");
      });
  }

  return (
    <>
      <div className="rt-modal-overlay overflow-auto my-5 mb-md-0 " role="dialog" aria-modal="true">
        <button className="rt-modal-backdrop" type="button" onClick={onClose} aria-label="Close" />

        <div className="rt-modal bg-dark overflow-auto mt-200 mt-md-0">
          <div className="rt-modal-head">
            <h6 className="rt-modal-title">Deposit Model</h6>
            <button type="button" className="rt-modal-x" onClick={onClose} aria-label="Close">
              ✕
            </button>
          </div>

          <div className="rt-modal-body">
            <div className="bodyWrap">
              
              {/* LEFT PANEL */}
              <div className="left">
                  <p className="fw-5">Payment Method:</p>

                  <div className="payment-button-grid mb-4 mt-1">
                      {paymentMethods.map((method) => {
                          const isSelected = selectedPayment?.id === method.id;
                          return (
                              <button
                                  key={method.id}
                                  type="button"
                                  className={`pay-item-card bg-dark pay-${method.className} ${isSelected ? "active" : ""}`}
                                  // onClick={() => setSelectedPayment(method)}
                                  aria-pressed={isSelected}
                              >
                                  <svg width="55" height="55" viewBox="0 0 24 24" fill="#F3BA2F">
                                      <path d="M12 2L14.59 4.59L12 7.17L9.41 4.59L12 2ZM4.59 9.41L7.17 12L4.59 14.59L2 12L4.59 9.41ZM16.83 12L19.41 9.41L22 12L19.41 14.59L16.83 12ZM12 16.83L14.59 19.41L12 22L9.41 19.41L12 16.83ZM9.41 12L12 9.41L14.59 12L12 14.59L9.41 12Z"/>
                                  </svg>
                                  <span className="fw-7 text-xl">{method.name}</span>
                              </button>
                          );
                      })}
                  </div>

                  <p>Deposit Policy:</p>
                  <div className="p-3 rounded bg-dark mt-1">
                      <small className="text-danger">We only accept USDT (TRC-20) on the TRON network. The correct amount must be sent to the correct TRC-20 address. Payments sent incorrectly or to the wrong address will not be refunded. Always use a wallet address you own or control to avoid issues.</small>
                  </div>

                  <div className="p-3 rounded bg-dark mt-3">
                      <small className="text-warning">To deposit funds, make a transfer to the blockchain address below. Copy the address or scan the QR code with the camera on your phone.</small>
                  </div>
                  <button type="button" onClick={onClose} className="d-none d-md-block mt-3 btn--secondary rounded py-2 d-flex align-items-center justify-content-center w-100" data-bs-dismiss="modal">
                  Go to My Accounts
                  </button> 
              </div>

              {/* RIGHT PANEL */}
              <div className="right">

                  <p className="text-center text-lg">Send USDT Ammount:</p>
                  <span className="text-warning fw-7 text-xxl text-center">$ {depositInfo.amount}</span>
                  <div className="d-flex align-items-center justify-content-center">
                      <Image src={depositInfo.qr_code} className="rounded" width={200} height={200} alt={'QR'} />
                  </div>

                  <div className="pt-2">
                      <p className="fw-5">Your unique account address:</p>
                      <div className="p-3 rounded w-100 bg-navy-blue overflow-hidden">
                          <span className="overflow-hidden">{depositInfo.address}</span>
                      </div>
                  </div>

                  <button type="button" onClick={copyAddress} className="btn--primary py-2 px-3 w-100 rounded text-sm d-flex align-items-center justify-content-center">
                      <i className="fa-solid fa-copy"></i>  Copy Address
                  </button>

                  <div className="py-3 rounded bg-navy-blue mt-2 mb-4 text-center">
                      <h6 className="text-lg fw-6 text-warning">Network</h6>
                      <p>{depositInfo.coin} Tron (TRC20)</p>
                  </div>
                
                <div className="footerBtns mt-20">
                  <button type="button" onClick={onClose} className="btn--secondary py-2 d-flex align-items-center justify-content-center " data-bs-dismiss="modal">
                    Cancel
                  </button>
                  <button type="button" onClick={onSubmitDeposit} className="btn--primary py-2 text-sm d-flex align-items-center justify-content-center w-100">
                    Submit
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>            
    </>
  );
}