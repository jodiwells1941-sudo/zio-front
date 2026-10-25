"use client";

import { getUserPaymentMethods } from "@/app/api/common";
import { getBonusFeesSettings } from "@/app/api/merchant";
import { P2pAdsData } from "@/app/api/p2padsapi";
import { generateTrade } from "@/app/api/trade";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import "./localTradeSummary.css";

// ─── Types ────────────────────────────────────────────────────────────────────

type Props = {
  onClose: () => void;
  ad: P2pAdsData;
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function LocalSellModal({ onClose, ad }: Props) {
  const router = useRouter();

  const [sellAmount,   setSellAmount]   = useState('');
  const [receiveAmt,   setReceiveAmt]   = useState('');
  const [errors,       setErrors]       = useState<{ paymentMethodId?: string }>({});
  const [paymentMethodId, setPaymentMethodId] = useState<number>(0);
  const [submitting,   setSubmitting]   = useState(false);
  const [methods,        setMethods        ] = useState<any[]>([]);
  const [loadingMethods, setLoadingMethods] = useState(false);
  const [feePercent, setFeePercent] = useState(0);

  const loadMethods = useCallback(async () => {
    setLoadingMethods(true);
    try {
      const res = await getUserPaymentMethods();
      setMethods(res?.data ?? []);
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? e?.message ?? 'Failed to load payment methods.');
    } finally {
      setLoadingMethods(false);
    }
  }, []);
  
  useEffect(() => { loadMethods(); }, [loadMethods]);

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
    const minCrypto = ad?.order_limit_min ?? 0;
    setSellAmount(String(minCrypto));
    setReceiveAmt((minCrypto * ad.fixed_price).toFixed(2));
    setErrors({});
  }, [ad]);

  // ─── Sell fee summary calculation ───────────────────────────────────────────
  const grossReceive = Number(receiveAmt) || 0;
  const sellValue     = Number(sellAmount || 0);
  const feeUsdt = (sellValue * feePercent) / 100;
  const totalUsdtWithFee = sellValue + feeUsdt;
  const money = (amount: number) => amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const paymentDetails = Object.entries(ad.payment_method?.field_values ?? {})
    .filter(([key, value]) => Boolean(value?.trim()) && /(number|wallet|phone|mobile|account)/i.test(key))
    .map(([key, value]) => ({
      label: key
        .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
        .replace(/[_-]/g, " ")
        .replace(/\b\w/g, character => character.toUpperCase()),
      value,
    }));

  // ─── Submit ────────────────────────────────────────────────────────────────

  const handleSell = async () => {
    const cryptoQty = parseFloat(String(sellAmount).replace(/,/g, "").trim());

    if (paymentMethodId === 0) {
      setErrors({ paymentMethodId: 'Please select a payment method.' });
      toast.error('Please select a payment method.');
      return;
    } else {
      setErrors({});
    }

    if (isNaN(cryptoQty) || cryptoQty <= 0) {
      toast.error("Please enter a valid amount.");
      return;
    }

    if (cryptoQty < ad.order_limit_min || cryptoQty > ad.order_limit_max) {
      toast.error(
        `Amount must be between ${ad.order_limit_min} and ${ad.order_limit_max} ${ad.asset}`,
      );
      return;
    }

    setSubmitting(true);
    try {
      const res = await generateTrade({
        type: 'sell',
        user_sell_method_id: ad.id,   // p2p_ad_id — backend validates against p2_p_ads table
        amount: Math.round(cryptoQty * 1e8) / 1e8,
        payment_method_id: paymentMethodId,
      });

      const tradeId = res?.data?.trade_id;
      if (!tradeId) throw new Error("No trade ID returned.");

      toast.success("Sell trade created successfully!");
      onClose();
      // router.push(`/dashboard/wallet/sell?trade_id=${tradeId}`);
      router.push(`/dashboard/local-buy-sell/my-orders/sell-view?trade_id=${tradeId}`);

    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? e?.message ?? "Failed to create trade.");
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
            <p>Sell your {ad.asset} and receive local currency.</p>
          </div>
          <button type="button" className="local-trade-close" onClick={onClose} aria-label="Close">×</button>
        </header>

        <div className="local-trade-steps" aria-label="Request progress">
          <span className="local-trade-step is-done"><b>1</b> <small>Request Details</small></span>
          <i className="local-trade-step-line" />
          <span className="local-trade-step is-active" aria-current="step"><b>2</b> <small>Confirm</small></span>
          <i className="local-trade-step-line" />
          <span className="local-trade-step"><b>3</b> <small>Submitted</small></span>
        </div>

        <div className="local-trade-content">
          <div className="local-trade-summary">
            <h4 className="local-trade-summary-title">Order Summary</h4>
            <div className="local-trade-row"><span>Currency</span><b>{ad.with_fiat}</b></div>
            <div className="local-trade-row"><span>Sell Amount</span><b>{money(sellValue)} {ad.asset}</b></div>
            <div className="local-trade-row"><span>Fee ({money(feePercent)}%)</span><b className="local-trade-positive">+ {money(feeUsdt)} {ad.asset}</b></div>
            <div className="local-trade-row"><span>Total Amount</span><b>{money(totalUsdtWithFee)} {ad.asset}</b></div>
            <div className="local-trade-row"><span>Market Price (1 {ad.asset})</span><b>{money(ad.fixed_price)} {ad.with_fiat}</b></div>
            <div className="local-trade-row"><span>Received Amount ({ad.with_fiat})</span><b className="local-trade-positive">{money(grossReceive)} {ad.with_fiat}</b></div>
          </div>
          <div className="local-trade-total-banner">
            <span className="local-trade-total-icon"><i className="fa-solid fa-hand-holding-dollar" /></span>
            <span className="local-trade-total-label">Total Received Amount</span>
            <strong><span>{money(grossReceive)}</span><span>{ad.with_fiat}</span></strong>
          </div>

          <div className="local-trade-payment-details">
            <div className="local-trade-payment-head border-0 pb-0">
              <span className="local-trade-payment-icon"><i className="fa-solid fa-credit-card" /></span>
              <span>
                <strong>{ad.payment_method?.sell_method?.name ?? "Payment Method"}</strong>
                <small>{ad.with_fiat} Payment Details</small>
              </span>
            </div>
            {/* {paymentDetails.length > 0 ? (
              <dl>
                {paymentDetails.map(detail => (
                  <div className="local-trade-payment-row" key={detail.label}>
                    <dt>{detail.label}</dt>
                    <dd>{detail.value}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="local-trade-payment-empty">No payment details available.</p>
            )} */}
          </div>

          <div className="local-trade-info">
            <div className="local-trade-field">
              <span className="local-trade-label"><i className="fa-solid fa-hourglass-half" /> Order Time Limit</span>
              <b>{ad.payment_time_limit} min</b>
            </div>
            <div className="local-trade-field local-trade-field--note">
              <span className="local-trade-label"><i className="fa-solid fa-note-sticky" /> Additional Note (Optional)</span>
              <p>{ad.remarks || "No additional note provided."}</p>
            </div>
          </div>

          <div className="local-trade-field local-trade-method">
            <label className="local-trade-label" htmlFor="local-sell-payment-method">Payment Method</label>
            <select
              id="local-sell-payment-method"
              className={errors.paymentMethodId ? "is-invalid" : ""}
              value={paymentMethodId}
              onChange={event => setPaymentMethodId(Number(event.target.value))}
              disabled={loadingMethods}
            >
              <option value={0}>{loadingMethods ? "Loading..." : "Select Payment Method"}</option>
              {methods.map(method => (
                <option key={method.id} value={method.id}>
                  {method.method_name} - {method.walletNumber} {method.bankName}
                </option>
              ))}
            </select>
            {errors.paymentMethodId && <span className="local-trade-error">{errors.paymentMethodId}</span>}
          </div>
          <div className="local-trade-actions">
            <button type="button" onClick={onClose} className="btn--secondary d-flex justify-content-center">Cancel</button>
            <button type="button" className="local-trade-sell-button d-flex justify-content-center" onClick={handleSell} disabled={submitting}>
              {submitting ? 'Processing...' : 'Accept request'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
