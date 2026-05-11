"use client";

import { getAllActiveRounds } from "@/app/api/lottery";
import CountdownTimerNew from "@/components/containers/CountdownTimerNew";
import { useCountUp } from "@/hooks/useCountUp";
import { getTradeEcho } from "@/utils/tradeEcho";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useMemo, useRef, useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";
import LotterySkeleton from "../LotterySkeleton";
import styles from "./dashboard.module.css";

// ── Types ────────────────────────────────────────────────────────────────────
type LotteryCardProps = {
  round?: any;
  roundShow?: number;
  serial?: string;
  drawAtText?: string;
};

// ── Card ─────────────────────────────────────────────────────────────────────
const LotteryCard = ({
  round,
  roundShow = 0,
  serial = "#1",
  drawAtText = "Pricing List",
}: LotteryCardProps) => {
  const [ticketCount, setTicketCount] = useState<number | "">(1);
  const [prizes, setPrizes] = useState(round?.computed_prizes?.prizes || []);

  const ticketPrice = round?.price || 0;

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

  const PrizeDisplay = ({ prize }: { prize: number }) => {
    const { count } = useCountUp(prize, 2000, 60000); // resets every 10s
    return <span className="price-2">${count}</span>;
  };

  return (
    <div className="lotteries-card-items">
      <span className="serial">{serial}</span>
      <span className="price">
        <i className="fa-solid fa-star"></i>R-{round?.id}
      </span>

      {/* thumb */}
      <div className="thumb">
        {round?.img ? (
          <Image width={100} height={100} src={round.img} alt="Image" />
        ) : (
          <Image width={100} height={100} src="/images/new/lucky-day.png" alt="Image" />
        )}
      </div>

      {/* title */}
      <div className="content">
        <h5 className="fw-bolder">{round?.name}</h5>
        <p>{drawAtText}</p>
      </div>

      {/* 1st prize */}
      <div className="price-box">
        <span className="price-1">1st Prize</span>
        <span className="price-2">${PrizeDisplay({ prize: Number(prizes[0]?.computed_amount) })}</span>
      </div>

      {/* 2nd & 3rd */}
      <div className="price-wrap">
        <div className="price-box2">
          <span className="price-1">2nd</span>
          <span className="price-2">${PrizeDisplay({ prize: Number(prizes[1]?.computed_amount) })}</span>
        </div>
        <div className="price-box2">
          <span className="price-1">3rd</span>
          <span className="price-2">${PrizeDisplay({ prize: Number(prizes[2]?.computed_amount) })}</span>
        </div>
      </div>

      {/* 4th – 6th */}
      <div className="price-wrap">
        <div className="price-box3">
          <span className="price-1">4th</span>
          <span className="price-2">${PrizeDisplay({ prize: Number(prizes[3]?.computed_amount) })}</span>
        </div>
        <div className="price-box3">
          <span className="price-1">5th</span>
          <span className="price-2">${PrizeDisplay({ prize: Number(prizes[4]?.computed_amount) })}</span>
        </div>
        <div className="price-box3">
          <span className="price-1">6th</span>
          <span className="price-2">${PrizeDisplay({ prize: Number(prizes[5]?.computed_amount) })}</span>
        </div>
      </div>

      {/* 7th – 10th */}
      {roundShow >= 4 && (
        <div className="price-wrap">
          <div className="price-box4 d-none d-md-block">
            <span className="price-1">7th</span>
            <span className="price-2">${PrizeDisplay({ prize: Number(prizes[6]?.computed_amount) })}</span>
          </div>
          <div className="price-box4 d-none d-md-block">
            <span className="price-1">8th</span>
            <span className="price-2">${PrizeDisplay({ prize: Number(prizes[7]?.computed_amount) })}</span>
          </div>
          <div className="price-box4 d-none d-md-block">
            <span className="price-1">9th</span>
            <span className="price-2">${PrizeDisplay({ prize: Number(prizes[8]?.computed_amount) })}</span>
          </div>
          <div className="price-box4 d-none d-md-block">
            <span className="price-1">10th</span>
            <span className="price-2">${PrizeDisplay({ prize: Number(prizes[9]?.computed_amount) })}</span>
          </div>
        </div>
      )}

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
              <span className="text-lg fw-bold textColor_1">Per Ticket Price:</span>
              <span className="value ps-3 text-lg fw-bold text-info">${ticketPrice}</span>
            </div>

            <div className="counter-container border-info">
              {ticketCount !== 0 && <span>No of Tickets</span>}
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
              href={`/lottery-details/${round?.slug}`}
              className="btn--primary py-2 px-3 d-flex align-items-center justify-content-center"
            >
              Pay Now <span className="fw-bold text-xl">${totalAmount}</span>
              <i className="fa-solid fa-angle-right ps-2 iconSize"></i>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Slider Section ────────────────────────────────────────────────────────────
type LotterySliderProps = {
  roundShow?: number;
};

const LotterySliderCard = ({ roundShow = 0 }: LotterySliderProps) => {
  const sliderRef = useRef<Slider | null>(null);

  const [allRounds, setAllRounds] = useState([]);
  const [loading, setLoading]     = useState(true);

  const getRounds = async () => {
    setLoading(true);
    const res = await getAllActiveRounds();
    setAllRounds(res?.data || []);
    setLoading(false);
  };

  useEffect(() => {
    getRounds();
  }, []);

  useEffect(() => {
    if (!allRounds.length) return;

    const echo = getTradeEcho();
    if (!echo) return;

    const roundIds = Array.from(
      new Set(
        allRounds
          .map((round: any) => round?.id)
          .filter((id: number | undefined): id is number => Boolean(id))
      )
    );

    let refreshTimer: ReturnType<typeof setTimeout> | null = null;
    const channels = roundIds.map((roundId) => {
      const channelName = `lottery-round-result.${roundId}`;
      const channel = echo.channel(channelName);
      channel.listen(".lottery-round-result.update", () => {
        if (refreshTimer) clearTimeout(refreshTimer);
        refreshTimer = setTimeout(() => {
          getRounds();
        }, 250);
      });
      return { channel, channelName };
    });

    return () => {
      if (refreshTimer) clearTimeout(refreshTimer);
      channels.forEach(({ channel, channelName }) => {
        channel.stopListening(".lottery-round-result.update");
        echo.leave(channelName);
      });
    };
  }, [allRounds]);

  const settings = {
    dots: false,
    arrows: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    autoplay: true,
    slidesToScroll: 1,
    appendDots: (dots: React.ReactNode) => (
      <div className={styles.dots}>{dots}</div>
    ),
    customPaging: () => <span className={styles.dot}></span>,
  };

  if (loading) return <LotterySkeleton />;

  return (
    <div className="container px-0">
      <Slider ref={sliderRef} {...settings}>
        {allRounds.map((round: any, idx: number) => (
          <div key={round.id ?? idx}>
            <LotteryCard
              round={round}
              roundShow={roundShow}
              serial={`#${idx + 1}`}
            />
          </div>
        ))}
      </Slider>

      {/* Custom Navigation */}
      <div className="slider-navigation mt-4 pt-2 d-flex justify-content-center gap-3">
        <button
          className="slider-btn"
          onClick={() => sliderRef.current?.slickPrev()}
        >
          <i className="fa-solid fa-angle-left"></i>
        </button>
        <button
          className="slider-btn"
          onClick={() => sliderRef.current?.slickNext()}
        >
          <i className="fa-solid fa-angle-right"></i>
        </button>
      </div>
    </div>
  );
};

export default LotterySliderCard;