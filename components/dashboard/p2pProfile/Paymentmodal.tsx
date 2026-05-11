"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  CurrencyOption,
  PaymentFormData,
  PaymentModalProps,
  SellMethodField,
  SellMethodOption,
} from "@/types/P2PProfileTypes";
import {
  currencyOptions,
  sellMethodsByCurrency,
} from "@/app/api/common";

// ─── QR Upload ────────────────────────────────────────────────────────────────

interface QRUploadProps {
  preview: string;
  onChange: (file: File) => void;
  onClear: () => void;
}

function QRUpload({ preview, onChange, onClear }: QRUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onChange(file); // pass File to parent — parent handles preview
    e.target.value = "";
  };

  return (
    <div className="qr-upload-wrap">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleFile}
        aria-label="Upload QR code image"
      />
      {preview ? (
        <div className="qr-preview position-relative mx-auto w-25">
          <img src={preview} alt="QR code preview" className="qr-preview-img" />
          <div className="qr-preview-actions pt-3 d-flex justify-content-between align-items-center gap-3">
            <button
              type="button"
              className="qr-action-btn text-warning"
              onClick={() => inputRef.current?.click()}
            >
              <i className="fa-solid fa-arrow-rotate-right" aria-hidden="true" /> Replace
            </button>
            <button
              type="button"
              className="qr-action-btn qr-action-danger text-danger"
              onClick={onClear}
            >
              <i className="fa-solid fa-xmark" aria-hidden="true" /> Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className="qr-dropzone border border-dark-light py-2 px-3 rounded-3"
          onClick={() => inputRef.current?.click()}
        >
          <i className="fa-solid fa-qrcode qr-dropzone-icon" aria-hidden="true" />
          <span className="qr-dropzone-label">Upload QR Code</span>
          <span className="qr-dropzone-sub">PNG, JPG up to 2 MB</span>
        </button>
      )}
    </div>
  );
}

// ─── Validation helpers ───────────────────────────────────────────────────────

function validateField(field: SellMethodField, value: string): string {
  const trimmed = value.trim();

  if (field.required && trimmed === "") {
    return `${field.label} is required.`;
  }

  if (trimmed !== "" && field.pattern) {
    try {
      const regex = new RegExp(`^(?:${field.pattern})$`);
      if (!regex.test(trimmed)) {
        return `${field.label} format is invalid.`;
      }
    } catch {
      // ignore bad regex from server
    }
  }

  return "";
}

function validateAll(
  fieldDefs: SellMethodField[],
  fieldValues: Record<string, string>,
  selectedCurrencyId: number | "",
  selectedMethodId: number | ""
): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!selectedCurrencyId) {
    errors.__currency = "Please select a currency.";
  }
  if (selectedCurrencyId && !selectedMethodId) {
    errors.__method = "Please select a payment method.";
  }

  for (const field of fieldDefs) {
    const err = validateField(field, fieldValues[field.key] ?? "");
    if (err) errors[field.key] = err;
  }

  return errors;
}

// ─── Dynamic Field ────────────────────────────────────────────────────────────

interface DynamicFieldProps {
  field: SellMethodField;
  value: string;
  error: string;
  touched: boolean;
  onChange: (key: string, val: string) => void;
  onBlur: (key: string) => void;
}

function DynamicField({ field, value, error, touched, onChange, onBlur }: DynamicFieldProps) {
  const showError = touched && !!error;
  const showValid = touched && !error && value.trim() !== "";

  return (
    <div className="input-box">
      <label htmlFor={`pm-field-${field.key}`}>
        {field.label}
        {field.required && <span className="text-danger fs-4"> *</span>}
      </label>
      <input
        id={`pm-field-${field.key}`}
        type={field.type}
        placeholder={field.placeholder}
        value={value}
        onChange={(e) => onChange(field.key, e.target.value)}
        onBlur={() => onBlur(field.key)}
        className={[
          field.mono ? "pm-mono" : "",
          showError ? "is-invalid" : "",
          showValid ? "is-valid" : "",
        ]
          .join(" ")
          .trim()}
      />
      {showError && (
        <div className="invalid-feedback d-block">
          <i className="fa-solid fa-circle-exclamation me-1" aria-hidden="true" />
          {error}
        </div>
      )}
    </div>
  );
}

// ─── Select Field ─────────────────────────────────────────────────────────────

interface SelectFieldProps {
  id: string;
  label: string;
  value: number | "";
  error: string;
  touched: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  onChange: (val: number) => void;
  onBlur: () => void;
}

function SelectField({
  id, label, value, error, touched, disabled, children, onChange, onBlur,
}: SelectFieldProps) {
  const showError = touched && !!error;
  const showValid = touched && !error && value !== "";

  return (
    <div className="input-box">
      <label htmlFor={id}>
        {label} <span className="text-danger fs-4">*</span>
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        onBlur={onBlur}
        disabled={disabled}
        className={[
          showError ? "is-invalid" : "",
          showValid ? "is-valid" : "",
        ]
          .join(" ")
          .trim()}
      >
        {children}
      </select>
      {showError && (
        <div className="invalid-feedback d-block">
          <i className="fa-solid fa-circle-exclamation me-1" aria-hidden="true" />
          {error}
        </div>
      )}
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getQrUrl = (path: string): string => {
  if (!path) return "";
  if (path.startsWith("data:") || path.startsWith("http")) return path;
  return `${process.env.NEXT_PUBLIC_API_URL}/storage/${path}`;
};

// ─── Main Modal ───────────────────────────────────────────────────────────────

export default function PaymentModal({
  mode,
  initialData,
  onClose,
  onSubmit,
}: PaymentModalProps) {
  const [currencies,     setCurrencies]     = useState<CurrencyOption[]>([]);
  const [sellMethods,    setSellMethods]    = useState<SellMethodOption[]>([]);
  const [loadingMethods, setLoadingMethods] = useState(false);

  const [selectedCurrencyId, setSelectedCurrencyId] = useState<number | "">(initialData?.currency_id ?? "");
  const [selectedMethodId,   setSelectedMethodId]   = useState<number | "">(initialData?.sell_method_id ?? "");
  const [fieldValues,        setFieldValues]        = useState<Record<string, string>>({});
  const [remarks,            setRemarks]            = useState(initialData?.remarks ?? "");

  // QR state — separate file (for upload) and preview (for display)
  const [qrCodeFile, setQrCodeFile] = useState<File | null>(null);
  const [qrPreview,  setQrPreview]  = useState<string>(
    initialData?.qr_code ? getQrUrl(initialData.qr_code) : ""
  );
  // keep track of existing path (edit mode) — sent when no new file chosen
  const [qrCodePath, setQrCodePath] = useState<string>(initialData?.qr_code ?? "");

  // ── Validation state ──────────────────────────────────────────────────────
  const [errors,          setErrors]          = useState<Record<string, string>>({});
  const [touched,         setTouched]         = useState<Record<string, boolean>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const activeMethod = sellMethods.find((m) => m.value === selectedMethodId);
  const fieldDefs: SellMethodField[] = activeMethod?.fields ?? [];

  // ── Re-validate on input change ───────────────────────────────────────────
  useEffect(() => {
    if (!submitAttempted) return;
    setErrors(validateAll(fieldDefs, fieldValues, selectedCurrencyId, selectedMethodId));
  }, [fieldDefs, fieldValues, selectedCurrencyId, selectedMethodId, submitAttempted]);

  // ── Load currencies ───────────────────────────────────────────────────────
  useEffect(() => {
    currencyOptions().then((res) => setCurrencies(res?.data ?? []));
  }, []);

  // ── Load sell methods on currency change ──────────────────────────────────
  useEffect(() => {
    if (!selectedCurrencyId) {
      setSellMethods([]);
      setSelectedMethodId("");
      setFieldValues({});
      return;
    }
    setLoadingMethods(true);
    sellMethodsByCurrency(selectedCurrencyId as number)
      .then((res) => setSellMethods(res?.data ?? []))
      .catch(console.error)
      .finally(() => setLoadingMethods(false));
  }, [selectedCurrencyId]);

  // ── Seed edit mode after sell methods load ────────────────────────────────
  useEffect(() => {
    if (mode === "edit" && initialData && sellMethods.length > 0) {
      setSelectedMethodId(initialData.sell_method_id);
      setRemarks(initialData.remarks ?? "");
      setQrCodePath(initialData.qr_code ?? "");
      setQrPreview(initialData.qr_code ? getQrUrl(initialData.qr_code) : "");

      const method = sellMethods.find((m) => m.value === initialData.sell_method_id);
      const seeded: Record<string, string> = {};
      for (const field of method?.fields ?? []) {
        const val = (initialData as Record<string, unknown>)[field.key];
        if (val !== undefined && val !== null) {
          seeded[field.key] = String(val);
        }
      }
      setFieldValues(seeded);
    }
  }, [sellMethods, mode, initialData]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const touch = (...keys: string[]) =>
    setTouched((prev) =>
      Object.fromEntries([...Object.entries(prev), ...keys.map((k) => [k, true])])
    );

  const handleCurrencyChange = (id: number) => {
    setSelectedCurrencyId(id);
    setSelectedMethodId("");
    setFieldValues({});
    setErrors({});
    setSubmitAttempted(false);
    touch("__currency");
    if (!id) setErrors((prev) => ({ ...prev, __currency: "Please select a currency." }));
    else     setErrors((prev) => ({ ...prev, __currency: "" }));
  };

  const handleMethodChange = (id: number) => {
    setSelectedMethodId(id);
    setFieldValues({});
    setRemarks("");
    setQrCodeFile(null);
    setQrPreview("");
    setQrCodePath("");
    touch("__method");
    if (!id) setErrors((prev) => ({ ...prev, __method: "Please select a payment method." }));
    else     setErrors((prev) => ({ ...prev, __method: "" }));
  };

  const handleFieldChange = (key: string, val: string) => {
    setFieldValues((prev) => ({ ...prev, [key]: val }));
    if (touched[key] || submitAttempted) {
      const field = fieldDefs.find((f) => f.key === key);
      if (field) setErrors((prev) => ({ ...prev, [key]: validateField(field, val) }));
    }
  };

  const handleFieldBlur = (key: string) => {
    touch(key);
    const field = fieldDefs.find((f) => f.key === key);
    if (field)
      setErrors((prev) => ({ ...prev, [key]: validateField(field, fieldValues[key] ?? "") }));
  };

  const handleQrChange = (file: File) => {
    setQrCodeFile(file); // store File for FormData
    const reader = new FileReader();
    reader.onload = () => setQrPreview(reader.result as string); // update preview
    reader.readAsDataURL(file);
  };

  const handleQrClear = () => {
    setQrCodeFile(null);
    setQrPreview("");
    setQrCodePath("");
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);

    const allTouched: Record<string, boolean> = { __currency: true, __method: true };
    fieldDefs.forEach((f) => { allTouched[f.key] = true; });
    setTouched(allTouched);

    const currentErrors = validateAll(fieldDefs, fieldValues, selectedCurrencyId, selectedMethodId);
    setErrors(currentErrors);

    if (Object.values(currentErrors).some((e) => e !== "")) return;

    // ✅ Guard — should never reach here if validation passes, but safety check
    if (!selectedMethodId || !selectedCurrencyId) return;

    console.log("Submitting:", {
      sell_method_id: selectedMethodId,
      currency_id:    selectedCurrencyId,
      field_values:   fieldValues,
    }); // 👈 check this in console

    onSubmit({
      sell_method_id: Number(selectedMethodId), // ✅ force Number
      currency_id:    Number(selectedCurrencyId), // ✅ force Number
      field_values:   fieldValues ?? {},          // ✅ guard null
      remarks:        remarks.trim() || undefined,
      qr_code:        qrCodeFile ?? null,
    });
  };

  const title       = mode === "add" ? "Add Payment Method" : "Edit Payment Method";
  const submitLabel = mode === "add" ? "Add Method"         : "Save Changes";
  const hasErrors   = Object.values(errors).some((e) => e !== "");

  return (
    <div className="rt-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="pm-modal-title">
      <button className="rt-modal-backdrop" type="button" onClick={onClose} aria-label="Close modal" />

      <div className="bg-light-white rt-modal--lg">

        {/* ── Head ── */}
        <div className="rt-modal-head">
          <h6 className="rt-modal-title" id="pm-modal-title">{title}</h6>
          <button type="button" className="rt-modal-x" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {/* ── Body ── */}
        <div className="rt-modal-body bg-light-dark m-3 rounded border border-dark-light">
          <form onSubmit={handleSubmit} noValidate className="ticket-form">

            {/* Currency + Method */}
            <div className="ticket-form-grid">
              <SelectField
                id="pm-currency"
                label="Select Currency"
                value={selectedCurrencyId}
                error={errors.__currency ?? ""}
                touched={touched.__currency ?? false}
                onChange={handleCurrencyChange}
                onBlur={() => {
                  touch("__currency");
                  if (!selectedCurrencyId)
                    setErrors((p) => ({ ...p, __currency: "Please select a currency." }));
                }}
              >
                <option value="">Select Currency</option>
                {currencies.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </SelectField>

              <SelectField
                id="pm-method"
                label="Payment Method"
                value={selectedMethodId}
                error={errors.__method ?? ""}
                touched={touched.__method ?? false}
                disabled={!selectedCurrencyId || loadingMethods}
                onChange={handleMethodChange}
                onBlur={() => {
                  touch("__method");
                  if (selectedCurrencyId && !selectedMethodId)
                    setErrors((p) => ({ ...p, __method: "Please select a payment method." }));
                }}
              >
                <option value="">{loadingMethods ? "Loading…" : "Select Method"}</option>
                {sellMethods.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </SelectField>
            </div>

            {/* Dynamic fields */}
            {fieldDefs.length > 0 && (
              <div className="ticket-form-grid mt-4 pt-3">
                {fieldDefs.map((field) => (
                  <DynamicField
                    key={field.key}
                    field={field}
                    value={fieldValues[field.key] ?? ""}
                    error={errors[field.key] ?? ""}
                    touched={touched[field.key] ?? submitAttempted}
                    onChange={handleFieldChange}
                    onBlur={handleFieldBlur}
                  />
                ))}
              </div>
            )}

            {/* Remarks + QR */}
            {selectedMethodId !== "" && (
              <div className="pm-optional-section pt-3">
                <div className="pm-optional-grid">
                  <div className="input-box textarea">
                    <label htmlFor="pm-remarks">
                      Remarks <span className="pm-optional-tag ps-1">(Optional)</span>
                    </label>
                    <textarea
                      id="pm-remarks"
                      placeholder="Add a note visible to buyers"
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="input-box pt-3">
                    <label>
                      QR Code <span className="pm-optional-tag ps-1">(Optional)</span>
                    </label>
                    <QRUpload
                      preview={qrPreview}
                      onChange={handleQrChange}
                      onClear={handleQrClear}
                    />
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* ── Footer ── */}
        <div className="rt-modal-foot pb-3 px-3">
          <button type="button" className="ticket-action-btn" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitAttempted && hasErrors}
            className="btn--primary py-2 px-3 text-sm d-flex align-items-center justify-content-center"
          >
            {submitLabel} <span className="arrow">›</span>
          </button>
        </div>
      </div>
    </div>
  );
}