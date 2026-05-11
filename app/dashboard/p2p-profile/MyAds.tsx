"use client";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { getMyAds, deleteAd, P2pAdsData } from "@/app/api/p2padsapi";
import { P2PTabKey } from "@/components/dashboard/wallet/types";
import P2PTabButton from "@/components/dashboard/wallet/components/P2PTabButton";
import Link from "next/link";

// UI Type
type P2PCard = {
  id: number;
  name: string;
  platform: string;
  methodName: string;
  rate: number;
  limit: string;
  available: string;
  timeText: string;
  type: "buy" | "sell";
  userImage: string;
  currency: string;
};

export default function MyAds() {
  const [activeP2PTab, setActiveP2PTab] =
    useState<P2PTabKey>("wallet-balance");
  const [ads, setAds] = useState<P2pAdsData[]>([]);
  const [loading, setLoading] = useState(false);

  //  Map API → UI
  const mapAdToCard = (ad: P2pAdsData): P2PCard => ({
    id: ad.id,
    name: ad.user?.name || "Unknown",
    platform: `${ad.asset}/${ad.with_fiat}`,
    methodName: ad.payment_method?.sell_method?.name || "N/A",
    rate: ad.fixed_price,
    limit: `${ad.order_limit_min * ad.fixed_price} - ${ad.order_limit_max * ad.fixed_price} ${ad.with_fiat}`,
    available: `${ad.total_amount} ${ad.asset}`,
    timeText: `${ad.payment_time_limit} min`,
    type: ad.type,
    userImage: ad.user?.avatar || "",
    currency: ad.with_fiat,
  });

  //  Fetch Ads
  const getBuySellAds = async () => {
    try {
      setLoading(true);

      const type =
        activeP2PTab === "wallet-balance" ? "buy" : "sell";

      const res = await getMyAds({ type });

      setAds(res?.data?.data ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getBuySellAds();
  }, [activeP2PTab]);

  // Transform data
  const p2pCards = ads.map(mapAdToCard);

  //  Filter by tab (extra safety)
  const filteredCards = p2pCards.filter(
    (c) =>
      c.type ===
      (activeP2PTab === "wallet-balance" ? "buy" : "sell")
  );

  //  Delete handler
  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "Delete Ad?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await deleteAd(id);

        setAds((prev) => prev.filter((ad) => ad.id !== id));

        Swal.fire("Deleted!", "Your ad has been removed.", "success");
      } catch (err) {
        Swal.fire("Error!", "Failed to delete ad.", "error");
      }
    }
  };

  return (
    <div className="wallet-paymet-box-items mt-30 p-4">
      <div className="wallet-tab-items">

        {/* Tabs */}
        <div className="d-flex justify-content-between mb-4">
          <div className="wallet-tab-buttons mb-0">
            <P2PTabButton
              tab="wallet-balance"
              label="Buy"
              activeTab={activeP2PTab}
              onChange={setActiveP2PTab}
            />
            <P2PTabButton
              tab="wallet-add"
              label="Sell"
              activeTab={activeP2PTab}
              onChange={setActiveP2PTab}
            />
          </div>
        </div>

        {/* Content */}
        <div className="wallet-tab-contents">
          <div className="wallet-wrap-area">

            {loading ? (
              <p>Loading...</p>
            ) : filteredCards.length === 0 ? (
              <p className="py-5 text-center">No ads found</p>
            ) : (
              <div className="row g-4">
                {filteredCards.map((c) => (
                  <div key={c.id} className="col-lg-6">
                    <div className="payment-card p-3 p-md-4 border border-secondary">

                      {/* Header */}
                      <div className="card-header d-flex justify-content-between">
                        <div className="user-info d-flex align-items-center gap-2">
                          <div className="avatar rounded-circle overflow-hidden">
                            <img
                              src={c.userImage}
                              width={30}
                              height={30}
                              alt="avatar"
                            />
                          </div>
                          <div>
                            <div className="name">{c.name}</div>
                            <div className="platform">{c.platform}</div>
                          </div>
                        </div>

                        <div className="payment-method text-end">
                          <div>{c.methodName}</div>
                          <small>{c.timeText}</small>
                        </div>
                      </div>

                      {/* Body */}
                      <div className="card-body">
                        <div className="price-display">
                          <span className="tk-symbol">{c.currency} </span>
                          <span className="amount">{c.rate}</span>
                          <span className="unit"> /USD</span>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="card-footer d-flex justify-content-between align-items-center">
                        <div>
                          <small>
                            <strong>Limit:</strong> {c.limit}
                          </small>
                          <p className="mb-0">
                            <strong>Available:</strong> {c.available}
                          </p>
                        </div>

                        <div className="d-flex gap-2">
                            <Link href={`/dashboard/ads?id=${c.id}`}
                              className="btn btn-primary btn-sm"
                            >
                              Edit
                            </Link>
                            <button
                                className="btn btn-danger btn-sm"
                                onClick={() => handleDelete(c.id)}
                            >
                                Delete
                            </button>
                        </div>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}