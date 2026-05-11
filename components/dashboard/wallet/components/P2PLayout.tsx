// "use client";

// import { getAllAds, P2pAdsData } from '@/app/api/p2padsapi';
// import MyAds from '@/app/dashboard/p2p-profile/MyAds';
// import { useEffect, useState } from 'react';
// import BuySellPendingModel from '../../p2p/BuySellPendingModel';
// import type { P2PTabKey } from '../types';
// import P2PBuyModal from './P2PBuyModal';
// import P2PHeaderButton from './P2PHeaderButton';
// import P2PTabButton from './P2PTabButton';

// // ─── Types ────────────────────────────────────────────────────────────────────

// type P2PCard = {
//   id: number;
//   name: string;
//   platform: string;
//   methodName: string;
//   rate: number;
//   limit: string;
//   available: string;
//   timeText: string;
//   type: "buy" | "sell";
//   userImage: string;
//   ad: P2pAdsData;
// };

// interface PaginationMeta {
//   current_page: number;
//   last_page: number;
//   per_page: number;
//   total: number;
//   from: number;
//   to: number;
// }

// const CURRENCIES = [
//   { code: "USD", name: "US Dollar" },
//   { code: "EUR", name: "Euro" },
//   { code: "GBP", name: "British Pound" },
//   { code: "BDT", name: "Bangladeshi Taka" },
//   { code: "INR", name: "Indian Rupee" },
//   { code: "PKR", name: "Pakistani Rupee" },
//   { code: "AUD", name: "Australian Dollar" },
//   { code: "CAD", name: "Canadian Dollar" },
//   { code: "JPY", name: "Japanese Yen" },
//   { code: "CNY", name: "Chinese Yuan" },
//   { code: "CHF", name: "Swiss Franc" },
// ];

// // ─── Avatar SVG ───────────────────────────────────────────────────────────────

// function AvatarSvg({ showDot = false }: { showDot?: boolean }) {
//   return (
//     <div className={`avatar ${showDot ? 'position-relative' : ''}`}>
//       <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
//         <g clipPath="url(#clip0_153_17792)">
//           <path d="M10.5357 23.5199L6.06001 25.9613C5.79737 26.1045 5.56133 26.2805 5.34171 26.4724C7.95114 28.6726 11.3196 29.9999 15 29.9999C18.6532 29.9999 22.0002 28.6924 24.6023 26.5222C24.3623 26.3196 24.1019 26.1373 23.8132 25.9935L19.0206 23.5975C18.4013 23.2879 18.0102 22.655 18.0102 21.9628V20.0824C18.1449 19.929 18.2989 19.732 18.4636 19.4994C19.1168 18.5767 19.611 17.5618 19.9534 16.4971C20.5681 16.3075 21.021 15.7398 21.021 15.065V13.0579C21.021 12.6164 20.8245 12.2218 20.5194 11.9456V9.04409C20.5194 9.04409 21.1155 4.52881 15.0006 4.52881C8.88567 4.52881 9.48171 9.04409 9.48171 9.04409V11.9456C9.17604 12.2218 8.9802 12.6164 8.9802 13.0579V15.065C8.9802 15.5937 9.25812 16.059 9.67416 16.3279C10.1757 18.5111 11.4889 20.0824 11.4889 20.0824V21.9164C11.4883 22.5843 11.1226 23.1996 10.5357 23.5199Z" fill="#2A2D33" />
//           <path d="M15.2564 0.00223368C6.97355 -0.139276 0.143745 6.46072 0.00223515 14.7436C-0.0781422 19.44 2.01507 23.6609 5.3479 26.4679C5.56582 26.2777 5.79959 26.1034 6.0594 25.9619L10.5351 23.5205C11.122 23.2002 11.4877 22.5849 11.4877 21.9158V20.0819C11.4877 20.0819 10.1739 18.5105 9.67299 16.3273C9.25752 16.0585 8.97903 15.5937 8.97903 15.0645V13.0573C8.97903 12.6158 9.17544 12.2213 9.48054 11.9451V9.04355C9.48054 9.04355 8.8845 4.52827 14.9994 4.52827C21.1143 4.52827 20.5183 9.04355 20.5183 9.04355V11.9451C20.8239 12.2213 21.0198 12.6158 21.0198 13.0573V15.0645C21.0198 15.7392 20.567 16.3069 19.9522 16.4966C19.6098 17.5613 19.1156 18.5762 18.4624 19.4988C18.2977 19.7315 18.1437 19.9285 18.009 20.0819V21.9622C18.009 22.6545 18.4002 23.2879 19.0194 23.597L23.812 25.993C24.0996 26.1368 24.3594 26.3185 24.5988 26.5205C27.8309 23.8251 29.919 19.7949 29.9966 15.2564C30.1392 6.97355 23.5398 0.143743 15.2564 0.00223368Z" fill="white" />
//         </g>
//         <defs>
//           <clipPath id="clip0_153_17792">
//             <rect width="30" height="30" fill="white" />
//           </clipPath>
//         </defs>
//       </svg>
//       {showDot && <span className="chat-online-dot"></span>}
//     </div>
//   );
// }

// // ─── Pagination Component ─────────────────────────────────────────────────────

// function Pagination({
//   meta,
//   onPageChange,
// }: {
//   meta: PaginationMeta;
//   onPageChange: (page: number) => void;
// }) {
//   const { current_page, last_page, from, to, total } = meta;

//   // Build page numbers with ellipsis
//   const getPages = (): (number | '...')[] => {
//     if (last_page <= 7) {
//       return Array.from({ length: last_page }, (_, i) => i + 1);
//     }
//     const pages: (number | '...')[] = [1];
//     if (current_page > 3) pages.push('...');
//     const start = Math.max(2, current_page - 1);
//     const end   = Math.min(last_page - 1, current_page + 1);
//     for (let i = start; i <= end; i++) pages.push(i);
//     if (current_page < last_page - 2) pages.push('...');
//     pages.push(last_page);
//     return pages;
//   };

//   if (last_page <= 1) return null;

//   return (
//     <div className="d-flex flex-column flex-sm-row align-items-center justify-content-between gap-3 mt-4">
//       <small className="text-muted">
//         Showing <strong>{from}</strong>–<strong>{to}</strong> of <strong>{total}</strong> ads
//       </small>

//       <ul className="pagination pagination-sm mb-0">
//         {/* Prev */}
//         <li className={`page-item ${current_page === 1 ? 'disabled' : ''}`}>
//           <button
//             className="page-link"
//             onClick={() => onPageChange(current_page - 1)}
//             disabled={current_page === 1}
//             type="button"
//           >
//             <i className="fa-solid fa-chevron-left" />
//           </button>
//         </li>

//         {/* Pages */}
//         {getPages().map((page, idx) =>
//           page === '...' ? (
//             <li key={`ellipsis-${idx}`} className="page-item disabled">
//               <span className="page-link">…</span>
//             </li>
//           ) : (
//             <li key={page} className={`page-item ${current_page === page ? 'active' : ''}`}>
//               <button
//                 className="page-link"
//                 onClick={() => onPageChange(page as number)}
//                 type="button"
//               >
//                 {page}
//               </button>
//             </li>
//           )
//         )}

//         {/* Next */}
//         <li className={`page-item ${current_page === last_page ? 'disabled' : ''}`}>
//           <button
//             className="page-link"
//             onClick={() => onPageChange(current_page + 1)}
//             disabled={current_page === last_page}
//             type="button"
//           >
//             <i className="fa-solid fa-chevron-right" />
//           </button>
//         </li>
//       </ul>
//     </div>
//   );
// }

// // ─── Main Component ───────────────────────────────────────────────────────────

// export default function P2PLayout({
//   activeP2PTab,
//   setActiveP2PTab,
// }: {
//   activeP2PTab: P2PTabKey;
//   setActiveP2PTab: (v: P2PTabKey) => void;
// }) {
//   const [isModalOpen,  setIsModalOpen]  = useState(false);
//   const [buyModalOpen, setBuyModalOpen] = useState(false);
//   const [myBuySellAds, setMyBuySellAds] = useState<'allAds' | 'myAds'>('allAds');

//   const [ads,     setAds]     = useState<P2pAdsData[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [meta,    setMeta]    = useState<PaginationMeta | null>(null);
//   const [page,    setPage]    = useState(1);

//   // Filters
//   const [filterFiat,   setFilterFiat]   = useState('');
//   const [filterAmount, setFilterAmount] = useState('');
//   const [filterMethod, setFilterMethod] = useState('');

//   // ─── Map API → UI card ──────────────────────────────────────────────────────

//   const mapAdToCard = (ad: P2pAdsData): P2PCard => ({
//     id:         ad.id,
//     name:       ad.user?.name                        || 'Unknown',
//     platform:   `${ad.asset}/${ad.with_fiat}`,
//     methodName: ad.payment_method?.sell_method?.name || 'N/A',
//     rate:       ad.fixed_price,
//     limit:      `${ad.order_limit_min} - ${ad.order_limit_max} ${ad.asset}`,
//     available:  `${ad.total_amount} ${ad.asset}`,
//     timeText:   `${ad.payment_time_limit} min`,
//     type:       ad.type,
//     userImage:  ad.user?.avatar                      || '',
//     ad,
//   });

//   // ─── Fetch ──────────────────────────────────────────────────────────────────

//   const fetchAllAds = async (targetPage = 1) => {
//     try {
//       setLoading(true);
//       const type = activeP2PTab === 'wallet-balance' ? 'buy' : 'sell';
//       const res = await getAllAds({
//         type,
//         page: targetPage,
//         ...(filterFiat ? { with_fiat: filterFiat } : {}),
//       });

//       const responseData = res?.data;

//       // Laravel paginator: { data: [], current_page, last_page, per_page, total, from, to }
//       setAds(responseData?.data ?? responseData ?? []);

//       if (responseData?.current_page != null) {
//         setMeta({
//           current_page: responseData.current_page,
//           last_page:    responseData.last_page,
//           per_page:     responseData.per_page,
//           total:        responseData.total,
//           from:         responseData.from ?? 1,
//           to:           responseData.to   ?? 0,
//         });
//       } else {
//         setMeta(null);
//       }
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Reset to page 1 on tab / view / fiat change
//   useEffect(() => {
//     if (myBuySellAds === 'allAds') {
//       setPage(1);
//       fetchAllAds(1);
//     }
//   }, [activeP2PTab, myBuySellAds, filterFiat]);

//   // Re-fetch when page number changes
//   useEffect(() => {
//     if (myBuySellAds === 'allAds' && page > 1) {
//       fetchAllAds(page);
//     }
//   }, [page]);

//   const handlePageChange = (newPage: number) => {
//     setPage(newPage);
//     window.scrollTo({ top: 0, behavior: 'smooth' });
//   };

//   // ─── Client-side filter (amount + method) ──────────────────────────────────

//   const p2pCards = ads
//     .map(mapAdToCard)
//     .filter(c => {
//       const matchAmount = !filterAmount || c.rate >= parseFloat(filterAmount);
//       const matchMethod = !filterMethod || c.methodName.toLowerCase().includes(filterMethod.toLowerCase());
//       return matchAmount && matchMethod;
//     });
    
//     const [selectedAd, setSelectedAd] = useState<P2pAdsData | null>(null);    

//   // ─── Shared card renderer ───────────────────────────────────────────────────

//   const renderCard = (c: P2PCard, idx: number, isBuy: boolean) => (
//     <div key={`${c.id}-${idx}`} className="col-lg-6">
//       <div className="payment-card p-3 p-md-4">

//         <div className="card-header">
//           <div className="user-info">
//             {c.userImage ? (
//               <div className="avatar rounded-circle overflow-hidden">
//                 <img src={c.userImage} width={30} height={30} alt="avatar" />
//               </div>
//             ) : (
//               <AvatarSvg showDot={isBuy} />
//             )}
//             <div className="details">
//               <span className="name">{c.name}</span>
//               <span className="platform">{c.platform}</span>
//             </div>
//           </div>

//           <div className="payment-method">
//             <span className="method-name">{c.methodName}</span>
//             <span className="time">
//               <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                 <circle cx="12" cy="12" r="10"></circle>
//                 <polyline points="12 6 12 12 16 14"></polyline>
//               </svg>
//               {c.timeText}
//             </span>
//           </div>
//         </div>

//         <div className="card-body">
//           <div className="price-display">
//             <span className="tk-symbol">{c.ad.with_fiat}</span>
//             <span className="amount">{c.rate}</span>
//             <span className="unit">/{c.ad.asset}</span>
//           </div>
//         </div>

//         <div className="card-footer">
//           <div className="limits">
//             <small><strong>Limit:</strong> {c.limit}</small>
//             <p><strong>Available:</strong> {c.available}</p>
//           </div>
//           {isBuy ? (
//             <button type="button" className="buy-btn bg-danger text-white" onClick={() => {
//               setSelectedAd(c.ad);
//               setIsModalOpen(true);
//             }}>
//               Sell
//             </button>
//           ) : (
//             <button type="button" className="buy-btn" onClick={() => {
//               setSelectedAd(c.ad);
//               setBuyModalOpen(true);
//             }}>
//               Buy
//             </button>
//           )}
//         </div>

//       </div>
//     </div>
//   );

//   const isBuyTab = activeP2PTab === 'wallet-balance';

//   // ─── Shared content block (filters + cards + pagination) ───────────────────

//   const AdsContent = ({ isBuy }: { isBuy: boolean }) => (
//     <div className="wallet-wrap-area">

//       {/* Filters */}
//       <div className="wallet-filter-section">
//         <div className="filter-items-wrapper">

//           <div className="wallet-filter-item-group">
//             <div className="filter-header-label">
//               <span>Amount</span>
//               <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
//                 <polyline points="6 9 12 15 18 9"></polyline>
//               </svg>
//             </div>
//             <div className="wallet-dropdown-content-box px-2">
//               <div className="filter-date-row">
//                 <input
//                   className="form-control-custom filter-date-input"
//                   placeholder="Enter min amount"
//                   type="number"
//                   value={filterAmount}
//                   onChange={e => setFilterAmount(e.target.value)}
//                 />
//               </div>
//             </div>
//           </div>

//           <div className="wallet-filter-item-group">
//             <div className="filter-header-label">
//               <span>Currency Method</span>
//               <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
//                 <polyline points="6 9 12 15 18 9"></polyline>
//               </svg>
//             </div>
//             <div className="wallet-dropdown-content-box px-2">
//               <input
//                 className="form-control-custom"
//                 placeholder="Search method..."
//                 value={filterMethod}
//                 onChange={e => setFilterMethod(e.target.value)}
//               />
//             </div>
//           </div>

//         </div>
//       </div>

//       {/* Cards */}
//       {loading ? (
//         <p>Loading...</p>
//       ) : p2pCards.length === 0 ? (
//         <p className="py-5 text-center">No {isBuy ? 'buy' : 'sell'} ads found</p>
//       ) : (
//         <div className="row g-4">
//           {p2pCards.map((c, idx) => renderCard(c, idx, isBuy))}
//         </div>
//       )}

//       {/* Pagination */}
//       {!loading && meta && (
//         <Pagination meta={meta} onPageChange={handlePageChange} />
//       )}

//       <div className="wallet-order-wrap" />
//     </div>
//   );

//   // ─── Render ─────────────────────────────────────────────────────────────────

//   return (
//     <>
//       {/* ── ALL ADS ── */}
//       <div className="wallet-paymet-box-items mt-30">
//         <div className="wallet-tab-items">

//           {/* Header */}
//           <div className="d-flex gap-5 justify-content-between align-items-center mb-4">
//             <div>
//               <div className="wallet-tab-buttons mb-0">
//                 <P2PTabButton tab="wallet-add" label="Buy" activeTab={activeP2PTab} onChange={setActiveP2PTab} />
//                 <P2PTabButton tab="wallet-balance" label="Sell" activeTab={activeP2PTab} onChange={setActiveP2PTab} />
//               </div>
//             </div>

//             {/* Fiat filter → sent to backend */}
//             <div className="form-group-custom mt-3 mt-md-0">
//               <select
//                 className="select-custom form-control-custom"
//                 value={filterFiat}
//                 onChange={e => setFilterFiat(e.target.value)}
//               >
//                 <option value="">All Currencies</option>
//                 {CURRENCIES.map(c => (
//                   <option key={c.code} value={c.code}>{c.code} - {c.name}</option>
//                 ))}
//               </select>
//             </div>

//             <P2PHeaderButton />
//           </div>

//           <div className="wallet-tab-contents">
//             <div className={`wallet-tab-content ${isBuyTab ? 'active' : ''}`} id="wallet-balance">
//               <AdsContent isBuy={true} />
//             </div>
//             <div className={`wallet-tab-content ${!isBuyTab ? 'active' : ''}`} id="wallet-add">
//               <AdsContent isBuy={false} />
//             </div>
//           </div>

//         </div>
//       </div>

//       {isModalOpen && selectedAd && (
//         <BuySellPendingModel onClose={() => setIsModalOpen(false)} ad={selectedAd} />
//       )}

//       {buyModalOpen && selectedAd && (
//         <P2PBuyModal onClose={() => setBuyModalOpen(false)} ad={selectedAd} />
//       )}
//     </>
//   );
// }

"use client";

import { getAllAds, P2pAdsData } from '@/app/api/p2padsapi';
import MyAds from '@/app/dashboard/p2p-profile/MyAds';
import { useEffect, useState } from 'react';
import BuySellPendingModel from '../../p2p/BuySellPendingModel';
import type { P2PTabKey } from '../types';
import P2PBuyModal from './P2PBuyModal';
import P2PHeaderButton from './P2PHeaderButton';
import P2PTabButton from './P2PTabButton';

// ─── Types ────────────────────────────────────────────────────────────────────

type P2PCard = {
  id: number;
  name: string;
  platform: string;
  methodName: string;
  rate: number;
  limit: string;
  available: string;
  timeText: string;
  type: "buy" | "sell";
  userImage: string;
  ad: P2pAdsData;
};

interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

const CURRENCIES = [
  { code: "USD", name: "US Dollar" },
  { code: "EUR", name: "Euro" },
  { code: "GBP", name: "British Pound" },
  { code: "BDT", name: "Bangladeshi Taka" },
  { code: "INR", name: "Indian Rupee" },
  { code: "PKR", name: "Pakistani Rupee" },
  { code: "AUD", name: "Australian Dollar" },
  { code: "CAD", name: "Canadian Dollar" },
  { code: "JPY", name: "Japanese Yen" },
  { code: "CNY", name: "Chinese Yuan" },
  { code: "CHF", name: "Swiss Franc" },
];

// Predefined amount ranges — label shown in UI, min/max sent to API
const AMOUNT_RANGES = [
  { label: "0 – 20",    min: 0,    max: 20   },
  { label: "20 – 50",   min: 20,   max: 50   },
  { label: "50 – 100",  min: 50,   max: 100  },
  { label: "100 – 150", min: 100,  max: 150  },
  { label: "150 – 200", min: 150,  max: 200  },
  { label: "200 – 500", min: 200,  max: 500  },
  { label: "500 +",     min: 500,  max: 99999 },
];

// Payment methods grouped by currency — mirrors your DB seed
const PAYMENT_METHODS = [
  // BDT
  { name: "Bkash",            currency: "BDT" },
  { name: "Nagad",            currency: "BDT" },
  { name: "Rocket",           currency: "BDT" },
  // USD
  { name: "PayPal",           currency: "USD" },
  { name: "Cash App",         currency: "USD" },
  { name: "American Express", currency: "USD" },
  // EUR
  { name: "American Express", currency: "EUR" },
  // INR
  { name: "PhonePe",          currency: "INR" },
  { name: "PayTM",            currency: "INR" },
  // All currencies
  { name: "Bank Transfer",    currency: "ALL" },
];

// ─── Avatar SVG ───────────────────────────────────────────────────────────────

function AvatarSvg({ showDot = false }: { showDot?: boolean }) {
  return (
    <div className={`avatar ${showDot ? 'position-relative' : ''}`}>
      <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g clipPath="url(#clip0_153_17792)">
          <path d="M10.5357 23.5199L6.06001 25.9613C5.79737 26.1045 5.56133 26.2805 5.34171 26.4724C7.95114 28.6726 11.3196 29.9999 15 29.9999C18.6532 29.9999 22.0002 28.6924 24.6023 26.5222C24.3623 26.3196 24.1019 26.1373 23.8132 25.9935L19.0206 23.5975C18.4013 23.2879 18.0102 22.655 18.0102 21.9628V20.0824C18.1449 19.929 18.2989 19.732 18.4636 19.4994C19.1168 18.5767 19.611 17.5618 19.9534 16.4971C20.5681 16.3075 21.021 15.7398 21.021 15.065V13.0579C21.021 12.6164 20.8245 12.2218 20.5194 11.9456V9.04409C20.5194 9.04409 21.1155 4.52881 15.0006 4.52881C8.88567 4.52881 9.48171 9.04409 9.48171 9.04409V11.9456C9.17604 12.2218 8.9802 12.6164 8.9802 13.0579V15.065C8.9802 15.5937 9.25812 16.059 9.67416 16.3279C10.1757 18.5111 11.4889 20.0824 11.4889 20.0824V21.9164C11.4883 22.5843 11.1226 23.1996 10.5357 23.5199Z" fill="#2A2D33" />
          <path d="M15.2564 0.00223368C6.97355 -0.139276 0.143745 6.46072 0.00223515 14.7436C-0.0781422 19.44 2.01507 23.6609 5.3479 26.4679C5.56582 26.2777 5.79959 26.1034 6.0594 25.9619L10.5351 23.5205C11.122 23.2002 11.4877 22.5849 11.4877 21.9158V20.0819C11.4877 20.0819 10.1739 18.5105 9.67299 16.3273C9.25752 16.0585 8.97903 15.5937 8.97903 15.0645V13.0573C8.97903 12.6158 9.17544 12.2213 9.48054 11.9451V9.04355C9.48054 9.04355 8.8845 4.52827 14.9994 4.52827C21.1143 4.52827 20.5183 9.04355 20.5183 9.04355V11.9451C20.8239 12.2213 21.0198 12.6158 21.0198 13.0573V15.0645C21.0198 15.7392 20.567 16.3069 19.9522 16.4966C19.6098 17.5613 19.1156 18.5762 18.4624 19.4988C18.2977 19.7315 18.1437 19.9285 18.009 20.0819V21.9622C18.009 22.6545 18.4002 23.2879 19.0194 23.597L23.812 25.993C24.0996 26.1368 24.3594 26.3185 24.5988 26.5205C27.8309 23.8251 29.919 19.7949 29.9966 15.2564C30.1392 6.97355 23.5398 0.143743 15.2564 0.00223368Z" fill="white" />
        </g>
        <defs>
          <clipPath id="clip0_153_17792">
            <rect width="30" height="30" fill="white" />
          </clipPath>
        </defs>
      </svg>
      {showDot && <span className="chat-online-dot"></span>}
    </div>
  );
}

// ─── Pagination Component ─────────────────────────────────────────────────────

function Pagination({
  meta,
  onPageChange,
}: {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
}) {
  const { current_page, last_page, from, to, total } = meta;

  const getPages = (): (number | '...')[] => {
    if (last_page <= 7) return Array.from({ length: last_page }, (_, i) => i + 1);
    const pages: (number | '...')[] = [1];
    if (current_page > 3) pages.push('...');
    const start = Math.max(2, current_page - 1);
    const end   = Math.min(last_page - 1, current_page + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (current_page < last_page - 2) pages.push('...');
    pages.push(last_page);
    return pages;
  };

  if (last_page <= 1) return null;

  return (
    <div className="d-flex flex-column flex-sm-row align-items-center justify-content-between gap-3 mt-4">
      <small className="text-muted">
        Showing <strong>{from}</strong>–<strong>{to}</strong> of <strong>{total}</strong> ads
      </small>
      <ul className="pagination pagination-sm mb-0">
        <li className={`page-item ${current_page === 1 ? 'disabled' : ''}`}>
          <button className="page-link" onClick={() => onPageChange(current_page - 1)} disabled={current_page === 1} type="button">
            <i className="fa-solid fa-chevron-left" />
          </button>
        </li>
        {getPages().map((page, idx) =>
          page === '...' ? (
            <li key={`ellipsis-${idx}`} className="page-item disabled"><span className="page-link">…</span></li>
          ) : (
            <li key={page} className={`page-item ${current_page === page ? 'active' : ''}`}>
              <button className="page-link" onClick={() => onPageChange(page as number)} type="button">{page}</button>
            </li>
          )
        )}
        <li className={`page-item ${current_page === last_page ? 'disabled' : ''}`}>
          <button className="page-link" onClick={() => onPageChange(current_page + 1)} disabled={current_page === last_page} type="button">
            <i className="fa-solid fa-chevron-right" />
          </button>
        </li>
      </ul>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function P2PLayout({
  activeP2PTab,
  setActiveP2PTab,
}: {
  activeP2PTab: P2PTabKey;
  setActiveP2PTab: (v: P2PTabKey) => void;
}) {
  const [isModalOpen,  setIsModalOpen]  = useState(false);
  const [buyModalOpen, setBuyModalOpen] = useState(false);
  const [selectedAd,   setSelectedAd]  = useState<P2pAdsData | null>(null);

  const [ads,     setAds]     = useState<P2pAdsData[]>([]);
  const [loading, setLoading] = useState(false);
  const [meta,    setMeta]    = useState<PaginationMeta | null>(null);
  const [page,    setPage]    = useState(1);

  // ── Filters ──────────────────────────────────────────────────────────────────
  const [filterFiat,   setFilterFiat]   = useState('');
  // filterAmount stores the range label string, e.g. "50-100"
  const [filterAmount, setFilterAmount] = useState('');
  const [filterMethod, setFilterMethod] = useState('');

  // Derived: all three must be selected before we fetch / display anything
  const allFiltersSet = !!filterFiat;

  // Filtered payment methods based on selected fiat currency
  const availableMethods = PAYMENT_METHODS.filter(
    m => m.currency === 'ALL' || !filterFiat || m.currency === filterFiat
  );

  // Parse min/max from the selected range label
  const selectedRange = AMOUNT_RANGES.find(r => r.label === filterAmount);

  // Reset method if it becomes unavailable after currency change
  useEffect(() => {
    if (filterMethod && filterFiat) {
      const stillAvailable = availableMethods.some(m => m.name === filterMethod);
      if (!stillAvailable) setFilterMethod('');
    }
  }, [filterFiat]);

  // ── Clear all filters ─────────────────────────────────────────────────────────
  const clearFilters = () => {
    setFilterFiat('');
    setFilterAmount('');
    setFilterMethod('');
    setAds([]);
    setMeta(null);
    setPage(1);
  };

  // ── Map API → UI card ─────────────────────────────────────────────────────────
  const mapAdToCard = (ad: P2pAdsData): P2PCard => ({
    id:         ad.id,
    name:       ad.user?.name                        || 'Unknown',
    platform:   `${ad.asset}/${ad.with_fiat}`,
    methodName: ad.payment_method?.sell_method?.name || 'N/A',
    rate:       ad.fixed_price,
    // limit:      `${ad.order_limit_min} - ${ad.order_limit_max} ${ad.asset}`,
    limit: `${ad.order_limit_min * ad.fixed_price} - ${ad.order_limit_max * ad.fixed_price} ${ad.with_fiat}`,
    available:  `${ad.total_amount} ${ad.asset}`,
    timeText:   `${ad.payment_time_limit} min`,
    type:       ad.type,
    userImage:  ad.user?.avatar                      || '',
    ad,
  });

  // ── Fetch ─────────────────────────────────────────────────────────────────────
  const fetchAllAds = async (targetPage = 1) => {
    if (!allFiltersSet) return;
    try {
      setLoading(true);
      const type = activeP2PTab === 'wallet-balance' ? 'buy' : 'sell';
      const res = await getAllAds({
        type,
        page: targetPage,
        with_fiat: filterFiat,
      });

      const responseData = res?.data;
      setAds(responseData?.data ?? responseData ?? []);

      if (responseData?.current_page != null) {
        setMeta({
          current_page: responseData.current_page,
          last_page:    responseData.last_page,
          per_page:     responseData.per_page,
          total:        responseData.total,
          from:         responseData.from ?? 1,
          to:           responseData.to   ?? 0,
        });
      } else {
        setMeta(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Reset to page 1 when any filter or tab changes
  useEffect(() => {
    setPage(1);
    if (allFiltersSet) {
      fetchAllAds(1);
    } else {
      setAds([]);
      setMeta(null);
    }
  }, [activeP2PTab, filterFiat, filterAmount, filterMethod]);

  useEffect(() => {
    if (allFiltersSet && page > 1) fetchAllAds(page);
  }, [page]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── Client-side card list ─────────────────────────────────────────────────────
  const p2pCards = ads.map(mapAdToCard);

  const handleChange = (value: string) => {
    setFilterFiat(value);
    localStorage.setItem('filterFiat', value);
  };

  useEffect(() => {
    const savedCurrency = localStorage.getItem('filterFiat');
    if (savedCurrency) {
      setFilterFiat(savedCurrency);
    }
  }, []);

  // ── Shared card renderer ──────────────────────────────────────────────────────
  const renderCard = (c: P2PCard, idx: number, isBuy: boolean) => (
    <div key={`${c.id}-${idx}`} className="col-lg-6">
      <div className="payment-card p-3 p-md-4">
        <div className="card-header">
          <div className="user-info">
            {c.userImage ? (
              <div className="avatar rounded-circle overflow-hidden">
                <img src={c.userImage} width={30} height={30} alt="avatar" />
              </div>
            ) : (
              <AvatarSvg showDot={isBuy} />
            )}
            <div className="details">
              <span className="name">{c.name}</span>
              <span className="platform">{c.platform}</span>
            </div>
          </div>
          <div className="payment-method">
            <span className="method-name">{c.methodName}</span>
            <span className="time">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              {c.timeText}
            </span>
          </div>
        </div>
        <div className="card-body">
          <div className="price-display">
            <span className="tk-symbol">{c.ad.with_fiat}</span>
            <span className="amount">{c.rate}</span>
            <span className="unit">/{c.ad.asset}</span>
          </div>
        </div>
        <div className="card-footer">
          <div className="limits">
            <small><strong>Limit:</strong> {c.limit}</small>
            <p><strong>Available:</strong> {c.available}</p>
          </div>
          {isBuy ? (
            <button type="button" className="buy-btn bg-danger text-white" onClick={() => { setSelectedAd(c.ad); setIsModalOpen(true); }}>
              Sell
            </button>
          ) : (
            <button type="button" className="buy-btn" onClick={() => { setSelectedAd(c.ad); setBuyModalOpen(true); }}>
              Buy
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const isBuyTab = activeP2PTab === 'wallet-balance';

  // ── Shared content block ──────────────────────────────────────────────────────
  const AdsContent = ({ isBuy }: { isBuy: boolean }) => (
    <div className="wallet-wrap-area">

      {/* ── Filters ── */}
      <div className="wallet-filter-section">
        <div className="filter-items-wrapper">

          {/* Amount Range */}
          <div className="wallet-filter-item-group">
            <div className="filter-header-label">
              <span>Amount Range</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
            <div className="wallet-dropdown-content-box px-2">
              <select
                className="select-custom form-control-custom"
                value={filterAmount}
                onChange={e => setFilterAmount(e.target.value)}
              >
                <option value="">Select range</option>
                {AMOUNT_RANGES.map(r => (
                  <option key={r.label} value={r.label}>{r.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Payment Method */}
          <div className="wallet-filter-item-group">
            <div className="filter-header-label">
              <span>Payment Method</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
            <div className="wallet-dropdown-content-box px-2">
              <select
                className="select-custom form-control-custom"
                value={filterMethod}
                onChange={e => setFilterMethod(e.target.value)}
                disabled={!filterFiat}
              >
                <option value="">
                  {filterFiat ? 'Select method' : 'Select currency first'}
                </option>
                {/* Deduplicate methods with same name */}
                {[...new Map(availableMethods.map(m => [m.name, m])).values()].map(m => (
                  <option key={m.name} value={m.name}>{m.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Clear button — only shows when any filter is active */}
          {(filterFiat || filterAmount || filterMethod) && (
            <div className="wallet-filter-item-group d-flex align-items-end pb-1">
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary bg-light-dark text-warning"
                onClick={clearFilters}
              >
                Clear filters
              </button>
            </div>
          )}

        </div>
      </div>

      {/* ── Prompt / Cards ── */}
      {!allFiltersSet ? (
        <div className="py-5 text-center text-muted">
          <p className="mb-1">
            <strong>Select all three filters</strong> to browse ads
          </p>
          <small>Currency → Amount range → Payment method</small>
        </div>
      ) : loading ? (
        <p>Loading...</p>
      ) : p2pCards.length === 0 ? (
        <p className="py-5 text-center">No {isBuy ? 'buy' : 'sell'} ads found for the selected filters</p>
      ) : (
        <div className="row g-4">
          {p2pCards.map((c, idx) => renderCard(c, idx, isBuy))}
        </div>
      )}

      {/* Pagination */}
      {!loading && allFiltersSet && meta && (
        <Pagination meta={meta} onPageChange={handlePageChange} />
      )}

      <div className="wallet-order-wrap" />
    </div>
  );

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <>
      <div className="wallet-paymet-box-items mt-30">
        <div className="wallet-tab-items">

          {/* Header */}
          <div className="d-flex gap-5 justify-content-between align-items-center mb-4">
            <div>
              <div className="wallet-tab-buttons mb-0">
                <P2PTabButton tab="wallet-add"     label="Buy"  activeTab={activeP2PTab} onChange={setActiveP2PTab} />
                <P2PTabButton tab="wallet-balance" label="Sell" activeTab={activeP2PTab} onChange={setActiveP2PTab} />
              </div>
            </div>

            {/* Currency filter — sent to backend */}
            <div className="form-group-custom mt-3 mt-md-0">
              {/* <select
                className="select-custom form-control-custom"
                value={filterFiat}
                onChange={e => setFilterFiat(e.target.value)}
              >
                <option value="">Select Currency</option>
                {CURRENCIES.map(c => (
                  <option key={c.code} value={c.code}>{c.code} — {c.name}</option>
                ))}
              </select> */}
              <select
                className="select-custom form-control-custom"
                value={filterFiat}
                onChange={e => handleChange(e.target.value)}
              >
                <option value="">Select Currency</option>
                {CURRENCIES.map(c => (
                  <option key={c.code} value={c.code}>
                    {c.code} — {c.name}
                  </option>
                ))}
              </select>
            </div>

            <P2PHeaderButton />
          </div>

          <div className="wallet-tab-contents">
            <div className={`wallet-tab-content ${isBuyTab ? 'active' : ''}`} id="wallet-balance">
              <AdsContent isBuy={true} />
            </div>
            <div className={`wallet-tab-content ${!isBuyTab ? 'active' : ''}`} id="wallet-add">
              <AdsContent isBuy={false} />
            </div>
          </div>

        </div>
      </div>

      {isModalOpen && selectedAd && (
        <BuySellPendingModel onClose={() => setIsModalOpen(false)} ad={selectedAd} />
      )}
      {buyModalOpen && selectedAd && (
        <P2PBuyModal onClose={() => setBuyModalOpen(false)} ad={selectedAd} />
      )}
    </>
  );
}