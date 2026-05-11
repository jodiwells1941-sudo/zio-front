"use client";

import React from "react";
import { TabKey } from "../types";

type Props = {
  onClose: () => void;
  setActiveTab: (v: TabKey) => void;
};

export default function DepositSubmitProcessingModel({ onClose, setActiveTab }: Props) {
  return (
    <div className="dpm-overlay-wrapper" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div className="dpm-backdrop-blur" onClick={onClose} />

      <div className="dpm-modal-container bg-dark border-dark-light">
        <div className="dpm-modal-header border-bottom border-dark-light d-flex justify-content-between p-3">
          <div></div>
          <button type="button" className="dpm-close-trigger" onClick={onClose}>
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

            <h5 className="dpm-heading-status fw-bold text-white mb-2">Validating Deposit</h5>
            <p className="dpm-text-muted mb-4 px-lg-4">
              Your <span className="text-warning">USDT (TRC-20)</span> transfer is being confirmed on the network.
            </p>

            {/* Unique Progress Timeline */}
            <div className="dpm-timeline-card bg-blue p-4 rounded-4 shadow-lg text-start">
              <div className="dpm-step-item dpm-step--completed mb-4">
                <div className="dpm-step-indicator">
                  <i className="fa-solid fa-check"></i>
                </div>
                <div className="dpm-step-info">
                  <span className="dpm-step-label d-block text-white fw-bold">Request Received</span>
                  <small className="text-success">System logged your deposit</small>
                </div>
              </div>

              <div className="dpm-step-item dpm-step--active mb-4">
                <div className="dpm-step-indicator">
                  <div className="dpm-pulse-dot"></div>
                </div>
                <div className="dpm-step-info">
                  <span className="dpm-step-label d-block text-white fw-bold">Blockchain Confirmation</span>
                  <small className="text-warning">Waiting for 3 network nodes...</small>
                </div>
              </div>

              <div className="dpm-step-item dpm-step--pending">
                <div className="dpm-step-indicator"></div>
                <div className="dpm-step-info">
                  <span className="dpm-step-label d-block text-secondary fw-bold">Balance Update</span>
                  <small className="text-secondary">Finalizing funds</small>
                </div>
              </div>
            </div>

            <button onClick={() => {onClose(); setActiveTab('tab6')}}
              type="button" 
              className="dpm-btn-exit mt-5 w-100 py-3 rounded-pill fw-bold d-flex justify-content-center"
            >
              Transection Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}