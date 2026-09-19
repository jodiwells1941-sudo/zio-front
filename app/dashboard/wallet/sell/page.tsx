"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { getTrade, type TradeData } from "@/app/api/trade";
import P2PTopNav from "@/components/dashboard/p2p/P2PTopNav";
import P2PChatPanel from "@/components/dashboard/p2p/P2PChatPanel";
import BuyerPaymentCard from "@/components/dashboard/wallet/sell/BuyerPaymentCard";
import {
  PaymentStatus,
  resolveUIStatus,
} from "@/components/dashboard/p2p/P2PTransferCard";

export default function SellPage() {
  const searchParams = useSearchParams();
  const tradeId = searchParams.get("trade_id");
  const [uiStatus, setUiStatus] = useState<PaymentStatus>("payment");
  const [tradeStatus, setTradeStatus] = useState<number>(0);

  const showChatPanel = tradeStatus !== 1 && tradeStatus !== 8 && tradeStatus !== 3;

  const fetchTrade = useCallback(async () => {
    if (!tradeId) return;

    try {
      const res = await getTrade(Number(tradeId));
      const t: TradeData = res?.data;
      const nextStatus = t?.status ?? 0;
      setTradeStatus(nextStatus);
      setUiStatus(resolveUIStatus(nextStatus));
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Failed to load trade.");
    }
  }, [tradeId]);

  useEffect(() => {
    void fetchTrade();
  }, [fetchTrade]);

  return (
    <div className="p2pPage mt-5">
      <P2PTopNav />

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