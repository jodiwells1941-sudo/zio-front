"use client";

import { calculateLocalBuyBonus, getLocalBuyAdBonusTiers, type LocalBonusTier } from "@/app/api/localBonusFees";
import { P2pAdsData } from "@/app/api/p2padsapi";
import { generateTrade } from "@/app/api/trade";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "./localTradeSummary.css";
import PaymentMethodIcon from "./PaymentMethodIcon";
import { localOrderSummaryRows } from "./localOrderSummary";
import { localAdQuote } from "./localQuote";
import { useLocalTradeLimits } from "./useLocalTradeLimits";

// ─── Types ────────────────────────────────────────────────────────────────────

type Props = {
  onClose: () => void;
  ad: P2pAdsData;             // full ad passed from P2PLayout
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function LocalBuyModal({ onClose, ad }: Props) {
  const router = useRouter();
  const marketPrice = Number(ad.market_price ?? 0);
  const { limits: tradeLimits, loading: limitsLoading } = useLocalTradeLimits();

  const [payAmount,   setPayAmount]   = useState('');
  const [receiveAmt,  setReceiveAmt]  = useState('');
  const [submitting,  setSubmitting]  = useState(false);
  const [bonusTiers, setBonusTiers] = useState<LocalBonusTier[]>([]);
  const [bonusReady, setBonusReady] = useState(false);

  // Close on Escape
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  useEffect(() => {
    let active = true;
    const loadBonusTiers = async () => {
      try {
        const res = await getLocalBuyAdBonusTiers();
        if (!res?.success || !Array.isArray(res.data)) throw new Error('Unable to load buy bonus tiers.');
        if (active) {
          setBonusTiers(res.data);
          setBonusReady(true);
        }
      } catch (error) {
        console.error('Failed to load buy bonus tiers:', error);
        if (active) setBonusReady(false);
      }
    };
    void loadBonusTiers();
    return () => { active = false; };
  }, []);

  // Auto-fill amounts from ad when modal opens and prevent manual typing
  useEffect(() => {
    const quote = localAdQuote(ad, ad.order_limit_min);
    setReceiveAmt(String(Number(quote.visitorAmount.toFixed(4))));
    setPayAmount(quote.fiatAmount.toFixed(2));
  }, [ad]);

  // Derive "you receive" whenever user types in "you pay"

  const parseAmount = (raw: string): number => {
    const n = parseFloat(String(raw).replace(/,/g, "").trim());
    return Number.isFinite(n) ? n : Number.NaN;
  };

  const baseReceive = Number(receiveAmt) || 0;
  const bonusAmount = calculateLocalBuyBonus(baseReceive, bonusTiers).amount;
  const totalUSD =  baseReceive + bonusAmount;
  const fiatAmount = Number(payAmount) || 0;
  const assetLabel = ad.asset?.toUpperCase() === "USDT" ? "USD" : ad.asset;
  const money = (amount: number) => amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  // ─── Submit ────────────────────────────────────────────────────────────────

  const handleBuy = async () => {
    if (!bonusReady) {
      toast.error('Could not load the current buy bonus tiers. Please reopen this request.');
      return;
    }
    if (!Number.isFinite(marketPrice) || marketPrice <= 0) {
      toast.error('The market rate is unavailable. Refresh the ad and try again.');
      return;
    }
    if (limitsLoading || !tradeLimits) {
      toast.error('Could not load the current Buy amount limits. Please try again.');
      return;
    }
    // ── Required field validation ──────────────────────────────────────────
    if (!payAmount.trim() || !(parseAmount(payAmount) > 0)) {
      toast.error('Please enter how much you pay and how much crypto you receive.');
      return;
    }
    if (!receiveAmt.trim() || !(parseAmount(receiveAmt) > 0)) {
      toast.error('Please enter how much you pay and how much crypto you receive.');
      return;
    }

    // Orders request the ad owner's amount. The buyer receives the USD quoted
    // at the buy rate, which is less than the seller's locked USD.
    const assetQty = Number(ad.order_limit_min);

    if (!(assetQty > 0)) {
      toast.error("Please enter how much you pay or how much crypto you receive.");
      return;
    }
    if (assetQty < tradeLimits.buy.min || assetQty > tradeLimits.buy.max) {
      toast.error(`Buy amount must be between ${money(tradeLimits.buy.min)} and ${money(tradeLimits.buy.max)} USD.`);
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
        market_price: marketPrice,
      });

      const tradeId = res?.data?.trade_id;
      if (!tradeId) throw new Error("No trade ID returned.");

      toast.success("Trade created successfully!");
      onClose();
      // router.push(`/dashboard/wallet/p2p/?trade_id=${tradeId}`);
      router.push(`/dashboard/local-buy-sell/my-orders/buy-view?trade_id=${tradeId}`);

    } catch (error: unknown) {
      const apiMessage = typeof error === "object" && error !== null && "response" in error
        ? (error as { response?: { data?: { message?: unknown } } }).response?.data?.message
        : undefined;
      toast.error(typeof apiMessage === "string" ? apiMessage : error instanceof Error ? error.message : "Failed to create trade.");
    } finally {
      setSubmitting(false);
    }
  };

  const methodName = ad.payment_method?.sell_method?.name ?? "Payment Method";
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
            <p>Buy {assetLabel} from trusted sellers and add it to your wallet.</p>
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

        <div className="mx-2">
          <div className="local-trade-total-banner local-trade-total-banner--pay mx-3 mb-0">
            <span className="local-trade-total-icon"><i className="fa-solid fa-sack-dollar" /></span>
            <span className="local-trade-total-label">Pay Now</span>
            <strong className="d-flex gap-1 fw-bold">{money(fiatAmount)} {ad.with_fiat}</strong>
          </div>
          <small className="local-trade-pay-receive px-2 pt-1">Received USD = <span className="fs-10 fw-bold">${money(totalUSD)}</span></small>
        </div>

        <div className="local-trade-content mx-2">
          <details className="local-trade-summary local-trade-summary--collapsible">
            <summary className="local-trade-summary-toggle">
              <h4 className="local-trade-summary-title"><i className="fa-solid fa-clipboard-list" aria-hidden="true" /> Order Summary</h4>
              <i className="fa-solid fa-chevron-down" aria-hidden="true" />
            </summary>
            <div className="local-trade-summary-rows">
              {localOrderSummaryRows({ side: "buy", fiat: ad.with_fiat, asset: ad.asset, fiatAmount, assetAmount: baseReceive, price: marketPrice, bonusAmount }).map(row => (
                <div className={`local-trade-row ${row.total ? "local-trade-row--total" : ""}`} key={row.label}>
                  <span><i className={`fa-solid ${row.icon}`} aria-hidden="true" />{row.label}</span><b className={row.tone === "positive" ? "local-trade-positive" : undefined}>{row.value}</b>
                </div>
              ))}
            </div>
          </details>

          <div className="local-trade-payment-details">
            <div className="local-trade-payment-head border-0 pb-0">
              <PaymentMethodIcon
                className="local-trade-payment-icon"
                methodName={methodName}
                iconImage={
                  ad.payment_method?.sell_method?.icon_url ??
                  ad.payment_method?.sell_method?.icon_image
                }
                size={36}
                fallbackMode="card"
              />
              <span>
                <strong>{methodName}</strong>
                <small>{ad.with_fiat} Payment Details</small>
              </span>
            </div>
          </div>
          <div className="local-trade-info">
            <div className="local-trade-field">
              <span className="local-trade-label"><i className="fa-solid fa-hourglass-half" /> Order Time Limit</span>
              <b>{ad.payment_time_limit} min</b>
            </div>
            {ad.remarks && 
              <div className="local-trade-field local-trade-field--note">
                <span className="local-trade-label"><i className="fa-solid fa-note-sticky" /> Additional Note (Optional)</span>
                <p className="px-3 pt-1">{ad.remarks || "No additional note provided."}</p>
              </div>
            }
          </div>
          <div className="local-trade-actions">
            <button type="button" onClick={onClose} className="btn--secondary fs-6 d-flex justify-content-center">Cancel</button>
            <button type="button" className="btn--primary w-100 d-flex justify-content-center" onClick={handleBuy} disabled={submitting}>
              {submitting ? 'Processing...' : <><i className="fa-solid fa-circle-check" /> Accept Request</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
