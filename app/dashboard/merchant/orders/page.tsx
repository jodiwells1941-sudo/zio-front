'use client';

import MerchantOrderTable from "./MerchantOrderTable";



export default function OrderPage() {

  return (
    <div className="p2pPage merchant-orders-page">
      <div className="container-fluid px-3 px-lg-4 py-4">
        <div className="merchant-orders-heading"><span className="merchant-orders-heading-icon"><i className="fa-solid fa-receipt" aria-hidden="true" /></span><div><h1>Merchant Orders</h1><p>Track orders placed on your merchant ads and open any trade to manage it.</p></div></div>
        <div className="trades-section">
          <MerchantOrderTable />
        </div>
      </div>
    </div>
  );
}
