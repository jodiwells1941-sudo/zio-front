export type LocalOrderSummaryRow = {
  label: string;
  value: string;
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
}: LocalOrderSummaryInput): LocalOrderSummaryRow[] {
  const assetName = asset.toUpperCase() === "USDT" ? "USD" : asset;
  const common: LocalOrderSummaryRow[] = [
    { label: "Currency", value: fiat || "—" },
    { label: `Market Price (1 ${assetName})`, value: `${money(price)} ${fiat}` },
  ];

  if (side === "sell") {
    return [
      ...common,
      { label: "Sell Amount", value: `- ${money(assetAmount)} ${assetName}`, tone: "negative" },
      { label: `Fee (${money(feePercent)}%)`, value: `- ${money(feeAmount)} ${assetName}`, tone: "negative" },
      { label: "Total Amount", value: `- ${money(assetAmount + feeAmount)} ${assetName}`, tone: "negative" },
      { label: `Received Amount (${fiat})`, value: `${money(fiatAmount)} ${fiat}`, tone: "received", total: true },
    ];
  }

  return [
    ...common,
    { label: "Amount", value: `${money(fiatAmount)} ${fiat}` },
    { label: `${assetName} Amount`, value: `+ ${money(assetAmount)} ${assetName}`, tone: "positive" },
    { label: "Bonus", value: `+ ${money(bonusAmount)} ${assetName}`, tone: "positive" },
    { label: "Total You Will Receive", value: `+ ${money(assetAmount + bonusAmount)} ${assetName}`, tone: "positive", total: true },
  ];
}
