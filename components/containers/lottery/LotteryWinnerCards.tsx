'use client';

import { getLotteryLatestResults } from "@/app/api/lottery";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import CountdownTimerNew from "../CountdownTimerNew";

type RankItem = {
  rank: string;
  number: string;
  highlight?: boolean;
};

type LotteryCardStyle2 = {
  serial: string;
  price: string;
  thumb: string;
  title: string;
  drawAt: string;
  leftRanks: RankItem[];
  rightRanks: RankItem[];
  nextDrawTime?: string;
  ticketHref?: string;
  winnersHref?: string;
  start_time?: string;
  end_time?: string;
  lotteryName: any;
  lottery: any;
};

// ── helpers ──────────────────────────────────────────────────────────────────

function ordinal(n: number) {
  if (n % 100 >= 11 && n % 100 <= 13) return `${n}th`;
  switch (n % 10) {
    case 1: return `${n}st`;
    case 2: return `${n}nd`;
    case 3: return `${n}rd`;
    default: return `${n}th`;
  }
}

function getDrawLabel(endTime?: string) {
  if (!endTime) return "Draw time unavailable";
  const d = new Date(endTime);
  return `Draw at ${d.toLocaleString("en-US", { month: "long", day: "numeric", year: "numeric" })}`;
}

function formatTime(diff: number): string[] {
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const mins = Math.floor((diff / (1000 * 60)) % 60);
  const secs = Math.floor((diff / 1000) % 60);

  return [
    `${String(days).padStart(2, "0")}D`,
    `${String(hours).padStart(2, "0")}H`,
    `${String(mins).padStart(2, "0")}M`,
    `${String(secs).padStart(2, "0")}S`,
  ];
}


function getTimeLeftStatic(startTime?: string, endTime?: string): string[] {

  if (!startTime || !endTime) return ["00D", "00H", "00M", "00S"];

  const now = Date.now();
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();

  let diff = 0;

  // before start → show time until start
  if (now < start) {
    diff = start - now;
  }
  // after start → show time until end
  else if (now >= start && now <= end) {
    diff = end - now;
  }
  // expired
  else {
    return ["00D", "00H", "00M", "00S"];
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const mins = Math.floor((diff / (1000 * 60)) % 60);
  const secs = Math.floor((diff / 1000) % 60);

  return [
    `${String(days).padStart(2, "0")}D`,
    `${String(hours).padStart(2, "0")}H`,
    `${String(mins).padStart(2, "0")}M`,
    `${String(secs).padStart(2, "0")}S`,
  ];
}

function isValidImageUrl(url?: string | null) {
  return !!url && /^https?:\/\//.test(url) && !url.endsWith("/storage");
}

function mapRoundToCard(round: any): LotteryCardStyle2 {
  const prizes = [...(round.lottery_round_prizes || [])].sort(
    (a: any, b: any) => a.position - b.position
  );

  const allRanks: RankItem[] = prizes.map((p: any) => ({
    rank: ordinal(p.position),
    number: p.winner_ticket?.ticket_code || "-",
    highlight: p.position === 3 || p.position === 8,
  }));

  return {
    serial: `#${round.count ?? "-"}`,
    price: `R-${round.id}`,
    thumb: round.lottery?.feature_img_url && isValidImageUrl(round.lottery.feature_img_url) ? round.lottery.feature_img_url
      : "/images/new/lucky-day.png",  
    title: round.name || "Lottery Round",
    drawAt: getDrawLabel(round.end_time),
    leftRanks: allRanks.slice(0, 5),   // positions 1–5
    rightRanks: allRanks.slice(5, 10), // positions 6–10
    nextDrawTime: round.next_round_time ?? undefined,
    start_time: round.start_time,
    end_time: round.end_time,
    ticketHref: "#",
    winnersHref: "#",
    lotteryName: round.lottery?.name,
    lottery: round.lottery,
  };
}

// ── RankBox ───────────────────────────────────────────────────────────────────

function RankBox({ items }: { items: RankItem[] }) {
  return (
    <div className="pricing-rank-box">
      <div className="rank-top">
        <span>Rank</span>
        <span>Winning No</span>
      </div>
      <ul>
        {items.map((it, i) => (
          <li key={i} className={it.highlight ? "color-2 px-2 px-md-2.5 py-2 py-md-2" : "mb-2 px-2 py-2 px-md-2.5"}>
            <span className="rank-text">
              <Image width={100} height={100} src="/images/new/award.png" alt="img" />
              <span className="text-sm">{it.rank}</span>
            </span>
            <span className="number-text">
              <Image width={100} height={100} src="/images/new/cash.png" alt="img" />
              <span className="text-xs">{it.number}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── CardStyle2 (with live countdown) ─────────────────────────────────────────

function CardStyle2({ card }: { card: LotteryCardStyle2 }) {
    const timeLeft = getTimeLeftStatic(
      card.start_time,
      card.end_time
    );    

  return (
    <div className="lotteries-card-items style-2">
      <span className="serial">{card.serial}</span>
      <span className="price">{card.price}</span>

      {/* <div className="thumb">
        <Image width={100} height={100} src={card.thumb} alt="" />
      </div> */}
       <div className="thumb">
          <Image
            src={
              card.thumb && !card.thumb.endsWith("/storage")
                ? card.thumb
                : "/images/new/lucky-day.png"
            }
            alt={"Lottery"}
            width={200}
            height={200}
            style={{ width: "100%", height: "auto" }}
          />
        </div>

      <div className="content">
        <h5>{card.title}</h5>
        <p className="text-white">{card.drawAt}</p>
      </div>

      <h6>Today's Top 10 Winning Number</h6>

      <div className="pricing-rank-area px-1 gap-2">
        <RankBox items={card.leftRanks} />
        <RankBox items={card.rightRanks} />
      </div>

      <div className="time-left-items">
        <p>Time Left :</p>
        <div className="d-flex align-items-center justify-content-center gap-1">
          {/* {timeLeft.map((t, i) => (
            <span className="bg-success" key={i}>{t}</span>
          ))} */}
          <CountdownTimerNew targetDate={card?.nextDrawTime} />
        </div>
      </div>

      <div className="lotterie-btn style-2">
        <a href={`/dashboard/ticket-history?tab=${card?.lotteryName}`}  className="btns">
          <i className="fa-solid fa-arrow-left"></i> My Ticket
        </a>
        <a href={'/dashboard/lottery-winner'} className="btns">
          Winner List <i className="fa-solid fa-arrow-right"></i>
        </a>
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export default function LotteryWinnerCards() {
  const [cards, setCards] = useState<LotteryCardStyle2[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const observerRef = useRef<HTMLDivElement | null>(null);

  const loadingRef = useRef(false); // ← add this

  const loadData = async (pageNumber: number) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);

    const res = await getLotteryLatestResults(pageNumber);
    const rounds = res?.data?.data || [];
    const lastPage = res?.data?.last_page ?? 1;


    if (rounds.length === 0 || pageNumber >= lastPage) {
      setHasMore(false);
    } else {
      setCards(prev => [...prev, ...rounds.map(mapRoundToCard)]);
    }

    loadingRef.current = false;
    setLoading(false);
  };  

  useEffect(() => {
    loadData(page);
  }, [page]);

  // Intersection Observer
  useEffect(() => {
    if (!hasMore) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          setPage(prev => prev + 1);
        }
      },
      {
        threshold: 1,
      }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore]);  


  return (
    <>
      <div className="row g-4">
        {cards.map((card, idx) => (
          <div
            key={idx}
            className="col-12 col-md-6 col-xxxl-4"
          >
            <CardStyle2 card={card} />
          </div>
        ))}
      </div>

      {loading && (
        <div className="text-center py-4">
          Loading more...
        </div>
      )}

      {hasMore && (
        <div
          ref={observerRef}
          style={{ height: 20 }}
        />
      )}

      {!hasMore && (
        <p className="text-center py-4">
          No more results
        </p>
      )}
    </>
  );
}