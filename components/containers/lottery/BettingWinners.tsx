"use client";

import { useCountdown } from "@/components/dashboard/Tickets/TicketHistoryPage";
import Image from "next/image";
import { useState } from "react";

type WinnerRow = {
  rank: string;
  userId: string;
  winningNo: string;
  amount: string;
  tickets: string;
  showAward?: boolean;
};

type WinnerCard = {
  serial: string;
  code: string;
  thumb: string;
  title: string;
  drawAt: string;
  rows: WinnerRow[];
  nextDrawTime: string | undefined; // raw ISO string for countdown
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
  end_time?: string;
  next_draw_time?: string;
  feature_img?: string;
  lottery_round_prizes?: LotteryRoundPrize[];
};

type LotteryApi = {
  id: number;
  name?: string;
  feature_img_url?: string | null;
  lottery_rounds?: LotteryRound[];
};

// ─── helpers ────────────────────────────────────────────────────────────────

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
  return `Draw at ${new Date(endTime).toLocaleString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  })}`;
}

function isValidImageUrl(url?: string | null) {
  return !!url && /^https?:\/\//.test(url) && !url.endsWith("/storage");
}

function mapRoundToCard(round: LotteryRound): WinnerCard {
  const prizes = [...(round.lottery_round_prizes || [])].sort(
    (a, b) => a.position - b.position
  );

  return {
    serial: `#${round.count ?? "-"}`,
    code: `R-${round.id}`,
    thumb: isValidImageUrl(round.feature_img) ? (round.feature_img as string) : "/images/new/lucky-day.png",
    title: round.name || "Lottery Round",
    drawAt: getDrawLabel(round.end_time),
    nextDrawTime: round.next_draw_time,
    rows: prizes.map((p) => ({
      rank: ordinal(p.position),
      userId: `#${p.winner_user?.uu_id || p.winner_user_id}`,
      winningNo: p.winner_ticket?.ticket_code || "-",
      amount: formatMoney(p.winner_amount),
      tickets: String(p.winner_total_tickets ?? 0),
      showAward: p.position <= 3,
    })),
  };
}

// ─── Countdown display ───────────────────────────────────────────────────────

function toTimeLeftFromIso(isoTime?: string): Parameters<typeof useCountdown>[0] {
  const zero = { d: "00D", h: "00H", m: "00M", s: "00S" };

  if (!isoTime) return zero;

  const target = new Date(isoTime).getTime();
  if (Number.isNaN(target)) return zero;

  let diff = Math.max(0, target - Date.now());

  const dayMs = 24 * 60 * 60 * 1000;
  const hourMs = 60 * 60 * 1000;
  const minuteMs = 60 * 1000;

  const days = Math.floor(diff / dayMs);
  diff %= dayMs;

  const hours = Math.floor(diff / hourMs);
  diff %= hourMs;

  const minutes = Math.floor(diff / minuteMs);
  diff %= minuteMs;

  const seconds = Math.floor(diff / 1000);

  return {
    d: String(days).padStart(2, "0") + "D",
    h: String(hours).padStart(2, "0") + "H",
    m: String(minutes).padStart(2, "0") + "M",
    s: String(seconds).padStart(2, "0") + "S",
  };
}

function NextDrawCountdown({ isoTime }: { isoTime?: string }) {
  const { d, h, m, s } = useCountdown(toTimeLeftFromIso(isoTime));
  return (
    <div className="d-flex align-items-center justify-content-center gap-1">
      <span className="bg-success">{d}</span>
      <span className="bg-success">{h}</span>
      <span className="bg-success">{m}</span>
      <span className="bg-success">{s}</span>
    </div>
  );
}

// ─── Single winner card ──────────────────────────────────────────────────────

function WinnerCardItem({ idx, rounds, lotteryImage }: { idx: number; rounds: LotteryRound[]; lotteryImage?: string | null }) {
  // Start at the latest round (last index)
  const [index, setIndex] = useState(rounds.length - 1);
  const card = mapRoundToCard(rounds[index]);  

  const goOlder = () => setIndex((i) => Math.max(0, i - 1));
  const goNewer = () => setIndex((i) => Math.min(rounds.length - 1, i + 1));

  const isOldest = index === 0;
  const isNewest = index === rounds.length - 1;   

  return (
    <div className="lotteries-card-items style-lottery">
      <span className="serial">{idx + 1}</span>
      <span className="price">{card.serial}</span>

      <div className="thumb">
        <Image width={100} height={100} src={lotteryImage || card.thumb} alt="Lottery" />
      </div>

      <div className="content">
        <h5>{card.title}</h5>
        <p className="text-white">{card.drawAt}</p>
      </div>

      <h6>Today's Top 10 Winning Number</h6>

      {/* Desktop table */}
      <div className="winner-table-container d-none d-lg-block px-1">
        <table className="winner-table-item">
          <thead>
            <tr>
              <th>Rank</th>
              <th>User ID</th>
              <th>Winning No</th>
              <th>Amount</th>
              <th>Tickets</th>
            </tr>
          </thead>
          <tbody>
            {card.rows.map((r, i) => (
              <tr key={i}>
                <td>
                  <span className="rank-badge my-2 my-md-0">
                    <div>
                      <Image
                        width={20} height={20}
                        className={r.showAward ? "" : "opacity-0"}
                        src="/images/new/award.png" alt=""
                      />
                    </div>
                    {r.rank}
                  </span>
                </td>
                <td>
                  <span className="user-id my-2 my-md-0">
                    <Image width={20} height={20} className="d-none d-md-block" src="/images/new/user.png" alt="" />
                    {/* {r.userId} */}
                    {(() => {
                      const raw = r.userId;
                      return raw ? raw.replace(/^(.{2}).*(.{2})$/, '$1$2') : "—";
                    })()}
                  </span>
                </td>
                <td>
                  <span className="win-no my-2 my-md-0">
                    <Image width={20} height={20} className="d-none d-md-block" src="/images/new/win.png" alt="" />
                    {r.winningNo}
                  </span>
                </td>
                <td>
                  <span className="amount my-2 my-md-0 text-info fw-bold">
                    <Image width={20} height={20} className="d-none d-md-block" src="/images/new/cash.png" alt="" />
                    {r.amount}
                  </span>
                </td>
                <td><span className="my-2 my-md-0">{r.tickets}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile table */}
      <div className="d-lg-none">
        <table className="winner-table-item w-full">
          <thead>
            <tr className="border-bottom pb-2">
              <th className="fw-bold text-info px-1">Rank</th>
              <th className="fw-bold text-info px-1">User ID</th>
              <th className="fw-bold text-info px-1">Winning No</th>
              <th className="fw-bold text-info px-1">Amount</th>
              <th className="fw-bold text-info px-1">Tickets</th>
            </tr>
          </thead>
          <tbody>
            {card.rows.map((r, i) => (
              <tr key={i} className="border-bottom border-secondary">
                <td>
                  <span className="rank-badge my-2 my-lg-0">
                    <Image
                      width={22} height={22}
                      className={r.showAward ? "d-none d-lg-block" : "opacity-0 d-none d-lg-block"}
                      src="/images/new/award.png" alt=""
                    />
                    <span className="ps-2">
                      {r.showAward ? <b className="text-info">{r.rank}</b> : r.rank}
                    </span>
                  </span>
                </td>
                <td><span className="user-id my-2 my-lg-0 ms-2">{r.userId}</span></td>
                <td><span className="win-no my-2 my-lg-0">{r.winningNo}</span></td>
                <td><span className="amount my-2 my-lg-0 text-warning fw-bold">{r.amount}</span></td>
                <td><span className="my-2 my-lg-0">{r.tickets}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Countdown */}
      <div className="time-left-items">
        <NextDrawCountdown isoTime={card.nextDrawTime} />
      </div>

      {/* Older / Newer navigation */}
      <div className="lotterie-btn style-3">
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

// ─── Main export ─────────────────────────────────────────────────────────────

export default function BettingWinners({
  winners,
}: {
  winners: LotteryApi | LotteryApi[] | null | undefined;
}) {
  const lotteries = Array.isArray(winners) ? winners : winners ? [winners] : [];   

  return (
    <div className="row g-4">
      {lotteries.map((lottery, idx) => {
        const rounds = lottery.lottery_rounds ?? [];
        if (rounds.length === 0) return null;

        return (
          <div
            key={idx}
            className="col-12 col-md-6 col-xxxl-4"
            data-aos="fade-up"
            data-aos-duration="600"
          >
            <WinnerCardItem idx={idx} rounds={rounds} lotteryImage={lottery.feature_img_url} />
          </div>
        );
      })}
    </div>
  );
}