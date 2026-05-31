'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import BettingWinners from '@/components/containers/lottery/BettingWinners';
import LotteryWinnerCards from '@/components/containers/lottery/LotteryWinnerCards';
import DashboardPage from '@/components/dashboard/mobileDesign/DashboardPage';
import LotterySectionTwo from '@/components/dashboard/LotterySectionTwo';
import { getLotteryLatestRounds, getLotteryWinners, getTopOneInvestment, investmentPurchase } from '../api/lottery';
import LotterySkeleton from '@/components/dashboard/LotterySkeleton';
import { Investment } from '@/types/CommonTypes';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';

// Main Page Component
const HomePage: React.FC = () => {

  const [winners, setWinners] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const getWinners = async () => {
    const res = await getLotteryWinners();
    setWinners(res?.data || []);
  };

  const formatMoney = (value?: string | number) => {
    const num = typeof value === "string" ? parseFloat(value) : value ?? 0;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(num);
  };

  const [investment, setInvestment] = useState<Investment | null>(null);
  const [loading, setLoading] = useState(true);

  const getInvestment = async () => {
    setLoading(true);
    const res = await getTopOneInvestment();
    setInvestment(res?.data || null);
    setLoading(false);
  };

  useEffect(() => {
    getInvestment();
    getWinners();
  }, []);

  if (loading) return <LotterySkeleton />;
  // if (!investment) return null;

  const handlePurchase = async () => {
    setIsLoading(true);

    if (!investment) {
      toast.error("No investment opportunity available at the moment.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await investmentPurchase(investment.id.toString());

      if (response) {
        toast.success("Investment successful! Your returns will be reflected in your account soon.");
      }

    } catch (err) {
      // Set the error message from the API response
      const errorMessage = err instanceof Error ? err.message : "Ticket purchase failed";
      toast.error(errorMessage);
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
      html: ` Are you sure you want to invest <strong>${formatMoney(investment?.investment_amount)}</strong> and get <strong>${formatMoney(investment?.return_amount)}</strong> in return?`,
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
    <main className="content-area flex-grow-1 px-0">

       {/* Mobile design show  */}
       <DashboardPage investment={investment} />

      {/* Banner Section */}
      {investment && 
        <div className="investment-wrapper d-none d-md-block mx-4 mx-xl-0">
          <div 
            className="investment-wrapper bg-cover mb-0" 
            style={{ backgroundImage: "url('/images/new/investment_bg_gradient.png')" }}
          >
            <div className="content p-5 d-flex justify-content-start mt-5">
              <div className="text-center pb-5">

                <div className="inv-box">
                  <span className="inv-corner--tl"></span>
                  <span className="inv-corner--tr"></span>
                  <span className="inv-corner--bl"></span>
                  <span className="inv-corner--br"></span>
                  <h3 className="inv-title px-1">Investment</h3>
                </div>
                <div className="inv-logo bg-gradient"></div>

                <h4 className="price text-xxl fw-6 pt-2">{investment ? formatMoney(investment.investment_amount) : "$0"}</h4>
                <p>Returns</p>
                <h4 className="price-2 fs-1 fw-8 text-warning">{investment ? formatMoney(investment.return_amount) : "$0"}</h4>

                <button className="investment-btn" onClick={ buyInvestment } disabled={isLoading}>
                {isLoading ? "Processing..." : "Invest Now"} <span className='fa-solid fa-angle-right ps-2'></span>
                </button>

                <h6>*Guaranteed</h6>
              </div>
            </div>

            <div className="thumb pt-3 pe-3">
              <Image 
                src="/images/new/investment-img.png" 
                alt="Investment illustration" 
                width={900}
                height={900}
                priority
              />
            </div>
          </div>
        </div>
      }

      {/* Lottery Cards Section */}
      <div className="investment-area d-none d-md-block">
        <div className="sec-title-content2">
          <h2>
            Play the Lottery Online with <br className="d-none d-lg-block" /> Official Tickets
          </h2>
          <p>
            Check your ticket numbers to see if you are a Winner in the Dream Lottery.
          </p>
        </div>

        <div>
          <LotterySectionTwo roundShow={4} />
        </div>
      </div>

      {/* Latest Results Section */}
      <div className="investment-history-area mt-100 d-none d-md-block mx-5 mx-lg-0">
        <div className="sec-title-content2">
          <h2>Recent Champions in Action</h2>
        </div>
        <BettingWinners winners={winners} />
      </div>

      <div className="investment-history-area mt-100 d-none d-md-block">
        <div className="sec-title-content2">
          <h2>Pick Your Winning Numbers</h2>
          <p>
            Explore our featured games at Zio Lottery, where every spin and every bet brings you closer to huge.
          </p>
        </div>
        <LotteryWinnerCards />
      </div>

    </main>
  );
};

export default HomePage;
