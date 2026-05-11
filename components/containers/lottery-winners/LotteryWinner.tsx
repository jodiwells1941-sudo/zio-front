// import React from "react";
// import LotteryWinnerSlider, { Champion } from "./LotteryWinnerSlider";
// import Image from "next/image";

// type Props = {
//   backgroundImage?: string;
//   champions?: Champion[];
// };

// const defaultChampions: Champion[] = [
//   { serial: "#1", avatarSrc: "/images/avatar/a-one.png", name: "Jacob Jones", wonText: "Won 45 minutes ago", numbers: "584X748", activeNumber: 16, drawDate: "27/11/24", aosDelay: 0 },
//   { serial: "#2", avatarSrc: "/images/avatar/a-two.png", name: "Darrell Steward", wonText: "Won 45 minutes ago", numbers: "584X748", activeNumber: 16, drawDate: "27/11/24", aosDelay: 200 },
//   { serial: "#3", avatarSrc: "/images/avatar/a-three.png", name: "Albert Flores", wonText: "Won 45 minutes ago", numbers: "584X748", activeNumber: 16, drawDate: "27/11/24", aosDelay: 400 },
//   { serial: "#4", avatarSrc: "/images/avatar/a-four.png", name: "Robert Fox", wonText: "Won 45 minutes ago", numbers: "584X748", activeNumber: 16, drawDate: "27/11/24", aosDelay: 600 },
//   { serial: "#5", avatarSrc: "/images/avatar/a-five.png", name: "Jacob Jones", wonText: "Won 45 minutes ago", numbers: "584X748", activeNumber: 16, drawDate: "27/11/24", aosDelay: 200 },
//   { serial: "#6", avatarSrc: "/images/avatar/a-six.png", name: "Cody Fisher", wonText: "Won 45 minutes ago", numbers: "584X748", activeNumber: 16, drawDate: "27/11/24", aosDelay: 400 },
//   { serial: "#7", avatarSrc: "/images/avatar/a-seven.png", name: "Jerome Bell", wonText: "Won 45 minutes ago", numbers: "584X748", activeNumber: 16, drawDate: "27/11/24", aosDelay: 600 },
//   { serial: "#8", avatarSrc: "/images/avatar/a-eight.png", name: "Eleanor Pena", wonText: "Won 45 minutes ago", numbers: "584X748", activeNumber: 16, drawDate: "27/11/24", aosDelay: 800 },
// ];

// const LotteryWinner: React.FC<Props> = ({
//   backgroundImage = "/images/lottery-details.png",
//   champions = defaultChampions,
// }) => {
//   return (
//     <section className="champion pt-120 pb-120" data-background={backgroundImage}>
//       <div className="container">
//         <div className="row justify-content-center">
//           <div className="col-12 col-xl-9">
//             <div className="section__header text-center mb-55" data-aos="fade-up" data-aos-duration="600">
//               <span className="fw-6 secondary-text text-xl">
//                 <strong>Recent,</strong> Lottery Winners
//               </span>
//               <h2 className="title-animation fw-6 mt-25">Meet Our Latest Champions</h2>
//               <p className="mt-25">
//                 {"Welcome to our FAQs section! Here, we've compiled answers to some of the most common questions our users ask."}
//               </p>
//             </div>
//           </div>
//         </div>

//         <div className="row gutter-24">
//           {champions.slice(4).map((c) => (
//             <LotteryWinnerSlider key={c.serial} item={c} />
//           ))}
//         </div>
//       </div>

//       <div className="left-thumb">
//         <Image width={100} height={100} src="/images/right-wheel.png" alt="Image" />
//       </div>
//       <div className="left-thumb-th">
//         <Image width={100} height={100} src="/images/left-th.png" alt="Image" />
//       </div>
//     </section>
//   );
// };

// export default LotteryWinner;

'use client'
import React, { useEffect, useState } from "react";
import LotteryWinnerSlider, { Champion } from "./LotteryWinnerSlider";
import Image from "next/image";
import LotterySkeleton from "@/components/dashboard/LotterySkeleton";
import { getLotteryWinners } from "@/app/api/lottery";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const timeAgo = (dateStr: string): string => {
  if (!dateStr) return "Won recently";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `Won ${mins} minutes ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `Won ${hrs} hours ago`;
  return `Won ${Math.floor(hrs / 24)} days ago`;
};

const formatDrawDate = (dateStr: string): string => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
};

const AOS_DELAYS = [0, 200, 400, 600, 0, 200, 400, 600];

// ─── Map raw API lottery data → Champion[] ────────────────────────────────────

const mapLotteriesToChampions = (lotteries: any[]): Champion[] => {
  const champions: Champion[] = [];

  for (const lottery of lotteries) {
    const rounds: any[] = lottery.lottery_rounds ?? [];
    if (!rounds.length) continue;

    const latestRound = rounds[rounds.length - 1];
    const prizes: any[] = latestRound.lottery_round_prizes ?? [];
    const firstPlace = prizes.find((p) => p.position === 1);

    if (!firstPlace?.winner_user) continue;

    const user = firstPlace.winner_user;
    const ticket = firstPlace.winner_ticket;
    const ticketCode: string = ticket?.ticket_code ?? "000000";
    const idx = champions.length;

    champions.push({
      serial: `#${idx + 1}`,
      avatarSrc: user.avatar ?? "",
      name: user.name ?? "Unknown",
      wonText: timeAgo(firstPlace.updated_at),
      numbers: ticketCode,
      activeNumber: parseInt(ticketCode.replace(/\D/g, "").slice(0, 2)) || 0,
      drawDate: formatDrawDate(firstPlace.updated_at),
      aosDelay: AOS_DELAYS[idx] ?? 0,
    });

    if (champions.length >= 8) break;
  }

  return champions;
};

// ─── Main Component ───────────────────────────────────────────────────────────

type Props = {
  backgroundImage?: string;
};

const LotteryWinner: React.FC<Props> = ({
  backgroundImage = "/images/lottery-details.png",
}) => {
  const [champions, setChampions] = useState<Champion[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchWinners = async () => {
      setLoading(true);
      try {
        const res = await getLotteryWinners();
        const lotteries: any[] = res?.data ?? [];
        setChampions(mapLotteriesToChampions(lotteries));
      } catch (err) {
        console.error("Failed to fetch lottery winners:", err);
        setChampions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchWinners();
  }, []);

  if (loading) return <LotterySkeleton />;

  return (
    <section
      className="champion pt-120 pb-120"
      data-background={backgroundImage}
    >
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-xl-9">
            <div
              className="section__header text-center mb-55"
              data-aos="fade-up"
              data-aos-duration="600"
            >
              <span className="fw-6 secondary-text text-xl">
                <strong>Recent,</strong> Lottery Winners
              </span>
              <h2 className="title-animation fw-6 mt-25">
                Meet Our Latest Champions
              </h2>
              <p className="mt-25">
                {"Welcome to our FAQs section! Here, we've compiled answers to some of the most common questions our users ask."}
              </p>
            </div>
          </div>
        </div>

        <div className="row gutter-24">
          {champions.slice(4).map((c) => (
            <LotteryWinnerSlider key={c.serial} item={c} />
          ))}
        </div>
      </div>

      <div className="left-thumb">
        <Image
          width={100}
          height={100}
          src="/images/right-wheel.png"
          alt="Image"
        />
      </div>
      <div className="left-thumb-th">
        <Image
          width={100} 
          height={100}
          src="/images/left-th.png"
          alt="Image"
        />
      </div>
    </section>
  );
};

export default LotteryWinner;