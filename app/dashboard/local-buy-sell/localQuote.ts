import type { P2pAdsData } from "@/app/api/p2padsapi";

/** The ad fixes the fiat payment; each participant's USD uses their own rate. */
export function localAdQuote(ad: P2pAdsData, requestedAdAmount = Number(ad.total_amount ?? 0)) {
  const adAmount = Number(requestedAdAmount);
  const fiatAmount = Number((adAmount * Number(ad.fixed_price)).toFixed(2));
  const marketRate = Number(ad.market_price ?? 0);
  const visitorAmount = marketRate > 0 ? fiatAmount / marketRate : 0;

  return { adAmount, fiatAmount, marketRate, visitorAmount };
}
