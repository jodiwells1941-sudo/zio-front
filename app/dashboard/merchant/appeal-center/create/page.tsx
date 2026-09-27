/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "react-toastify";
import {
  lookupMerchantOrderForAppeal,
  createMerchantAppeal,
  AppealOrderLookup,
} from "@/app/api/merchant";

// ─── Types ────────────────────────────────────────────────────────────────────

type OrderSummary = AppealOrderLookup;

interface AppealTypeOption {
  key: string;
  label: string;
  description: string;
  icon: string;
  iconBg: string;
}

const APPEAL_TYPES: AppealTypeOption[] = [
  {
    key: "wrong_payment",
    label: "Wrong Payment",
    description: "I have paid but sent wrong amount or extra amount.",
    icon: "fa-solid fa-credit-card",
    iconBg: "#ef4444",
  },
  {
    key: "payment_not_received",
    label: "Payment Not Received",
    description: "I have paid but payment not received by the merchant.",
    icon: "fa-regular fa-clock",
    iconBg: "#f59e0b",
  },
  {
    key: "usdt_not_released",
    label: "USDT Not Released",
    description: "Merchant not released USDT after payment.",
    icon: "fa-solid fa-t",
    iconBg: "#22c55e",
  },
  {
    key: "expired_order",
    label: "Expired Order",
    description: "Order was expired but I have already made the payment.",
    icon: "fa-regular fa-calendar-xmark",
    iconBg: "#ef4444",
  },
  {
    key: "account_issue",
    label: "Account / User Issue",
    description: "Facing issue with merchant account or user behavior.",
    icon: "fa-solid fa-user",
    iconBg: "#3b82f6",
  },
  {
    key: "fraud_scam",
    label: "Fraud / Scam",
    description: "I suspect fraud or scam activity in this order.",
    icon: "fa-solid fa-triangle-exclamation",
    iconBg: "#f59e0b",
  },
  {
    key: "other",
    label: "Other Issue",
    description: "Other issues not listed above.",
    icon: "fa-regular fa-comments",
    iconBg: "#a855f7",
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function CreateAppealPage() {
  const router = useRouter();

  const [orderQuery, setOrderQuery] = useState("");
  const [order, setOrder] = useState<OrderSummary | null>(null);
  const [searching, setSearching] = useState(false);

  const [appealType, setAppealType] = useState<string>(APPEAL_TYPES[0].key);
  const [amountSent, setAmountSent] = useState("");
  const [paymentDateTime, setPaymentDateTime] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreviewUrl, setProofPreviewUrl] = useState<string | null>(null);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleProofChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setProofFile(file);
    setProofPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return file ? URL.createObjectURL(file) : null;
    });
  };

  const clearProof = () => {
    setProofFile(null);
    setProofPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  };

  const SUBJECT_MAX = 100;
  const DESC_MAX = 1000;

  const handleSearch = async () => {
    if (!orderQuery.trim()) {
      toast.error("Enter an order ID to search.");
      return;
    }
    setSearching(true);
    try {
      const res = await lookupMerchantOrderForAppeal(orderQuery.trim());
      const found = res?.data ?? null;
      setOrder(found);
      if (found && !found.appealable) {
        toast.error("This order is already completed and can no longer be appealed.");
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? e?.message ?? "Order not found.");
      setOrder(null);
    } finally {
      setSearching(false);
    }
  };

  const canSubmit =
    !!order &&
    order.appealable &&
    !!appealType &&
    subject.trim().length > 0 &&
    description.trim().length > 0 &&
    !submitting;

  const handleSubmit = async () => {
    if (!canSubmit || !order) return;
    setSubmitting(true);
    try {
      await createMerchantAppeal({
        order_id: order.order_id,
        type: appealType,
        subject: subject.trim(),
        description: description.trim(),
        amount_sent: amountSent || undefined,
        payment_datetime: paymentDateTime || undefined,
        proof: proofFile,
      });
      toast.success("Appeal submitted. Our team will review it within 24 hours.");
      router.push("/dashboard/merchant/appeal-center");
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Failed to submit appeal.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="appeal-page">
      <div className="container-fluid appeal-container">
        <div className="appeal-section">

          {/* =========================================
              HEADER
          ========================================== */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
            <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: "linear-gradient(135deg,#7c3aed,#a855f7)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontSize: 18,
                  flexShrink: 0,
                }}
              >
                <i className="fa-solid fa-comment-medical" />
              </div>
              <div>
                <h2 className="appeal-title mt-0 pt-0" style={{ marginBottom: 2 }}>Create New Appeal</h2>
                <p className="appeal-description" style={{ margin: 0 }}>
                  Submit a new appeal if you face any issue in your transaction.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => router.push("/dashboard/merchant/appeal-center")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 16px",
                borderRadius: 10,
                background: "#171a24",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.8)",
                fontSize: 13,
              }}
            >
              <i className="fa-solid fa-arrow-left" />
              Back to Dashboard
            </button>
          </div>

          {/* =========================================
              MAIN GRID: form (left) + sidebar (right)
          ========================================== */}
          <div style={{ display: "flex", gap: 18, alignItems: "flex-start", flexWrap: "wrap" }}>

            {/* ── Left column: form ── */}
            <div style={{ flex: "1 1 560px", minWidth: 320, display: "flex", flexDirection: "column", gap: 18 }}>

              {/* Step 1: Select Order */}
              <section className="appeal-content-card p-3">
                <h4 className="appeal-content-title" style={{ marginBottom: 2 }}>1. Select Order</h4>
                <p className="appeal-content-subtitle">Choose the order related to your issue.</p>

                <label style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", display: "block", margin: "14px 0 6px" }}>
                  Order ID / Order Number
                </label>
                <div style={{ display: "flex", gap: 8 }}>
                  <div style={{ position: "relative", flex: 1 }}>
                    <i
                      className="fa-solid fa-magnifying-glass"
                      style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.35)" }}
                    />
                    <input
                      value={orderQuery}
                      onChange={(e) => setOrderQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                      placeholder="Search by Order ID"
                      style={{
                        width: "100%",
                        padding: "10px 12px 10px 38px",
                        borderRadius: 10,
                        background: "#0e1017",
                        border: "1px solid rgba(255,255,255,0.08)",
                        color: "#fff",
                        fontSize: 13,
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSearch}
                    disabled={searching}
                    style={{
                      padding: "0 16px",
                      borderRadius: 10,
                      background: "#171a24",
                      border: "1px solid rgba(255,255,255,0.08)",
                      color: "#fff",
                      fontSize: 13,
                    }}
                  >
                    {searching ? "…" : <i className="fa-solid fa-angle-down" />}
                  </button>
                </div>

                {order && (
                  <div
                    style={{
                      marginTop: 14,
                      background: "#0e1017",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 12,
                      padding: 14,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <strong style={{ color: "#fff", fontSize: 14 }}>{order.order_id}</strong>
                    </div>
                    <div style={{ display: "flex", gap: 8, margin: "8px 0 12px" }}>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          padding: "3px 10px",
                          borderRadius: 999,
                          background: order.side === "Buy" ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
                          color: order.side === "Buy" ? "#22c55e" : "#ef4444",
                        }}
                      >
                        {order.side}
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          padding: "3px 10px",
                          borderRadius: 999,
                          background: "rgba(59,130,246,0.15)",
                          color: "#3b82f6",
                        }}
                      >
                        {order.asset}
                      </span>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13 }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "rgba(255,255,255,0.5)" }}>Amount</span>
                        <strong style={{ color: "#fff" }}>{order.amount} {order.asset}</strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "rgba(255,255,255,0.5)" }}>Price</span>
                        <strong style={{ color: "#fff" }}>{order.price} {order.fiat}</strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ color: "rgba(255,255,255,0.5)" }}>Merchant</span>
                        <span style={{ display: "flex", alignItems: "center", gap: 6, color: "#fff" }}>
                          <span
                            style={{
                              width: 20,
                              height: 20,
                              borderRadius: 999,
                              background: "#333",
                              display: "inline-block",
                              overflow: "hidden",
                              position: "relative",
                            }}
                          >
                            {order.merchant_avatar && (
                              <Image src={order.merchant_avatar} alt={order.merchant_name} fill unoptimized />
                            )}
                          </span>
                          {order.merchant_name}
                        </span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "rgba(255,255,255,0.5)" }}>Date</span>
                        <strong style={{ color: "#fff" }}>{order.date}</strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "rgba(255,255,255,0.5)" }}>Status</span>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            padding: "3px 10px",
                            borderRadius: 999,
                            background: "rgba(59,130,246,0.15)",
                            color: "#3b82f6",
                          }}
                        >
                          {order.status_text}
                        </span>
                      </div>
                    </div>

                    {!order.appealable && (
                      <div
                        style={{
                          marginTop: 12,
                          padding: "8px 10px",
                          borderRadius: 8,
                          background: "rgba(239,68,68,0.1)",
                          border: "1px solid rgba(239,68,68,0.25)",
                          color: "#f87171",
                          fontSize: 12,
                          display: "flex",
                          gap: 8,
                          alignItems: "center",
                        }}
                      >
                        <i className="fa-solid fa-triangle-exclamation" />
                        This order is already completed and can no longer be appealed.
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => router.push(`/dashboard/merchant/ads/p2p/?trade_id=${order.id}`)}
                      style={{ background: "transparent", border: "none", color: "#a855f7", fontSize: 12.5, marginTop: 12, padding: 0 }}
                    >
                      View Order Details <i className="fa-solid fa-arrow-right ms-1" />
                    </button>
                  </div>
                )}
              </section>

              {/* Step 2: Select Appeal Type */}
              <section className="appeal-content-card p-3">
                <h4 className="appeal-content-title" style={{ marginBottom: 2 }}>2. Select Appeal Type</h4>
                <p className="appeal-content-subtitle">Choose the issue you are facing.</p>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                    gap: 12,
                    marginTop: 14,
                  }}
                >
                  {APPEAL_TYPES.map((opt) => {
                    const selected = appealType === opt.key;
                    return (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => setAppealType(opt.key)}
                        style={{
                          textAlign: "left",
                          borderRadius: 12,
                          padding: 14,
                          border: selected ? "1.5px solid #a855f7" : "1px solid rgba(255,255,255,0.08)",
                          background: selected ? "rgba(168,85,247,0.08)" : "#0e1017",
                          cursor: "pointer",
                          display: "flex",
                          flexDirection: "column",
                          gap: 8,
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <span
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 9,
                              background: opt.iconBg,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#fff",
                              fontSize: 14,
                            }}
                          >
                            <i className={opt.icon} />
                          </span>
                          <span
                            style={{
                              width: 16,
                              height: 16,
                              borderRadius: 999,
                              border: selected ? "5px solid #a855f7" : "1.5px solid rgba(255,255,255,0.25)",
                              background: "transparent",
                              flexShrink: 0,
                            }}
                          />
                        </div>
                        <div style={{ fontSize: 13.5, fontWeight: 600, color: "#fff" }}>{opt.label}</div>
                        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.4 }}>
                          {opt.description}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Step 3: Describe Your Issue */}
              <section className="appeal-content-card p-3">
                <h4 className="appeal-content-title" style={{ marginBottom: 2 }}>3. Describe Your Issue</h4>
                <p className="appeal-content-subtitle">Provide detailed information about your problem.</p>

                {/* Optional payment-proof fields */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: 14,
                    marginTop: 14,
                  }}
                >
                  <div>
                    <label style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", display: "block", marginBottom: 6 }}>
                      Amount You Sent <span style={{ color: "rgba(255,255,255,0.3)" }}>(optional)</span>
                    </label>
                    <input
                      value={amountSent}
                      onChange={(e) => setAmountSent(e.target.value)}
                      inputMode="decimal"
                      placeholder={order ? `e.g. ${order.amount}` : "e.g. 250.00"}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: 10,
                        background: "#0e1017",
                        border: "1px solid rgba(255,255,255,0.08)",
                        color: "#fff",
                        fontSize: 13,
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", display: "block", marginBottom: 6 }}>
                      Date &amp; Time of Payment <span style={{ color: "rgba(255,255,255,0.3)" }}>(optional)</span>
                    </label>
                    <input
                      type="datetime-local"
                      value={paymentDateTime}
                      onChange={(e) => setPaymentDateTime(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: 10,
                        background: "#0e1017",
                        border: "1px solid rgba(255,255,255,0.08)",
                        color: "#fff",
                        fontSize: 13,
                        colorScheme: "dark",
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginTop: 14 }}>
                  <label style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", display: "block", marginBottom: 6 }}>
                    Upload Payment Proof <span style={{ color: "rgba(255,255,255,0.3)" }}>(optional)</span>
                  </label>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp,application/pdf"
                    onChange={handleProofChange}
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      borderRadius: 10,
                      background: "#0e1017",
                      border: "1px solid rgba(255,255,255,0.08)",
                      color: "rgba(255,255,255,0.75)",
                      fontSize: 12.5,
                    }}
                  />
                  {proofPreviewUrl && proofFile?.type.startsWith("image/") && (
                    <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 10 }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={proofPreviewUrl}
                        alt="Payment proof preview"
                        style={{ height: 64, borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", objectFit: "cover" }}
                      />
                      <button
                        type="button"
                        onClick={clearProof}
                        style={{ background: "transparent", border: "none", color: "#ef4444", fontSize: 12 }}
                      >
                        <i className="fa-solid fa-xmark me-1" />
                        Remove
                      </button>
                    </div>
                  )}
                  {proofFile && !proofFile.type.startsWith("image/") && (
                    <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 10, fontSize: 12.5, color: "rgba(255,255,255,0.6)" }}>
                      <i className="fa-solid fa-file-pdf" style={{ color: "#ef4444" }} />
                      {proofFile.name}
                      <button
                        type="button"
                        onClick={clearProof}
                        style={{ background: "transparent", border: "none", color: "#ef4444", fontSize: 12 }}
                      >
                        <i className="fa-solid fa-xmark me-1" />
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                <div style={{ marginTop: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <label style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>Subject / Short Description</label>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{subject.length}/{SUBJECT_MAX}</span>
                  </div>
                  <input
                    value={subject}
                    maxLength={SUBJECT_MAX}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Write a short summary of your issue"
                    style={{
                      width: "100%",
                      marginTop: 6,
                      padding: "10px 12px",
                      borderRadius: 10,
                      background: "#0e1017",
                      border: "1px solid rgba(255,255,255,0.08)",
                      color: "#fff",
                      fontSize: 13,
                    }}
                  />
                </div>

                <div style={{ marginTop: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <label style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>Detailed Description</label>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{description.length}/{DESC_MAX}</span>
                  </div>
                  <textarea
                    value={description}
                    maxLength={DESC_MAX}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={5}
                    placeholder="Explain your issue in detail. Please mention what happened, expected and actual situation."
                    style={{
                      width: "100%",
                      marginTop: 6,
                      padding: "10px 12px",
                      borderRadius: 10,
                      background: "#0e1017",
                      border: "1px solid rgba(255,255,255,0.08)",
                      color: "#fff",
                      fontSize: 13,
                      resize: "vertical",
                    }}
                  />
                </div>
              </section>

              {/* Footer actions */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
                <button
                  type="button"
                  onClick={() => router.back()}
                  style={{
                    padding: "10px 20px",
                    borderRadius: 10,
                    background: "#171a24",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "rgba(255,255,255,0.8)",
                    fontSize: 13,
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  style={{
                    padding: "10px 20px",
                    borderRadius: 10,
                    background: canSubmit ? "linear-gradient(135deg,#7c3aed,#a855f7)" : "rgba(168,85,247,0.3)",
                    border: "none",
                    color: "#fff",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: canSubmit ? "pointer" : "not-allowed",
                  }}
                >
                  {submitting ? "Submitting…" : "Review & Submit Appeal"} <i className="fa-solid fa-arrow-right ms-1" />
                </button>
              </div>
            </div>

            {/* ── Right column: guidelines + tips (kept — image 2 only) ── */}
            <div style={{ flex: "0 1 260px", minWidth: 240, display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="appeal-content-card p-3">
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <i className="fa-solid fa-shield-halved" style={{ color: "#a855f7" }} />
                  <h5 style={{ margin: 0, fontSize: 14, color: "#fff" }}>Appeal Guidelines</h5>
                </div>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                  {[
                    "Submit only valid appeals with correct information.",
                    "Provide accurate details and payment proof.",
                    "Our team will review your appeal within 24 hours.",
                    "You will be notified about the decision.",
                  ].map((tip, i) => (
                    <li key={i} style={{ display: "flex", gap: 8, fontSize: 12.5, color: "rgba(255,255,255,0.55)", lineHeight: 1.4 }}>
                      <i className="fa-solid fa-check" style={{ color: "#a855f7", marginTop: 3, fontSize: 11 }} />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="appeal-content-card p-3" style={{ textAlign: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, justifyContent: "center" }}>
                  <i className="fa-solid fa-lightbulb" style={{ color: "#f59e0b" }} />
                  <h5 style={{ margin: 0, fontSize: 14, color: "#fff" }}>Tips</h5>
                </div>
                <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>
                  Make sure you select the correct order and issue type for faster resolution.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}