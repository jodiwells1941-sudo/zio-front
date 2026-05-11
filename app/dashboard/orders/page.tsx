'use client';

import AdsTable from '@/components/dashboard/ads/AdsTable';
import P2PTopNav from '@/components/dashboard/p2p/P2PTopNav';

export default function OrderPage() {

  return (
    <div className="p2pPage mt-5">
      <P2PTopNav />
      <div className="container-lg p-3">
        {/* Trades Table Section */}
        <div className="trades-section">
          <AdsTable />
        </div>
      </div>
    </div>
  );
}