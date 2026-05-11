"use client";

import React from "react";
import P2PTopNav from "@/components/dashboard/p2p/P2PTopNav";
import P2PChatPanel from "@/components/dashboard/p2p/P2PChatPanel";
import BuyerPaymentCard from "@/components/dashboard/wallet/sell/BuyerPaymentCard";

export default function SellPage() {
  return (
    <div className="p2pPage mt-5">
      <P2PTopNav />

      <div className="container p2pContainer">
        <div className="row g-4">
          <div className="col-lg-7 col-12">
            <BuyerPaymentCard />
          </div>
          <div className="col-lg-5 col-12">
            <P2PChatPanel />
          </div>
        </div>
      </div>
    </div>
  );
}