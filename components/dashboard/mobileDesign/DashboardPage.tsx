'use client'

import { useState } from "react";
import styles from "./dashboard.module.css";
import TopWinnersMobileCard from "./TopWinnersMobileCard";
import LatestDrawMobileCard from "./LatestDrawMobileCard";
import ReferEarnMobileCard from "./ReferEarnMobileCard";
import PopularLotteryMobileCard from "./PopularLotteryMobileCard";
import LotteryResultMobileCard from "./LotteryResultMobileCard";
import LotterySliderCard from "./LotterySliderCard";
import ActionBottomSheet from "./Actionbottomsheet";
import Link from "next/link";
import { Investment } from "@/types/CommonTypes";
import { investmentPurchase } from "@/app/api/lottery";
import Swal from "sweetalert2";

type ModalType = "deposit" | "withdraw" | null;

export default function DashboardPage({investment}: {investment: Investment | null}) {

  const [modalType, setModalType] = useState<ModalType>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const formatMoney = (value?: string | number) => {
    const num = typeof value === "string" ? parseFloat(value) : value ?? 0;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(num);
  };

  const handlePurchase = async () => {
      if (!investment) {
        Swal.fire({
          title: "No Investment Available",
          text: "Please try again later.",
          icon: "warning",
          confirmButtonText: "OK",
        });
        return;
      }

      setIsLoading(true);
      try {
        await investmentPurchase(investment.id.toString());
  
        Swal.fire({
          title: "Investment Successful",
          text: `You have successfully invested ${formatMoney(investment.investment_amount)} and will receive ${formatMoney(investment.return_amount)} in return.`,
          icon: "success",
          confirmButtonText: "OK",
        });
  
      } catch (err) {
        // Set the error message from the API response
        const errorMessage = err instanceof Error ? err.message : "Ticket purchase failed";
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
      if (!investment) {
        Swal.fire({
          title: "No Investment Available",
          text: "Please try again later.",
          icon: "warning",
          confirmButtonText: "OK",
        });
        return;
      }

      const result = await Swal.fire({
        title: "Investment Confirmation",
        icon: "info",
        html: ` Are you sure you want to invest <strong>${formatMoney(investment.investment_amount)}</strong> and get <strong>${formatMoney(investment.return_amount)}</strong> in return?`,
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
    <main className={`d-md-none ${styles.screen}`}>
      <div className="container-flouid">
        <div className="row h-100 justify-content-center align-items-start">
          <div className={`col-12 px-0 ${styles.wrap}`}>

            {/* Top balance card */}
            <section className={`${styles.balanceCard}`}>
              <div className={styles.balanceCardInner}>
                <div className="d-flex justify-content-between align-items-end">
                  <div>
                    <div className={styles.label}>Total Won Balance</div>
                    <div className={styles.balanceValue}>$12,458.50</div>
                  </div>
                  <div className="text-end d-flex align-items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setModalType("deposit")}
                      className={`${styles.depositBtn} d-flex justify-content-center`}
                    >
                      Deposit
                    </button>
                    <button
                      type="button"
                      onClick={() => setModalType("withdraw")}
                      className={`${styles.depositBtn} d-flex justify-content-center`}
                    >
                      Withdraw
                    </button>
                  </div>
                </div>

                <div className={`row ${styles.statsRow}`}>
                  <div className="col-4">
                    <div className={styles.statLabel}>{"Today's Profit"}</div>
                    <div className={`${styles.statValue} ${styles.profit}`}>+$245.80</div>
                  </div>

                  <div className="col-4 text-center">
                    <div className={styles.statLabel}>Pending Tickets</div>
                    <div className={`${styles.statValue} ${styles.tickets}`}>15</div>
                  </div>

                  <div className="col-4 text-end">
                    <div className={styles.statLabel}>Win Rate</div>
                    <div className={`${styles.statValue} ${styles.win}`}>78%</div>
                  </div>
                </div>
              </div>
            </section>

            {/* Bottom nav */}
            <nav className={`${styles.bottomNav} mb-5 py-3`}>
              <div className="row g-0 text-center">
                <div className="col-3">
                  <Link href="/dashboard/lottery">
                    <div>
                      <div className={`${styles.navTile} ${styles.tileGreen}`}>
                        <svg width="38" height="38" viewBox="0 0 48 48" fill="none">
                          <circle cx="24" cy="22" r="13" stroke="currentColor" strokeWidth="2" fill="none"/>
                          <circle cx="24" cy="22" r="3" fill="currentColor"/>
                          <line x1="24" y1="9" x2="24" y2="19" stroke="currentColor" strokeWidth="1.5"/>
                          <line x1="24" y1="25" x2="24" y2="35" stroke="currentColor" strokeWidth="1.5"/>
                          <line x1="11" y1="22" x2="21" y2="22" stroke="currentColor" strokeWidth="1.5"/>
                          <line x1="27" y1="22" x2="37" y2="22" stroke="currentColor" strokeWidth="1.5"/>
                          <line x1="15.1" y1="13.1" x2="21.9" y2="19.9" stroke="currentColor" strokeWidth="1.5"/>
                          <line x1="26.1" y1="24.1" x2="32.9" y2="30.9" stroke="currentColor" strokeWidth="1.5"/>
                          <line x1="32.9" y1="13.1" x2="26.1" y2="19.9" stroke="currentColor" strokeWidth="1.5"/>
                          <line x1="21.9" y1="24.1" x2="15.1" y2="30.9" stroke="currentColor" strokeWidth="1.5"/>
                          <circle cx="24" cy="9" r="2.5" fill="currentColor" opacity="0.8"/>
                          <circle cx="37" cy="22" r="2.5" fill="currentColor" opacity="0.8"/>
                          <circle cx="24" cy="35" r="2.5" fill="currentColor" opacity="0.8"/>
                          <circle cx="11" cy="22" r="2.5" fill="currentColor" opacity="0.8"/>
                          <line x1="17" y1="35" x2="12" y2="44" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          <line x1="31" y1="35" x2="36" y2="44" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          <line x1="10" y1="44" x2="38" y2="44" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                      </div>
                      <div className={styles.navLabel}>Lotteries</div>
                    </div>
                  </Link>
                </div>

                <div className="col-3">
                  <Link href="/dashboard/invesment">
                    <div>
                      <div className={`${styles.navTile} ${styles.tileGold}`}>
                        <i className={`fa-solid fa-chart-line ${styles.navIcon}`} /> 
                      </div>
                      <div className={styles.navLabel}>Investment</div>
                      </div>
                    </Link>
                </div>

                <div className="col-3">
                  <Link href="/dashboard/ticket-history">
                    <div>
                      <div className={`${styles.navTile} ${styles.tilePurple}`}>
                        <i className={`fa-solid fa-ticket ${styles.navIcon}`} />
                      </div>
                      <div className={styles.navLabel}>My Ticket</div>
                    </div>
                  </Link>
                </div>

                <div className="col-3">
                  <Link href="/dashboard/wallet">
                    <div>
                      <div className={`${styles.navTile} ${styles.tileRed}`}>
                        <i className={`fa-solid fa-wallet ${styles.navIcon}`} />
                      </div>
                      <div className={styles.navLabel}>My Wallet</div>
                    </div>
                  </Link>
                </div>
              </div>
            </nav>

          </div>
        </div>

        <div className="my-0 pt-0 bg-cover rounded" 
          style={{ backgroundImage: "url('/images/new/investment-img.png')" }}
        >
          <div className="investment-wrapper my-0 pt-0 bg-cover rounded" 
            style={{ backgroundImage: "url('/images/new/bg.png')" }}
          >
            <div className="content d-flex justify-content-start pb-2">
              <div className="text-center px-3 pt-3">
                <div className="inv-box">
                  <span className="inv-corner--tl"></span>
                  <span className="inv-corner--tr"></span>
                  <span className="inv-corner--bl"></span>
                  <span className="inv-corner--br"></span>
                  <h3 className="inv-title px-1">Investment</h3>
                </div>
                <div className="inv-logo bg-gradient"></div>

                <h6 className="fw-6">{investment ? formatMoney(investment.investment_amount) : "$0"}</h6>
                <small>Returns</small>
                <h6 className="price-2 fs-5 fw-6 text-warning">{investment ? formatMoney(investment.return_amount) : "$0"}</h6>

                <button className="btn--primary py-1 px-2 d-flex align-items-center justify-content-center text-xs my-2" onClick={buyInvestment}>
                  {isLoading ? "Processing..." : "Invest Now"} <span className='fa-solid fa-angle-right '></span>
                </button>
                
                <small>*Guaranteed</small>
              </div>
            </div>
          </div>
        </div>

        {/* Trending Lotteries */}
         <div className="mt-5">
          <LotterySliderCard roundShow={3} />
        </div>

        {/* Top Winners Mobile Card */}
        <div className="mt-5">
          <TopWinnersMobileCard />
        </div>

        <div className="mt-5">
          <LatestDrawMobileCard />
        </div>

        <div className="mt-5">
          <ReferEarnMobileCard bgImageUrl="/images/refer_bg_image.svg" />
        </div>

        <div className="mt-5">
          <PopularLotteryMobileCard />
        </div>

        <div className="mt-5">
          <LotteryResultMobileCard />
        </div>

      </div>

       <ActionBottomSheet
        type={modalType}
        onClose={() => setModalType(null)}
      />

    </main>
  );
}