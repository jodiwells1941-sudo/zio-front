'use client';

import MerchantOrderTable from "./MerchantOrderTable";



export default function OrderPage() {

  return (
    <div className="p2pPage mt-5">
      <div className="container-lg p-3">
        <div className="trades-section">
          <MerchantOrderTable />
        </div>
      </div>
    </div>
  );
}