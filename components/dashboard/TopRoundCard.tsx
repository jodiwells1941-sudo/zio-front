"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCountUp } from "@/hooks/useCountUp";
import { getTopRoundTicket } from "@/app/api/lottery";
import CountdownTimerNew from "../containers/CountdownTimerNew";
import LotterySkeleton from "./LotterySkeleton";
import { getTradeEcho } from "@/utils/tradeEcho";

// ── Types ────────────────────────────────────────────────────────────────────
type Prize = {
  id: number;
  position: number;
  prize_percent: number;
  computed_amount: number;
  winner_ticket: string;
};

type RoundDetails = {
  img: string;
  lottery_round_id: number;
  lottery_name: string;
  lottery_id: number;
  round_name: string;
  round: number;
  start_time: string;
  end_time: string;
};

type ApiResponse = {
  round: {
    id: number;
    slug: string;
    name: string;
    count: number;
    start_time: string;
    end_time: string;
    lottery_name: string;
    price: number;
    img: string;
  };
  details: RoundDetails;
  user_ticket: number;
  total_tickets: number;
  winning_possibility: string;
  ticket_price: number;
  net_pool: number;
  prizes: Prize[];
};

// ── Prize Amount with count-up ───────────────────────────────────────────────
// const PrizeAmount = ({ amount }: { amount?: number }) => {
//   const val = useCountUp(amount ?? 0);
//   return <>${val}</>;
// };

const PrizeAmount = ({ prize = 0 }: { prize?: number }) => {
  const { count } = useCountUp(prize, 2000, 60000); // resets every 10s
  return <>{count}</>;
};

// ── Main Component ───────────────────────────────────────────────────────────
const TopRoundCard = () => {
  const [roundData, setRoundData] = useState<ApiResponse | null>(null);
  const [ticketCount, setTicketCount] = useState<number | "">(1);
  const [loading, setLoading] = useState(true);

  const getRounds = async () => {
    setLoading(true);
    const res = await getTopRoundTicket();
    setRoundData(res?.data ?? null);
    setLoading(false);
  };

  useEffect(() => {
    getRounds();
  }, []);

  useEffect(() => {
    const roundId = roundData?.round?.id;
    if (!roundId) return;

    const echo = getTradeEcho();
    if (!echo) return;

    const channelName = `lottery-round-result.${roundId}`;
    const channel = echo.channel(channelName);
    channel.listen(".lottery-round-result.update", () => {
      getRounds();
    });

    return () => {
      channel.stopListening(".lottery-round-result.update");
      echo.leave(channelName);
    };
  }, [roundData?.round?.id]);

  const ticketPrice = roundData?.ticket_price ?? roundData?.round?.price ?? 0;
  const prizes      = roundData?.prizes ?? [];
  const round       = roundData?.round;

  const totalAmount = useMemo(() => {
    const count = typeof ticketCount === "number" ? ticketCount : 0;
    return Number(ticketPrice) * count;
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

  if (!roundData) return null; // or a skeleton/loader

  if (loading) {
    return <LotterySkeleton />;
  }

  return (
    <div className="d-flex flex-column gap-4">
      <div className="lotteries-card-items px-2 bg-navy-blue">

        {/* serial & round id */}
        <span className="serial">#1</span>
        <span className="price">
          <i className="fa-solid fa-star"></i>R-{round?.id}
        </span>

        {/* thumbnail */}
        <div className="thumb">
          <Image
            src={
              round?.img && !round.img.endsWith("/storage")
                ? round.img
                : "/images/new/lucky-day.png"
            }
            alt={round?.name ?? "Lottery"}
            width={200}
            height={200}
            style={{ width: "100%", height: "auto" }}
          />
        </div>

        {/* title */}
        <div className="content">
          <h6 className="fs-20 fw-bold">{round?.name}</h6>
          <p className="py-2">Pricing List</p>
        </div>

        {/* 1st prize */}
        <div className="price-box">
          <span className="price-1">1st Prize</span>
          <span className="price-2">
            <PrizeAmount prize={prizes[0]?.computed_amount} />
          </span>
        </div>

        {/* 2nd & 3rd */}
        <div className="price-wrap">
          <div className="price-box2">
            <span className="price-1">2nd</span>
            <span className="price-2">
              <PrizeAmount prize={prizes[1]?.computed_amount} />
            </span>
          </div>
          <div className="price-box2">
            <span className="price-1">3rd</span>
            <span className="price-2">
              <PrizeAmount prize={prizes[2]?.computed_amount} />
            </span>
          </div>
        </div>

        {/* countdown */}
        <div className="time-left-items">
          <p>Time Left :</p>
          <CountdownTimerNew targetDate={round?.end_time} />
        </div>

        {/* buy section */}
        <div className="lottery-details-wrap m-0 p-0">
          <div className="lotteries-card-items style-lottery px-3 border-0 m-0 p-0">
            <div className="ticket-card">
              <div className="border-0 text-center px-2 pb-0">
                <span className="text-lg fw-bold textColor_1">
                  Per Ticket Price:
                </span>
                <span className="value ps-3 text-lg fw-bold text-info">
                  ${ticketPrice}
                </span>
              </div>

              <div className="counter-container border-info">
                {ticketCount !== "" && ticketCount > 0 && <span>No </span>}
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
                  <button id="minus-btn" type="button" onClick={handleMinus}>-</button>
                  <span id="ticket-count">{ticketCount}</span>
                  <button id="plus-btn" type="button" onClick={handlePlus}>+</button>
                </div>
              </div>
            </div>

            <div className="lotterie-btn style-3 mt-3">
              <Link
                href={`/dashboard/lottery-details/${round?.slug}?qty=${
                  typeof ticketCount === "number" ? ticketCount : 1
                }`}
              >
                <span className="btn--primary py-2 text-sm d-flex align-items-center justify-content-center w-100">
                  Pay Now{" "}
                  <span className="fw-bold text-md">${totalAmount}</span>
                  <i className="fa-solid fa-angle-right ps-2 iconSize"></i>
                </span>
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TopRoundCard;