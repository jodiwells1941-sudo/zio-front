'use client';

import AdsTable from '@/components/dashboard/ads/AdsTable';

export default function OrderPage() {

  return (
    <div className="p2pPage mt-5">
      <div className="container-lg p-3">
        <div className="trades-section">
          <AdsTable />
        </div>
      </div>
    </div>
  );
}