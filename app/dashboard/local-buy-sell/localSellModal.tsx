"use client";

import { getUserPaymentMethods, updateUserPaymentMethod } from "@/app/api/common";
import { getLocalBonusFeesSettings as getBonusFeesSettings } from "@/app/api/localBonusFees";
import { P2pAdsData } from "@/app/api/p2padsapi";
import { generateTrade } from "@/app/api/trade";
import type { SellMethodField, UserPaymentMethod } from "@/types/P2PProfileTypes";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import "./localTradeSummary.css";
import PaymentMethodIcon from "./PaymentMethodIcon";
import { localOrderSummaryRows } from "./localOrderSummary";
import { localAdQuote } from "./localQuote";
import { useLocalTradeLimits } from "./useLocalTradeLimits";

// ─── Types ────────────────────────────────────────────────────────────────────

type Props = {
  onClose: () => void;
  ad: P2pAdsData;
};

function apiErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === "object" && error !== null && "response" in error) {
    const message = (error as { response?: { data?: { message?: unknown } } }).response?.data?.message;
    if (typeof message === "string" && message) return message;
  }

  return error instanceof Error && error.message ? error.message : fallback;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function LocalSellModal({ onClose, ad }: Props) {
  const router = useRouter();
  const marketPrice = Number(ad.market_price ?? 0);
  const { limits: tradeLimits, loading: limitsLoading } = useLocalTradeLimits();

  const [sellAmount,   setSellAmount]   = useState('');
  const [receiveAmt,   setReceiveAmt]   = useState('');
  const [errors,       setErrors]       = useState<{ paymentMethodId?: string }>({});
  const [paymentMethodId, setPaymentMethodId] = useState<number>(0);
  const [paymentFieldValues, setPaymentFieldValues] = useState<Record<string, string>>({});
  const [paymentFieldErrors, setPaymentFieldErrors] = useState<Record<string, string>>({});
  const [submitting,   setSubmitting]   = useState(false);
  const [methods,        setMethods        ] = useState<UserPaymentMethod[]>([]);
  const [loadingMethods, setLoadingMethods] = useState(false);
  const [methodsLoaded, setMethodsLoaded] = useState(false);
  const [feePercent, setFeePercent] = useState(0);
  const autoSelectedMethodKey = useRef<string | null>(null);

  const loadMethods = useCallback(async () => {
    setLoadingMethods(true);
    setMethodsLoaded(false);
    try {
      const res = await getUserPaymentMethods();
      setMethods(res?.data ?? []);
    } catch (error: unknown) {
      toast.error(apiErrorMessage(error, 'Failed to load payment methods.'));
    } finally {
      setLoadingMethods(false);
      setMethodsLoaded(true);
    }
  }, []);
  
  useEffect(() => { loadMethods(); }, [loadMethods]);

  useEffect(() => {
    const adMethod = ad.payment_method?.sell_method;
    if (!methodsLoaded) return;

    const selectionKey = [
      ad.id,
      adMethod?.id ?? "",
      adMethod?.name.trim().toLowerCase() ?? "",
      ad.with_fiat.trim().toUpperCase(),
    ].join(":");
    if (autoSelectedMethodKey.current === selectionKey) return;
    autoSelectedMethodKey.current = selectionKey;

    if (!adMethod) {
      setPaymentMethodId(0);
      return;
    }

    const currencyCode = ad.with_fiat.trim().toUpperCase();
    const matchingCurrency = (method: UserPaymentMethod) =>
      !method.currency_name || method.currency_name.trim().toUpperCase() === currencyCode;
    const activeMethods = methods.filter(method => method.is_active);
    const match =
      activeMethods.find(method =>
        method.sell_method_id === adMethod.id && matchingCurrency(method)
      ) ??
      activeMethods.find(method =>
        method.method_name.trim().toLowerCase() === adMethod.name.trim().toLowerCase() &&
        matchingCurrency(method)
      );

    setPaymentMethodId(match?.id ?? 0);
  }, [ad.id, ad.payment_method?.sell_method, ad.with_fiat, methods, methodsLoaded]);

  // Close on Escape
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  useEffect(() => {
    const loadBonusFees = async () => {
      try {
        const res = await getBonusFeesSettings();
        const settings = res?.data;

        const configuredFee = Number(settings?.user_sell_charge ?? 0);
        setFeePercent(ad.type === "buy" && Number.isFinite(configuredFee) ? configuredFee : 0);
      } catch (error) {
        console.error('Failed to load bonus & fees settings:', error);
        setFeePercent(0);
      }
    };

    if (ad?.type) {
      loadBonusFees();
    }
  }, [ad]);

  // Auto-fill sell/receive amounts from ad when modal opens and prevent manual typing
  useEffect(() => {
    const quote = localAdQuote(ad, ad.order_limit_min);
    setSellAmount(String(Number(quote.visitorAmount.toFixed(4))));
    setReceiveAmt(quote.fiatAmount.toFixed(2));
    setErrors({});
  }, [ad]);

  // ─── Sell fee summary calculation ───────────────────────────────────────────
  const grossReceive = Number(receiveAmt) || 0;
  const sellValue     = Number(sellAmount || 0);
  const feeUsdt = (sellValue * feePercent) / 100;
  // The seller's wallet is charged the sale amount plus its configured fee.
  const totalUSD = sellValue + feeUsdt;
  const assetLabel = ad.asset?.toUpperCase() === "USDT" ? "USD" : ad.asset;

  const money = (amount: number) => amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const selectedPaymentMethod = methods.find(method => method.id === paymentMethodId);
  const paymentMethodFields: SellMethodField[] = selectedPaymentMethod?.fields?.length
    ? selectedPaymentMethod.fields
    : Object.keys({
        ...(selectedPaymentMethod?.field_values ?? {}),
        ...(selectedPaymentMethod?.walletNumber ? { walletNumber: selectedPaymentMethod.walletNumber } : {}),
        ...(selectedPaymentMethod?.bankName ? { bankName: selectedPaymentMethod.bankName } : {}),
      }).map(key => ({
        key,
        label: key
        .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
        .replace(/[_-]/g, " ")
        .replace(/\b\w/g, character => character.toUpperCase()),
        type: "text" as const,
        required: false,
        placeholder: "",
      }));

  useEffect(() => {
    if (!selectedPaymentMethod) {
      setPaymentFieldValues({});
      setPaymentFieldErrors({});
      return;
    }

    setPaymentFieldValues({
      ...selectedPaymentMethod.field_values,
      ...(selectedPaymentMethod.walletNumber
        ? { walletNumber: selectedPaymentMethod.field_values?.walletNumber ?? selectedPaymentMethod.walletNumber }
        : {}),
      ...(selectedPaymentMethod.bankName
        ? { bankName: selectedPaymentMethod.field_values?.bankName ?? selectedPaymentMethod.bankName }
        : {}),
    });
    setPaymentFieldErrors({});
  }, [selectedPaymentMethod]);

  // ─── Submit ────────────────────────────────────────────────────────────────

  const handleSell = async () => {
    if (!Number.isFinite(marketPrice) || marketPrice <= 0) {
      toast.error('The market rate is unavailable. Refresh the ad and try again.');
      return;
    }
    if (limitsLoading || !tradeLimits) {
      toast.error('Could not load the current Sell amount limits. Please try again.');
      return;
    }
    const cryptoQty = parseFloat(String(sellAmount).replace(/,/g, "").trim());

    if (!selectedPaymentMethod) {
      setErrors({ paymentMethodId: 'Please select a payment method.' });
      toast.error('Please select a payment method.');
      return;
    } else {
      setErrors({});
    }

    const nextPaymentFieldErrors: Record<string, string> = {};
    for (const field of paymentMethodFields) {
      const value = (paymentFieldValues[field.key] ?? "").trim();
      if (field.required && !value) {
        nextPaymentFieldErrors[field.key] = `${field.label} is required.`;
      } else if (value && field.pattern) {
        try {
          if (!new RegExp(`^(?:${field.pattern})$`).test(value)) {
            nextPaymentFieldErrors[field.key] = `${field.label} format is invalid.`;
          }
        } catch (error) {
          console.error(`Invalid validation pattern for payment field "${field.key}":`, error);
        }
      }
    }
    setPaymentFieldErrors(nextPaymentFieldErrors);
    if (Object.keys(nextPaymentFieldErrors).length > 0) {
      toast.error("Please correct the payment method details.");
      return;
    }

    if (isNaN(cryptoQty) || cryptoQty <= 0) {
      toast.error("Please enter a valid amount.");
      return;
    }

    if (cryptoQty < tradeLimits.sell.min || cryptoQty > tradeLimits.sell.max) {
      toast.error(`Sell amount must be between ${money(tradeLimits.sell.min)} and ${money(tradeLimits.sell.max)} USD.`);
      return;
    }

    if (Number(ad.order_limit_min) > ad.order_limit_max) {
      toast.error(
        `Amount must be between ${ad.order_limit_min} and ${ad.order_limit_max} ${ad.asset}`,
      );
      return;
    }

    setSubmitting(true);
    let paymentDetailsSaved = false;
    try {
      const originalFieldValues: Record<string, string> = {
        ...selectedPaymentMethod.field_values,
        ...(selectedPaymentMethod.walletNumber
          ? { walletNumber: selectedPaymentMethod.field_values?.walletNumber ?? selectedPaymentMethod.walletNumber }
          : {}),
        ...(selectedPaymentMethod.bankName
          ? { bankName: selectedPaymentMethod.field_values?.bankName ?? selectedPaymentMethod.bankName }
          : {}),
      };
      const normalizedPaymentFieldValues = Object.fromEntries(
        Object.entries(paymentFieldValues).map(([key, value]) => [key, value.trim()]),
      );
      const paymentDetailsChanged = paymentMethodFields.some(
        field => (normalizedPaymentFieldValues[field.key] ?? "") !== (originalFieldValues[field.key] ?? ""),
      );

      if (paymentDetailsChanged) {
        const updated = await updateUserPaymentMethod(selectedPaymentMethod.id, {
          field_values: normalizedPaymentFieldValues,
        });
        const updatedMethod = {
          ...selectedPaymentMethod,
          ...(updated?.data ?? {}),
          field_values: normalizedPaymentFieldValues,
        };
        setMethods(previous => previous.map(method =>
          method.id === updatedMethod.id ? updatedMethod : method,
        ));
        setPaymentFieldValues(normalizedPaymentFieldValues);
        paymentDetailsSaved = true;
      }

      const res = await generateTrade({
        type: 'sell',
        user_sell_method_id: ad.id,   // p2p_ad_id — backend validates against p2_p_ads table
        amount: Math.round(Number(ad.order_limit_min) * 1e8) / 1e8,
        market_price: marketPrice,
        payment_method_id: selectedPaymentMethod.id,
      });

      const tradeId = res?.data?.trade_id;
      if (!tradeId) throw new Error("No trade ID returned.");

      toast.success("Sell trade created successfully!");
      onClose();
      // router.push(`/dashboard/wallet/sell?trade_id=${tradeId}`);
      router.push(`/dashboard/local-buy-sell/my-orders/sell-view?trade_id=${tradeId}`);

    } catch (error: unknown) {
      const message = apiErrorMessage(error, "Failed to create trade.");
      toast.error(
        paymentDetailsSaved
          ? `Payment details were saved, but the sell request failed: ${message}`
          : message,
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="local-trade-overlay local-trade-overlay--red" role="dialog" aria-modal="true">
      <button className="rt-modal-backdrop" type="button" onClick={onClose} aria-label="Close" />

      <div className="local-trade-modal local-trade-modal--red">
        <header className="local-trade-head">
          <span className="local-trade-head-icon" aria-hidden="true">
            <i className="fa-solid fa-cart-shopping" />
            <span className="local-trade-head-badge">↑</span>
          </span>
          <div className="local-trade-head-copy">
            <h2>Create Sell Request</h2>
            <p>Sell your {assetLabel} and receive local currency.</p>
          </div>
          <button type="button" className="local-trade-close" onClick={onClose} aria-label="Close">×</button>
        </header>

        <div className="local-trade-steps" aria-label="Request progress">
          <span className="local-trade-step is-done"><b>1</b> <small>Request</small></span>
          <i className="local-trade-step-line" />
          <span className="local-trade-step is-active" aria-current="step"><b>2</b> <small>Confirm</small></span>
          <i className="local-trade-step-line" />
          <span className="local-trade-step"><b>3</b> <small>Submitted</small></span>
        </div>

        <div className="mx-1 mt-2 pt-1 height-88">
          <div className="local-trade-total-banner local-trade-total-banner--received mx-3 mb-0">
            <span className="local-trade-total-icon"><i className="fa-solid fa-hand-holding-dollar" /></span>
            <span className="local-trade-total-label text-white">
              <span>Received</span>
            </span>
            <strong className="fw-bold text-white pb-3">{money(grossReceive)} {ad.with_fiat}</strong>
          </div>
          <div className="d-flex justify-content-end">
            <small className="local-trade-sell-usd px-2 pt-1 mb-0">Sell USD = <span className="fs-10 fw-bold">${money(totalUSD)} USD</span></small>
          </div>
        </div>

        <div className="local-trade-content px-3 mx-0">
          <details className="local-trade-summary local-trade-summary--collapsible mb-3">
            <summary className="local-trade-summary-toggle">
              <h4 className="local-trade-summary-title"><i className="fa-solid fa-clipboard-list" aria-hidden="true" /> Order Summary</h4>
              <i className="fa-solid fa-chevron-down" aria-hidden="true" />
            </summary>
            <div className="local-trade-summary-rows">
              {localOrderSummaryRows({ side: "sell", fiat: ad.with_fiat, asset: ad.asset, fiatAmount: grossReceive, assetAmount: sellValue, price: marketPrice, feeAmount: feeUsdt, feePercent }).map(row => (
                <div className={`local-trade-row ${row.total ? "local-trade-row--total mx-0 local-trade-row--received" : ""}`} key={row.label}>
                  <span><i className={`fa-solid ${row.icon}`} aria-hidden="true" />{row.label}</span><b className={row.tone === "negative" ? "local-trade-negative" : row.tone === "received" ? "local-trade-positive" : undefined}>{row.value}</b>
                </div>
              ))}
            </div>
          </details>
          {selectedPaymentMethod && (
            <div className="local-trade-payment-time-card local-trade-payment-time-card--editable mt-3 mb-3" aria-live="polite">
              <div className="local-trade-payment-time-head">
                <div className="local-trade-payment-head">
                  <PaymentMethodIcon
                    className="local-trade-payment-icon"
                    methodName={selectedPaymentMethod.method_name}
                    iconImage={
                      selectedPaymentMethod.icon_url ??
                      selectedPaymentMethod.icon_image ??
                      selectedPaymentMethod.sell_method?.icon_url ??
                      selectedPaymentMethod.sell_method?.icon_image
                    }
                    size={36}
                    fallbackMode="card"
                  />
                  <span>
                    <strong>{selectedPaymentMethod.method_name}</strong>
                    <small>Edit details; changes save when you accept the request.</small>
                  </span>
                </div>
                <div className="local-trade-time-details">
                  <i className="fa-solid fa-hourglass-half ms-3" aria-hidden="true" />
                  <span className="mx-auto">
                    <span className="fs-10">Order Time Limit</span>
                    <strong className="fs-14"><b>{ad.payment_time_limit} Min</b></strong>
                  </span>
                </div>
                <i className="fa-solid fa-chevron-right local-trade-method-arrow" aria-hidden="true" />
              </div>
              <div className="local-trade-payment-details">
                {paymentMethodFields.length > 0 ? (
                  <div className="local-sell-payment-fields">
                    {paymentMethodFields.map(field => (
                      <label className="local-sell-payment-field" key={field.key}>
                        <span className="fs-10">
                          {field.label}
                          {field.required && <b aria-hidden="true"> *</b>}
                        </span>
                        <input
                          type={field.type}
                          value={paymentFieldValues[field.key] ?? ""}
                          placeholder={field.placeholder}
                          onChange={event => {
                            setPaymentFieldValues(previous => ({
                              ...previous,
                              [field.key]: event.target.value,
                            }));
                            setPaymentFieldErrors(previous => ({
                              ...previous,
                              [field.key]: "",
                            }));
                          }}
                          aria-invalid={Boolean(paymentFieldErrors[field.key])}
                        />
                        {paymentFieldErrors[field.key] && (
                          <small className="local-trade-error">{paymentFieldErrors[field.key]}</small>
                        )}
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="local-trade-payment-empty">No editable fields are configured for this payment method.</p>
                )}
              </div>
            </div>
          )}

          {ad.remarks && 
            <div className="local-trade-info mb-2 mt-2 pt-3">
                <div className="local-trade-field local-trade-field--note">
                  <span className="local-trade-label"><i className="fa-solid fa-note-sticky" /> Additional Note (Optional)</span>
                  <p className="px-3 pt-1">{ad.remarks || "No additional note provided."}</p>
                </div>
            </div>
          }

          <div className="local-trade-actions mt-3">
            <button type="button" onClick={onClose} className="btn--secondary d-flex justify-content-center">Cancel</button>
            <button type="button" className="local-trade-sell-button d-flex justify-content-center" onClick={handleSell} disabled={submitting}>
              {submitting ? 'Processing...' : <><i className="fa-solid fa-circle-check" /> Accept Request</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
