"use client";

import {
  getAllActiveRoundsWithTickets,
  ticketPurchase,
} from "@/app/api/lottery";
import { useAuth } from "@/hooks/useAuth";
import { useCountUp } from "@/hooks/useCountUp";
import { getTradeEcho } from "@/utils/tradeEcho";
import moment from "moment";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import CountdownTimerNew from "../CountdownTimerNew";

type Prize = {
  id: number;
  position: number;
  prize: number;
  winner_amount: number;
  computed_amount: number;
};

type Round = {
  id: number;
  round: number;
  slug: string;
  name: string;
  start_time: string;
  end_time: string;
  status: number;
  lottery_name: string;
  price: number;
  img: string;
  prizes: Prize[];
  auth_tickets: { ticket_code: string; created_at: string }[];
  auth_ticket_count: number;
  total_tickets_sold: number;
  winning_chance: number | null;
};

type LotteryCardProps = {
  round: Round;
  roundShow?: number;
  serial?: string;
  drawAtText?: string;
  onPurchaseSuccess?: () => Promise<void> | void;
  borderColor?: string;
};

// ── prize amount hook per position ──────────────────────────────────────────
// const PrizeAmount = ({ amount }: { amount?: number }) => {
//   const val = useCountUp(amount ?? 0);
//   return <>${val}</>;
// };

const PrizeDisplay = ({ prize }: { prize: number }) => {
  const { count } = useCountUp(prize, 2000, 60000); // resets every 10s
  return count;
};

// ── single card ──────────────────────────────────────────────────────────────
const LotteryCard = ({
  round,
  roundShow = 0,
  serial = "#1",
  drawAtText = "Pricing List",
  onPurchaseSuccess,
  borderColor
}: LotteryCardProps) => {
  const [ticketCount, setTicketCount] = useState<number | "">(1);
  const [showHistory, setShowHistory] = useState(false);

  const ticketPrice = round?.price ?? 0;
  const prizes = round?.prizes ?? [];
  const authTickets = round?.auth_tickets ?? [];

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

  const { isLoggedIn } = useAuth();
  const router = useRouter();

  const handleBuy = async (
    roundId: number | undefined,
    e: React.MouseEvent<HTMLButtonElement>,
  ) => {
    if (!isLoggedIn) {
      router.push("/sign-in?redirect=/lottery-details/" + round?.slug);
      return;
    }

    if (round?.end_time && new Date(round.end_time).getTime() - 60000 < Date.now()) {
      e.preventDefault();
      toast.error("Ticket purchasing closes 1 minute before the draw. Please wait for the next round.");
      return;
    }

    const count = typeof ticketCount === "number" ? ticketCount : 0;
    if (!count || count < 1) {
      e.preventDefault();
      toast.error("Please enter a valid number of tickets.");
      setTicketCount(1);
      return;
    }

    if (!roundId) {
      e.preventDefault();
      toast.error("Lottery round ID is missing. Cannot proceed with purchase.");
      return;
    }

      try {
          const response = await ticketPurchase(roundId, count);
          if (response?.error) {
            toast.error(response.message);
            return;
          }

          await onPurchaseSuccess?.();
          toast.success("Ticket purchase successful!");
        } catch (err) {
          const errorMessage = (() => {
            if (err && typeof err === "object" && "response" in err) {
              const response = (err as { response?: { data?: Record<string, unknown> } }).response?.data;
              if (response && typeof response === "object") {
                if ("message" in response && typeof response.message === "string") return response.message;
                if ("error" in response && typeof response.error === "string") return response.error;
              }
            }
            if (err instanceof Error) return err.message;
            return "Ticket purchase failed";
          })();
    
          toast.error(errorMessage);
          Swal.fire({
            title: "Purchase Failed",
            text: errorMessage,
            icon: "error",
            confirmButtonText: "OK",
          });
        }

  };

  const prize1 = prizes[0];
  const group2to3 = prizes.slice(1, 3);   // 2nd–3rd
  const group4to6 = prizes.slice(3, 6);   // 4th–6th
  const group7to10 = prizes.slice(6, 10); // 7th–10th

  const ordinal = (n: number) => {
    if (n === 1) return '1st Prize';
    if (n === 2) return '2nd';
    if (n === 3) return '3rd';
    return `${n}th`;
  };
  

  return (
    <div className="lotteries-card-items bg-dark pb-2" style={{border: `1px solid ${borderColor}`}}>
      <span className="serial">{serial}</span>
      <span className="price">
        <i className="fa-solid fa-star"></i>R-{round?.round}
      </span>

      <div
        className="thumb"
        style={{ width: 100, height: 100, position: "relative" }}
      >
        <Image
          fill
          style={{ objectFit: "cover" }}
          src={
            round?.img && !round.img.endsWith("/storage")
              ? round.img
              : "/images/new/lucky-day.png"
          }
          alt={round?.name ?? "Lottery"}
        />
      </div>

      <div className="content">
        <Link
          href={`/lottery-details/${round?.slug}`}
          className="fw-bolder fs-4"
        >
          {round?.name}
        </Link>
        <p>{drawAtText}</p>
      </div>

      {/* 1st prize */}
      {prize1 && (
        <div className="price-box">
          <span className="price-1">1st Prize</span>
          <span className="price-2">
            <PrizeDisplay prize={prize1.computed_amount ?? 0} />
          </span>
        </div>
      )}

      {/* 2nd – 3rd */}
      {group2to3.length > 0 && (
        <div className="price-wrap">
          {group2to3.map((p) => (
            <div key={p.id} className="price-box2">
              <span className="price-1">{ordinal(p.position)}</span>
              <span className="price-2">
                <PrizeDisplay prize={p.computed_amount ?? 0} />
              </span>
            </div>
          ))}
        </div>
      )}

      {/* 4th – 6th */}
      {group4to6.length > 0 && (
        <div className="price-wrap">
          {group4to6.map((p) => (
            <div key={p.id} className="price-box3">
              <span className="price-1">{ordinal(p.position)}</span>
              <span className="price-2">
                <PrizeDisplay prize={p.computed_amount ?? 0} />
              </span>
            </div>
          ))}
        </div>
      )}

      {/* 7th – 10th */}
      {roundShow >= 4 && group7to10.length > 0 && (
        <div className="price-wrap d-none d-md-flex">
          {group7to10.map((p) => (
            <div key={p.id} className="price-box4">
              <span className="price-1">{ordinal(p.position)}</span>
              <span className="price-2">
                <PrizeDisplay prize={p.computed_amount ?? 0} />
              </span>
            </div>
          ))}
        </div>
      )}

      {/* countdown using real end_time */}
      <div className="time-left-items">
        <p>Time Left :</p>
        <CountdownTimerNew targetDate={round?.end_time} />
      </div>

      {/* buy section */}
      <div className="lottery-details-wrap m-0 p-0">
        <div className="lotteries-card-items style-lottery px-3 border-top-0 pt-1 mt-1 mb-0 pb-4">
          <div className="ticket-card py-2 mb-10">
            <div className="border-0 text-center px-2 pb-0">
              <span className="text-lg fw-bold textColor_1">
                Per Ticket Price:
              </span>
              <span className="value ps-3 text-lg fw-bold text-info">
                ${ticketPrice}
              </span>
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
                <button type="button" onClick={handleMinus}>
                  -
                </button>
                <span className="px-3">{ticketCount}</span>
                <button type="button" onClick={handlePlus}>
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="lotterie-btn style-3">
            {round?.end_time && new Date(round.end_time).getTime() - 60000 < Date.now() ? (
                <span>Wait few minutes for the next draw</span>
              ) : (
                <button
                  onClick={(e) => handleBuy(round?.id, e)}
                  className="btn--primary py-2 px-3 d-flex align-items-center justify-content-center"
                >
                  Pay Now <span className="fw-bold text-xl ms-2">${totalAmount}</span>
                  <i className="fa-solid fa-angle-right ps-2 iconSize"></i>
                </button>
              )}
          </div>

          <div className="move-down">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="border-0 text-xl-start bg-navy-blue text-warning border px-3 py-2 rounded-pill border-warning"
            >
              View History
            </button>
          </div>
        </div>
      </div>

      {/* history panel */}
      {showHistory && (
        <>
          <h6 className="py-3 mt-1">
            Recent <span className="fw-7 text-warning">10</span> Tickets
            Purchase
          </h6>

          <div className="ticket-purchase-history-box pb-2">
            <div className="d-flex justify-content-between border-bottom py-2 border-dark-light px-2">
              <span>Your Tickets</span>
              <span className="value">{round?.auth_ticket_count ?? 0}</span>
            </div>

            <div className="d-flex justify-content-between border-bottom py-2 border-dark-light px-2">
              <span>Total Sold</span>
              <span className="value">{round?.total_tickets_sold ?? 0}</span>
            </div>

            <div className="d-flex justify-content-between border-bottom py-2 border-dark-light px-2">
              <span>Winning Chance</span>
              <span className="value text-warning">
                {round?.winning_chance != null
                  ? `${round.winning_chance}%`
                  : "—"}
              </span>
            </div>

            <div className="ticket-header">
              <h3 className="text-xl text-white py-1 fw-7">Ticket No</h3>
              <div className="short-line"></div>
            </div>

            {authTickets.length > 0 ? (
              <div className="ticket-grid">
                {authTickets.map((item, idx) => (
                  <div key={idx} className="gap-2 align-items-center">
                    <span>
                      <i className="fa-solid fa-ticket me-1 text-warning"></i>
                      {item.ticket_code}
                      <small className="fs-9 text-muted text-white-50 d-block">
                        {moment(item.created_at).format("DD MMM YY, hh:mm A")}
                      </small>
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-secondary py-3">
                No tickets purchased yet.
              </p>
            )}
          </div>

          <div className="lotterie-btn style-3 mt-3 border-top border-secondary pt-3">
            <Link href={`/lottery-details/${round?.slug}`}>
              <span className="text-xl-start text-warning border px-3 py-2 rounded-pill border-warning">
                Tickets History
              </span>
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

// ── section ──────────────────────────────────────────────────────────────────
type LotterySectionProps = {
  roundShow?: number;
};

const LotterySection = ({ roundShow = 0 }: LotterySectionProps) => {
  const [allRounds, setAllRounds] = useState<Round[]>([]);

  const getRounds = async () => {
    const res = await getAllActiveRoundsWithTickets();
    setAllRounds(res?.data ?? []);
  };

  useEffect(() => {
    getRounds();
  }, []);

  useEffect(() => {
    if (!allRounds.length) return;

    const echo = getTradeEcho();
    if (!echo) return;

    const roundIds = Array.from(
      new Set(allRounds.map((r) => r.id).filter(Boolean)),
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

  const borderColors = [
    "#ff6b6b",
    "#4ecdc4",
    "#45b7d1",
    "#f7b731",
    "#a55eea",
    "#26de81",
    "#fd9644",
    "#2bcbba",
    "#eb3b5a",
    "#20bf6b",
    "#8854d0",
  ];

  return (
    <div className="container px-2 px-md-0">
      <div className="row gutter-24">
        {allRounds.map((round, idx) => (
          <div
            suppressHydrationWarning
            key={round.id}
            className="col-12 col-md-6 col-xxxl-4"
            data-aos="fade-up"
            data-aos-duration="600"
          >
            <LotteryCard
              round={round}
              roundShow={roundShow}
              serial={`#${idx + 1}`}
              onPurchaseSuccess={getRounds}
              borderColor={borderColors[idx % borderColors.length]}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default LotterySection;
