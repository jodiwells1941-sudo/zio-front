"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import TicketHistoryPage from "@/components/dashboard/Tickets/TicketHistoryPage";
import { getTicketHistory } from "@/app/api/lottery";

export default function Page() {
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get("tab");

  const [active, setActive] = useState("All");
  const [data, setData] = useState([]);

  async function loadData() {
    const res = await getTicketHistory();
    setData(res.data.data);
  }

  //  Set active tab from URL
  useEffect(() => {
    if (tabFromUrl) {
      setActive(tabFromUrl);
    }
  }, [tabFromUrl]);

  // filter
  const filteredData =
    active === "All"
      ? data
      : data.filter((item: any) => item.lotteryName === active);

  const buttons = [
    "All",
    ...new Set(data.map((i: any) => i.lotteryName)),
  ];

  useEffect(() => {
    loadData();
  }, []);  

  return (
    <>
      <div className="py-4">
        <div className="d-flex flex-wrap gap-2 justify-content-center">
          {buttons.map((btn) => (
            <button
              key={btn}
              onClick={() => setActive(btn)}
              className={
                active === btn
                  ? "bg-warning text-black px-4 py-2 rounded-pill"
                  : "bg-gradient text-white px-4 py-2 rounded-pill"
              }
            >
              {btn}
            </button>
          ))}
        </div>
      </div>

      <TicketHistoryPage title="Lottery" items={filteredData} />
    </>
  );
}