// components/OrderDetailsCard.tsx
"use client";

import { useState } from "react";

interface OrderDetailsCardProps {
  fromName: string;
  toName: string;
  payWith: string;
  orderType: "Buy" | "Sell";
  type: string;
  asset: string;         // "USDT"
  fiatCurrency: string;  // "Tk."
  fiatAmount: number;    // 5000
  price: number;         // 127.6
  totalQuantity: number; // 39.24
  fee: number;           // 0.06
  bonus: number;         // 0.00
  orderNo: string;
}

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handle = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button className="p2pCopyBtn" type="button" aria-label="copy" onClick={handle}>
      {copied ? <i className="fa-solid fa-check text-success" /> : <i className="fa-regular fa-copy" />}
    </button>
  );
}

export default function OrderDetailsCard({
  fromName, toName, payWith, orderType, type, asset,
  fiatCurrency, fiatAmount, price, totalQuantity, fee, bonus, orderNo,
}: OrderDetailsCardProps) {
  const [open, setOpen] = useState(true);
  const releaseQuantity = totalQuantity;
  const fmt = (n: number, d = 2) =>
    Number(n).toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d });

  return (
    <div className="p2pCard p-0">
      <button
        type="button"
        className="p2pCardRow px-3 bg-dark rounded-top-3 w-100 border-0 d-flex justify-content-between align-items-center"
        onClick={() => setOpen(o => !o)}
      >
        <span className="d-flex align-items-center gap-2 text-white fw-6">
          <span className="assetBadge">{asset[0]}</span>
          {asset} Order details
        </span>
        <i className={`fa-solid fa-angle-${open ? "up" : "down"}`} />
      </button>

      {open && (
        <>
          <div className="p2pCardRow px-3">
            <div className="p2pCardLabel">From</div>
            <div className="p2pCardValue">{fromName}</div>
          </div>
          <div className="p2pCardRow px-3">
            <div className="p2pCardLabel">To</div>
            <div className="p2pCardValue">{toName}</div>
          </div>
          <div className="p2pCardRow px-3">
            <div className="p2pCardLabel">Pay With</div>
            <div className="p2pCardValue text-danger">{payWith}</div>
          </div>

          <div className="p2pCardRow px-3 border-top border-dark-light">
            <div className="p2pCardLabel">Order type</div>
            <div className="p2pCardValue">{orderType} {asset}</div>
          </div>
          <div className="p2pCardRow px-3">
            <div className="p2pCardLabel">Fiat Amount</div>
            <div className="p2pCardValue">{fiatCurrency} {fmt(fiatAmount, 0)}</div>
          </div>
          <div className="p2pCardRow px-3">
            <div className="p2pCardLabel">{asset} Price</div>
            <div className="p2pCardValue">{fiatCurrency} {fmt(price)}</div>
          </div>
          <div className="p2pCardRow px-3">
            <div className="p2pCardLabel">Total Quantity</div>
            <div className="p2pCardValue">{fmt(totalQuantity + fee + bonus)} {asset}</div>
          </div>
          <div className="p2pCardRow px-3 ps-4">
            <div className="p2pCardLabel text-white-50">└ Release Quantity</div>
            <div className="p2pCardValue">{fmt(releaseQuantity)} {asset}</div>
          </div>

          { type == "buy" && (
            <div className="p2pCardRow px-3 ps-4">
              <div className="p2pCardLabel text-white-50">└ Bonus</div>
              <div className="p2pCardValue">{fmt(bonus)} {asset}</div>
            </div>
          )}

          { type == "sell" && (
            <div className="p2pCardRow px-3 ps-4">
              <div className="p2pCardLabel text-white-50">└ Selling Fee</div>
              <div className="p2pCardValue">{fmt(fee)} {asset}</div>
            </div>
          )}

          <div className="p2pCardRow px-3 border-top border-dark-light">
            <div className="p2pCardLabel">Order No.</div>
            <div className="p2pCardValue">
              {orderNo}
              <CopyBtn text={orderNo} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}