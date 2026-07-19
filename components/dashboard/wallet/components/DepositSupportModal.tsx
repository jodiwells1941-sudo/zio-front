"use client";

import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { depositSupportApi } from "@/app/api/wallet";

type Props = {
  mode: "submit" | "support";        // submit = "I've Already Paid"; support = "Contact Support"
  depositId: string;
  coinLabel?: string;
  depositAmount?: string;            // pre-fill from parent
  onClose: () => void;
  onSuccess: () => void;
  paymentProofSubmit: () => void;
};

export default function DepositSupportModal({ mode, depositId, coinLabel = "USDT", depositAmount = "", onClose, onSuccess, paymentProofSubmit }: Props) {
  const [txId, setTxId]           = useState<string>("");
  const [paidAmount, setPaidAmount] = useState<string>(depositAmount);
  const [note, setNote]           = useState<string>("");
  const [file, setFile]           = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const handleFile = (f: File) => {
    if (!["image/png", "image/jpeg", "image/jpg"].includes(f.type)) { toast.error("Only PNG, JPG or JPEG allowed."); return; }
    if (f.size > 5 * 1024 * 1024) { toast.error("File must be under 5 MB."); return; }
    setFile(f);
    setFilePreview(URL.createObjectURL(f));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleSubmit = async () => {
    if (mode === "submit") {
      if (!txId.trim())      { toast.error("Please enter a Transaction ID."); return; }
      if (!paidAmount.trim()){ toast.error("Please enter the paid amount."); return; }
    }
    setIsLoading(true);
    try {
      await depositSupportApi({ deposit_id: depositId, tx_id: txId, paid_amount: paidAmount, note, file: file ?? undefined });
      toast.success(mode === "submit" ? "Payment details submitted!" : "Support request sent!");
      onSuccess();
      onClose();
      paymentProofSubmit();
    } catch { toast.error("Submission failed. Please try again."); }
    finally { setIsLoading(false); }
  };

  const isSubmitMode = mode === "submit";

  return (
    <div className="dsm-overlay z_index">
      <button className="dsm-backdrop" type="button" onClick={onClose} aria-label="Close" />

      <div className="dsm-sheet">
        {/* Header */}
        <div className="dsm-header">
          <div className="dsm-header-left">
            <div className="dsm-header-icon bg-warning">
              <i className={isSubmitMode ? "fa-solid fa-receipt" : "fa-solid fa-headset"} />
            </div>
            <div>
              <h5 className="dsm-title">{isSubmitMode ? <><span style={{color:"#fff"}}>ADMIN</span> <span style={{color:"#9cecfe"}}>REVIEW</span></> : "NEED HELP?"}</h5>
              <p className="dsm-subtitle">{isSubmitMode ? "We're here to help! Submit your payment details and our team will review it shortly." : "Facing any issue? Our support team is ready to help you."}</p>
            </div>
          </div>
          <button type="button" className="dsm-close" onClick={onClose} aria-label="Close">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        {/* Mini stepper */}
        {isSubmitMode && (
          <div className="dsm-stepper">
            {[
              { n: 1, label: "Submit Details", sub: "Fill payment information" },
              { n: 2, label: "Admin Review",   sub: "Our team will check" },
              { n: 3, label: "Get Update",     sub: "We will notify you" },
            ].map((s, i, arr) => (
              <React.Fragment key={s.n}>
                <div className={`dsm-step ${s.n === 1 ? "dsm-step--active" : ""}`}>
                  <div className="dsm-step-dot">{s.n}</div>
                  <div>
                    <div className="dsm-step-label">{s.label}</div>
                    <div className="dsm-step-sub">{s.sub}</div>
                  </div>
                </div>
                {i < arr.length - 1 && <i className="fa-solid fa-arrow-right dsm-step-arrow" />}
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Body: two columns */}
        <div className="dsm-body">
          {/* LEFT: form */}
          <div className="dsm-form-col">
            <div className="dsm-form-head">
              <i className="fa-solid fa-sparkles" style={{color:"#9cecfe"}} />
              <span>SUBMIT PAYMENT DETAILS</span>
            </div>
            <p className="dsm-form-sub">Please provide accurate information for faster review</p>

            {/* Deposit ID (auto-filled) */}
            <div className="dsm-field">
              <label>Deposit Request ID</label>
              <div className="dsm-input dsm-input--readonly">
                <input type="text" value={`#${depositId || "DP0000000"}`} readOnly />
              </div>
              <small>Your deposit request ID (auto-filled)</small>
            </div>

            {/* TXID */}
            {isSubmitMode && (
              <div className="dsm-field">
                <label>Transaction ID (TXID)</label>
                <div className="dsm-input">
                  <input type="text" placeholder="Enter transaction ID / TXID" value={txId} onChange={(e) => setTxId(e.target.value)} />
                </div>
                <small>You can find TXID in your wallet or exchange history</small>
              </div>
            )}

            {/* Paid amount */}
            {isSubmitMode && (
              <div className="dsm-field">
                <label>Paid Amount</label>
                <div className="dsm-amount-row">
                  <div className="dsm-input dsm-input--flex">
                    <input type="text" inputMode="decimal" placeholder="0.000000" value={paidAmount}
                      onChange={(e) => setPaidAmount(e.target.value.replace(/[^\d.]/g, ""))} />
                  </div>
                  <div className="dsm-coin-badge"><span className="dl-coin-badge dl-coin-badge--usdt" style={{width:22,height:22}}>T</span> {coinLabel}</div>
                </div>
                <small>Enter the exact amount you have sent</small>
              </div>
            )}

            {/* File upload */}
            <div className="dsm-field">
              <label>Payment Proof (Screenshot) {!isSubmitMode && "(Optional)"}</label>
              <div
                className={`dsm-upload ${isDragging ? "dsm-upload--drag" : ""}`}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
                role="button" tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && fileRef.current?.click()}
              >
                <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/jpg" hidden
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
                {filePreview ? (
                  <div className="dsm-upload-preview">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={filePreview} alt="Preview" />
                    <button type="button" className="dsm-remove-file" onClick={(e) => { e.stopPropagation(); setFile(null); setFilePreview(null); }} aria-label="Remove file">
                      <i className="fa-solid fa-xmark" />
                    </button>
                  </div>
                ) : (
                  <>
                    <i className="fa-solid fa-cloud-arrow-up dsm-upload-icon" />
                    <p>Click to upload or drag &amp; drop</p>
                    <small>PNG, JPG or JPEG (Max. 5MB)</small>
                  </>
                )}
              </div>
            </div>

            {/* Note */}
            <div className="dsm-field">
              <label>Additional Note (Optional)</label>
              <textarea rows={3} placeholder="Write any additional information here..." value={note} onChange={(e) => setNote(e.target.value)} className="dsm-textarea" />
              <small>Add any note that may help us verify your payment</small>
            </div>

            {/* Submit — uses the shared btn--primary class, no custom color overrides */}
            <button type="button" className="dsm-submit-btn btn--primary" disabled={isLoading} onClick={handleSubmit}>
              {isLoading ? "Submitting..." : isSubmitMode ? "Submit for Review" : "Send Message"}
              <i className={isLoading ? "fa-solid fa-spinner fa-spin" : "fa-regular fa-paper-plane"} />
            </button>

            {/* Important */}
            <div className="dsm-important">
              <div className="dsm-important-head"><i className="fa-solid fa-circle-exclamation" /> Important</div>
              <p>Please ensure all information is correct. Wrong details may cause delay in review.</p>
            </div>
          </div>

          {/* RIGHT: summary + help */}
          <div className="dsm-info-col">
            {/* Deposit summary */}
            {depositId && (
              <div className="dsm-summary-card">
                <div className="dsm-summary-head">
                  <i className="fa-solid fa-file-invoice" style={{color:"#9cecfe"}} />
                  <span>DEPOSIT SUMMARY</span>
                </div>
                <div className="dsm-summary-rows">
                  <div className="dsm-summary-row">
                    <span>Expected Amount</span>
                    <span className="dsm-summary-val">{depositAmount || "—"} {coinLabel}</span>
                  </div>
                  <div className="dsm-summary-row">
                    <span>Network</span>
                    <span className="dsm-summary-val"><span style={{color:"#dd9b0e"}}>⟁</span> TRC20 (Tron)</span>
                  </div>
                  <div className="dsm-summary-row">
                    <span>Status</span>
                    <span className="dsm-status-badge">PENDING</span>
                  </div>
                </div>
              </div>
            )}

            {/* Need help */}
            <div className="dsm-help-card">
              <div className="dsm-summary-head"><i className="fa-solid fa-circle-question" style={{color:"#9cecfe"}} /> NEED HELP?</div>
              <p style={{fontSize:13,color:"#8d96ad",marginBottom:14}}>If you have any issue or need assistance, our support team is ready to help you.</p>
              <div className="dsm-help-action bg-warning">
                <i className="fa-solid fa-headset" style={{color:"#0d1120"}} />
                <span className="text-black">Contact Support</span>
              </div>
              <div className="dsm-help-row">
                <div className="dsm-help-icon"><i className="fa-regular fa-comment-dots" /></div>
                <div><div className="dsm-help-label">Live Chat</div><small>Available 24/7</small></div>
              </div>
              <div className="dsm-help-row">
                <div className="dsm-help-icon"><i className="fa-regular fa-envelope" /></div>
                <div><div className="dsm-help-label">Support Email</div><small>support@example.com</small></div>
              </div>
            </div>

            {/* How it works */}
            <div className="dsm-how-card">
              <div className="dsm-summary-head"><i className="fa-solid fa-lightbulb" style={{color:"#dd9b0e"}} /> HOW IT WORKS?</div>
              {[
                { n: 1, title: "Submit your payment details", body: "Fill the form with TXID, amount and screenshot (if any)." },
                { n: 2, title: "Our admin will review",       body: "We will check your payment on the blockchain." },
                { n: 3, title: "Get notified",                body: "You will receive an update once the review is complete." },
              ].map((s) => (
                <div key={s.n} className="dsm-how-row">
                  <div className="dsm-how-dot">{s.n}</div>
                  <div>
                    <div className="dsm-how-title">{s.title}</div>
                    <small>{s.body}</small>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .dsm-overlay {
          position: fixed; inset: 0; z-index: 1050;
          display: flex; align-items: flex-start; justify-content: center;
          overflow-y: auto; padding: 24px 16px;
        }
        .dsm-backdrop {
          position: fixed; inset: 0; background: rgba(5,8,20,.85); backdrop-filter: blur(4px); border: none; cursor: default;
        }
        .dsm-sheet {
          position: relative; z-index: 1; width: 100%; max-width: 900px;
          background: #0e1322; border: 1px solid #1f2433; border-radius: 18px; overflow: hidden;
          box-shadow: 0 24px 80px rgba(0,0,0,.6);
        }

        /* Header */
        .dsm-header {
          display: flex; align-items: flex-start; justify-content: space-between; gap: 16px;
          padding: 24px 28px; border-bottom: 1px solid #1f2433;
          background: linear-gradient(135deg,#0e1322 0%,#131a2e 100%);
        }
        .dsm-header-left { display: flex; align-items: flex-start; gap: 16px; }
        .dsm-header-icon {
          width: 48px; height: 48px; border-radius: 12px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center; font-size: 20px; color: #0d1120;
        }
        .dsm-title    { font-size: 20px; font-weight: 800; margin: 0 0 4px; color: #f2f4f8; }
        .dsm-subtitle { font-size: 13px; color: #8d96ad; margin: 0; }
        .dsm-close {
          width: 36px; height: 36px; border-radius: 8px; background: #1c2133; border: 1px solid #262c40;
          color: #9aa4ba; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0;
          transition: background .15s ease;
        }
        .dsm-close:hover { background: #262c40; color: #f2f4f8; }

        /* Stepper */
        .dsm-stepper {
          display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
          padding: 14px 28px; background: #0b1020; border-bottom: 1px solid #1f2433;
        }
        .dsm-step { display: flex; align-items: center; gap: 10px; }
        .dsm-step-dot {
          width: 28px; height: 28px; border-radius: 8px; flex-shrink: 0;
          background: #1c2133; color: #7c8499; font-size: 12px; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
        }
        .dsm-step--active .dsm-step-dot { background: linear-gradient(135deg,#dd9b0e,#9cecfe); color: #0d1120; }
        .dsm-step-label { font-size: 13px; font-weight: 600; color: #f2f4f8; }
        .dsm-step-sub   { font-size: 11px; color: #7c8499; }
        .dsm-step-arrow { color: #3a4255; font-size: 12px; }

        /* Body */
        .dsm-body { display: grid; grid-template-columns: 1.1fr 0.9fr; }
        @media (max-width: 720px) { .dsm-body { grid-template-columns: 1fr; } }

        /* Form col */
        .dsm-form-col { padding: 24px 28px; border-right: 1px solid #1f2433; display: flex; flex-direction: column; gap: 0; }
        @media (max-width: 720px) { .dsm-form-col { border-right: none; border-bottom: 1px solid #1f2433; } }
        .dsm-form-head { display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 700; letter-spacing: .1em; color: #e9ecf3; margin-bottom: 4px; }
        .dsm-form-sub  { font-size: 12px; color: #7c8499; margin-bottom: 20px; }

        .dsm-field { margin-bottom: 16px; }
        .dsm-field label { display: block; font-size: 13px; font-weight: 600; color: #c8cee0; margin-bottom: 6px; }
        .dsm-field small { display: block; margin-top: 5px; font-size: 11px; color: #5a6278; }

        .dsm-input {
          background: #161b29; border: 1px solid #262c40; border-radius: 10px;
          display: flex; align-items: center; padding: 0 14px;
          transition: border-color .15s ease;
        }
        .dsm-input:focus-within { border-color: #9cecfe; box-shadow: 0 0 0 1px rgba(156,236,254,.3); }
        .dsm-input--readonly { opacity: .7; }
        .dsm-input--flex { flex: 1; }
        .dsm-input input { flex: 1; background: transparent; border: none; outline: none; color: #f2f4f8; font-size: 14px; padding: 12px 0; width: 100%; }
        .dsm-input input::placeholder { color: #3a4255; }

        .dsm-amount-row { display: flex; align-items: center; gap: 10px; }
        .dsm-coin-badge {
          display: flex; align-items: center; gap: 6px; background: #161b29; border: 1px solid #262c40;
          border-radius: 10px; padding: 10px 14px; white-space: nowrap; font-weight: 600; font-size: 14px; color: #f2f4f8; flex-shrink: 0;
        }
        .dl-coin-badge { width: 22px; height: 22px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: #fff; flex-shrink: 0; }
        .dl-coin-badge--usdt { background: #1fae5c; }

        .dsm-upload {
          border: 2px dashed #262c40; border-radius: 10px; padding: 24px 16px;
          display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px;
          cursor: pointer; transition: border-color .15s ease; min-height: 110px; text-align: center;
          color: #7c8499; font-size: 13px;
        }
        .dsm-upload:hover, .dsm-upload--drag { border-color: #dd9b0e; background: rgba(221,155,14,.06); }
        .dsm-upload-icon { font-size: 26px; color: #5a6278; margin-bottom: 4px; }
        .dsm-upload p { margin: 0; font-size: 13px; color: #c8cee0; }
        .dsm-upload small { color: #5a6278; font-size: 11px; }
        .dsm-upload-preview { position: relative; display: inline-flex; }
        .dsm-upload-preview img { max-height: 80px; max-width: 100%; border-radius: 6px; object-fit: cover; }
        .dsm-remove-file {
          position: absolute; top: -8px; right: -8px; width: 20px; height: 20px; border-radius: 50%;
          background: #ef4060; border: none; color: #fff; font-size: 10px; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
        }

        .dsm-textarea {
          width: 100%; background: #161b29; border: 1px solid #262c40; border-radius: 10px;
          color: #f2f4f8; font-size: 13px; padding: 12px 14px; resize: vertical; outline: none;
          transition: border-color .15s ease; font-family: inherit;
        }
        .dsm-textarea:focus { border-color: #9cecfe; box-shadow: 0 0 0 1px rgba(156,236,254,.3); }
        .dsm-textarea::placeholder { color: #3a4255; }

        /* Layout only — colors/background come from the shared .btn--primary class */
        .dsm-submit-btn {
          width: 100%; border-radius: 50px; padding: 14px 18px;
          font-weight: 700; font-size: 15px;
          display: flex; align-items: center; justify-content: center; gap: 10px;
          margin-top: 4px;
        }
        .dsm-submit-btn:disabled { opacity: .5; cursor: not-allowed; }

        .dsm-important {
          margin-top: 14px; background: #1d1908; border: 1px solid #5a4a1c;
          border-radius: 10px; padding: 12px 14px;
        }
        .dsm-important-head { display: flex; align-items: center; gap: 6px; color: #dd9b0e; font-weight: 700; font-size: 13px; margin-bottom: 6px; }
        .dsm-important p    { color: #9aa4ba; font-size: 12px; margin: 0; line-height: 1.5; }

        /* Info col */
        .dsm-info-col { padding: 24px 24px; display: flex; flex-direction: column; gap: 16px; background: #0b1020; }

        .dsm-summary-card, .dsm-help-card, .dsm-how-card {
          background: #0e1322; border: 1px solid #1f2433; border-radius: 12px; padding: 16px 18px;
        }
        .dsm-summary-head { display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 700; letter-spacing: .1em; color: #e9ecf3; margin-bottom: 14px; }
        .dsm-summary-rows { display: flex; flex-direction: column; gap: 0; }
        .dsm-summary-row {
          display: flex; justify-content: space-between; align-items: center;
          padding: 8px 0; border-bottom: 1px solid #141c2e; font-size: 13px; color: #8d96ad;
        }
        .dsm-summary-row:last-child { border-bottom: none; }
        .dsm-summary-val { font-weight: 600; color: #f2f4f8; }
        .dsm-status-badge { background: #3a2c12; color: #dd9b0e; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 999px; }

        .dsm-help-action {
          display: flex; align-items: center; gap: 10px;
          border-radius: 10px; padding: 12px 16px; font-weight: 700; font-size: 14px; margin-bottom: 12px; cursor: pointer;
        }
        .dsm-help-row { display: flex; align-items: center; gap: 12px; padding: 8px 0; border-bottom: 1px solid #141c2e; }
        .dsm-help-row:last-child { border-bottom: none; }
        .dsm-help-icon { width: 32px; height: 32px; border-radius: 8px; background: #1c2133; display: flex; align-items: center; justify-content: center; color: #9cecfe; flex-shrink: 0; }
        .dsm-help-label { font-size: 13px; font-weight: 600; color: #f2f4f8; }
        .dsm-help-row small { font-size: 11px; color: #7c8499; }

        .dsm-how-row { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 12px; }
        .dsm-how-row:last-child { margin-bottom: 0; }
        .dsm-how-dot {
          width: 24px; height: 24px; border-radius: 50%; flex-shrink: 0; font-size: 11px; font-weight: 700;
          background: linear-gradient(135deg,#dd9b0e,#9cecfe); color: #0d1120;
          display: flex; align-items: center; justify-content: center;
        }
        .dsm-how-title { font-size: 13px; font-weight: 600; color: #f2f4f8; margin-bottom: 2px; }
        .dsm-how-row small { font-size: 11px; color: #7c8499; }
      `}</style>
    </div>
  );
}