"use client";

import React, { useState } from "react";
import { toast } from "react-toastify";
import { depositSupportApi } from "@/app/api/wallet";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg"];

type DepositSupportModalProps = {
  depositId: string;      // e.g. "DP7854321"
  defaultAmount?: string; // pre-fill from depositInfo.amount
  coinLabel?: string;     // e.g. "USDT"
  onClose: () => void;
  onSuccess?: () => void;
};

export default function DepositSupportModal({
  depositId,
  defaultAmount = "",
  coinLabel = "USDT",
  onClose,
  onSuccess,
}: DepositSupportModalProps) {
  const [txId, setTxId] = useState("");
  const [paidAmount, setPaidAmount] = useState(defaultAmount);
  const [note, setNote] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleFileSelect = (f: File | null) => {
    if (!f) return;
    if (!ALLOWED_TYPES.includes(f.type)) {
      toast.error("Only PNG, JPG or JPEG files are allowed.");
      return;
    }
    if (f.size > MAX_FILE_SIZE) {
      toast.error("File size must be under 5MB.");
      return;
    }
    setFile(f);
    setFilePreview(URL.createObjectURL(f));
  };

  const removeFile = () => {
    setFile(null);
    setFilePreview(null);
  };

  const validate = () => {
    if (!depositId) {
      toast.error("Missing deposit request ID.");
      return false;
    }
    if (!txId.trim()) {
      toast.error("Please enter the Transaction ID (TXID).");
      return false;
    }
    const amountNum = Number(paidAmount);
    if (!paidAmount || isNaN(amountNum) || amountNum <= 0) {
      toast.error("Please enter a valid paid amount.");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setSubmitting(true);
    try {
      const res = await depositSupportApi({
        deposit_id: depositId,
        tx_id: txId.trim(),
        paid_amount: paidAmount,
        note: note.trim() || undefined,
        file: file ?? undefined,
      });

      if (!res.error) {
        toast.success(res.message || "Submitted for review.");
        onSuccess?.();
        onClose();
      } else {
        toast.error(res.message || "Submission failed. Please try again.");
      }
    } catch (err) {
      toast.error("A network error occurred while submitting.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="ds-modal-overlay" onClick={onClose}>
      <div className="ds-modal" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="ds-modal-close" onClick={onClose} aria-label="Close">
          <i className="fa-solid fa-xmark" />
        </button>

        {/* Fixed header */}
        <div className="ds-modal-header">
          <span className="ds-modal-icon">
            <i className="fa-solid fa-bolt" />
          </span>
          <div>
            <h4>Submit Payment Details</h4>
            <small>Please provide accurate information for faster review</small>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="ds-modal-body">
          <div className="ds-field">
            <label>Deposit Request ID <span className="ds-req">*</span></label>
            <input type="text" value={depositId ? `#${depositId}` : ""} disabled />
            <small>Your deposit request ID (auto-filled)</small>
          </div>

          <div className="ds-field">
            <label>Transaction ID (TXID) <span className="ds-req">*</span></label>
            <input
              type="text"
              placeholder="Enter transaction ID / TXID"
              value={txId}
              disabled={submitting}
              onChange={(e) => setTxId(e.target.value)}
            />
            <small>You can find TXID in your wallet or exchange history</small>
          </div>

          <div className="ds-field">
            <label>Paid Amount <span className="ds-req">*</span></label>
            <div className="ds-amount-row">
              <input
                type="text"
                inputMode="decimal"
                placeholder="Amount"
                value={paidAmount}
                disabled={submitting}
                onChange={(e) => setPaidAmount(e.target.value.replace(/[^\d.]/g, ""))}
              />
              <span className="ds-coin-pill">
                <span className="ds-coin-badge">T</span> {coinLabel}
              </span>
            </div>
            <small>Enter the exact amount you have sent</small>
          </div>

          <div className="ds-field">
            <label>Payment Proof (Screenshot) <span className="ds-optional">(Optional)</span></label>

            {filePreview ? (
              <div className="ds-preview-wrap">
                <img src={filePreview} alt="Payment proof preview" className="ds-preview" />
                <button type="button" className="ds-preview-remove" onClick={removeFile} disabled={submitting}>
                  <i className="fa-solid fa-trash" /> Remove
                </button>
              </div>
            ) : (
              <label
                className={`ds-dropzone ${isDragActive ? "ds-dropzone--active" : ""}`}
                onDragOver={(e) => { e.preventDefault(); setIsDragActive(true); }}
                onDragLeave={() => setIsDragActive(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragActive(false);
                  handleFileSelect(e.dataTransfer.files?.[0] ?? null);
                }}
              >
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  hidden
                  disabled={submitting}
                  onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)}
                />
                <i className="fa-solid fa-cloud-arrow-up ds-upload-icon" />
                <span className="ds-dropzone-text">Click to upload or drag &amp; drop</span>
                <small>PNG, JPG or JPEG (Max. 5MB)</small>
              </label>
            )}
          </div>

          <div className="ds-field">
            <label>Additional Note <span className="ds-optional">(Optional)</span></label>
            <textarea
              placeholder="Write any additional information here..."
              value={note}
              disabled={submitting}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
            />
            <small>Add any note that may help us verify your payment</small>
          </div>
        </div>

        {/* Fixed footer */}
        <div className="ds-modal-footer">
          <div className="d-flex justify-content-center">
            <button type="button" className="ds-submit-btn w-50" disabled={submitting} onClick={handleSubmit}>
                {submitting ? "Submitting..." : "Submit for Review"} <i className="fa-solid fa-paper-plane" />
            </button>
          </div>

          <div className="ds-important">
            <i className="fa-solid fa-circle-exclamation" />
            <div>
              <strong>Important</strong>
              <p>Please ensure all information is correct.<br />Wrong details may cause delay in review.</p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .ds-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(5, 7, 15, 0.72);
          backdrop-filter: blur(3px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          z-index: 9999;
        }
        .ds-modal {
          position: relative;
          width: 100%;
          max-width: 600px;
          height: 92vh;
          max-height: 640px;
          display: flex;
          flex-direction: column;
          background: #0d1120;
          border: 1px solid #1f2433;
          border-radius: 18px;
          color: #e9ecf3;
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.5);
          overflow: hidden;
        }
        .ds-modal-close {
          position: absolute;
          top: 16px;
          right: 16px;
          background: #161b29;
          border: 1px solid #262c40;
          color: #9aa4ba;
          width: 30px;
          height: 30px;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2;
        }
        .ds-modal-close:hover { background: #1c2133; color: #fff; }

        /* Fixed header */
        .ds-modal-header {
          flex: 0 0 auto;
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 24px 22px 18px;
          padding-right: 46px;
          border-bottom: 1px solid #1a1f30;
        }
        .ds-modal-icon {
          width: 34px;
          height: 34px;
          flex-shrink: 0;
          border-radius: 10px;
          background: linear-gradient(135deg, #facc15, #eab308);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #14100a;
          font-size: 15px;
        }
        .ds-modal-header h4 { margin: 0; font-size: 15px; font-weight: 700; color: #fff; }
        .ds-modal-header small { color: #7c8499; font-size: 12px; }

        /* Scrollable body */
        .ds-modal-body {
          flex: 1 1 auto;
          overflow-y: auto;
          padding: 20px 22px 4px;

          /* Firefox: thin dark scrollbar */
          scrollbar-width: thin;
          scrollbar-color: #3a3f52 #0d1120;
        }
        /* Webkit: thin dark scrollbar */
        .ds-modal-body::-webkit-scrollbar {
          width: 6px;
        }
        .ds-modal-body::-webkit-scrollbar-track {
          background: transparent;
        }
        .ds-modal-body::-webkit-scrollbar-thumb {
          background-color: #3a3f52;
          border-radius: 10px;
        }
        .ds-modal-body::-webkit-scrollbar-thumb:hover {
          background-color: #4a5068;
        }

        .ds-field { margin-bottom: 16px; }
        .ds-field label {
          display: block;
          font-size: 12.5px;
          font-weight: 600;
          color: #c8cee0;
          margin-bottom: 8px;
        }
        .ds-req { color: #ef4060; }
        .ds-optional { color: #7c8499; font-weight: 500; }

        .ds-field input[type="text"],
        .ds-field textarea {
          width: 100%;
          background: #12172a;
          border: 1px solid #262c40;
          border-radius: 10px;
          padding: 12px 14px;
          color: #f2f4f8;
          font-size: 13.5px;
          outline: none;
          box-sizing: border-box;
        }
        .ds-field input[disabled],
        .ds-field textarea[disabled] { color: #9aa4ba; opacity: 0.7; cursor: not-allowed; }
        .ds-field input:focus,
        .ds-field textarea:focus {
          border-color: #eab308;
          box-shadow: 0 0 0 1px rgba(234, 179, 8, 0.35);
        }
        .ds-field textarea { resize: vertical; font-family: inherit; }
        .ds-field small { display: block; margin-top: 6px; color: #7c8499; font-size: 11.5px; }

        .ds-amount-row { display: flex; align-items: center; gap: 8px; }
        .ds-amount-row input { flex: 1; }
        .ds-coin-pill {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #12172a;
          border: 1px solid #262c40;
          border-radius: 10px;
          padding: 10px 12px;
          font-weight: 600;
          font-size: 13px;
          white-space: nowrap;
        }
        .ds-coin-badge {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #eab308;
          color: #14100a;
          font-size: 11px;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .ds-dropzone {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 6px;
          border: 1.5px dashed #2b3247;
          border-radius: 12px;
          padding: 26px 16px;
          cursor: pointer;
          text-align: center;
          transition: border-color 0.15s ease, background 0.15s ease;
        }
        .ds-dropzone:hover,
        .ds-dropzone--active { border-color: #eab308; background: rgba(234, 179, 8, 0.06); }
        .ds-upload-icon { font-size: 22px; color: #7c8499; margin-bottom: 4px; }
        .ds-dropzone-text { font-size: 13px; color: #c8cee0; font-weight: 500; }
        .ds-dropzone small { color: #7c8499; font-size: 11px; }

        .ds-preview-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          border: 1px solid #262c40;
          border-radius: 12px;
          padding: 14px;
        }
        .ds-preview { max-width: 100%; max-height: 140px; border-radius: 8px; object-fit: contain; }
        .ds-preview-remove {
          background: #1c2133;
          border: 1px solid #3a2530;
          color: #ef4060;
          font-size: 12px;
          font-weight: 600;
          padding: 6px 12px;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .ds-preview-remove:hover { background: #2a1a20; }
        .ds-preview-remove:disabled { opacity: 0.5; cursor: not-allowed; }

        /* Fixed footer */
        .ds-modal-footer {
          flex: 0 0 auto;
          padding: 16px 22px 22px;
          border-top: 1px solid #1a1f30;
          background: #0d1120;
        }

        .ds-submit-btn {
          width: 100%;
          border: none;
          border-radius: 50px;
          padding: 14px;
          font-weight: 700;
          font-size: 14.5px;
          color: #14100a;
          background: linear-gradient(90deg, #9cecfe, #9cecfe);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          margin-top: 0;
        }
        .ds-submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .ds-important {
          display: flex;
          gap: 10px;
          align-items: flex-start;
          margin-top: 14px;
          background: #1d1908;
          border: 1px solid #4a3d12;
          border-radius: 12px;
          padding: 14px 16px;
        }
        .ds-important i { color: #f0b332; margin-top: 2px; }
        .ds-important strong { display: block; color: #f0b332; font-size: 13px; margin-bottom: 4px; }
        .ds-important p { margin: 0; color: #9aa4ba; font-size: 12px; line-height: 1.5; }
      `}</style>
    </div>
  );
}