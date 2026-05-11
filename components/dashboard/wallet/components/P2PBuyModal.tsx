// "use client";

// import Link from "next/link";
// import React, { useEffect } from "react";

// type Props = {
//   onClose: () => void;
// };

// export default function P2PBuyModal({ onClose }: Props) {
//   useEffect(() => {
//     const onKeyDown = (e: KeyboardEvent) => {
//       if (e.key === "Escape") onClose();
//     };
//     window.addEventListener("keydown", onKeyDown);
//     return () => window.removeEventListener("keydown", onKeyDown);
//   }, [onClose]);

//   return (
//     <div className="rt-modal-overlay overflow-auto my-5 mb-md-0 " role="dialog" aria-modal="true">
//       <button className="rt-modal-backdrop" type="button" onClick={onClose} aria-label="Close" />

//       <div className="rt-modal bg-dark overflow-auto mt-200 mt-md-0">
//         <div className="rt-modal-head">
//           <h6 className="rt-modal-title">Buy USD</h6>
//           <button type="button" className="rt-modal-x" onClick={onClose} aria-label="Close">
//             ✕
//           </button>
//         </div>

//         <div className="rt-modal-body">
//           <div className="bodyWrap">
            
//             {/* LEFT PANEL */}
//             <div className="left order-2 order-md-1">
//               <div className="leftHeader">
//                 <div className="avatar">A</div>
//                 <div className="userBlock">
//                   <div className="userTop">
//                     <span className="userName">Abdullah_Avee</span>
//                     <span className="badgeDot" title="verified" />
//                   </div>
//                   <div className="userMeta">
//                     <span className="text-xs text-secondary"><i className="fa-solid fa-thumbs-up iconWhite" /></span>
//                     <span className="perc">98.68%</span>
//                   </div>
//                 </div>
//               </div>

//               <div className="stats">
//                 <div className="d-flex align-items-center justify-content-between">
//                   <span className="text-white-50 text-lg">Orders</span>
//                   <span className="val">98.20%</span>
//                 </div>
//                 <div className="d-flex align-items-center justify-content-between">
//                   <span className="text-white-50 text-lg">Completion</span>
//                   <span className="val">272 orders</span>
//                 </div>
//                 <div className="d-flex align-items-center justify-content-between">
//                   <span className="text-white-50 text-lg">Payment Time Limit</span>
//                   <span className="val">15 min</span>
//                 </div>
//                 <div className="d-flex align-items-center justify-content-between">
//                   <span className="text-white-50 text-lg">Avg. Release Time</span>
//                   <span className="val">1.56 Minutes</span>
//                 </div>
//                 <div className="d-flex align-items-center justify-content-between">
//                   <span className="text-white-50 text-lg">Available</span>
//                   <span className="val">149.31 USDT</span>
//                 </div>
//                 <div className="d-flex align-items-center justify-content-between">
//                   <span className="text-white-50 text-lg">Positive Feedback</span>
//                   <span className="val">
//                     <span className="text-xs text-secondary"><i className="fa-solid fa-thumbs-up iconWhite" /></span> 98.68%
//                   </span>
//                 </div>
//               </div>

//               <div className="termsBox">
//                 <div className="termsTitle">
//                   Advertiser&apos;s Terms (Please read carefully)
//                 </div>
//                 <div className="termsText">
//                   শুধুমাত্র পার্সোনাল নাম্বার পেমেন্ট নেওয়া হয়
//                 </div>
//               </div>

//               <div className="footerBtns d-md-none mt-2">
//                 <button type="button" onClick={onClose} className="btn--secondary py-2 d-flex align-items-center justify-content-center " data-bs-dismiss="modal">
//                   Cancel
//                 </button> 
                
//                 <Link href={'/dashboard/wallet/p2p/'} type="button" className="btn--primary py-2 text-sm d-flex align-items-center justify-content-center w-100">
//                   Buy USDT
//                 </Link>
//               </div>
//             </div>

//             {/* RIGHT PANEL */}
//             <div className="right order-1 order-md-2">
//               <div className="priceLine">
//                 <span className="priceLabel">Price</span>
//                 <span className="priceValue">126.22 BDT</span>
//                 <button className="refreshBtn text-center px-1" type="button" aria-label="refresh">
//                   ↻
//                 </button>
//               </div>

//               <div className="card">
//                 <div className="apr">You Pay</div>
//                 <div className="inputWrap">
//                   <input
//                     className="input text-light placeholder-texr-color"
//                     placeholder="15,000 - 18,846"
//                     aria-label="you pay"
//                   />
//                   <div className="inputRight">
//                     <button className="allBtn" type="button">
//                       All
//                     </button>
//                     <span className="currency">৳</span>
//                     <span className="ccyText">BDT</span>
//                   </div>
//                 </div>
//               </div>

//               <div className="card">
//                 <div className="cardLabel">
//                   <span className="apr">You Receive</span>
//                 </div>
//                 <div className="inputWrap">
//                   <input className="input" defaultValue="0.00" aria-label="you receive" readOnly />
//                   <div className="inputRight">
//                     <span className="usdtIcon"><i className="fa-solid fa-coins iconWhite" /></span>
//                     <span className="ccyText">USDT</span>
//                   </div>
//                 </div>
//               </div>

//               <div className="methodRow">
//                 <span className="fw-5 pb-1">Payment Method:</span>
//                 <div className="methodChip">
//                   <span className="methodIcon">i</span>
//                   <span>bKash</span>
//                 </div>
//               </div>

//               <div className="d-none d-md-block mt-5">
//                 <div className="footerBtns">
//                   <button type="button" onClick={onClose} className="btn--secondary py-2 d-flex align-items-center justify-content-center " data-bs-dismiss="modal">
//                     Cancel
//                   </button> 
                  
//                   <Link href={'/dashboard/wallet/p2p/'} type="button" className="btn--primary py-2 text-sm d-flex align-items-center justify-content-center w-100">
//                     Buy USDT
//                   </Link>
//                 </div>
//               </div>
//             </div>

//           </div>
//         </div>
//       </div>
//      </div>
//   );
// }



"use client";

import { P2pAdsData } from "@/app/api/p2padsapi";
import { generateTrade } from "@/app/api/trade";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

// ─── Types ────────────────────────────────────────────────────────────────────

type Props = {
  onClose: () => void;
  ad: P2pAdsData;             // full ad passed from P2PLayout
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function P2PBuyModal({ onClose, ad }: Props) {
  const router = useRouter();

  const [payAmount,   setPayAmount]   = useState('');
  const [receiveAmt,  setReceiveAmt]  = useState('');
  const [submitting,  setSubmitting]  = useState(false);

  // Close on Escape
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  // Derive "you receive" whenever user types in "you pay"

  const parseAmount = (raw: string): number => {
    const n = parseFloat(String(raw).replace(/,/g, "").trim());
    return Number.isFinite(n) ? n : Number.NaN;
  };

  // Max crypto (asset) the ad allows; sync fiat from price.
  const handleAll = () => {
    const maxCrypto = ad.order_limit_max;
    setReceiveAmt(String(maxCrypto));
    setPayAmount((maxCrypto * ad.fixed_price).toFixed(2));
  };

  // ─── Submit ────────────────────────────────────────────────────────────────

  const handleBuy = async () => {
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
      router.push(`/dashboard/wallet/p2p/?trade_id=${tradeId}`);
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? e?.message ?? "Failed to create trade.");
    } finally {
      setSubmitting(false);
    }
  };

  const sellerName   = ad.user?.name          ?? 'Unknown';
  const sellerAvatar = ad.user?.avatar         ?? '';
  const methodName   = ad.payment_method?.sell_method?.name ?? ad.payment_method?.sell_method?.name ?? 'N/A';
  // const methodName   = ad.payment_method?.field_values?.name ?? ad.payment_method?.field_values?.name ?? 'N/A';

  return (
    <div className="rt-modal-overlay overflow-auto my-5 mb-md-0" role="dialog" aria-modal="true">
      <button className="rt-modal-backdrop" type="button" onClick={onClose} aria-label="Close" />

      <div className="rt-modal bg-dark overflow-auto mt-200 mt-md-0">
        <div className="rt-modal-head">
          <h6 className="rt-modal-title">Buy {ad.asset}</h6>
          <button type="button" className="rt-modal-x" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="rt-modal-body">
          <div className="bodyWrap">

            {/* ── LEFT PANEL ── */}
            <div className="left order-2 order-md-1">
              <div className="leftHeader">
                <div className="avatar">
                  {sellerAvatar
                    ? <img src={sellerAvatar} width={32} height={32} className="rounded-circle" alt="avatar" />
                    : sellerName.charAt(0).toUpperCase()
                  }
                </div>
                <div className="userBlock">
                  <div className="userTop">
                    <span className="userName">{sellerName}</span>
                    <span className="badgeDot" title="verified" />
                  </div>
                  <div className="userMeta">
                    <span className="text-xs text-secondary">
                      <i className="fa-solid fa-thumbs-up iconWhite" />
                    </span>
                    <span className="perc">—</span>
                  </div>
                </div>
              </div>

              <div className="stats">
                <div className="d-flex align-items-center justify-content-between">
                  <span className="text-white-50 text-lg">Payment Time Limit</span>
                  <span className="val">{ad.payment_time_limit} min</span>
                </div>
                <div className="d-flex align-items-center justify-content-between">
                  <span className="text-white-50 text-lg">Available</span>
                  <span className="val">{ad.total_amount} {ad.asset}</span>
                </div>
                <div className="d-flex align-items-center justify-content-between">
                  <span className="text-white-50 text-lg">Order Limit</span>
                  <span className="val">
                    {ad.order_limit_min.toLocaleString()} – {ad.order_limit_max.toLocaleString()} {ad.asset}
                  </span>
                </div>
                <div className="d-flex align-items-center justify-content-between">
                  <span className="text-white-50 text-lg">Price Type</span>
                  <span className="val">{ad.price_type === 'fixed' ? 'Fixed' : 'Floating'}</span>
                </div>
              </div>

              {ad.remarks && (
                <div className="termsBox">
                  <div className="termsTitle">Advertiser&apos;s Terms (Please read carefully)</div>
                  <div className="termsText">{ad.remarks}</div>
                </div>
              )}

              {/* Mobile footer buttons */}
              <div className="footerBtns d-md-none mt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn--secondary py-2 d-flex align-items-center justify-content-center"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn--primary py-2 text-sm d-flex align-items-center justify-content-center w-100"
                  onClick={handleBuy}
                  disabled={submitting}
                >
                  {submitting ? 'Processing...' : `Buy ${ad.asset}`}
                </button>
              </div>
            </div>

            {/* ── RIGHT PANEL ── */}
            <div className="right order-1 order-md-2">
              <div className="priceLine">
                <span className="priceLabel">Price</span>
                <span className="priceValue">{ad.fixed_price.toFixed(2)} {ad.with_fiat}</span>
                <button className="refreshBtn text-center px-1" type="button" aria-label="refresh">↻</button>
              </div>

              {/* You Pay */}
              <div className="card">
                <div className="apr">You Pay</div>
                <div className="inputWrap">
                  <input
                    className="input text-light placeholder-texr-color"
                    placeholder={`${(ad.order_limit_min * ad.fixed_price).toFixed(2)} - ${(ad.order_limit_max * ad.fixed_price).toFixed(2)}`}
                    type="number"
                    value={payAmount}
                    onChange={e => {
                      setPayAmount(e.target.value);
                      setReceiveAmt((Number(e.target.value) / ad.fixed_price).toFixed(2));
                    }}
                    aria-label="you pay"
                  />
                  <div className="inputRight">
                    <button className="allBtn" type="button" onClick={handleAll}>All</button>
                    <span className="ccyText">{ad.with_fiat}</span>
                  </div>
                </div>
              </div>

              {/* You Receive */}
              <div className="card">
                <div className="cardLabel">
                  <span className="apr">You Receive</span>
                </div>
                <div className="inputWrap">
                  <input
                    className="input text-light placeholder-texr-color"
                    value={receiveAmt}
                    aria-label="you receive"
                    onChange={e => {
                      setReceiveAmt(e.target.value);
                      setPayAmount((Number(e.target.value) * ad.fixed_price).toFixed(2));
                    }}
                    placeholder={`${ad.order_limit_min} - ${ad.order_limit_max}`}
                  />
                  <div className="inputRight">
                    <span className="usdtIcon"><i className="fa-solid fa-coins iconWhite" /></span>
                    <span className="ccyText">{ad.asset}</span>
                  </div>
                </div>
              </div>

              <div className="methodRow">
                <span className="fw-5 pb-1">Payment Method:</span>
                <div className="methodChip py-3">
                  <span className="methodIcon">i</span>
                  <span>{methodName}</span>
                </div>
              </div>

              {/* Desktop footer buttons */}
              <div className="d-none d-md-block mt-5">
                <div className="footerBtns">
                  <button
                    type="button"
                    onClick={onClose}
                    className="btn--secondary py-2 d-flex align-items-center justify-content-center"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn--primary py-2 text-sm d-flex align-items-center justify-content-center w-100"
                    onClick={handleBuy}
                    disabled={submitting}
                  >
                    {submitting ? 'Processing...' : `Buy ${ad.asset}`}
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}