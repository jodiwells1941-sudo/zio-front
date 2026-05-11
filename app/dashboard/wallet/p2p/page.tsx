"use client";

import React from "react";
// import P2PTopNav from "@/components/dashboard/p2p/P2PTopNav";
import P2PTransferCard from "@/components/dashboard/p2p/P2PTransferCard";
// import P2PFAQ from "@/components/dashboard/p2p/P2PFAQ";
import P2PChatPanel from "@/components/dashboard/p2p/P2PChatPanel";
import P2PTopNav from "@/components/dashboard/p2p/P2PTopNav";

export default function P2POrderPage() {
  return (
    <div className="p2pPage mt-5">
      <P2PTopNav />

      <div className="container p2pContainer">
        <div className="row g-4">
          {/* LEFT */}
          <div className="col-lg-7">
            <P2PTransferCard />
            {/* <div className="p2pDivider" /> */}
            {/* <P2PFAQ /> */}
          </div>

          {/* RIGHT */}
          <div className="col-lg-5 d-none d-md-block">
            <P2PChatPanel />
          </div>
        </div>
      </div>
    </div>
  );
}