// "use client";

// import Link from "next/link";
// import React, { useEffect } from "react";

// type Props = {
//   onClose: () => void;
// };

// export default function BuySellPendingModel({ onClose }: Props) {
//   useEffect(() => {
//     const onKeyDown = (e: KeyboardEvent) => {
//       if (e.key === "Escape") onClose();
//     };
//     window.addEventListener("keydown", onKeyDown);
//     return () => window.removeEventListener("keydown", onKeyDown);
//   }, [onClose]);

//   return (
//     <div className="rt-modal-overlay overflow-auto mb-5 mb-md-0" role="dialog" aria-modal="true">
//       <button className="rt-modal-backdrop" type="button" onClick={onClose} aria-label="Close" />

//       <div className="rt-modal bg-dark overflow-auto mt-200 mt-md-0">
//         <div className="rt-modal-head">
//           <h6 className="rt-modal-title">Pending Transaction</h6>
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
//                   বিকাশে ক্যাশ ইন করা হয়।
//                 </div>
//               </div>

//               <div className="footerBtns d-md-none mt-2">
//                 <button type="button" onClick={onClose} className="rounded-pill border px-4 border-danger text-white py-2 d-flex align-items-center justify-content-center " data-bs-dismiss="modal">
//                   Cancel
//                 </button>
//                 <Link href={'/dashboard/wallet/sell'} type="button" className="bg-danger rounded-pill py-2 text-sm d-flex align-items-center justify-content-center w-100">
//                   Sell USDT
//                 </Link>
//               </div>
//             </div>

//             {/* RIGHT PANEL */}
//             <div className="right order-1 order-md-2">
//               <div className="priceLine">
//                 <span className="priceLabel">Price</span>
//                 <span className="priceValue text-danger">126.22 BDT</span>
//                 <button className="refreshBtn text-center px-1" type="button" aria-label="refresh">
//                   ↻
//                 </button>
//               </div>
//               <div className="priceLine pt-0">
//                 <span className="priceLabel">Processing Fee</span>
//                 <span className="fw-6 text-light text-sm">0.06 USDT <i className="fa-regular fa-circle-question text-xs text-light-dark ms-2" /></span>
//               </div>

//               <div className="card">
//                 <div className="apr">You Sell</div>
//                 <div className="inputWrap">
//                   <input
//                     type="number"
//                     className="input text-light placeholder-texr-color"
//                     placeholder="10.11"
//                     aria-label="You Sell"
//                   />
//                   <div className="inputRight">
//                     <button className="allBtn" type="button">
//                       All
//                     </button>
//                     <span className="currency"><i className="fa-solid fa-coins iconWhite" /></span>
//                     <span className="ccyText">USDT</span>
//                   </div>
//                 </div>
//               </div>

//               <div className="card">
//                 <div className="apr">You Receive</div>
//                 <div className="inputWrap">
//                   <input disabled
//                     type="number"
//                     className="input text-light placeholder-texr-color"
//                     placeholder="10.11"
//                     aria-label="You Receive"
//                   />
//                   <div className="inputRight">
//                     <span className="currency">৳</span>
//                     <span className="ccyText">BDT</span>
//                   </div>
//                 </div>
//                 <div className="text-sm fw-6 text-danger pt-3 ">
//                   Order Limits: TK.6000 - TK.6787.89
//                 </div>
//               </div>

//               <div className="form-group-custom mt-3">
//                 <span className="pb-1 fw-5">Pyment Method:</span>
//                 <select className="select-custom form-control-custom rounded-4">
//                   <option>Bkash</option>
//                   <option>Nogad</option>
//                 </select>
//                 <small className="text-warning p-1 fw-6">017-00000000</small>
//               </div>

//               <div className="d-none d-md-block mt-5">
//                 <div className="footerBtns">
//                   <button type="button" onClick={onClose} className="rounded-pill border px-4 border-danger text-white py-2 d-flex align-items-center justify-content-center " data-bs-dismiss="modal">
//                     Cancel
//                   </button>
//                   <Link href={'/dashboard/wallet/sell'} type="button" className="bg-danger rounded-pill py-2 text-sm d-flex align-items-center justify-content-center w-100">
//                     Sell USDT
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

import { getUserPaymentMethods } from "@/app/api/common";
import { P2pAdsData } from "@/app/api/p2padsapi";
import { generateTrade } from "@/app/api/trade";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";

// ─── Types ────────────────────────────────────────────────────────────────────

type Props = {
  onClose: () => void;
  ad: P2pAdsData;
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function BuySellPendingModel({ onClose, ad }: Props) {
  const router = useRouter();

  const [sellAmount,   setSellAmount]   = useState('');
  const [receiveAmt,   setReceiveAmt]   = useState('');
  const [errors,       setErrors]       = useState<{ paymentMethodId?: string }>({});
  const [paymentMethodId, setPaymentMethodId] = useState<number>(0);
  const [submitting,   setSubmitting]   = useState(false);
  const [methods,        setMethods]        = useState<any[]>([]);
  const [loadingMethods, setLoadingMethods] = useState(false);


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

  const handleAll = () => setSellAmount(String(ad.total_amount));

  const sellerName   = ad.user?.name          ?? 'Unknown';
  const sellerAvatar = ad.user?.avatar         ?? '';
  const methodName   = ad.payment_method?.sell_method?.name
                    ?? ad.payment_method?.sell_method?.name
                    ?? 'N/A';
  // const walletNumber = ad.payment_method?.sell_method?.walletNumber ?? ad.payment_method?.bankName ?? '';
  const walletNumber = ad.payment_method?.field_values?.walletNumber ?? ad.payment_method?.field_values?.bankName ?? '';

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
      router.push(`/dashboard/wallet/sell?trade_id=${tradeId}`);
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? e?.message ?? "Failed to create trade.");
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="rt-modal-overlay overflow-auto mb-5 mb-md-0" role="dialog" aria-modal="true">
      <button className="rt-modal-backdrop" type="button" onClick={onClose} aria-label="Close" />

      <div className="rt-modal bg-dark overflow-auto mt-200 mt-md-0">
        <div className="rt-modal-head">
          <h6 className="rt-modal-title">Sell {ad.asset}</h6>
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
                    {ad.order_limit_min.toLocaleString()} – {ad.order_limit_max.toLocaleString()} {ad.with_fiat}
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

              {/* Mobile footer */}
              <div className="footerBtns d-md-none mt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-pill border px-4 border-danger text-white py-2 d-flex align-items-center justify-content-center"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="bg-danger rounded-pill py-2 text-sm d-flex align-items-center justify-content-center w-100"
                  onClick={handleSell}
                  disabled={submitting}
                >
                  {submitting ? 'Processing...' : `Sell ${ad.asset}`}
                </button>
              </div>
            </div>

            {/* ── RIGHT PANEL ── */}
            <div className="right order-1 order-md-2">
              <div className="priceLine">
                <span className="priceLabel">Price</span>
                <span className="priceValue text-danger">{ad.fixed_price.toFixed(2)} {ad.with_fiat}</span>
                <button className="refreshBtn text-center px-1" type="button" aria-label="refresh">↻</button>
              </div>

              {/* You Sell */}
              <div className="card">
                <div className="apr">You Sell</div>
                <div className="inputWrap">
                  <input
                    type="number"
                    className="input text-light placeholder-texr-color"
                    placeholder={`${ad.order_limit_min} - ${ad.order_limit_max}`}
                    value={sellAmount}
                    onChange={e => {
                      setSellAmount(e.target.value);
                      setReceiveAmt((Number(e.target.value) * ad.fixed_price).toFixed(2));
                    }}
                    aria-label="You Sell"
                  />
                  <div className="inputRight">
                    <button className="allBtn" type="button" onClick={handleAll}>All</button>
                    <span className="currency"><i className="fa-solid fa-coins iconWhite" /></span>
                    <span className="ccyText">{ad.asset}</span>
                  </div>
                </div>
              </div>

              {/* You Receive */}
              <div className="card">
                <div className="apr">You Receive</div>
                <div className="inputWrap">
                  <input
                    type="number"
                    className="input text-light placeholder-texr-color"
                    value={receiveAmt}
                    onChange={e => {
                      setReceiveAmt(e.target.value);
                      setSellAmount((Number(e.target.value) / ad.fixed_price).toFixed(2));
                    }}
                    placeholder="0.00"
                    aria-label="You Receive"
                  />
                  <div className="inputRight">
                    <span className="currency">৳</span>
                    <span className="ccyText">{ad.with_fiat}</span>
                  </div>
                </div>
                <div className="text-sm fw-6 text-danger pt-3">
                  Order Limits: {ad.with_fiat} {(ad.order_limit_min * ad.fixed_price).toFixed(2)} – {ad.with_fiat} {(ad.order_limit_max * ad.fixed_price).toFixed(2)}
                </div>
              </div>

              {/* Payment Method */}
              <div className="form-group-custom mt-3">
                <span className="pb-1 fw-5">Buyer payment Method:</span>
                <div className="form-control-custom rounded-4 d-flex align-items-center gap-2 px-3">
                  <span><i className="fa-solid fa-building-columns" /></span>
                  <span>{methodName}</span>
                </div>
                {/* {walletNumber && (
                  <small className="text-warning p-1 fw-6">{walletNumber}</small>
                )} */}
              </div>


              {/* Select Payment Method */}
              <Link href="/dashboard/p2p-profile/" className="text-sm text-primary mt-2 inline-block">
                {methods.length === 0 ? 'Add a payment method to proceed' : 'Select a different payment method'}
              </Link>
              <div className="mb-4 w-100">
                <label>Select Payment Method <span className="text-danger fs-4">*</span></label>
                <select
                  className={`select-custom form-control-custom w-100 ${errors.paymentMethodId ? 'is-invalid' : ''}`}
                  value={paymentMethodId}
                  onChange={e => setPaymentMethodId(Number(e.target.value))}
                  disabled={loadingMethods}
                >
                  <option value={0}>{loadingMethods ? 'Loading...' : 'Select Payment Method'}</option>
                  {methods.map(m => (
                    <option key={m.id} value={m.id}>
                      {m?.method_name} - {m?.walletNumber} {m?.bankName}
                    </option>
                  ))}
                </select>
                {errors.paymentMethodId && (
                  <div className="invalid-feedback d-block">{errors.paymentMethodId}</div>
                )}
              </div>


              {/* Desktop footer */}
              <div className="d-none d-md-block mt-5">
                <div className="footerBtns">
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-pill border px-4 border-danger text-white py-2 d-flex align-items-center justify-content-center"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="bg-danger rounded-pill py-2 text-sm d-flex align-items-center justify-content-center w-100"
                    onClick={handleSell}
                    disabled={submitting}
                  >
                    {submitting ? 'Processing...' : `Sell ${ad.asset}`}
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

