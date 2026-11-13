'use client';

import React, { useEffect, useState } from 'react';
import BettingWinners from '@/components/containers/lottery/BettingWinners';
import LotteryWinnerCards from '@/components/containers/lottery/LotteryWinnerCards';
import DashboardPage from '@/components/dashboard/mobileDesign/DashboardPage';
import InvestmentSection from '@/components/dashboard/Investment/InvestmentSection';
import LotterySectionTwo from '@/components/dashboard/LotterySectionTwo';
import { getLotteryWinners } from '../api/lottery';
import styles from './dashboardHome.module.css';

// Main Page Component
const HomePage: React.FC = () => {

  const [winners, setWinners] = useState<Parameters<typeof BettingWinners>[0]['winners']>(null);

  const getWinners = async () => {
    const res = await getLotteryWinners();
    setWinners(res?.data || []);
  };

  useEffect(() => {
    getWinners();
  }, []);

  return (
    <main className={`content-area flex-grow-1 px-0 ${styles.homeContent}`}>
      <div className="px-3 px-xl-0 pt-3">
        <InvestmentSection title="Choose an Investment Package" description="Compare active plans, then select one to review its duration and payout details." wrapperClassName="" />
      </div>

      <DashboardPage />

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
