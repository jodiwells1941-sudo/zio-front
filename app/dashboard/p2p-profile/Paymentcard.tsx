"use client";

import React from "react";
import styles from "./P2PProfile.module.css";
import { PaymentCardProps, SellMethodField } from "@/types/P2PProfileTypes";

function getAccentClass(methodName: string): string {
  const n = methodName.toLowerCase();
  if (n === "bkash")         return styles.accentBkash;
  if (n === "bank transfer") return styles.accentBank;
  if (n === "nagad")         return styles.accentNagad;
  if (n === "rocket")        return styles.accentRocket ?? styles.accentNagad;
  if (n === "paypal")        return styles.accentPaypal ?? styles.accentBank;
  return styles.accentBank;
}

export default function PaymentCard({ method, onEdit, onDelete }: PaymentCardProps) {
  return (
    <div className={styles.paymentCard}>
      {/* ── Header ── */}
      <div className={`${styles.paymentCardHeader} d-flex justify-content-between align-items-center`}>
        <div className="d-flex align-items-center gap-2">
          <span className={`${styles.paymentAccent} ${getAccentClass(method.method_name)}`} />
          <span className={styles.paymentType}>{method.method_name}</span>
          <span className={styles.currencyBadge}>{method.currency_name}</span>
        </div>

        <div className="d-flex gap-3">
          <button
            type="button"
            className={styles.actionBtn}
            onClick={() => onEdit?.(method)}
            aria-label={`Edit ${method.method_name}`}
          >
            <i className="fa-solid fa-pen-to-square" aria-hidden="true" />
            <span>Edit</span>
          </button>
          <button
            type="button"
            className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
            onClick={() => onDelete?.(method.id)}
            aria-label={`Delete ${method.method_name}`}
          >
            <i className="fa-solid fa-trash" aria-hidden="true" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <div className={`${styles.paymentBody} d-flex flex-wrap`}>
        {(method.fields ?? []).map((field: SellMethodField) => {
          //  API returns field values as flat keys on the method object
          const val = (method as Record<string, unknown>)[field.key] as string | undefined;
          if (!val) return null;
          return (
            <div key={field.key} className={styles.fieldGroup}>
              <p className={styles.fieldLabel}>{field.label}</p>
              <p className={`${styles.fieldValue} ${field.mono ? styles.fieldMono : ""}`}>
                {val}
              </p>
            </div>
          );
        })}

        {method.remarks && (
          <div className={styles.fieldGroup}>
            <p className={styles.fieldLabel}>Remarks</p>
            <p className={styles.fieldValue}>{method.remarks}</p>
          </div>
        )}

        {method.qr_code && (
          <div className={styles.fieldGroup}>
            <p className={styles.fieldLabel}>QR Code</p>
            <img src={method.qr_code} alt="QR code" className={styles.qrThumb} />
          </div>
        )}
      </div>
    </div>
  );
}