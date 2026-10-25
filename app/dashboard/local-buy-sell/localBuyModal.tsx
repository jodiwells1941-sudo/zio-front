"use client";

import { getBonusFeesSettings } from "@/app/api/merchant";
import { P2pAdsData } from "@/app/api/p2padsapi";
import { generateTrade } from "@/app/api/trade";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "./localTradeSummary.css";

// ─── Types ────────────────────────────────────────────────────────────────────

type Props = {
  onClose: () => void;
  ad: P2pAdsData;             // full ad passed from P2PLayout
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function LocalBuyModal({ onClose, ad }: Props) {
  const router = useRouter();

  const [payAmount,   setPayAmount]   = useState('');
  const [receiveAmt,  setReceiveAmt]  = useState('');
  const [submitting,  setSubmitting]  = useState(false);
  const [bonus, setBonus] = useState(0);

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

        const configuredBonus = Number(settings?.user_buy_bonus ?? 0);
        setBonus(ad.type === "sell" && Number.isFinite(configuredBonus) ? configuredBonus : 0);
      } catch (error) {
        console.error('Failed to load bonus & fees settings:', error);
        setBonus(0);
      }
    };

    if (ad?.type) {
      loadBonusFees();
    }
  }, [ad]);

  // Auto-fill amounts from ad when modal opens and prevent manual typing
  useEffect(() => {
    const minCrypto = ad?.order_limit_min ?? 0;
    setReceiveAmt(String(minCrypto));
    setPayAmount((minCrypto * ad.fixed_price).toFixed(2));
  }, [ad]);

  // Derive "you receive" whenever user types in "you pay"

  const parseAmount = (raw: string): number => {
    const n = parseFloat(String(raw).replace(/,/g, "").trim());
    return Number.isFinite(n) ? n : Number.NaN;
  };

  const baseReceive = Number(receiveAmt) || 0;
  const bonusAmount = (baseReceive * bonus) / 100;
  const totalUsdtReceive = baseReceive + bonusAmount;
  const fiatAmount = Number(payAmount) || 0;
  const money = (amount: number) => amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  // ─── Submit ────────────────────────────────────────────────────────────────

  const handleBuy = async () => {
    // ── Required field validation ──────────────────────────────────────────
    if (!payAmount.trim() || !(parseAmount(payAmount) > 0)) {
      toast.error('Please enter how much you pay and how much crypto you receive.');
      return;
    }
    if (!receiveAmt.trim() || !(parseAmount(receiveAmt) > 0)) {
      toast.error('Please enter how much you pay and how much crypto you receive.');
      return;
    }

    const payFiat = parseAmount(payAmount);
    const recvCrypto = parseAmount(receiveAmt);
    let assetQty = Number.NaN;
    if (payFiat > 0) {
      assetQty = payFiat / ad.fixed_price;
    } else if (recvCrypto > 0) {
      assetQty = recvCrypto;
    }

    if (!(assetQty > 0)) {
      toast.error("Please enter how much you pay or how much crypto you receive.");
      return;
    }
    if (assetQty < ad.order_limit_min || assetQty > ad.order_limit_max) {
      toast.error(
        `Amount must be between ${ad.order_limit_min} and ${ad.order_limit_max} ${ad.asset}`,
      );
      return;
    }
    if (!ad.payment_method?.id) {
      toast.error("This ad has no payment method.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await generateTrade({
        type: 'buy',
        user_sell_method_id: ad.id,
        amount: Math.round(assetQty * 1e8) / 1e8,
      });

      const tradeId = res?.data?.trade_id;
      if (!tradeId) throw new Error("No trade ID returned.");

      toast.success("Trade created successfully!");
      onClose();
      // router.push(`/dashboard/wallet/p2p/?trade_id=${tradeId}`);
      router.push(`/dashboard/local-buy-sell/my-orders/buy-view?trade_id=${tradeId}`);

    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? e?.message ?? "Failed to create trade.");
    } finally {
      setSubmitting(false);
    }
  };

  const methodName = ad.payment_method?.sell_method?.name ?? "Payment Method";
  const paymentDetails = Object.entries(ad.payment_method?.field_values ?? {})
    .filter(([key, value]) => Boolean(value?.trim()) && /(number|wallet|phone|mobile|account)/i.test(key))
    .map(([key, value]) => ({
      label: key
        .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
        .replace(/[_-]/g, " ")
        .replace(/\b\w/g, character => character.toUpperCase()),
      value,
    }));

  return (
    <div className="local-trade-overlay local-trade-overlay--green" role="dialog" aria-modal="true">
      <button className="rt-modal-backdrop" type="button" onClick={onClose} aria-label="Close" />

      <div className="local-trade-modal local-trade-modal--green">
        <header className="local-trade-head">
          <span className="local-trade-head-icon" aria-hidden="true">
            <i className="fa-solid fa-cart-shopping" />
            <span className="local-trade-head-badge">+</span>
          </span>
          <div className="local-trade-head-copy">
            <h2>Create Buy Request</h2>
            <p>Buy {ad.asset} from trusted sellers and add it to your wallet.</p>
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
            <div className="local-trade-row"><span>Amount</span><b>{money(fiatAmount)} {ad.with_fiat}</b></div>
            <div className="local-trade-row"><span>Market Price (1 {ad.asset})</span><b>{money(ad.fixed_price)} {ad.with_fiat}</b></div>
            <div className="local-trade-row"><span>{ad.asset} Amount</span><b>{money(baseReceive)} {ad.asset}</b></div>
            {ad.type === "sell" && (
              <div className="local-trade-row"><span>Bonus</span><b className="local-trade-positive">+ {money(bonusAmount)} {ad.asset}</b></div>
            )}
            <div className="local-trade-row local-trade-row--total"><span>Total You Will Receive</span><b>{money(totalUsdtReceive)} {ad.asset}</b></div>
          </div>
          <div className="local-trade-total-banner">
            <span className="local-trade-total-icon"><i className="fa-solid fa-sack-dollar" /></span>
            <span className="local-trade-total-label">Pay Amount</span>
            <strong>{money(fiatAmount)} {ad.with_fiat}</strong>
          </div>
          <div className="local-trade-payment-details">
            <div className="local-trade-payment-head border-0 pb-0">
              <span className="local-trade-payment-icon"><i className="fa-solid fa-credit-card" /></span>
              <span>
                <strong>{methodName}</strong>
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
              <p className="local-trade-payment-empty">No payment number available.</p>
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
          <div className="local-trade-actions">
            <button type="button" onClick={onClose} className="btn--secondary d-flex justify-content-center">Cancel</button>
            <button type="button" className="btn--primary d-flex justify-content-center" onClick={handleBuy} disabled={submitting}>
              {submitting ? 'Processing...' : 'Accept request'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}