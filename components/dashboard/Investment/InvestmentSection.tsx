'use client';

import { investmentPurchase, investmentsApi } from "@/app/api/lottery";
import { useAuth } from "@/hooks/useAuth";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

type Timer = {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
};

type ApiInvestment = {
  id: number | string;
  created_at?: string;
  duration?: number;
  feature_img_url?: string;
  name?: string;
  investment_amount?: number;
  return_amount?: number;
};

type SectionProps = {
  bannerSrc?: string; // "/assets/images/new/banner.png"
  title: string;
  description: string;
  wrapperClassName?: string; // e.g. "investment-history-area mt-100 investment-area"
};

const formatMoney = (value?: number) =>
  value === undefined || value === null
    ? "-"
    : new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }).format(value);

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

function TimerRow({ timer }: { timer: Timer }) {
  return (
    <div className="timer-container">
      <div className="time-box">{timer.days}</div>
      <div className="time-box">{timer.hours}</div>
      <div className="time-box">{timer.minutes}</div>
      <div className="time-box">{timer.seconds}</div>
    </div>
  );
}

function InvestmentCard({ index, item }: { index: number; item: ApiInvestment }) {
  const investmentAmount = item.investment_amount ?? 0;
  const returnAmount = item.return_amount ?? 0;
  const { isLoggedIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  
  const returnPercent =
    investmentAmount > 0
      ? (((returnAmount - investmentAmount) / investmentAmount) * 100).toFixed(0)
      : "0";

  const handleLoginClick = async () => {
    router.push("/sign-in?redirect=dashboard/investment/"); 
  };

  const handlePurchase = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await investmentPurchase(item.id.toString());

      if (response.error) {
        throw new Error(response.message || "Investment purchase failed");
      }

      Swal.fire({
        title: "Investment Successful",
        text: `You have successfully invested ${formatMoney(investmentAmount)} and will receive ${formatMoney(returnAmount)} in return.`,
        icon: "success",
        confirmButtonText: "OK",
      });

      // reload the page to reflect the new investment
      router.refresh();

    } catch (err) {
      // Set the error message from the API response
      const errorMessage = err instanceof Error ? err.message : "Ticket purchase failed";
      setError(errorMessage);
      Swal.fire({
        title: "Purchase Failed",
        text: errorMessage,
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const buyInvestment = async () => {
    const result = await Swal.fire({
      title: "Investment Confirmation",
      icon: "info",
      html: ` Are you sure you want to invest <strong>${formatMoney(investmentAmount)}</strong> and get <strong>${formatMoney(returnAmount)}</strong> in return?`,
      showCloseButton: true,
      showCancelButton: true,
      focusConfirm: false,
      confirmButtonAriaLabel: "Thumbs up, great!",
      cancelButtonText: `No, Cancel!`,
      confirmButtonText: `Yes, Invest!`,
      cancelButtonAriaLabel: "Thumbs down"
    });

    if (result.isConfirmed) {
      await handlePurchase();
    }
  };

  return (
    <div className="investment-box-items">
      <span className="serial">
        #{index + 1}
      </span>

      <span className="price z-0">
        <i className="fa-solid fa-star" />
        {item.created_at ? new Date(item.created_at).getFullYear() : "Active"}
      </span>

      <div className="card-header mt-5">
        <span className="badge-dashboard">{item.name ?? "Investment"}</span>
      </div>

      {item.feature_img_url && (
        <div className="graphic-area mt-3">
          <img
            src={item.feature_img_url ?? '/images/new/investment-img2.png'}
            alt="chart"
            className="chart-img"
            style={{
                height: "150px",
                objectFit: "cover",
            }}
        />
        </div>
      )}

      <div className="card-header mt-3">
        <span className="badge-dashboard">{`${item.duration} Days`}</span>
      </div>

      <div className="card-content">
        <h2 className="main-title">
          <div className="line-1" />
          {"INVESTMENT"}
          <div className="line-2" />
          <div className="line-4" />
          <div className="line-3" />
        </h2>

        <div className="pricing">
          <span className="small-price">{formatMoney(investmentAmount)}</span>
          <p className="buzz-text">Return {returnPercent} % Amount</p>
          <span className="big-price">{formatMoney(returnAmount)}</span>
        </div>
      </div>

      <div className="text-center d-flex justify-content-center pt-2">
        <button
          onClick={ isLoggedIn ? buyInvestment : handleLoginClick }
          className="btn--primary py-2 d-flex align-items-center justify-content-center text-lg px-4 w-md-50"
          disabled={isLoading}
        >
          {isLoading ? "Processing..." : "Invest Now"}
        </button>
      </div>
    </div>
  );
}


export default function InvestmentSection({
  bannerSrc,
  title,
  description,
  // items,
  wrapperClassName = "investment-area",
}: SectionProps) {

    const [investments, setInvestments] = useState([]);
    const [pageLoading, setPageLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        next_page_url: null,
        prev_page_url: null,
        total: 0,
        per_page: 1,
    });

    const getInvestments = async (page = 1) => {
      try {
          setPageLoading(true);

          // IMPORTANT: pass page to your API function
          const res = await investmentsApi(page);

          // res.data should be the pagination object
          setInvestments(res?.data?.data || []);

          setPagination({
              current_page: res?.data?.current_page ?? 1,
              last_page: res?.data?.last_page ?? 1,
              next_page_url: res?.data?.next_page_url ?? null,
              prev_page_url: res?.data?.prev_page_url ?? null,
              total: res?.data?.total ?? 0,
              per_page: res?.data?.per_page ?? 1,
          });
      } finally {
          setPageLoading(false);
      }
    };

    useEffect(() => {
        getInvestments();
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
          {investments.map((item: ApiInvestment, index: number) => (
            <div key={item.id} className="col-xxl-4 col-xl-6 col-lg-4 col-md-6">
              <InvestmentCard index={index} item={item} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}