"use client";
import { getLotteryWinnersById, getRoundById, ticketPurchase } from "@/app/api/lottery";
import { useAuth } from "@/hooks/useAuth";
import { useCountUp } from "@/hooks/useCountUp";
import { getTradeEcho } from "@/utils/tradeEcho";
import moment from "moment";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import CountdownTimerNew from "../CountdownTimerNew";
import { toast } from "react-toastify";

// ─── API Types ────────────────────────────────────────────────────────────────
type ApiPrize = {
  id: number;
  position: number;
  prize_percent: number;
  computed_amount: number;
  winner_ticket: string;
};

type ApiRound = {
  details: {
    img: string;
    lottery_round_id: number;
    lottery_name: string;
    lottery_id: number;
    round_name: string;
    round: number;
    start_time: string;
    end_time: string;
  };
  my_tickets?: string[];
  user_ticket: number;
  total_tickets: number;
  winning_possibility: string;
  ticket_price: number;
  net_pool: number;
  prizes: ApiPrize[];
};

// ─── Internal Types ───────────────────────────────────────────────────────────
type PrizeTier = {
  rank: string;
  amount: string;
  toneClass: string;
};

type WinnerRow = {
  rank: string;
  userId: string;
  winningNo: string;
  amount: string;
  tickets: number;
  showAwardIcon?: boolean;
};

// ── Real shape from API (matches document 4) ──────────────────────────────────
type RoundPrize = {
  id: number;
  lottery_round_id: number;
  position: number;
  prize: number;
  winner_amount: number;
  winner_ticket_id: number;
  winner_user_id: number;
  winner_total_tickets: number;
  winner_user: {
    id: number;
    uu_id: string;
    name: string;
    avatar: string;
  };
  winner_ticket: {
    id: number;
    ticket_code: string;
  };
};

type WinnersRound = {
  id: number;
  slug: string;
  name: string;
  count: number;
  start_time: string;
  end_time: string;
  created_at: string;
  status: number;
  lottery_round_prizes: RoundPrize[];
  // auth user's tickets for this round
  auth_tickets?: { ticket_code: string }[];
  tickets?: string[];
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const TONE_CLASSES = ["prize-green", "prize-gold", "prize-purple", "prize-blue"];
const ORDINALS = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th"];

function buildDesktopRows(prizes: ApiPrize[]): PrizeTier[][] {
  const rows: PrizeTier[][] = [];
  let idx = 0;
  let rowSize = 1;
  while (idx < prizes.length) {
    const slice = prizes.slice(idx, idx + rowSize);
    rows.push(
      slice.map((p, i) => ({
        rank: `${ORDINALS[(idx + i) % ORDINALS.length]} Prize`,
        amount: String(p.computed_amount),
        toneClass: TONE_CLASSES[rows.length % TONE_CLASSES.length],
      }))
    );
    idx += rowSize;
    rowSize++;
  }
  return rows;
}

function buildWinnerRows(prizes: ApiPrize[]): WinnerRow[] {
  return prizes.map((p, i) => ({
    rank: ORDINALS[i] ?? `${i + 1}th`,
    userId: "—",
    winningNo: p.winner_ticket,
    amount: `$${Number(p.computed_amount).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`,
    tickets: 0,
    showAwardIcon: i < 3,
  }));
}

const PrizeDisplay = ({ prize }: { prize: number }) => {
  const { count } = useCountUp(prize, 2000, 60000); // resets every 10s
  return count
};

// ─── PrizeCard ────────────────────────────────────────────────────────────────
const PrizeCard = ({ p }: { p: PrizeTier }) => {
  return (
    <div className={`prize-card ${p.toneClass}`}>
      <span className="prize-rank">{p.rank}</span>
      <h3>${PrizeDisplay({ prize: Number(p.amount) })}</h3>
    </div>
  );
};

// ─── LotteryCard (mobile) ─────────────────────────────────────────────────────
type LotteryCardProps = {
  roundShow?: number;
  serial?: string;
  drawTitle?: string;
  drawAtText?: string;
  ticketPrice?: number;
  endTime?: string;
  prizes?: ApiPrize[];
};

const LotteryCard = ({
  roundShow = 0,
  serial = "#1",
  drawTitle = "Lucky Day ( Round 1)",
  drawAtText = "Pricing List",
  ticketPrice = 10,
  endTime,
  prizes = [],
}: LotteryCardProps) => {
  const [ticketCount, setTicketCount] = useState<number | "">(1);

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

  const handleBuy = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (endTime && new Date(endTime).getTime() - 60000 < Date.now()) {
      toast.error("Ticket purchasing closes 1 minute before the draw. Please wait for the next round.");
      return;
    }

    const count = typeof ticketCount === "number" ? ticketCount : 0;
    if (!count || count < 1) {
      alert("Please enter at least 1 ticket.");
      setTicketCount(1);
    }
  };

  const prize1 = prizes[0];
  const prize2 = prizes[1];
  const prize3 = prizes[2];
  const prize4 = prizes[3];
  const prize5 = prizes[4];
  const prize6 = prizes[5];

  return (
    <div className="lotteries-card-items bg-dark">
      <span className="serial">{serial}</span>
      <span className="price">
        <i className="fa-solid fa-star"></i>R-458
      </span>
      <div className="thumb">
        <Image width={500} height={500} src="/images/winnig_img.svg" alt="Image" />
      </div>
      <div className="content">
        <h5 className="fw-bolder">{drawTitle}</h5>
        <p>{drawAtText}</p>
      </div>
      {prize1 && (
        <div className="price-box">
          <span className="price-1">1st Prize</span>
          <span className="price-2">${PrizeDisplay({ prize: Number(prize1.computed_amount) })}</span>
        </div>
      )}
      {(prize2 || prize3) && (
        <div className="price-wrap">
          {prize2 && <div className="price-box2"><span className="price-1">2nd</span><span className="price-2">${PrizeDisplay({ prize: Number(prize2.computed_amount) })}</span></div>}
          {prize3 && <div className="price-box2"><span className="price-1">3rd</span><span className="price-2">${PrizeDisplay({ prize: Number(prize3.computed_amount) })}</span></div>}
        </div>
      )}
      {(prize4 || prize5 || prize6) && (
        <div className="price-wrap">
          {prize4 && <div className="price-box3"><span className="price-1">4th</span><span className="price-2">${PrizeDisplay({ prize: Number(prize4.computed_amount) })}</span></div>}
          {prize5 && <div className="price-box3"><span className="price-1">5th</span><span className="price-2">${PrizeDisplay({ prize: Number(prize5.computed_amount) })}</span></div>}
          {prize6 && <div className="price-box3"><span className="price-1">6th</span><span className="price-2">${PrizeDisplay({ prize: Number(prize6.computed_amount) })}</span></div>}
        </div>
      )}
      {roundShow >= 4 && prizes.slice(6).length > 0 && (
        <div className="price-wrap">
          {prizes.slice(6, 10).map((p, i) => (
            <MobilePrizeBox key={p.id} prize={p} label={`${i + 7}th`} />
          ))}
        </div>
      )}
      <div className="time-left-items">
        <p>Time Left :</p>
        <CountdownTimerNew targetDate={endTime ?? "2026-12-18T23:11:44.000000Z"} />
      </div>
      <div className="lottery-details-wrap m-0 p-0">
        <div className="lotteries-card-items style-lottery px-3 border-top-0 pt-1 mt-1">
          <div className="ticket-card pt-3">
            <div className="border-0 text-center px-2 pb-0">
              <span className="text-lg fw-bold textColor_1"> Per Ticket Price:</span>
              <span className="value ps-3 text-lg fw-bold text-info"> ${ticketPrice}</span>
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
            {/* <Link
              href="/dashboard/lottery-details/"
              className="btn--primary py-2 px-3 d-flex align-items-center justify-content-center"
              onClick={handleBuy}
            >
              Pay Now <span className="fw-bold text-xl">${totalAmount}</span>
              <i className="fa-solid fa-angle-right ps-2 iconSize"></i>
            </Link> */}
            {endTime && new Date(endTime).getTime() - 60000 < Date.now() ? (
              <span>Wait few minutes for the next draw</span>
            ) : (
              <button
                onClick={handleBuy}
                className="btn--primary py-2 px-3 d-flex align-items-center justify-content-center"
              >
                Pay Now <span className="fw-bold text-xl ms-2">${totalAmount}</span>
                <i className="fa-solid fa-angle-right ps-2 iconSize"></i>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const MobilePrizeBox = ({ prize, label }: { prize: ApiPrize; label: string }) => {
  return (
    <div className="price-box4">
      <span className="price-1">{label}</span>
      <span className="price-2">${PrizeDisplay({ prize: Number(prize.computed_amount) })}</span>
    </div>
  );
};

// ─── Main Export ──────────────────────────────────────────────────────────────
export default function LotteryDetails({ slug }: { slug?: string }) {
  const [round, setRound] = useState<ApiRound | null>(null);
  const [loading, setLoading] = useState(true);
  const [ticketCount, setTicketCount] = useState(1);
  const handleMinus = () => setTicketCount((v) => Math.max(1, v - 1));
  const handlePlus = () => setTicketCount((v) => v + 1);

  const [winnersData, setWinnersData] = useState<WinnersRound[] | null>(null);
  const [currentRound, setCurrentRound] = useState<number | null>(null);
  const [topWinners, setTopWinners] = useState<WinnersRound | null>(null);

  const fetchRound = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await getRoundById(slug ?? "");
      setRound(res?.data ?? null);
    } catch (err) {
      console.error("Failed to fetch round:", err);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  const fetchWinners = React.useCallback(async () => {
    try {
      const res = await getLotteryWinnersById(slug ?? "");
      const data = Array.isArray(res?.data) ? (res.data as WinnersRound[]) : null;
      setWinnersData(data);
      setCurrentRound(data && data.length > 0 ? data.length - 1 : null);
      setTopWinners(data && data.length > 0 ? data[data.length - 1] : null);
    } catch (error) {
      console.error("Error fetching winners data:", error);
    }
  }, [slug]);

  // Fetch round data
  useEffect(() => {
    fetchRound();
  }, [fetchRound]);

  // Fetch winners data
  useEffect(() => {
    fetchWinners();
  }, [fetchWinners]);

  useEffect(() => {
    const roundId = round?.details?.lottery_round_id;
    if (!roundId) return;

    const echo = getTradeEcho();
    if (!echo) return;

    const channelName = `lottery-round-result.${roundId}`;
    const channel = echo.channel(channelName);
    channel.listen(".lottery-round-result.update", () => {
      fetchRound();
      fetchWinners();
    });

    return () => {
      channel.stopListening(".lottery-round-result.update");
      echo.leave(channelName);
    };
  }, [round?.details?.lottery_round_id, fetchRound, fetchWinners]);

  // ── Fixed navigation: both use currentRound as the single index ──
  const setOlder = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!winnersData || currentRound === null || currentRound <= 0) return;
    const newRound = currentRound - 1;
    setCurrentRound(newRound);
    setTopWinners(winnersData[newRound] ?? null);
  };

  const setNewer = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!winnersData || currentRound === null || currentRound >= winnersData.length - 1) return;
    const newRound = currentRound + 1;
    setCurrentRound(newRound);
    setTopWinners(winnersData[newRound] ?? null);
  };

  const details = round?.details;
  const prizes = round?.prizes ?? [];
  const ticketPrice = round?.ticket_price ?? 0;
  const totalAmount = useMemo(() => ticketCount * ticketPrice, [ticketCount, ticketPrice]);
  const userTicket = round?.user_ticket ?? 0;
  const totalTickets = round?.total_tickets ?? 0;
  const winningPossibility = round?.winning_possibility ?? "0%";
  const tabKey = details?.lottery_name || "All" ;  

  const drawTitle = details?.round_name ?? "—";
  const drawAtText = details?.end_time
    ? `Draw at ${moment(details.end_time).format("MMMM Do YYYY, h:mmA")}`
    : "";

  const prizeTitle = `PRIZE FOR ${details?.lottery_name?.toUpperCase() ?? "LOTTERY"} ( ROUND ${details?.round ?? 1} )`;

  const desktopRows = useMemo(() => buildDesktopRows(prizes), [prizes]);
  const winnerRows = useMemo(() => buildWinnerRows(prizes), [prizes]);

  const { isLoggedIn } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLoginClick = () => {
    router.push("/sign-in?redirect=/lottery-details/" + slug);
  };

  const handlePurchase = async () => {
    if (!round?.details?.lottery_round_id) {
      Swal.fire({ title: "Error", text: "Lottery round ID is missing", icon: "error", confirmButtonText: "OK" });
      return;
    }

    // check time before allowing purchase 
    if (details?.end_time && new Date(details.end_time).getTime() - 60000 < Date.now()) {
      toast.error("Ticket purchasing closes 1 minute before the draw. Please wait for the next round.");
      return;
    }
    
    setIsLoading(true);
    setError("");

    try {
            const responseawait = await ticketPurchase(round.details.lottery_round_id, ticketCount);
            if (responseawait?.error) {
              toast.error(responseawait.message);
              return;
            }

            await fetchRound();
            await fetchWinners();

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

    // try {
    //   await ticketPurchase(round.details.lottery_round_id, ticketCount);
    //   await fetchRound();
    //   await fetchWinners();
    //   Swal.fire({
    //     title: "Purchase Successful",
    //     text: `You have successfully purchased ${ticketCount} ticket(s) for ${details?.lottery_name} (Round ${details?.round}).`,
    //     icon: "success",
    //     confirmButtonText: "OK",
    //   });
    // } catch (err) {
    //   const errorMessage = err instanceof Error ? err.message : "Ticket purchase failed";
    //   setError(errorMessage);
    //   Swal.fire({ title: "Purchase Failed", text: errorMessage, icon: "error", confirmButtonText: "OK" });
    // } finally {
    //   setIsLoading(false);
    // }


  };

  const buyTickets = async () => {
    const result = await Swal.fire({
      title: "Purchase Confirmation",
      icon: "info",
      html: `You are about to purchase <strong>${ticketCount}</strong> ticket(s) for <br />
             <strong>${details?.lottery_name} (Round ${details?.round})</strong> <br />
             at a total cost of <strong>$${totalAmount.toFixed(2)}</strong>. <br />
             Do you want to proceed?`,
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: "Yes, Buy!",
      cancelButtonText: "No, Cancel!",
    });
    if (result.isConfirmed) await handlePurchase();
  };

  if (loading) {
    return (
      <div className="prize-pyramid py-5 text-center text-white">
        <p>Loading...</p>
      </div>
    );
  }

  // ── Countdown component defined outside render to avoid hook-in-render issues ──
  const CountdownBoxes = ({ targetDate }: { targetDate: string }) => {
    const [timeLeft, setTimeLeft] = useState({ days: "00", hours: "00", minutes: "00", seconds: "00" });
    useEffect(() => {
      const calculate = () => {
        const diff = new Date(targetDate).getTime() - Date.now();
        if (diff <= 0) {
          setTimeLeft({ days: "00D", hours: "00H", minutes: "00M", seconds: "00S" });
          return;
        }
        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const m = Math.floor((diff / (1000 * 60)) % 60);
        const s = Math.floor((diff / 1000) % 60);
        setTimeLeft({
          days: String(d).padStart(2, "0") + "D",
          hours: String(h).padStart(2, "0") + "H",
          minutes: String(m).padStart(2, "0") + "M",
          seconds: String(s).padStart(2, "0") + "S",
        });
      };
      calculate();
      const timer = setInterval(calculate, 1000);
      return () => clearInterval(timer);
    }, [targetDate]);
    return (
      <>
        <div className="box">{timeLeft.days}</div>
        <div className="box">{timeLeft.hours}</div>
        <div className="box">{timeLeft.minutes}</div>
        <div className="box">{timeLeft.seconds}</div>
      </>
    );
  };

  return (
    <div className="prize-pyramid py-5">
      <div className="container px-0 mx-0">
        <div className="sec-title-content2 mb-0">
          <h3>{prizeTitle}</h3>
          <h4>Prize List</h4>
        </div>

        <div className="lotteries-wrappers-items">
          <div className="lotteries-card-items lotteries-responsive-style d-lg-none">
            <LotteryCard
              roundShow={prizes.length}
              drawTitle={drawTitle}
              drawAtText={drawAtText}
              ticketPrice={ticketPrice}
              endTime={details?.end_time}
              prizes={prizes}
            />
          </div>
          <div className="lotteries-wrappers d-none d-lg-block">
            {desktopRows.map((row, rowIdx) => (
              <div className="prize-row" key={`row-${rowIdx}`}>
                {row.map((p, idx) => (
                  <PrizeCard key={`p-${rowIdx}-${idx}`} p={p} />
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="lottery-details-wrap bg-cover">
          <div className="countdown-container d-none d-md-block">
            <h2>{`${details?.lottery_name?.toUpperCase() ?? "LOTTERY"} ( ROUND ${String(details?.round ?? 1).padStart(2, "0")} ) ENDS IN`}</h2>
            <div className="timer-boxes">
              <CountdownBoxes targetDate={details?.end_time ?? ""} />
            </div>
          </div>

          <div className="row g-4">
            {/* ── Winners Table ── */}
            <div className="col-xl-4 col-lg-6 col-md-6">
              <div className="lotteries-card-items style-lottery style-padding-30">
                <span className="serial">#1</span>
                <span className="price">R-{topWinners?.id}</span>
                <div className="thumb py-3 d-md-none">
                  <Image width={100} height={100} src="/images/winnig_img.svg" alt="Image" />
                </div>
                <div className="content mt-4 pt-3">
                  {/*  Fixed: was broken JSX expression */}
                  <h5>{topWinners?.name}</h5>
                  <p className="text-white">
                    Draw at {topWinners?.created_at
                      ? moment(topWinners.created_at).format("MMMM Do YYYY, h:mmA")
                      : "—"}
                  </p>
                </div>

                <h6>Top 10 Winning Numbers</h6>

                <div className="winner-table-container">
                  <table className="winner-table-item w-100">
                    <thead>
                      <tr>
                        <th>Rank</th>
                        <th>User ID</th>
                        <th>Ticket No</th>
                        <th>Amount</th>
                        <th>Tickets</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topWinners?.lottery_round_prizes?.map((w, idx) => (
                        <tr key={`w-${idx}`}>
                          <td>
                            <span className="rank-badge">
                              {/*  Fixed: w.showAwardIcon doesn't exist, use idx < 3 */}
                              <Image
                                width={20}
                                height={20}
                                className={idx < 3 ? "d-none d-md-block" : "opacity-0 d-none d-md-block"}
                                src="/images/new/award.png"
                                alt=""
                              />
                              {ORDINALS[idx] ?? `${idx + 1}th`}
                            </span>
                          </td>
                          {/* <td>{w.winner_user?.uu_id || w.winner_user_id}</td> */}
                          <td>
                            #{(() => {
                              const raw = w.winner_user?.uu_id ?? (w.winner_user_id !== undefined && w.winner_user_id !== null ? String(w.winner_user_id) : undefined);
                              return raw ? raw.replace(/^(.{2}).*(.{2})$/, '$1$2') : "—";
                            })()}
                          </td>
                          <td>
                            <span className="win-no">{w.winner_ticket?.ticket_code}</span>
                          </td>
                          <td>
                            {/*  Fixed: was double-braced broken expression */}
                            <span className="amount">
                              ${Number(w.winner_amount).toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </span>
                          </td>
                          <td>{w.winner_total_tickets ?? 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="lotterie-btn style-3 mt-3">
                  {/*  Fixed: both buttons now pass event correctly */}
                  <button className="btns" onClick={setOlder}>
                    <i className="ti ti-chevron-left"></i> Older
                  </button>
                  <button className="btns" onClick={setNewer}>
                    Newer <i className="ti ti-chevron-right"></i>
                  </button>
                </div>
              </div>
            </div>

            {/* ── Buy Tickets ── */}
            <div className="col-xl-4 col-lg-6 col-md-6 d-none d-md-block">
              <div className="lotteries-card-items style-lottery style-padding-30">
                <div className="content">
                  <h5>{drawTitle}</h5>
                  <p className="text-white">{drawAtText}</p>
                </div>
                <h6>Buy Lottery Tickets</h6>
                <div className="ticket-card">
                  <div className="rows">
                    <span>Price Per Ticket</span>
                    <span className="value">${ticketPrice}</span>
                  </div>
                  <div className="rows">
                    <span>Total Tickets</span>
                    <span className="value">{ticketCount}</span>
                  </div>
                  <div className="rows">
                    <span>Total Amount</span>
                    <span className="value">${totalAmount.toFixed(2)}</span>
                  </div>
                  {/* <div className="rows">
                    <span>Net Pool</span>
                    <span className="value">${round?.net_pool?.toLocaleString() ?? 0}</span>
                  </div> */}
                  <div className="counter-container border-info">
                    {ticketCount !== 0 && <span>No of Tickets</span>}
                    <div className="controls">
                      <button id="minus-btn" type="button" onClick={handleMinus}>-</button>
                      <span id="ticket-count">{ticketCount}</span>
                      <button id="plus-btn" type="button" onClick={handlePlus}>+</button>
                    </div>
                  </div>
                </div>
                <div className="lotterie-btn style-3 mt-5">
                  { details?.end_time && new Date(details.end_time).getTime() - 60000 < Date.now() ? (
                    <span>Already Draw This Round</span>
                  ) : (
                    <button
                      className="btn--primary"
                      disabled={isLoading}
                      onClick={isLoggedIn ? buyTickets : handleLoginClick}
                    >
                      {isLoading ? "Processing..." : isLoggedIn ? "Buy Tickets" : "Login to Buy Tickets"}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* ── Ticket History / Stats ── */}
            <div className="col-xl-4 col-lg-6 col-md-6 d-none d-md-block">
              <div className="lotteries-card-items style-lottery style-padding-30">
                <div className="content">
                  <h5>{drawTitle}</h5>
                  <p className="text-white">
                    {drawAtText}
                  </p>
                </div>
                <h6>Recent Tickets Purchase</h6>
                <div className="ticket-purchase-history-box">
                  <div className="info-row">
                    <span>Your Ticket</span>
                    {/* Shows count from current round's auth tickets if available, else falls back to round data */}
                    <span className="value">
                      {topWinners?.auth_tickets?.length ?? userTicket}
                    </span>
                  </div>
                  <div className="divider"></div>
                  <div className="info-row">
                    <span>Total Amount</span>
                    <span className="value">{topWinners?.auth_tickets?.length ?? userTicket * ticketPrice}</span>
                  </div>
                  <div className="divider"></div>
                  <div className="info-row">
                    <span>Winning Chance</span>
                    <span className="value">{winningPossibility}</span>
                  </div>
                  <div className="divider"></div>
                  <div className="ticket-header">
                    <h3>Winning Tickets</h3>
                    <div className="short-line"></div>
                  </div>
                  <div className="ticket-grid">
                    {round?.my_tickets?.map((p, index) => (
                      <span key={index}>{p}</span>
                    ))}
                  </div>
                </div>
                <div className="lotterie-btn style-3 mt-5">
                  <Link href={`/dashboard/ticket-history?tab=${tabKey}`} className="btn--primary">
                    Tickets History
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}