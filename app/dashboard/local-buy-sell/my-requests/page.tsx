'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { getMyLocalAds, toggleAdStatus, deleteAd, P2pAdsData } from '@/app/api/p2padsapi';
import './LocalMyAds.css';

type Kind = 'buy' | 'sell';
type Bucket = { items: P2pAdsData[]; page: number; last: number; total: number; loading: boolean };

const EMPTY: Bucket = { items: [], page: 1, last: 1, total: 0, loading: true };
const METHOD_COLORS: Record<string, string> = { bKash: '#e2136e', Nagad: '#f26522', Rocket: '#8c3494', 'Bank Transfer': '#1d6fe0' };

// ads created from the market page (treat a missing field as local so nothing disappears if the API omits it)
const isLocal = (a: P2pAdsData) => !a.ad_create_type || a.ad_create_type === 'local';
const n2 = (v: number | string, d = 2) => {
  const n = Number(v);
  return Number.isFinite(n) ? n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }) : '-';
};
const apiMsg = (e: any, fallback: string) => e?.response?.data?.message ?? e?.message ?? fallback;

/* ───────────── Row ───────────── */
function AdRow({ ad, busy, onToggle, onEdit, onDelete }: {
  ad: P2pAdsData; busy: boolean;
  onToggle: (a: P2pAdsData) => void; onEdit: (id: number) => void; onDelete: (a: P2pAdsData) => void;
}) {
  const method = ad.payment_method?.sell_method?.name ?? '—';
  const price = Number(ad.fixed_price);
  return (
    <div className="ma-row">
      <div className="ma-ad">
        <b>#{ad.id}</b>
        <small>{new Date(ad.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</small>
      </div>
      <div className={`ma-price ma-price--${ad.type}`}>{n2(price)} <small>{ad.with_fiat}</small></div>
      <div className="ma-cell">{n2(ad.total_amount)} <small>{ad.asset}</small></div>
      <div className="ma-cell">
        {n2(ad.order_limit_min, 0)} – {n2(ad.order_limit_max, 0)} <small>{ad.asset}</small>
        <small className="ma-sub">≈ {n2(ad.order_limit_min * price, 0)} – {n2(ad.order_limit_max * price, 0)} {ad.with_fiat}</small>
      </div>
      <div className="ma-method">
        <span className="ma-mico" style={{ background: METHOD_COLORS[method] ?? '#3b82f6' }}>{method[0]}</span>{method}
      </div>
      <div className="ma-status">
        <button
          type="button" role="switch" aria-checked={ad.status} disabled={busy}
          aria-label={`${ad.status ? 'Deactivate' : 'Activate'} ad ${ad.id}`}
          className={`ma-switch ${ad.status ? 'is-on' : ''}`} onClick={() => onToggle(ad)}
        />
        <span>{ad.status ? 'Active' : 'Inactive'}</span>
      </div>
      <div className="ma-actions">
        <button type="button" className="ma-icon" title="Edit" aria-label={`Edit ad ${ad.id}`} onClick={() => onEdit(ad.id)}>
          <i className="fa-solid fa-pen" />
        </button>
        <button type="button" className="ma-icon ma-icon--danger" title="Delete" aria-label={`Delete ad ${ad.id}`} onClick={() => onDelete(ad)}>
          <i className="fa-solid fa-trash" />
        </button>
      </div>
    </div>
  );
}

/* ───────────── Page ───────────── */
export default function LocalMyAds({ onBack, onCreate, onEdit }: {
  onBack: () => void; onCreate: () => void; onEdit: (id: number) => void;
}) {
  const [tab, setTab] = useState<Kind>('buy');
  const [data, setData] = useState<Record<Kind, Bucket>>({ buy: EMPTY, sell: EMPTY });
  const [toggling, setToggling] = useState<number | null>(null);
  const [toDelete, setToDelete] = useState<P2pAdsData | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async (type: Kind, page = 1) => {
    setData(p => ({ ...p, [type]: { ...p[type], loading: true } }));
    try {
      const res = await getMyLocalAds({ type, page });
      const d = res?.data;
      const raw: P2pAdsData[] = Array.isArray(d) ? d : d?.data ?? [];
      const items = raw.filter(a => a.type === type && isLocal(a));
      setData(p => ({
        ...p,
        [type]: { items, page: d?.current_page ?? page, last: d?.last_page ?? 1, total: d?.total ?? items.length, loading: false },
      }));
    } catch (e: any) {
      toast.error(apiMsg(e, 'Failed to load your ads.'));
      setData(p => ({ ...p, [type]: { ...p[type], loading: false } }));
    }
  }, []);

  useEffect(() => { load('buy'); load('sell'); }, [load]);

  const handleToggle = async (ad: P2pAdsData) => {
    setToggling(ad.id);
    try {
      await toggleAdStatus(ad.id);
      setData(p => ({
        ...p,
        [ad.type]: { ...p[ad.type], items: p[ad.type].items.map(a => (a.id === ad.id ? { ...a, status: !a.status } : a)) },
      }));
      toast.success(ad.status ? 'Ad deactivated.' : 'Ad activated.');
    } catch (e: any) {
      toast.error(apiMsg(e, 'Could not change the status.'));
    } finally {
      setToggling(null);
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await deleteAd(toDelete.id);
      toast.success('Ad deleted.');
      const t = toDelete.type;
      const b = data[t];
      const page = b.items.length === 1 && b.page > 1 ? b.page - 1 : b.page;
      setToDelete(null);
      await load(t, page);
    } catch (e: any) {
      toast.error(apiMsg(e, 'Could not delete the ad.'));
    } finally {
      setDeleting(false);
    }
  };

  const cur = data[tab];

  return (
    <div className={`ma ma--${tab}`}>
      <div className="ma-head justify-content-between mt-3">
        <button type="button" className="ma-back" onClick={onBack}><i className="fa-solid fa-arrow-left" /> Back to market</button>
        {/* <div className="ma-title">
          <h2>My Local Ads</h2>
          <p>Manage the requests you posted from the marketplace.</p>
        </div> */}
        <button type="button" className="ma-create" onClick={onCreate}><i className="fa-solid fa-plus" /> Create request</button>
      </div>

      <div className="ma-tabs" role="tablist" aria-label="Ad type">
        {(['buy', 'sell'] as Kind[]).map(k => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} className={`ma-tab ma-tab--${k} ${tab === k ? 'is-active' : ''}`} onClick={() => setTab(k)}>
            {k === 'buy' ? 'Buy Ads' : 'Sell Ads'}
            <span className="ma-count">{data[k].loading && !data[k].total ? '…' : data[k].total}</span>
          </button>
        ))}
      </div>

      <section className="ma-panel" role="tabpanel">
        <div className="pf-scroll">
          <div className="ma-table">
            <div className="ma-row ma-row--head">
              <div>Ad</div><div>Price</div><div>Amount</div><div>Order limit</div><div>Payment</div><div>Status</div><div>Actions</div>
            </div>

            {cur.loading && [0, 1, 2].map(i => <div key={i} className="ma-row ma-skel"><span /><span /><span /><span /><span /><span /><span /></div>)}

            {!cur.loading && cur.items.length === 0 && (
              <div className="ma-empty">
                <i className="fa-regular fa-folder-open" />
                <b>No {tab} ads yet</b>
                <p>Requests you create from the marketplace will show up here.</p>
                <button type="button" className="ma-create" onClick={onCreate}><i className="fa-solid fa-plus" /> Create request</button>
              </div>
            )}

            {!cur.loading && cur.items.map(ad => (
              <AdRow key={ad.id} ad={ad} busy={toggling === ad.id} onToggle={handleToggle} onEdit={onEdit} onDelete={setToDelete} />
            ))}
          </div>
        </div>

        {cur.last > 1 && (
          <div className="ma-pager">
            <button type="button" disabled={cur.page <= 1 || cur.loading} onClick={() => load(tab, cur.page - 1)}>Previous</button>
            <span>Page {cur.page} of {cur.last}</span>
            <button type="button" disabled={cur.page >= cur.last || cur.loading} onClick={() => load(tab, cur.page + 1)}>Next</button>
          </div>
        )}
      </section>

      {toDelete && (
        <div className="ma-modal" role="dialog" aria-modal="true" aria-labelledby="ma-del-title">
          <button type="button" className="ma-modal-bg" aria-label="Close" onClick={() => !deleting && setToDelete(null)} />
          <div className="ma-modal-card">
            <h3 id="ma-del-title">Delete ad #{toDelete.id}?</h3>
            <p>
              This {toDelete.type} ad ({n2(toDelete.fixed_price)} {toDelete.with_fiat}) will be removed from the marketplace. This can’t be undone.
            </p>
            <div className="ma-modal-actions">
              <button type="button" className="ma-ghost" onClick={() => setToDelete(null)} disabled={deleting}>Cancel</button>
              <button type="button" className="ma-danger" onClick={confirmDelete} disabled={deleting}>{deleting ? 'Deleting…' : 'Delete'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}