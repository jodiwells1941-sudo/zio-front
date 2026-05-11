"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { getLotteryLatestOneRound } from "@/app/api/lottery";
import LotterySkeleton from "./LotterySkeleton";

// ── Types ────────────────────────────────────────────────────────────────────
type LotteryRoundPrize = {
  id: number;
  position: number;
  prize: number;
  winner_amount: number;
  winner_ticket_id: number;
  winner_user_id: number;
  winner_total_tickets: number;
  winner_ticket?: {
    ticket_code?: string;
  };
  winner_user?: {
    uu_id?: string;
  };
};

type LotteryRoundApi = {
  id: number;
  slug: string;
  count?: number;
  name?: string;
  lottery_name?: string;
  end_time?: string;
  img?: string;
  lottery?: {
    feature_img_url?: string | null;
  };
  lottery_round_prizes?: LotteryRoundPrize[];
};

type WinnerRow = {
  rank: string;
  userId: string;
  winningNo: string;
  amount: string;
  showAward: boolean;
  winner_user?: {
  uu_id?: string;
};
};

type WinnerCard = {
  serial: string;
  code: string;
  thumb: string;
  title: string;
  drawAt: string;
  rows: WinnerRow[];
  nextDraw: string[];
};

// ── Helpers ──────────────────────────────────────────────────────────────────
function ordinal(n: number) {
  if (n % 100 >= 11 && n % 100 <= 13) return `${n}th`;
  switch (n % 10) {
    case 1: return `${n}st`;
    case 2: return `${n}nd`;
    case 3: return `${n}rd`;
    default: return `${n}th`;
  }
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

function getDrawLabel(endTime?: string) {
  if (!endTime) return "Draw time unavailable";
  const d = new Date(endTime);
  return `Draw at ${d.toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })}`;
}

function getCountdownParts(endTime?: string): string[] {
  if (!endTime) return ["00D", "00H", "00M", "00S"];
  const diff = Math.max(0, new Date(endTime).getTime() - Date.now());
  const days  = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const mins  = Math.floor((diff / (1000 * 60)) % 60);
  const secs  = Math.floor((diff / 1000) % 60);
  const pad   = (n: number) => String(n).padStart(2, "0");
  return [`${pad(days)}D`, `${pad(hours)}H`, `${pad(mins)}M`, `${pad(secs)}S`];
}

function isValidImageUrl(url?: string | null) {
  return !!url && /^https?:\/\//.test(url) && !url.endsWith("/storage");
}

// ── Mapper ───────────────────────────────────────────────────────────────────
function mapRoundToCard(round: LotteryRoundApi): WinnerCard {
  const prizes = [...(round.lottery_round_prizes || [])].sort(
    (a, b) => a.position - b.position
  );

  const imgUrl = isValidImageUrl(round.lottery?.feature_img_url)
    ? (round.lottery!.feature_img_url as string)
    : isValidImageUrl(round.img)
    ? (round.img as string)
    : "/images/new/lucky-day.png";

  return {
    serial:  `#${round.count ?? "-"}`,
    code:    `R-${round.id}`,
    thumb:   imgUrl,
    title:   round.name || round.lottery_name || "Lottery Round",
    drawAt:  getDrawLabel(round.end_time),
    rows: prizes.map((p) => ({
      rank:      ordinal(p.position),
      userId:    `#${p.winner_user?.uu_id}`,
      winningNo: p.winner_ticket?.ticket_code || "-",
      amount:    formatMoney(p.winner_amount),
      showAward: p.position <= 3,
    })),
    nextDraw: getCountdownParts(round.end_time),
  };
}

// ── Card UI ──────────────────────────────────────────────────────────────────
function LatestRoundCard({ card }: { card: WinnerCard }) {

  return (
    <div className="lotteries-card-items style-lottery">
      <span className="serial">{card.serial}</span>
      <span className="price">{card.code}</span>

      <div className="thumb">
        <Image width={100} height={100} src={card.thumb} alt="Image" />
      </div>

      <div className="content">
        <h6>{card.title}</h6>
        <p className="text-white">{card.drawAt}</p>
      </div>

      <h6>Today's Top 10 Winning Number</h6>

      <div className="">
        <table className="winner-table-item w-full">
          <thead>
            <tr className="border-bottom pb-2">
              <th className="fw-bold text-info px-1 text-sm">Rank</th>
              <th className="fw-bold text-info px-1 text-sm">User ID</th>
              <th className="fw-bold text-info px-1 text-sm">Winning No</th>
              <th className="fw-bold text-info px-1 text-sm">Amount</th>
            </tr>
          </thead>
          <tbody>
            {card.rows.map((r, i) => (
              <tr key={i} className="border-bottom border-secondary">
                <td>
                  <span className="rank-badge my-2 text-sm">
                    <span className="ps-2">
                      {r.showAward
                        ? <b className="text-info">{r.rank}</b>
                        : r.rank}
                    </span>
                  </span>
                </td>
                <td>
                  <span className="user-id text-sm my-2 ms-2">
                    {/* {r.userId} */}
                     {(() => {
                      const raw = r.userId;
                      return raw ? raw.replace(/^(.{2}).*(.{2})$/, '$1$2') : "—";
                    })()}
                  </span>
                </td>
                <td>
                  <span className="win-no text-sm my-2">{r.winningNo}</span>
                </td>
                <td>
                  <span className="amount text-sm my-2 text-warning fw-bold">
                    {r.amount}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="time-left-items">
        <p>Next Draw:</p>
        <div className="d-flex align-items-center justify-content-center gap-1">
          {card.nextDraw.map((t, idx) => (
            <span className="bg-success" key={idx}>{t}</span>
          ))}
        </div>
      </div>

      <div className="lotterie-btn style-3">
        <a href="#" className="btns">
          <i className="ti ti-chevron-left"></i> Older
        </a>
        <a href="#" className="btns">
          Newer <i className="ti ti-chevron-right"></i>
        </a>
      </div>
    </div>
  );
}

// ── Section ──────────────────────────────────────────────────────────────────
export default function LatestRoundSection() {
  const [latestRound, setLatestRound] = useState<LotteryRoundApi | null>(null);
  const [loading, setLoading] = useState(true);

  const getLatestRound = async () => {
    try {
      const res = await getLotteryLatestOneRound();
      setLatestRound(res?.data || null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getLatestRound();
  }, []);

  if (loading) return <LotterySkeleton />;
  if (!latestRound) return null;

  const card = mapRoundToCard(latestRound);
  return <LatestRoundCard card={card} />;
}
