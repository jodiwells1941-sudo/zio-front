'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { getMyLocalAds, P2pAdsData } from '@/app/api/p2padsapi';
import './localBuySell.css';

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
const n2 = (v: unknown, d = 2) => {
  const n = Number(v);
  return Number.isFinite(n)
    ? n.toLocaleString('en-US', {
        minimumFractionDigits: d,
        maximumFractionDigits: d,
      })
    : '-';
};

const isLocal = (a: P2pAdsData) =>
  !a.ad_create_type || a.ad_create_type === 'local';

const adStatusClass = (ad: P2pAdsData) => {
  const status = (ad as any).status;
  const text = ((ad as any).status_text ?? '').toLowerCase();
  if (text.includes('pause')) return 'lbs-status--paused';
  if (text.includes('inactive') || status === false || status === 0)
    return 'lbs-status--inactive';
  if (text.includes('active') || status === true || status === 1)
    return 'lbs-status--active';
  return 'lbs-status--active';
};

const adStatusText = (ad: P2pAdsData) => {
  const status = (ad as any).status;
  const text = (ad as any).status_text;
  if (text) return text;
  return status ? 'Active' : 'Inactive';
};

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────
export default function MyActiveAdsCard() {
  const [ads, setAds] = useState<P2pAdsData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAds = useCallback(async () => {
    setLoading(true);
    try {
      const [buyRes, sellRes] = await Promise.all([
        getMyLocalAds({ type: 'buy', page: 1 }),
        getMyLocalAds({ type: 'sell', page: 1 }),
      ]);

      const pick = (res: any, type: 'buy' | 'sell') => {
        const d = res?.data;
        const raw: P2pAdsData[] = Array.isArray(d) ? d : d?.data ?? [];
        return raw.filter((a) => a.type === type && isLocal(a));
      };

      const merged = [...pick(buyRes, 'buy'), ...pick(sellRes, 'sell')].slice(0, 4);
      setAds(merged);
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'Failed to load your active ads.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchAds();
  }, [fetchAds]);

  return (
    <section className="lbs-card">
      <header className="lbs-card-head">
        <span className="lbs-card-icon lbs-card-icon--yellow">
          <i className="fa-solid fa-bullhorn" />
        </span>
        <h3 className="lbs-card-title">My Active Ads</h3>

        <Link
          href="/dashboard/local-buy-sell/my-ads"
          className="lbs-card-link"
          style={{ marginLeft: 'auto' }}
        >
          View All <i className="fa-solid fa-arrow-right ms-1" />
        </Link>
      </header>

      <div className="lbs-card-scroll">
        <div className="lbs-card-table">
          <div className="lbs-card-row lbs-card-row--head lbs-card-row--ads">
            <div>#</div>
            <div>Type</div>
            <div>Amount (BDT)</div>
            <div>Price (BDT)</div>
            <div>USDT Amount</div>
            <div>Status</div>
            <div>Action</div>
          </div>

          {loading && ads.length === 0 &&
            [0, 1, 2, 3].map((i) => (
              <div key={i} className="lbs-card-row lbs-card-row--ads lbs-card-skel">
                {Array.from({ length: 7 }).map((_, j) => (
                  <span key={j} />
                ))}
              </div>
            ))}

          {!loading && ads.length === 0 && (
            <div className="lbs-card-empty">
              <i className="fa-regular fa-folder-open" />
              No active ads yet.
            </div>
          )}

          {ads.map((ad, i) => {
            const typeBuy = ad.type === 'buy';
            const price = Number(ad.fixed_price ?? 0);
            const totalAmount = Number(ad.total_amount * price);
            const usdtAmount = price > 0 ? totalAmount / price : totalAmount;

            return (
              <div key={ad.id} className="lbs-card-row lbs-card-row--ads">
                <div>
                  <span className="lbs-cell-idx">{i + 1}</span>
                </div>
                <div>
                  <span className={`lbs-type-badge lbs-type-badge--${typeBuy ? 'buy' : 'sell'}`}>
                    {typeBuy ? 'Buy' : 'Sell'}
                  </span>
                </div>
                <div className="lbs-cell-num lbs-cell-num--accent">{n2(totalAmount, 0)}</div>
                <div className="lbs-cell-num">{n2(price)}</div>
                <div className="lbs-cell-num">{n2(usdtAmount)}</div>
                <div>
                  <span className={`lbs-status ${adStatusClass(ad)}`}>
                    {adStatusText(ad)}
                  </span>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <Link
                    href={`/dashboard/local-buy-sell/my-ads?ad_id=${ad.id}`}
                    className="lbs-view-btn"
                  >
                    View
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}