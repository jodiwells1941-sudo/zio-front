"use client";

import React, { useCallback, useEffect, useState } from "react";
import P2PTopNav from "@/components/dashboard/p2p/P2PTopNav";
import P2PChatPanel from "@/components/dashboard/p2p/P2PChatPanel";
import BuyerPaymentCard from "@/components/dashboard/wallet/sell/BuyerPaymentCard";
import { useSearchParams } from "next/navigation";
import { getTrade, type TradeData } from "@/app/api/trade";
import { toast } from "react-toastify";

export default function SellPage() {
  const searchParams = useSearchParams();
  const tradeId = searchParams.get("trade_id");
  const [tradeStatus, setTradeStatus] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const showChatPanel = tradeStatus !== 1 && tradeStatus !== 8 && tradeStatus !== 3;

  const fetchTrade = useCallback(async () => {
    if (!tradeId) return;

    try {
      setLoading(true);
      const res = await getTrade(Number(tradeId));
      const t: TradeData = res?.data;
      const nextStatus = t?.status ?? 0;
      setTradeStatus(nextStatus);
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Failed to load trade.");
    } finally {
      setLoading(false);
    }
  }, [tradeId]);

  useEffect(() => {
    void fetchTrade();
  }, [fetchTrade]);

  return (
    <div className="p2pPage mt-5">
      {/* <P2PTopNav /> */}

      <div className="container p2pContainer">
        <div className="row g-4">
          <div className={showChatPanel ? "col-lg-7 col-12" : "col-12 w-100"}>
            <BuyerPaymentCard />
          </div>

          {showChatPanel && (
            <div className="col-lg-5 col-12">
              <P2PChatPanel />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}