"use client";

import React from "react";
// Assuming TabKey is an enum or type that includes 'tab6' for Transaction History
import { TabKey } from "../types"; 

type Props = {
  onClose: () => void;
  setActiveTab: (v: TabKey) => void;
};

export default function WithdrawSubmitProcessingModel({ onClose, setActiveTab }: Props) {
  return (
    <div className="dpm-overlay-wrapper" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div className="dpm-backdrop-blur" onClick={onClose} />

      <div className="dpm-modal-container bg-dark border-dark-light">
        <div className="dpm-modal-header border-bottom border-dark-light d-flex justify-content-between p-3 align-items-center">
          <h6 className="m-0 text-white-50 small fw-bold">Withdrawal Status</h6>
          <button type="button" className="dpm-close-trigger" onClick={onClose} style={{background: 'none', border: 'none', color: '#fff'}}>
            ✕
          </button>
        </div>

        <div className="dpm-modal-content p-4 p-md-5">
          <div className="dpm-status-body text-center">
            
            {/* Unique Loader Container */}
            <div className="dpm-loader-visual mb-4">
              <div className="dpm-spinner-ring"></div>
              <div className="dpm-spinner-inner-dot"></div>
            </div>

            <h5 className="dpm-heading-status fw-6 text-white mb-2">Processing Withdrawal</h5>
            <p className="dpm-text-muted mb-4 px-lg-4 text-secondary">
              Your request to withdraw <span className="text-warning">USDT TRX-Tron (TRC-20)</span> has been submitted and is being secured.
            </p>

            {/* Withdrawal-Specific Progress Timeline */}
            <div className="dpm-timeline-card bg-navy-blue p-4 rounded-4 shadow-lg text-start">
              
              {/* Step 1: Request */}
              <div className="dpm-step-item dpm-step--completed mb-3">
                <div className="dpm-step-indicator">
                  <i className="fa-solid fa-check text-white"></i>
                </div>
                <div className="dpm-step-info">
                  <span className="dpm-step-label d-block text-white fw-bold">Withdrawal Requested</span>
                  <small className="text-success">Request successfully placed</small>
                </div>
              </div>

              {/* Step 2: Internal Review (Active) */}
              <div className="dpm-step-item dpm-step--active mb-4">
                <div className="dpm-step-indicator">
                  <div className="dpm-pulse-dot"></div>
                </div>
                <div className="dpm-step-info">
                  <span className="dpm-step-label d-block text-white fw-bold">Security Review</span>
                  <small className="text-warning">Checking transaction integrity...</small>
                </div>
              </div>

              {/* Step 3: Payout */}
              <div className="dpm-step-item dpm-step--pending">
                <div className="dpm-step-indicator"></div>
                <div className="dpm-step-info">
                  <span className="dpm-step-label d-block text-secondary fw-bold">Network Payout</span>
                  <small className="text-secondary">Funds sending to your wallet</small>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 rounded bg-dark border border-secondary border-opacity-25 mb-2">
               <small className="text-info">
                <i className="fa-solid fa-circle-info me-2"></i>
                Withdrawals are typically processed within 5-30 minutes depending on network traffic.
               </small>
            </div>

            <button onClick={() => {onClose(); setActiveTab('tab6')}}
              type="button" 
              className="dpm-btn-exit mt-4 w-100 py-3 rounded-pill fw-6 d-flex justify-content-center align-items-center gap-2"
            >
             Transaction Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}