type Props = {
  currency: string;
};

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  BDT: "৳",
  EUR: "€",
  GBP: "£",
  INR: "₹",
  PKR: "₨",
  AUD: "A$",
  CAD: "C$",
  JPY: "¥",
  CNY: "¥",
  CHF: "Fr",
};

export default function CurrencyMark({ currency }: Props) {
  const code = currency.trim().toUpperCase();
  const symbol = CURRENCY_SYMBOLS[code] ?? code;

  if (!symbol) return null;

  return (
    <span className="lbs-currency-mark" aria-label={code || "Currency"}>
      {symbol}
    </span>
  );
}
