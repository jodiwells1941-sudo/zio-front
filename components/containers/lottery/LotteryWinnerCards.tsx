'use client';

import { getLotteryWinners } from "@/app/api/lottery";
import Image from "next/image";
import { useEffect, useState } from "react";
import CountdownTimerNew from "../CountdownTimerNew";

// ─── Types ────────────────────────────────────────────────────────────────────

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
  start_time?: string;
  end_time?: string;
  lotteryName: string;
};

type LotteryRoundPrize = {
  position: number;
  winner_amount: number;
  winner_user_id: number;
  winner_total_tickets: number;
  winner_ticket?: { ticket_code?: string };
  winner_user?: { uu_id: string };
};

type LotteryRound = {
  id: number;
  count?: number;
  name?: string;
  start_time?: string;
  end_time?: string;
  next_round_time?: string;
  feature_img?: string;
  lottery_round_prizes?: LotteryRoundPrize[];
  lottery?: {
    name?: string;
    feature_img_url?: string | null;
  };
};

type LotteryApi = {
  id: number;
  name?: string;
  feature_img_url?: string | null;
  lottery_rounds?: LotteryRound[];
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function ordinal(n: number) {
  if (n % 100 >= 11 && n % 100 <= 13) return `${n}th`;
  switch (n % 10) {
    case 1:  return `${n}st`;
    case 2:  return `${n}nd`;
    case 3:  return `${n}rd`;
    default: return `${n}th`;
  }
}

function getDrawLabel(endTime?: string) {
  if (!endTime) return "Draw time unavailable";
  return `Draw at ${new Date(endTime).toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })}`;
}

function isValidImageUrl(url?: string | null) {
  return !!url && /^https?:\/\//.test(url) && !url.endsWith("/storage");
}

function mapRoundToCard(round: LotteryRound): LotteryCardStyle2 {
  const prizes = [...(round.lottery_round_prizes || [])].sort(
    (a, b) => a.position - b.position
  );

  const allRanks: RankItem[] = prizes.map((p) => ({
    rank: ordinal(p.position),
    number: p.winner_ticket?.ticket_code || "-",
    highlight: p.position === 3 || p.position === 8,
  }));

  const imgUrl = round.lottery?.feature_img_url;

  return {
    serial: `#${round.count ?? "-"}`,
    price: `R-${round.id}`,
    thumb: isValidImageUrl(imgUrl) ? (imgUrl as string) : "/images/new/lucky-day.png",
    title: round.name || "Lottery Round",
    drawAt: getDrawLabel(round.end_time),
    leftRanks: allRanks.slice(0, 5),   // positions 1–5
    rightRanks: allRanks.slice(5, 10), // positions 6–10
    nextDrawTime: round.next_round_time ?? undefined,
    start_time: round.start_time,
    end_time: round.end_time,
    lotteryName: round.lottery?.name ?? "",
  };
}

// ─── RankBox ──────────────────────────────────────────────────────────────────

function RankBox({ items }: { items: RankItem[] }) {
  return (
    <div className="pricing-rank-box">
      <div className="rank-top">
        <span>Rank</span>
        <span>Winning No</span>
      </div>
      <ul>
        {items.map((it, i) => (
          <li
            key={i}
            className={
              it.highlight
                ? "color-2 px-2 px-md-2.5 py-2 py-md-2"
                : "mb-2 px-2 py-2 px-md-2.5"
            }
          >
            <span className="rank-text">
              <Image width={100} height={100} src="/images/new/award.png" alt="award" />
              <span className="text-sm">{it.rank}</span>
            </span>
            <span className="number-text">
              <Image width={100} height={100} src="/images/new/cash.png" alt="cash" />
              <span className="text-xs">{it.number}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Single winner card ───────────────────────────────────────────────────────

function WinnerCardStyle2({
  idx,
  rounds,
  lotteryImage,
}: {
  idx: number;
  rounds: LotteryRound[];
  lotteryImage?: string | null;
}) {
  // Start at the latest round (last index) — same as BettingWinners
  const [index, setIndex] = useState(rounds.length - 1);
  const card = mapRoundToCard(rounds[index]);

  const goOlder = () => setIndex((i) => Math.max(0, i - 1));
  const goNewer = () => setIndex((i) => Math.min(rounds.length - 1, i + 1));

  const isOldest = index === 0;
  const isNewest = index === rounds.length - 1;

  // Resolve the thumbnail: prefer lottery-level image, then round-level
  const resolvedThumb =
    isValidImageUrl(lotteryImage) ? (lotteryImage as string) : card.thumb;

  return (
    <div className="lotteries-card-items style-2">
      <span className="serial">{idx + 1}</span>
      <span className="price">{card.serial}</span>

      <div className="thumb">
        <Image
          src={resolvedThumb}
          alt="Lottery"
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

      {/* Countdown */}
      <div className="time-left-items">
        <p>Time Left :</p>
        <div className="d-flex align-items-center justify-content-center gap-1">
          <CountdownTimerNew targetDate={card.nextDrawTime} />
        </div>
      </div>

      {/* Older / Newer navigation — identical to BettingWinners */}
      <div className="lotterie-btn style-2">
        <button
          className={`btns ${isOldest ? "opacity-50" : ""}`}
          onClick={goOlder}
          disabled={isOldest}
        >
          <i className="ti ti-chevron-left"></i> Older
        </button>
        <button
          className={`btns ${isNewest ? "opacity-50" : ""}`}
          onClick={goNewer}
          disabled={isNewest}
        >
          Newer <i className="ti ti-chevron-right"></i>
        </button>
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function LotteryWinnerCards() {
  const [lotteries, setLotteries] = useState<LotteryApi[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchWinners = async () => {
    setLoading(true);
    const res = await getLotteryWinners();
    const data = res?.data ?? [];
    // Normalise: accept both a single object and an array
    setLotteries(Array.isArray(data) ? data : [data]);
    setLoading(false);
  };

  useEffect(() => {
    fetchWinners();
  }, []);

  if (loading) return null; // swap for <LotterySkeleton /> if desired

  return (
    <div className="row g-4">
      {lotteries.map((lottery, idx) => {
        const rounds = lottery.lottery_rounds ?? [];
        if (rounds.length === 0) return null;

        return (
          <div
            key={lottery.id}
            className="col-12 col-md-6 col-xxxl-4"
            data-aos="fade-up"
            data-aos-duration="600"
          >
            <WinnerCardStyle2
              idx={idx}
              rounds={rounds}
              lotteryImage={lottery.feature_img_url}
            />
          </div>
        );
      })}
    </div>
  );
}