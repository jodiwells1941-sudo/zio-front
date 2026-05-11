'use client';

import { cancelInvestmentItem, investmentHistoryApi } from "@/app/api/lottery";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

// ─── Types ────────────────────────────────────────────────────────────────────

type RawInvestment = {
  id: number;
  investment_id: number;
  investment_amount: string;
  return_amount: string;
  started_at: string;
  ended_at: string;
  closed_at: string | null;
  status: string;
  created_at: string;
  investment: {
    id: number;
    name: string;
    feature_img: string;
    duration: number;
    feature_img_url: string;
  };
};

type SectionProps = {
  bannerSrc?: string;
  title: string;
  description: string;
  // items: InvestmentPlan[];
  wrapperClassName?: string;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtMoney = (val: string | number) => {
  const n = typeof val === "string" ? parseFloat(val) : val;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(n);
};

const pad = (n: number) => String(Math.max(0, n)).padStart(2, "0");

function getCountdown(endedAt: string) {
  const diff = Math.max(
    0,
    Math.floor((new Date(endedAt).getTime() - Date.now()) / 1000)
  );
  return {
    days: pad(Math.floor(diff / 86400)),
    hours: pad(Math.floor((diff % 86400) / 3600)),
    minutes: pad(Math.floor((diff % 3600) / 60)),
    seconds: pad(diff % 60),
  };
}

function getReturnPct(investedAmt: string, returnAmt: string) {
  const i = parseFloat(investedAmt);
  const r = parseFloat(returnAmt);
  return i > 0 ? ((r / i) * 100).toFixed(0) : "0";
}


function SectionTitle({ title, description }: { title: string; description: string }) {
  return (
    <div className="sec-title-content2">
      <h2 className="fw-7">{title}</h2>
      <p>
        {description.split("\n").map((line, i) => (
          <span key={i}>
            {line}
            <br />
          </span>
        ))}
      </p>
    </div>
  );
}

// ─── Countdown component (self-ticking) ───────────────────────────────────────


// function TimerRow({ endedAt }: { endedAt: string }) {

//   const [timer, setTimer] = useState(getCountdown(endedAt));

//   useEffect(() => {
//     const id = setInterval(() => setTimer(getCountdown(endedAt)), 1000);
//     return () => clearInterval(id);
//   }, [endedAt]);

//   const boxes = [
//     { val: timer.days, label: "D" },
//     { val: timer.hours, label: "H" },
//     { val: timer.minutes, label: "M" },
//     { val: timer.seconds, label: "S" },
//   ];

//   return (
//     <div className="timer-container">
//       {boxes.map((b) => (
//         <div className="time-box">{b.val}{b.label}</div>
//       ))}
//     </div>
//   );
// }
function getCountdownNew(endedAt: string) {
  // Parse backend UTC time and compare with current local time
  const end = new Date(endedAt.endsWith('Z') ? endedAt : endedAt + 'Z') // ensure treated as UTC
  const now = new Date()
  const diff = end.getTime() - now.getTime()

  if (diff <= 0) return { days: '00', hours: '00', minutes: '00', seconds: '00' }

  const days    = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours   = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)

  const pad = (n: number) => String(n).padStart(2, '0')

  return {
    days:    pad(days),
    hours:   pad(hours),
    minutes: pad(minutes),
    seconds: pad(seconds),
  }
}

function TimerRow({ endedAt }: { endedAt: string }) {
  const [timer, setTimer] = useState(getCountdownNew(endedAt))

  useEffect(() => {
    const id = setInterval(() => setTimer(getCountdownNew(endedAt)), 1000)
    return () => clearInterval(id)
  }, [endedAt])

  const boxes = [
    { val: timer.days,    label: 'D' },
    { val: timer.hours,   label: 'H' },
    { val: timer.minutes, label: 'M' },
    { val: timer.seconds, label: 'S' },
  ]

  return (
    <div className="timer-container">
      {boxes.map((b) => (
        <div key={b.label} className="time-box">
          {b.val}{b.label}
        </div>
      ))}
    </div>
  )
}

// ─── Single card ──────────────────────────────────────────────────────────────

function InvestmentCard({
  investment,
  index,
  fetchInvestments,
}: {
  investment: RawInvestment;
  index: number;
  fetchInvestments: () => void;
}) {
  const inv = investment.investment;
  const invested = parseFloat(investment.investment_amount);
  const returnAmt = parseFloat(investment.return_amount);
  const isActive = investment.status === "active";
  const returnPercent =
    invested > 0
      ? (((returnAmt - invested) / invested) * 100).toFixed(0)
      : "0";

  const handleCancel = async () => {
    try {
      await cancelInvestmentItem(investment.id.toString());
      toast.success("Investment cancelled successfully.");
      fetchInvestments();
    } catch (err) {
      toast.error("Failed to cancel investment. Please try again.");
    }
  }

  const cancelInvestment = async () => {
    const result = await Swal.fire({
          title: "Investment Confirmation",
          icon: "info",
          html: `Are you sure you want to cancel this investment? You will lose all potential returns and get back only your invested amount of <strong>${fmtMoney(invested)}</strong>.`,
          showCloseButton: true,
          showCancelButton: true,
          focusConfirm: false,
          confirmButtonAriaLabel: "Thumbs up, great!",
          cancelButtonText: `No, Cancel!`,
          confirmButtonText: `Yes, Cancel!`,
          cancelButtonAriaLabel: "Thumbs down"
        });
    
        if (result.isConfirmed) {
          await handleCancel();
        }
  };

  console.log('investment', investment);
  

  return (
    <div className="investment-box-items">
      <span className="serial">{index + 1}</span>
      <span className="price">
        <i className="fa-solid fa-star" />
        {index === 0 ? "R-458" : `R-${inv.id}`}
      </span>

      {/* Header */}
      <div className="card-header">
        <span className="badge-dashboard">{investment?.investment?.name}</span>

        {investment?.investment && (
          <div className="graphic-area mt-4">
            <img
              src={investment?.investment.feature_img_url ?? '/images/new/investment-img2.png'}
              alt="chart"
              className="chart-img"
              style={{
                  height: "150px",
                  objectFit: "cover",
              }}
              />
          </div>
        )}
      </div>

      <div className="card-header mt-3">
        <span className="badge-dashboard">{
          (() => {
        const started = new Date(investment.started_at);
        const ended = investment.ended_at ? new Date(investment.ended_at) : new Date();
        const days = Math.max(0, Math.ceil((ended.getTime() - started.getTime()) / (1000 * 60 * 60 * 24)));
        return `${days} Days`;
          })()
        }</span>
      </div>

      {/* Content */}
      <div className="card-content">

        <h2 className="main-title">
          <div className="line-1" />
          {'INVESTMENT'}
          <div className="line-2" />
          <div className="line-4" />
          <div className="line-3" />
        </h2>

        <div className="pricing">
          <span className="small-price">${investment.investment_amount}</span>
          <p className="buzz-text">Return {returnPercent} % Amount</p>
          <span className="big-price ">${investment.return_amount}</span>
        </div>

        {!investment.investment && <hr className="divider" />}

        {investment.investment && (
          <ul>
            <li>
              <span>Code No</span>
              <span>{investment?.id}</span>
            </li>
            <li>
              <span>Serial No</span>
              <span>#{investment?.id}</span>
            </li>
            <li>
              <span>Start Date</span>
              <span>{new Date(investment.started_at).toLocaleDateString('en-GB')}</span>
            </li>
            {/* <li>
              <span>Time</span>
              <span>{new Date(investment.started_at).toLocaleTimeString('en-GB')}</span>
            </li> */}
            <li>
              <span>Return Date</span>
              <span>{investment.ended_at ? new Date(investment.ended_at).toLocaleDateString('en-GB') : 'N/A'}</span>
            </li>
          </ul>
        )}
      </div>

      {/* Timer */}
       <TimerRow endedAt={investment.ended_at} />

      <div className="text-center d-flex gap-2 justify-content-center">
        <button className="btn--primary py-2 text-sm d-flex align-items-center justify-content-center" disabled>
          {isActive
            ? "Active"
            : investment.status.charAt(0).toUpperCase() + investment.status.slice(1)}
        </button>
        {isActive && <button className="btn--secondary py-2 text-sm d-flex align-items-center justify-content-center" onClick={cancelInvestment}> Cancel</button>}
      </div>
    </div>
  );
}

export default function MyInvestmentSection({
  bannerSrc,
  title,
  description,
  // items,
  wrapperClassName = "investment-area",
}: SectionProps) {
    const [investments, setInvestments] = useState<RawInvestment[]>([]);
    const [pageLoading, setPageLoading] = useState(false);
    const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
  });
 
  const fetchInvestments = async (page = 1) => {
    try {
      setPageLoading(true);
      const res = await investmentHistoryApi(page);
      setInvestments(res?.data?.data ?? []);
      setPagination({
        current_page: res?.data?.current_page ?? 1,
        last_page: res?.data?.last_page ?? 1,
        total: res?.data?.total ?? 0,
      });
    } finally {
      setPageLoading(false);
    }
  };
 
  useEffect(() => {
    fetchInvestments();
  }, []);    

  return (
    <div className="px-2 px-md-0">
      {bannerSrc ? (
        <div className="investment-wrapper">
          <Image src={bannerSrc} alt="" width={1400} height={520} className="w-100" />
        </div>
      ) : null}

      <div className={wrapperClassName}>
        <SectionTitle title={title} description={description} />

        <div className="row g-4">
          {investments.map((inv, idx) => (
            <>
              {inv?.status === 'active' && (
                <div key={idx} className="col-xxl-4 col-xl-6 col-lg-4 col-md-6">
                  <InvestmentCard investment={inv} index={idx} fetchInvestments={fetchInvestments} />
                </div>
              )}
            </>
          ))}
        </div>

        {/* Pagination */}
        {!pageLoading && pagination.last_page > 1 && (
          <div
            className="d-flex align-items-center justify-content-center gap-3 mt-4"
          >
            <button
              className="active-btn"
              disabled={pagination.current_page <= 1}
              onClick={() => fetchInvestments(pagination.current_page - 1)}
            >
              ← Prev
            </button>
            <span className="fs-12">
              Page {pagination.current_page} / {pagination.last_page}
            </span>
            <button
              className="active-btn"
              disabled={pagination.current_page >= pagination.last_page}
              onClick={() => fetchInvestments(pagination.current_page + 1)}
            >
              Next →
            </button>
          </div>
        )}

      </div>
    </div>
  );
}