"use client";

import React, { use, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCountUp } from "@/hooks/useCountUp";
import { getAllActiveRounds, ticketPurchase } from "@/app/api/lottery";
import CountdownTimerNew from "../CountdownTimerNew";
import LotterySkeleton from "@/components/dashboard/LotterySkeleton";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

type LotteryCardProps = {
  round?: any;
  roundShow?: number;
  serial?: string;
  drawTitle?: string;
  drawAtText?: string;
  ticketPrice?: number;
  onPurchaseSuccess?: () => Promise<void> | void;
};

type Prize = {
  id?: number;
  position?: number;
  prize?: number | null;
};

const LotteryCard = ({
  round,
  roundShow = 0, // default so `roundShow >= 4` never crashes
  serial = "#1",
  drawAtText = "Pricing List",
  ticketPrice = round?.price || 0,
  onPurchaseSuccess,
}: LotteryCardProps) => {
  const [ticketCount, setTicketCount] = useState<number | "">(1);
  const [prizes, setPrizes] = useState<Prize[]>(round?.computed_prizes?.lottery_round_prizes || []);
  const { isLoggedIn } = useAuth();
  const router = useRouter();

  const handleLoginClick = () => {
    router.push("/sign-in");
  };

  const totalAmount = useMemo(() => {
    const count = typeof ticketCount === "number" ? ticketCount : 0;
    return Number(ticketPrice) * Number(count);
  }, [ticketPrice, ticketCount]);

  const handlePlus = () => {
    const current = typeof ticketCount === "number" ? ticketCount : 0;
    setTicketCount(current + 1);
  };

  const handleMinus = () => {
    const current = typeof ticketCount === "number" ? ticketCount : 0;
    setTicketCount(current > 1 ? current - 1 : 1);
  };

  const handleTicketInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!/^\d*$/.test(val)) return;
    setTicketCount(val === "" ? "" : Number(val));
  };

  const handleTicketBlur = () => {
    const n = typeof ticketCount === "number" ? ticketCount : 0;
    if (!n || n < 1) setTicketCount(1);
  };

  const handleBuy = async (roundId: number | undefined, e: React.MouseEvent<HTMLButtonElement>) => {

    if (round?.end_time && new Date(round.end_time).getTime() - 60000 < Date.now()) {
      e.preventDefault();
      toast.error("Ticket purchasing closes 1 minute before the draw. Please wait for the next round.");
      return;
    }

    const count = typeof ticketCount === "number" ? ticketCount : 0;
    if (!count || count < 1) {
      e.preventDefault();
      toast.error("Please enter a valid number of tickets.");
      setTicketCount(1);
      return;
    }

    if (!roundId) {
      e.preventDefault();
      toast.error("Lottery round ID is missing. Cannot proceed with purchase.");
      return;
    }

    try {
      await ticketPurchase(roundId, count);
      await onPurchaseSuccess?.();
      Swal.fire({
        title: "Purchase Successful",
        text: `You have successfully purchased ticket.`,
        icon: "success",
        confirmButtonText: "OK",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Ticket purchase failed";
      toast.error(errorMessage);
      Swal.fire({ title: "Purchase Failed", text: errorMessage, icon: "error", confirmButtonText: "OK" });
    }

  }; 

  const PrizeDisplay = ({ prize }: { prize: number }) => {
    const { count } = useCountUp(prize, 2000, 60000); // resets every 10s
    return <span className="price-2">${count}</span>;
  };

  return (
    <div className="lotteries-card-items">
      <span className="serial">{serial}</span>
      <span className="price">
        <i className="fa-solid fa-star"></i>R-{serial} 
      </span>

      {/* <div className="thumb">
        {round?.img ? (
          <Image width={100} height={100} src={round.img} alt="Image" />
        ) : (
          <Image width={100} height={100} src="/images/new/lucky-day.png" alt="Image" /> 
        )}
      </div> */}

      <div className="thumb">
        {round?.img ? (
          <Image
            width={100}
            height={100}
            style={{ width: '100px', height: '100px', objectFit: 'cover' }}
            src={round.img}
            alt="Image"
          />
        ) : (
          <Image
            width={100}
            height={100}
            style={{ width: '100px', height: '100px', objectFit: 'cover' }}
            src="/images/new/lucky-day.png"
            alt="Image"
          />
        )}
      </div>

      <div className="content">
        <h5 className="fw-bolder">{round?.name}</h5>
        <p>{drawAtText}</p>
      </div>

      {prizes[0]?.prize != null && (
        <div className="price-box">
          <span className="price-1">1st Prize</span>
          <PrizeDisplay prize={prizes[0].prize ?? 0} />
        </div>
      )}

      {(prizes[1]?.prize != null || prizes[2]?.prize != null) && (
        <div className="price-wrap">
          {prizes[1]?.prize != null && (
            <div className="price-box2">
              <span className="price-1">2nd</span>
              <PrizeDisplay prize={prizes[1].prize ?? 0} />
            </div>
          )}
          {prizes[2]?.prize != null && (
            <div className="price-box2">
              <span className="price-1">3rd</span>
              <PrizeDisplay prize={prizes[2].prize ?? 0} />
            </div>
          )}
        </div>
      )}

      {(prizes[3]?.prize != null || prizes[4]?.prize != null || prizes[5]?.prize != null) && (
        <div className="price-wrap">
          {prizes[3]?.prize != null && (
            <div className="price-box3">
              <span className="price-1">4th</span>
              <PrizeDisplay prize={prizes[3].prize ?? 0} />
            </div>
          )}
          {prizes[4]?.prize != null && (
            <div className="price-box3">
              <span className="price-1">5th</span>
              <PrizeDisplay prize={prizes[4].prize ?? 0} />
            </div>
          )}
          {prizes[5]?.prize != null && (
            <div className="price-box3">
              <span className="price-1">6th</span>
              <PrizeDisplay prize={prizes[5].prize ?? 0} />
            </div>
          )}
        </div>
      )}

      {roundShow >= 4 && prizes.slice(6, 10).some((p) => p?.prize != null) && (
        <div className="price-wrap">
          {[6, 7, 8, 9].map((i) =>
            prizes[i]?.prize != null ? (
              <div key={i} className="price-box4">
                <span className="price-1">{i + 1}th</span>
                <PrizeDisplay prize={prizes[i].prize ?? 0} />
              </div>
            ) : null
          )}
        </div>
      )}

      <div className="time-left-items">
        <p>Time Left :</p>
        <CountdownTimerNew targetDate={round?.end_time} />
      </div>

      <div className="lottery-details-wrap m-0 p-0">
        <div className="lotteries-card-items style-lottery px-3 border-0 m-0 p-0">
          <div className="ticket-card">
            <div className="border-0 text-center px-2 pb-0">
              <span className="text-lg fw-bold textColor_1"> Per Ticket Price:</span>
              <span className="value ps-3 text-lg fw-bold text-info"> ${round?.price}</span>
            </div>

            <div className="counter-container border-info">
              {ticketCount != 0 && <span>No of Tickets</span>}
              <input
                className="rounded-3 w-25 bg-navy-blue px-2 text-center"
                type="text"
                inputMode="numeric"
                value={ticketCount}
                onChange={handleTicketInput}
                onBlur={handleTicketBlur}
                placeholder="0"
              />

              <div className="controls">
                <button id="minus-btn" type="button" onClick={handleMinus}>
                  -
                </button>
                <span id="ticket-count">{ticketCount}</span>
                <button id="plus-btn" type="button" onClick={handlePlus}>
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="lotterie-btn style-3 mt-3 pb-4">
            {/* <button onClick={(e) => isLoggedIn ? handleBuy(round?.id, e) : handleLoginClick()}
              className="btn--primary py-2 px-3 d-flex align-items-center justify-content-center"
            >
              Pay Now <span className="fw-bold text-xl ms-2">${totalAmount}</span>
              <i className="fa-solid fa-angle-right ps-2 iconSize"></i>
            </button> */}
            {round?.end_time && new Date(round.end_time).getTime() - 60000 < Date.now() ? (
              <span>Wait few minutes for the next draw</span>
            ) : (
              <button
                onClick={(e) => handleBuy(round?.id, e)}
                className="btn--primary py-2 px-3 d-flex align-items-center justify-content-center"
              >
                Pay Now <span className="fw-bold text-xl ms-2">${totalAmount}</span>
                <i className="fa-solid fa-angle-right ps-2 iconSize"></i>
              </button>
            )}
          </div>

        </div>
      </div>

    </div>
  );
};

type LotterySectionProps = {
  roundShow?: number; // optional
};

const LotterySectionOld = ({ roundShow = 0 }: LotterySectionProps) => {

  const [allRounds, setAllRounds] = useState([]);
  const [loading, setLoading] = useState(true);  

  const getRounds = async () => {
    setLoading(true);
    const res = await getAllActiveRounds();
    setAllRounds(res?.data || []);
    setLoading(false);
  };

  useEffect(() => {
    getRounds();
  }, []);

  if (loading) {
    return (
      <>
      {[1, 2, 3].map((i) => (
        <div className="d-flex justify-content-center align-items-center" key={i}>
          <div className="col-12 col-md-6 col-xl-4">
            <LotterySkeleton />
          </div>
        </div>
      ))}
      </>
    );
  }

  return (
    <div className="container px-2 px-md-0">
      <div className="row gutter-24">
        {allRounds.map((round: any, idx: number) => (
          <div
            suppressHydrationWarning
            key={idx}
            className="col-12 col-md-6 col-xl-4 px-0 px-md-2"
            data-aos="fade-up"
            data-aos-duration="600"
          >
            <LotteryCard round={round} roundShow={roundShow} serial={`#${idx + 1}`} onPurchaseSuccess={getRounds} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default LotterySectionOld;