"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type TimeLeft = {
  d: string;
  h: string;
  m: string;
  s: string;
};

type TicketSummary = {
  yourTicket: number | string;
  winningChance: string; // "10%"
  winningNumber: string;
};

type TicketGridItem = {
  value: string;
  isActive?: boolean;
  isWin?: boolean;
};

type TicketHistoryCardData = {
  id: string;
  lotteryName: string; // "Lucky Day"
  roundLabel: string; // "Round 2"
  drawText: string; // "Draw at November 21st 2025, 05:30PM"
  timeLeft: TimeLeft;
  summary: TicketSummary;
  grid: TicketGridItem[];
  className?: string; // "mt-10" etc
};

type TicketHistoryPageProps = {
  title?: string; // "Lottery"
  items: TicketHistoryCardData[];
  onOpenSidebar?: () => void;
};

export default function TicketHistoryPage({
  title = "Lottery",
  items,
  // onOpenSidebar,
}: TicketHistoryPageProps) {
  return (
    <main className="px-xl-0 px-2">

      {items.map((item) => (
        <TicketHistoryCard key={item.id} data={item} pageTitle={title} />
      ))}
    </main>
  );
}

export function useCountdown(timeLeft: TimeLeft) {
  // Parse numbers from strings like "00D", "09H", "19M", "06S"
  const parse = (val: string) => parseInt(val.replace(/\D/g, ""), 10) || 0;

  const [time, setTime] = useState({
    d: parse(timeLeft.d),
    h: parse(timeLeft.h),
    m: parse(timeLeft.m),
    s: parse(timeLeft.s),
  });

  useEffect(() => {
    // Reset if new timeLeft comes in
    setTime({
      d: parse(timeLeft.d),
      h: parse(timeLeft.h),
      m: parse(timeLeft.m),
      s: parse(timeLeft.s),
    });
  }, [timeLeft.d, timeLeft.h, timeLeft.m, timeLeft.s]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime((prev) => {
        let { d, h, m, s } = prev;

        if (d === 0 && h === 0 && m === 0 && s === 0) {
          clearInterval(timer);
          return prev; // already at zero
        }

        s -= 1;

        if (s < 0) {
          s = 59;
          m -= 1;
        }
        if (m < 0) {
          m = 59;
          h -= 1;
        }
        if (h < 0) {
          h = 23;
          d -= 1;
        }
        if (d < 0) {
          d = 0; h = 0; m = 0; s = 0;
        }

        return { d, h, m, s };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft.d, timeLeft.h, timeLeft.m, timeLeft.s]);

  return {
    d: String(time.d).padStart(2, "0") + "D",
    h: String(time.h).padStart(2, "0") + "H",
    m: String(time.m).padStart(2, "0") + "M",
    s: String(time.s).padStart(2, "0") + "S",
  };
}

function TicketHistoryCard({ data, pageTitle }: { data: TicketHistoryCardData; pageTitle: string }) {
  const countdown = useCountdown(data.timeLeft);

  return (
    <div className={`ticket-history-items mt-10 ${data.className ?? ""}`.trim()}>
      <div className="lottery-header ">

        <div className="lotteries-card-items border-0 p-0 m-0">
          <span className="serial" style={{ marginLeft: -28 }}>#1</span>
        </div>

        <div className="time-left-card position-absolute">
          <p className="fw-6 d-none d-md-block">Time Left:</p>
          <span>{countdown.d}</span>
          <span>{countdown.h}</span>
          <span>{countdown.m}</span>
          <span>{countdown.s}</span>
        </div>
        
        <div className="thumb pb-4 pt-5 pt-md-2">
          <Image width={120} height={120} src="/images/winnig_img.svg" alt="Image" />
        </div>

        <h3>
          {data?.lotteryName} <span>( {data.roundLabel} )</span>
        </h3>

        <p>{data.drawText}</p>

        <div className="recent-title">
          <span></span>
          <h3>Recent Ticket Purchase</h3>
          <span></span>
        </div>
      </div>

      <div className="ticket-details">
        <div className="rows">
          <span>Your Ticket</span>
          <b>{data.summary.yourTicket}</b>
        </div>
        <div className="rows">
          <span>Winning Chance</span>
          <b>{data.summary.winningChance}</b>
        </div>
        <div className="rows win">
          <span>Winning Number</span>
          <b>{data.summary.winningNumber}</b>
        </div>
      </div>

      {/* watermark */}
      <div className="lucky-bg">LUCKY</div>

      <div className="ticket-no text-xl">Ticket No</div>
      <div className="ticket-grid-two">
        {data.grid.map((g, idx) => (
          <span
            key={`${g.value}-${idx}`}
            className={`ticket-box ${g.isActive ? "win" : ""}`}
            // className={`ticket-box ${g.isActive ? "active" : ""} ${
            //   g.isWin ? "win" : ""
            // }`}
          >
            <i className="fa-solid fa-ticket ticket-icon"></i>
            <span className="ticket-number text-xs">{g.value}</span>
          </span>
        ))}
      </div>

    </div>
  );
}