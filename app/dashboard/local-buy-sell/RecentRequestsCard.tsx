'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { getLocalMyTrades } from '@/app/api/trade';
import { getUserInfo } from '@/utils/auth';
import { getTradeEcho } from '@/utils/tradeEcho';
import Link from 'next/link';
import './localBuySell.css';

// ─────────────────────────────────────────────────────────────
// Types — matches backend `localTradeListRow()` output
// ─────────────────────────────────────────────────────────────
type ActiveTab = 'all' | 'buy' | 'sell';

interface Trade {
  id: number;
  type: string;                          // 'Buy' | 'Sell' (viewer's side)
  order_side?: 'buy' | 'sell';           // ad side
  asset?: string;                        // 'USDT'
  date?: string;                         // '2025-09-25 10:21'
  orderNumber?: string;                  // 'OD123456'
  price?: string;                        // '120.21 BDT' (formatted)
  cryptoAmount?: string;                 // '41.25 BDT' (formatted)
  cryptoValue?: string;                  // '8.24 USDT' (formatted)
  bonus_amount?: number | string;        // 0.41
  charge_amount?: number | string;       // 0.82
  bonus_percent?: number | string;       // 1
  charge_percent?: number | string;      // 1
  timeLimit?: number | string;           // 15
  counterparty?: string;                 // 'John'
  isCustomer?: boolean;
  status?: number;
  status_text?: string;
  status_list?: number[];
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
const num = (v: unknown, d = 2) => {
  const n = Number(v);
  return Number.isFinite(n)
    ? n.toLocaleString('en-US', {
        minimumFractionDigits: d,
        maximumFractionDigits: d,
      })
    : '-';
};

const tradeStatusClass = (status?: number, text?: string) => {
  const t = (text ?? '').toLowerCase();
  if (status === 9 || t.includes('complete')) return 'lbs-status--completed';
  if (status === 3 || status === 4 || t.includes('cancel') || t.includes('reject'))
    return 'lbs-status--cancelled';
  if (status === 5 || status === 6 || t.includes('process') || t.includes('paid'))
    return 'lbs-status--processing';
  if (status === 1 || t.includes('pending')) return 'lbs-status--pending';
  return 'lbs-status--pending';
};

const tradeStatusText = (status?: number, text?: string) => {
  if (text) return text;
  switch (status) {
    case 1:  return 'Pending';
    case 2:  return 'Approved';
    case 3:  return 'Cancelled';
    case 4:  return 'Rej. Balance';
    case 5:  return 'Paid';
    case 6:  return 'Processing';
    case 9:  return 'Completed';
    case 10: return 'Claimed';
    default: return 'Pending';
  }
};

/** Backend sends '2025-09-25 10:21' — turn into '25 Sep 2025 10:21 AM' */
const formatCreated = (raw?: string) => {
  if (!raw) return '—';
  const d = new Date(raw.replace(' ', 'T'));
  if (Number.isNaN(d.getTime())) return raw;
  return d.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────
export default function RecentRequestsCard() {
  const [tab, setTab] = useState<ActiveTab>('all');
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTrades = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await (getLocalMyTrades as (
        args?: Record<string, string | number>
      ) => Promise<unknown>)({ page: 1 });

      // Backend wraps in { data: { data: [...] } } (paginator) OR { data: [...] }
      const outer = (res as any)?.data;
      const list: Trade[] = outer?.data ?? outer ?? [];
      setTrades(Array.isArray(list) ? list.slice(0, 5) : []);
    } catch (e: any) {
      if (!silent) toast.error(e?.response?.data?.message ?? 'Failed to load requests.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchTrades();
  }, [fetchTrades]);

  // Live refresh via Reverb
  useEffect(() => {
    const me = getUserInfo();
    const uid = me?.id != null ? Number(me.id) : NaN;
    if (!Number.isFinite(uid) || uid < 1) return;

    const echo = getTradeEcho();
    if (!echo) return;

    const channel = echo.private(`user.${uid}`);
    const onUpdate = () => void fetchTrades(true);
    channel.listen('.p2p-orders-list.updated', onUpdate);

    return () => {
      channel.stopListening('.p2p-orders-list.updated');
      echo.leave(`user.${uid}`);
    };
  }, [fetchTrades]);

  const filtered = trades.filter((t) => {
    if (tab === 'buy') return t.order_side === 'buy' || t.type === 'Buy';
    if (tab === 'sell') return t.order_side === 'sell' || t.type === 'Sell';
    return true;
  });

  return (
    <section className="lbs-card">
      <header className="lbs-card-head">
        <span className="lbs-card-icon lbs-card-icon--amber">
          <i className="fa-solid fa-clock-rotate-left" />
        </span>
        <h3 className="lbs-card-title">Recent Buy &amp; Sell Requests</h3>

        <div className="lbs-card-tabs" role="tablist">
          {(['all', 'buy', 'sell'] as ActiveTab[]).map((k) => (
            <button
              key={k}
              type="button"
              role="tab"
              aria-selected={tab === k}
              className={`lbs-card-tab ${tab === k ? 'is-active' : ''}`}
              onClick={() => setTab(k)}
            >
              {k.charAt(0).toUpperCase() + k.slice(1)}
            </button>
          ))}
        </div>

        <Link href="/dashboard/local-buy-sell/my-orders" className="lbs-card-link">
          View All <i className="fa-solid fa-arrow-right ms-1" />
        </Link>
      </header>

      <div className="lbs-card-scroll">
        <div className="lbs-card-table">
          {/* Column widths tuned in CSS: .lbs-card-row--requests */}
          <div className="lbs-card-row lbs-card-row--head lbs-card-row--requests">
            <div>#</div>
            <div>Type</div>
            <div>Amount</div>
            <div>Price </div>
            <div>USDT Amount</div>
            <div>Bonus/Fee</div>
            <div>Time (Min)</div>
            <div>Status</div>
            <div>Created At</div>
            <div>Action</div>
          </div>

          {loading && trades.length === 0 &&
            [0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="lbs-card-row lbs-card-row--requests lbs-card-skel">
                {Array.from({ length: 10 }).map((_, j) => (
                  <span key={j} />
                ))}
              </div>
            ))}

          {!loading && filtered.length === 0 && (
            <div className="lbs-card-empty">
              <i className="fa-regular fa-folder-open" />
              No recent requests yet.
            </div>
          )}

          {filtered.map((t, i) => {
            const typeBuy = t.order_side === 'buy' || t.type === 'Buy';

            // Bonus on Buy side / Charge on Sell side
            const bonusAmt = Number(t.bonus_amount ?? 0);
            const chargeAmt = Number(t.charge_amount ?? 0);
            const fee = typeBuy ? bonusAmt : -chargeAmt;
            const feePct = typeBuy
              ? Number(t.bonus_percent ?? 0)
              : Number(t.charge_percent ?? 0);

            // Backend sends formatted strings — strip the currency suffix for display
            // so we can render '41.25' + a small 'BDT' tag if needed. Here we keep
            // the string as-is (it already contains 'BDT' / 'USDT').
            const amountStr = String(t.cryptoAmount ?? '—');
            const priceStr  = String(t.price ?? '—');
            const usdtStr   = String(t.cryptoValue ?? '—');

            const timeLimit = t.timeLimit ?? 15;
            const status = t.status;
            const viewUrl = typeBuy ? `/dashboard/local-buy-sell/my-orders/buy-view/?trade_id=${t.id}` : `/dashboard/local-buy-sell/my-orders/sell-view/?trade_id=${t.id}`;

            return (
              <div key={t.id} className="lbs-card-row lbs-card-row--requests">
                <div>
                  <span className="lbs-cell-idx">{i + 1}</span>
                </div>

                <div>
                  <span className={`lbs-type-badge lbs-type-badge--${typeBuy ? 'buy' : 'sell'}`}>
                    {typeBuy ? 'Buy' : 'Sell'}
                  </span>
                </div>

                {/* Amount (BDT) — backend sends "41.25 BDT" */}
                <div className="lbs-cell-num lbs-cell-num--accent">{amountStr}</div>

                {/* Price (BDT) — backend sends "120.21 BDT" */}
                <div className="lbs-cell-num">{priceStr}</div>

                {/* USDT Amount — backend sends "8.24 USDT" */}
                <div className="lbs-cell-num">{usdtStr}</div>

                {/* Bonus/Fee — green +ve, red -ve */}
                <div
                  className={`lbs-cell-bonus ${
                    fee >= 0 ? 'lbs-cell-bonus--pos' : 'lbs-cell-bonus--neg'
                  }`}
                >
                  {fee >= 0 ? '+' : ''}
                  {num(fee)}
                  {feePct > 0 && (
                    <small className="lbs-bonus-pct">({feePct}%)</small>
                  )}
                </div>

                <div className="lbs-cell-time">{timeLimit}</div>

                <div>
                  <span className={`lbs-status ${tradeStatusClass(status, t.status_text)}`}>
                    {tradeStatusText(status, t.status_text)}
                  </span>
                </div>

                <div className="lbs-cell-created">{formatCreated(t.date)}</div>

                <div style={{ textAlign: 'center' }}>
                  <Link
                    href={viewUrl}
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