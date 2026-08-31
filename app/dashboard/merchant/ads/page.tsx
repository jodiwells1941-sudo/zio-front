'use client';

import { useRouter, useSearchParams } from "next/navigation";
import AdsPage from "./AdsPage";
import { useEffect, useState } from "react";
import { getAd } from "@/app/api/p2padsapi";
import { toast } from "react-toastify";

export default function Page() {
  const searchId = useSearchParams();
  const [ads, setAds] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const id = searchId.get("id");
  const route = useRouter();

  useEffect(() => {
    const id = searchId.get("id");

    if (!id) {
      setLoading(false);
      return;
    }

    const getEditAd = async () => {
      try {
        const res = await getAd(parseInt(id));
        const ad = res?.data || {};

        setAds({
          type: ad.type ?? "buy",
          asset: ad.asset ?? "",
          withFlat: ad.with_fiat ?? "",
          priceType: ad.price_type ?? "fixed",
          fixedPrice: Number(ad.fixed_price ?? 0),
          totalAmount: String(ad.total_amount ?? ""),
          orderLimitMin: Number(ad.order_limit_min ?? 0),
          orderLimitMax: Number(ad.order_limit_max ?? 0),
          paymentMethodId: Number(ad.payment_method_id ?? 0),
          paymentTimeLimit: String(ad.payment_time_limit ?? ""),
          terms: Array.isArray(ad.terms) ? ad.terms : [],
          remarks: ad.remarks ?? "",
          autoReply: ad.auto_reply ?? "",
          displayRegion: ad.display_region ?? "all",
          conditions: ad.conditions ?? {},
          status: Boolean(ad.status),
        });
      } catch (err) {        
        toast.error("Ads data not found. Please try again.");
        route.push("/dashboard/ads");
      } finally {
        setLoading(false);
      }
    };

    getEditAd();
  }, [searchId]);

  if (loading) return <p>Loading...</p>;

  return (
      <AdsPage editId={id ? Number(id) : undefined} defaultValues={ads} />
  );
}