/**
 * P2P API uses `payable_amount` = fiat total and `receivable_amount` = crypto (asset) amount.
 * The buyer always pays fiat and receives crypto; the seller locks/sends crypto and receives fiat.
 * UI must swap labels/primary rows when the viewer is the seller (`is_client`).
 */

export type P2pOrderAmountsInput = {
  payable_amount: string | number;
  receivable_amount: string | number;
  user_price: string | number;
  /** `buy` | `sell` from API */
  type: string;
  /** True when the authenticated user is the seller (crypto side). */
  is_client: boolean;
  p2p_ad?: { with_fiat?: string; asset?: string };
};

function fmtFiat(n: number): string {
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtCrypto(n: number): string {
  return n.toFixed(2);
}

export type ViewerOrderAmountDisplay = {
  fiat: string;
  asset: string;
  fiatAmount: number;
  cryptoAmount: number;
  fiatStr: string;
  cryptoStr: string;
  priceStr: string;
  /** Primary card / "You pay" row */
  youPayLabel: string;
  youPayLine: string;
  youPayCopyText: string;
  /** Order details accordion rows (3 lines: primary leg, price, counter leg) */
  detailRows: Array<{ label: string; value: string; copyText: string }>;
};

export function getViewerOrderAmountDisplay(trade: P2pOrderAmountsInput): ViewerOrderAmountDisplay {
  const fiat = trade.p2p_ad?.with_fiat ?? "BDT";
  const asset = trade.p2p_ad?.asset ?? "USDT";
  const fiatAmount = Number(trade.payable_amount);
  const cryptoAmount = Number(trade.receivable_amount);
  const fiatStr = fmtFiat(fiatAmount);
  const cryptoStr = fmtCrypto(cryptoAmount);
  const priceStr = Number(trade.user_price).toFixed(2);
  const isSeller = trade.is_client;

  if (!isSeller) {
    return {
      fiat,
      asset,
      fiatAmount,
      cryptoAmount,
      fiatStr,
      cryptoStr,
      priceStr,
      youPayLabel: "You pay",
      youPayLine: `${fiat} ${fiatStr}`,
      youPayCopyText: fiatStr,
      detailRows: [
        { label: `Fiat amount (${fiat})`, value: `${fiat} ${fiatStr}`, copyText: fiatStr },
        { label: "Price", value: `${fiat} ${priceStr}`, copyText: priceStr },
        { label: `You receive (${asset})`, value: `${cryptoStr} ${asset}`, copyText: cryptoStr },
      ],
    };
  }

  return {
    fiat,
    asset,
    fiatAmount,
    cryptoAmount,
    fiatStr,
    cryptoStr,
    priceStr,
    youPayLabel: "You pay",
    youPayLine: `${cryptoStr} ${asset}`,
    youPayCopyText: cryptoStr,
    detailRows: [
      { label: `${asset} amount (you sell)`, value: `${cryptoStr} ${asset}`, copyText: cryptoStr },
      { label: "Price", value: `${fiat} ${priceStr}`, copyText: priceStr },
      { label: `Fiat you receive (${fiat})`, value: `${fiat} ${fiatStr}`, copyText: fiatStr },
    ],
  };
}
