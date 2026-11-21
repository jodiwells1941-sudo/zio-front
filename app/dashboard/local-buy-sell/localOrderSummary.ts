export type LocalOrderSummaryRow = {
  label: string;
  value: string;
  icon: string;
  tone?: "positive" | "negative" | "received";
  total?: boolean;
};

type LocalOrderSummaryInput = {
  side: "buy" | "sell";
  fiat: string;
  asset: string;
  fiatAmount: number;
  assetAmount: number;
  price: number;
  bonusAmount?: number;
  feeAmount?: number;
  feePercent?: number;
  feeLabel?: string;
};

const money = (value: number) =>
  (Number.isFinite(value) ? value : 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export function localOrderSummaryRows({
  side,
  fiat,
  asset,
  fiatAmount,
  assetAmount,
  price,
  bonusAmount = 0,
  feeAmount = 0,
  feePercent = 0,
  feeLabel,
}: LocalOrderSummaryInput): LocalOrderSummaryRow[] {
  const assetName = asset.toUpperCase() === "USDT" ? "USD" : asset;
  const common: LocalOrderSummaryRow[] = [
    { label: "Currency", value: fiat || "—", icon: "fa-coins" },
    { label: `Market Price (1 ${assetName})`, value: `${money(price)} ${fiat}`, icon: "fa-arrow-trend-up" },
  ];

  if (side === "sell") {
    return [
      ...common,
      { label: "Sell Amount", value: `- ${money(assetAmount)} ${assetName}`, icon: "fa-layer-group", tone: "negative" },
      { label: feeLabel ?? `Fee (${money(feePercent)}%)`, value: `- ${money(feeAmount)} ${assetName}`, icon: "fa-percent", tone: "negative" },
      { label: "Total Amount", value: `- ${money(assetAmount + feeAmount)} ${assetName}`, icon: "fa-wallet", tone: "negative" },
      { label: `Received Amount (${fiat})`, value: `${money(fiatAmount)} ${fiat}`, icon: "fa-hand-holding-dollar", tone: "received", total: true },
    ];
  }

  return [
    ...common,
    { label: "Amount", value: `${money(fiatAmount)} ${fiat}`, icon: "fa-layer-group" },
    { label: `${assetName} Amount`, value: `+ ${money(assetAmount)} ${assetName}`, icon: "fa-wallet", tone: "positive" },
    { label: "Bonus", value: `+ ${money(bonusAmount)} ${assetName}`, icon: "fa-gift", tone: "positive" },
    { label: "Total You Will Receive", value: `+ ${money(assetAmount + bonusAmount)} ${assetName}`, icon: "fa-coins", tone: "positive", total: true },
  ];
}
