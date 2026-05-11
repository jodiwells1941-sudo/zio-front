// "use client";

// import Image from "next/image";
// import styles from "./dashboard.module.css";

// type WinningRow = { rank: string; wonNo: string };

// type Props = {
//   serial?: string;
//   title?: string;
//   code?: string;
//   drawAt?: string;
//   nextDraw?: { d: string; h: string; m: string; s: string };
//   leftLogoSrc?: string;
//   rowsLeft?: WinningRow[];
//   rowsRight?: WinningRow[];
// };

// export default function LatestDrawMobileCard({
//   serial = "#1",
//   title = "Lucky Day",
//   code = "R-1000",
//   drawAt = "Draw at November 21st 2025",
//   nextDraw = { d: "02D", h: "05H", m: "25M", s: "37S" },
//   leftLogoSrc = "/images/new/lucky-day.png",
//   rowsLeft = [
//     { rank: "1st", wonNo: "584X748" },
//     { rank: "2nd", wonNo: "584X748" },
//     { rank: "3rd", wonNo: "584X748" },
//     { rank: "4th", wonNo: "584X748" },
//     { rank: "5th", wonNo: "584X748" },
//   ],
//   rowsRight = [
//     { rank: "6th", wonNo: "584X748" },
//     { rank: "7th", wonNo: "584X748" },
//     { rank: "8th", wonNo: "584X748" },
//     { rank: "9th", wonNo: "584X748" },
//     { rank: "10th", wonNo: "584X748" },
//   ],
// }: Props) {
//   return (
//     <section className={styles.section}>
//       {/* header */}
//       <div className={styles.header}>
//         <div className={styles.heading}>
//           Latest <span className={styles.headingAccent}>Draw</span>
//         </div>

//         <a className={styles.seeAll} href="#">
//           See All <i className="fa-solid fa-arrow-right" />
//         </a>
//       </div>

//       {/* card */}
//       <div className={`${styles.card} position-relative`}>
//         {/* Top content: left + right */}
//         <div className={styles.topGrid}>
//           {/* LEFT */}
//           <div className={styles.left}>
//             <div className={styles.serial}>{serial}</div>

//             <div className={`${styles.logoRow}`}>
//               <Image
//                 src={leftLogoSrc}
//                 alt="Logo"
//                 width={92}
//                 height={46}
//                 className={styles.logo}
//                 priority
//               />
//             </div>

//             <div className={`${styles.title} d-flex gap-1`}>
//               {title} <span className={styles.code}>[{code}]</span>
//             </div>

//             <div className={styles.drawAt}>{drawAt}</div>

//             <div className={`${styles.nextDrawLabel} text-center pt-4 mt-1`}>Next Draw :</div>

//             <div className={styles.chips}>
//               <span className={styles.chip}>{nextDraw.d}</span>
//               <span className={styles.chip}>{nextDraw.h}</span>
//               <span className={styles.chip}>{nextDraw.m}</span>
//               <span className={styles.chip}>{nextDraw.s}</span>
//             </div>
//           </div>

//           {/* RIGHT */}
//           <div className={styles.right}>
//             <div className={styles.tableTitle}>Top 10 Winning Number</div>

//             <div className={styles.tableWrap}>
//               <div className={styles.tableCol}>
//                 <div className={styles.tableHead}>
//                   <span className={styles.thRank}>Rank</span>
//                   <span className={styles.thWon}>Won No</span>
//                 </div>

//                 {rowsLeft.map((r) => (
//                   <div key={r.rank} className={styles.tr}>
//                     <span className={styles.tdRank}>{r.rank}</span>
//                     <span className={styles.tdWon}>{r.wonNo}</span>
//                   </div>
//                 ))}
//               </div>

//               <div className={styles.tableCol}>
//                 <div className={styles.tableHead}>
//                   <span className={styles.thRank}>Rank</span>
//                   <span className={styles.thWon}>Won No</span>
//                 </div>

//                 {rowsRight.map((r) => (
//                   <div key={r.rank} className={styles.tr}>
//                     <span className={styles.tdRank}>{r.rank}</span>
//                     <span className={styles.tdWon}>{r.wonNo}</span>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>

//       </div>
//         {/* dots */}
//         <div className={styles.dots}>
//           <span className={styles.dot} />
//           <span className={styles.dot} />
//           <span className={`${styles.dot} ${styles.dotActive}`} />
//           <span className={styles.dot} />
//           <span className={styles.dot} />
//         </div>
//     </section>
//   );
// }


"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import styles from "./dashboard.module.css";
import { getLotteryLatestRounds } from "@/app/api/lottery";
import LotterySkeleton from "../LotterySkeleton";

// ── Types ────────────────────────────────────────────────────────────────────
type WinningRow = { rank: string; wonNo: string };

type DrawCard = {
  serial: string;
  title: string;
  code: string;
  drawAt: string;
  nextDraw: { d: string; h: string; m: string; s: string };
  leftLogoSrc: string;
  rowsLeft: WinningRow[];
  rowsRight: WinningRow[];
};

type LotteryRoundPrize = {
  position: number;
  winner_amount: number;
  winner_user_id: number;
  winner_total_tickets: number;
  winner_ticket?: { ticket_code?: string };
};

type LotteryRoundApi = {
  id: number;
  count?: number;
  name?: string;
  lottery_name?: string;
  end_time?: string;
  next_draw_time?: string;
  img?: string;
  lottery?: { feature_img_url?: string | null };
  lottery_round_prizes?: LotteryRoundPrize[];
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

function getDrawLabel(endTime?: string) {
  if (!endTime) return "Draw time unavailable";
  return `Draw at ${new Date(endTime).toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })}`;
}

function getNextDraw(endTime?: string) {
  if (!endTime) return { d: "00D", h: "00H", m: "00M", s: "00S" };
  const diff = Math.max(0, new Date(endTime).getTime() - Date.now());
  const pad  = (n: number) => String(n).padStart(2, "0");
  return {
    d: `${pad(Math.floor(diff / 86400000))}D`,
    h: `${pad(Math.floor((diff / 3600000) % 24))}H`,
    m: `${pad(Math.floor((diff / 60000) % 60))}M`,
    s: `${pad(Math.floor((diff / 1000) % 60))}S`,
  };
}

function isValidImageUrl(url?: string | null) {
  return !!url && /^https?:\/\//.test(url) && !url.endsWith("/storage");
}

// ── Mapper ───────────────────────────────────────────────────────────────────
function mapRoundToDrawCard(round: LotteryRoundApi): DrawCard {
  const prizes = [...(round.lottery_round_prizes || [])].sort(
    (a, b) => a.position - b.position
  );

  const allRows: WinningRow[] = prizes.map((p) => ({
    rank:  ordinal(p.position),
    wonNo: p.winner_ticket?.ticket_code || "-",
  }));

  return {
    serial:   `#${round.count ?? "-"}`,
    title:    round.name || round.lottery_name || "Lottery Round",
    code:     `R-${round.id}`,
    drawAt:   getDrawLabel(round.end_time),
    nextDraw: getNextDraw(round.next_draw_time),
    leftLogoSrc: isValidImageUrl(round.lottery?.feature_img_url)
      ? (round.lottery!.feature_img_url as string)
      : isValidImageUrl(round.img)
      ? (round.img as string)
      : "/images/new/lucky-day.png",
    rowsLeft:  allRows.slice(0, 5),
    rowsRight: allRows.slice(5, 10),
  };
}

// ── Single Card UI ────────────────────────────────────────────────────────────
function DrawCardItem({ card }: { card: DrawCard }) {
  return (
    <div className={`${styles.card} position-relative`}>
      <div className={styles.topGrid}>

        {/* LEFT */}
        <div className={styles.left}>
          <div className={styles.serial}>{card.serial}</div>

          <div className={styles.logoRow}>
            <Image
              src={card.leftLogoSrc}
              alt="Logo"
              width={92}
              height={46}
              className={styles.logo}
              priority
            />
          </div>

          <div className={`${styles.title} d-flex gap-1`}>
            {card.title}
            <span className={styles.code}>[{card.code}]</span>
          </div>

          <div className={styles.drawAt}>{card.drawAt}</div>

          <div className={`${styles.nextDrawLabel} text-center pt-4 mt-1`}>
            Next Draw :
          </div>

          <div className={styles.chips}>
            <span className={styles.chip}>{card.nextDraw.d}</span>
            <span className={styles.chip}>{card.nextDraw.h}</span>
            <span className={styles.chip}>{card.nextDraw.m}</span>
            <span className={styles.chip}>{card.nextDraw.s}</span>
          </div>
        </div>

        {/* RIGHT */}
        <div className={styles.right}>
          <div className={styles.tableTitle}>Top 10 Winning Number</div>

          <div className={styles.tableWrap}>
            {/* 1st–5th */}
            <div className={styles.tableCol}>
              <div className={styles.tableHead}>
                <span className={styles.thRank}>Rank</span>
                <span className={styles.thWon}>Won No</span>
              </div>
              {card.rowsLeft.map((r) => (
                <div key={r.rank} className={styles.tr}>
                  <span className={styles.tdRank}>{r.rank}</span>
                  <span className={styles.tdWon}>{r.wonNo}</span>
                </div>
              ))}
            </div>

            {/* 6th–10th */}
            <div className={styles.tableCol}>
              <div className={styles.tableHead}>
                <span className={styles.thRank}>Rank</span>
                <span className={styles.thWon}>Won No</span>
              </div>
              {card.rowsRight.map((r) => (
                <div key={r.rank} className={styles.tr}>
                  <span className={styles.tdRank}>{r.rank}</span>
                  <span className={styles.tdWon}>{r.wonNo}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// ── Section with Slider ───────────────────────────────────────────────────────
export default function LatestDrawMobileCard() {
  const sliderRef                     = useRef<Slider | null>(null);
  const [rounds, setRounds]           = useState<LotteryRoundApi[]>([]);
  const [loading, setLoading]         = useState(true);
  const [activeIdx, setActiveIdx]     = useState(0);

  const getRounds = async () => {
    try {
      const res = await getLotteryLatestRounds();
      setRounds(res?.data?.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getRounds();
  }, []);

  const settings = {
    dots:           false,
    arrows:         false,
    infinite:       true,
    speed:          500,
    slidesToShow:   1,
    slidesToScroll: 1,
    autoplay:       true,
    afterChange:    (idx: number) => setActiveIdx(idx),
  };

  if (loading) return <LotterySkeleton />;

  const cards = rounds.map(mapRoundToDrawCard);

  return (
    <section className={styles.section}>

      {/* Header */}
      <div className={styles.header}>
        <div className={styles.heading}>
          Latest <span className={styles.headingAccent}>Draw</span>
        </div>
        <a className={styles.seeAll} href="#">
          See All <i className="fa-solid fa-arrow-right" />
        </a>
      </div>

      {/* Slider */}
      <Slider ref={sliderRef} {...settings}>
        {cards.map((card, idx) => (
          <div key={idx}>
            <DrawCardItem card={card} />
          </div>
        ))}
      </Slider>

      {/* Dynamic dots — one per slide, active tracks current */}
      <div className={styles.dots}>
        {cards.map((_, idx) => (
          <span
            key={idx}
            onClick={() => sliderRef.current?.slickGoTo(idx)}
            className={`${styles.dot} ${idx === activeIdx ? styles.dotActive : ""}`}
            style={{ cursor: "pointer" }}
          />
        ))}
      </div>

    </section>
  );
}