// "use client";

// import React, { useEffect, useState } from "react";
// import styles from "./dashboard.module.css";
// import { getPopularLottery } from "@/app/api/lottery";
// import LotterySkeleton from "../LotterySkeleton";

// type Card = {
//   badge: "Hot" | "New";
//   title: string;
//   subtitle: string;
//   subtitleIcon?: React.ReactNode;
//   bgImage: string;
//   badgeTone: "hot" | "new";
// };

// export default function PopularLotteryMobileCard() {
//   const cards: Card[] = [
//     {
//       badge: "Hot",
//       badgeTone: "hot",
//       title: "Win Big Tonight",
//       subtitle: "Powerball",
//       subtitleIcon: <span className={styles.popularSubIcon}>🎟️</span>,
//       bgImage: "/images/popular_img_1.svg",
//     },
//     {
//       badge: "New",
//       badgeTone: "new",
//       title: "Chase the Millions",
//       subtitle: "Mega Millions",
//       subtitleIcon: <span className={styles.popularSubIcon}>💰</span>,
//       bgImage: "/images/popular_img_2.svg",
//     },
//   ];

//   // const
//     const [allLottery, setAllLottery] = useState<any | []>([]);
//     const [loading, setLoading] = useState(true);
  
//     const getPopulerLottery = async () => {
//       setLoading(true);
//       const res = await getPopularLottery();
//       setAllLottery(res?.data || null);
//       setLoading(false);
//     };
  
//     useEffect(() => {
//       getPopulerLottery();
//     }, []);
  
//     if (loading) return <LotterySkeleton />;
//     if (!allLottery) return null;

//     console.log('== allLottery== ', allLottery);
    

//   return (
//     <section className={styles.popularSection}>
//       {/* Header */}
//       <div className={styles.popularHeader}>
//         <div className={styles.popularHeading}>
//           Popular <span className={styles.popularHeadingAccent}>Lottery</span>
//         </div>

//         <a className={styles.popularSeeAll} href="#">
//           See All <i className="fa-solid fa-arrow-right" />
//         </a>
//       </div>

//       {/* Cards */}
//       <div className={styles.popularRow}>
//         {cards.map((c) => (
//           <div
//             key={c.title}
//             className={styles.popularCard}
//             style={{ backgroundImage: `url(${c.bgImage})` }}
//           >
//             <div className={styles.popularCardOverlay} />

//             <span
//               className={`${styles.popularBadge} ${
//                 c.badgeTone === "hot" ? styles.popularBadgeHot : styles.popularBadgeNew
//               }`}
//             >
//               {c.badge}
//             </span>

//             <div className={styles.popularCardContent}>
//               <div className={styles.popularCardTitle}>{c.title}</div>

//               <div className={styles.popularCardSubRow}>
//                 <div className={styles.popularCardSub}>{c.subtitle}</div>
//                 {c.subtitleIcon}
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Dots */}
//       <div className={styles.popularDots}>
//         <span className={styles.popularDot} />
//         <span className={styles.popularDot} />
//         <span className={`${styles.popularDot} ${styles.popularDotActive}`} />
//         <span className={styles.popularDot} />
//         <span className={styles.popularDot} />
//       </div>
//     </section>
//   );
// }

"use client";

import React, { useEffect, useRef, useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import styles from "./dashboard.module.css";
import { getPopularLottery } from "@/app/api/lottery";
import LotterySkeleton from "../LotterySkeleton";

// ── Types ────────────────────────────────────────────────────────────────────
type LotteryApi = {
  id: number;
  slug: string;
  name?: string;
  lottery_name?: string;
  price?: number;
  img?: string;
  tag?: string;
  total_tickets_sold?: number;
  round?: {
    id: number;
    name?: string;
    end_time?: string;
    lottery?: { feature_img_url?: string | null };
    lottery_round_prizes?: {
      position: number;
      winner_amount: number;
      winner_ticket?: { ticket_code?: string };
    }[];
  };
};

type Card = {
  id: number;
  badge: string;
  badgeTone: "hot" | "new" | "default";
  title: string;
  subtitle: string;
  bgImage: string;
};

// ── Helpers ──────────────────────────────────────────────────────────────────
function isValidImageUrl(url?: string | null) {
  return !!url && /^https?:\/\//.test(url) && !url.endsWith("/storage");
}

function getBadgeTone(tag?: string): "hot" | "new" | "default" {
  if (!tag) return "hot";
  if (tag.toLowerCase() === "hot") return "hot";
  if (tag.toLowerCase() === "new") return "new";
  return "default";
}

// ── Mapper ───────────────────────────────────────────────────────────────────
function mapLotteryToCard(item: LotteryApi): Card {
  const bgImage = isValidImageUrl(item.round?.lottery?.feature_img_url)
    ? (item.round!.lottery!.feature_img_url as string)
    : isValidImageUrl(item.img)
    ? (item.img as string)
    : "/images/popular_img_1.svg";

  return {
    id:        item.id,
    badge:     item.tag || "Hot",
    badgeTone: getBadgeTone(item.tag),
    title:     item.round?.name || item.name || item.lottery_name || "Lottery",
    subtitle:  item.lottery_name || item.name || "Lottery",
    bgImage,
  };
}

// ── Section ──────────────────────────────────────────────────────────────────
export default function PopularLotteryMobileCard() {
  const sliderRef                   = useRef<Slider | null>(null);
  const [allLottery, setAllLottery] = useState<LotteryApi[]>([]);
  const [loading, setLoading]       = useState(true);
  const [activeIdx, setActiveIdx]   = useState(0);

  const getPopulerLottery = async () => {
    try {
      const res = await getPopularLottery();
      const data = res?.data;
      // handles both single object and array
      setAllLottery(Array.isArray(data) ? data : data ? [data] : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getPopulerLottery();
  }, []);

  if (loading) return <LotterySkeleton />;
  if (!allLottery.length) return null;

  const cards = allLottery.map(mapLotteryToCard);

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

  return (
    <section className={styles.popularSection}>

      {/* Header — identical to your static */}
      <div className={styles.popularHeader}>
        <div className={styles.popularHeading}>
          Popular <span className={styles.popularHeadingAccent}>Lottery</span>
        </div>
        <a className={styles.popularSeeAll} href="#">
          See All <i className="fa-solid fa-arrow-right" />
        </a>
      </div>

      {/* Cards — same div/className structure as your static map */}
      <div className={styles.popularRow}>
        {cards.map((c) => (
          <div
            key={c.id}
            className={styles.popularCard}
            style={{ backgroundImage: `url(${c.bgImage})` }}
          >
            <div className={styles.popularCardOverlay} />

            <span
              className={`${styles.popularBadge} ${
                c.badgeTone === "hot"
                  ? styles.popularBadgeHot
                  : styles.popularBadgeNew
              }`}
            >
              {c.badge}
            </span>

            <div className={styles.popularCardContent}>
              <div className={styles.popularCardTitle}>{c.title}</div>

              <div className={styles.popularCardSubRow}>
                <div className={styles.popularCardSub}>{c.subtitle}</div>
                <span className={styles.popularSubIcon}>🎟️</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Dynamic dots — replaces your 5 hardcoded spans */}
      <div className={styles.popularDots}>
        {cards.map((_, idx) => (
          <span
            key={idx}
            className={`${styles.popularDot} ${
              idx === activeIdx ? styles.popularDotActive : ""
            }`}
          />
        ))}
      </div>

    </section>
  );
}
