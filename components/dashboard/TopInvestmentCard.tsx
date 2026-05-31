"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getTopOneInvestment, investmentPurchase } from "@/app/api/lottery";
import LotterySkeleton from "./LotterySkeleton";
import { Investment } from "@/types/CommonTypes";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Swal from "sweetalert2";
import { toast } from "react-toastify";

// ── Countdown using ended_at ─────────────────────────────────────────────────
type ApiInvestment = {
  id: number | string;
  created_at?: string;
  duration?: number;
  feature_img_url?: string;
  name?: string;
  investment_amount?: number;
  return_amount?: number;
};

// ── Format money ─────────────────────────────────────────────────────────────
const formatMoney = (value?: string | number) => {
  const num = typeof value === "string" ? parseFloat(value) : value ?? 0;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(num);
};

// ── Card ─────────────────────────────────────────────────────────────────────
function InvestmentCard({ item }: { item: ApiInvestment }) {
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

      if (response) {
        toast.success("Investment successful! Your returns will be reflected in your account soon.");
      }

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
        # 1
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

// ── Section ──────────────────────────────────────────────────────────────────
export default function TopInvestmentSection() {
  const [investment, setInvestment] = useState<ApiInvestment | null>(null);
  const [loading, setLoading] = useState(true);

  const getInvestment = async () => {
    setLoading(true);
    const res = await getTopOneInvestment();
    setInvestment(res?.data || null);
    setLoading(false);
  };

  useEffect(() => {
    getInvestment();
  }, []);

  if (loading) return <LotterySkeleton />;
  if (!investment) return null;  

  return (
  <div className="investment-area">
    <InvestmentCard item={investment} />  
  </div>
);
}