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
  const feeFiat = (grossReceive * feePercent) / 100;
  const totalFiatReceive = Math.max(grossReceive - feeFiat, 0);
  const money = (amount: number) => amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

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
        <div className="rt-modal-head">
          <h6 className="rt-modal-title">Sell {ad.asset}</h6>
          <button type="button" className="rt-modal-x" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="local-trade-content">
          <div className="local-trade-summary">
            <h4 className="local-trade-summary-title">Order Summary</h4>
            <div className="local-trade-row"><span>Currency</span><b>{ad.with_fiat}</b></div>
            <div className="local-trade-row"><span>{ad.asset} Amount</span><b>{money(totalUsdtWithFee)} {ad.asset}</b></div>
            <div className="local-trade-row"><span>Market Price (1 {ad.asset})</span><b>{money(ad.fixed_price)} {ad.with_fiat}</b></div>
            <div className="local-trade-row"><span>Amount ({ad.with_fiat})</span><b>{money(grossReceive)} {ad.with_fiat}</b></div>
            {ad.type === "buy" && (
              <div className="local-trade-row"><span>Fee ({money(feePercent)}%)</span><b className="local-trade-negative">- {money(feeFiat)} {ad.with_fiat}</b></div>
            )}
            <div className="local-trade-row"><span>Payment Method</span><b>{ad.payment_method?.sell_method?.name ?? "N/A"}</b></div>
            <div className="local-trade-row local-trade-row--total"><span>Total You Will Receive</span><b>{money(totalFiatReceive)} {ad.with_fiat}</b></div>
          </div>
          <div className="local-trade-field">
            <span className="local-trade-label">Order Time Limit</span>
            <b>{ad.payment_time_limit} min</b>
          </div>
          <div className="local-trade-field local-trade-field--note">
            <span className="local-trade-label">Additional Note</span>
            <p>{ad.remarks || "No additional note provided."}</p>
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
            <button type="button" onClick={onClose} className="btn--secondary">Cancel</button>
            <button type="button" className="local-trade-sell-button" onClick={handleSell} disabled={submitting}>
              {submitting ? 'Processing...' : `Sell ${ad.asset}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
