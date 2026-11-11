'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import apiClient from '@/utils/apiClient';
import styles from './investment.module.css';

type Plan = { id: number; name: string; short_description?: string | null; icon_key?: string | null; duration: number; investment_amount: number | string; return_amount: number | string; payout_frequency?: string; profit_rate?: number | string | null; min_amount?: number | string | null; max_amount?: number | string | null; duration_options?: number[] | null; duration_rates?: { duration_days: number; total_profit_rate: number | string }[] | null };
type Holding = { id: number; code_no: string; started_at: string; closed_at?: string | null; investment_amount: number | string; return_amount: number | string; total_profit: number | string; paid_profit: number | string; paid_periods: number; total_periods: number; next_payment_at?: string | null; ended_at: string; status: string; payout_frequency?: string; profit_rate?: number | string | null; total_profit_rate?: number | string | null; investment?: { name: string } };
type Overview = { total_invested: number; total_profit_expected: number; total_profit_paid: number; remaining_profit: number; active_investments: number };
type ProfitRow = { id: number | string; amount: number | string; description: string; created_at: string; trx_id?: string };
const money = (value: number | string | null | undefined) => `$${Number(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const date = (value?: string | null) => value ? new Date(value).toLocaleString() : '—';
const days = (plan: Plan) => plan.duration_rates?.length ? plan.duration_rates.map(row => Number(row.duration_days)) : plan.profit_rate != null && plan.duration_options?.length ? plan.duration_options.map(Number) : [Number(plan.duration)];
const iconClass = (plan: Plan) => ({ crown: 'fa-crown', daily: 'fa-calendar-day', weekly: 'fa-calendar-week', monthly: 'fa-calendar-days', coins: 'fa-coins', growth: 'fa-chart-line', shield: 'fa-shield-halved', gem: 'fa-gem' }[plan.icon_key || ''] || (plan.payout_frequency === 'fixed' ? 'fa-crown' : 'fa-calendar-days'));
const label = (frequency?: string) => ({ daily: 'Daily Income', weekly: 'Weekly Income', monthly: 'Monthly Income', fixed: 'Fixed Return' }[frequency || 'fixed'] || 'Fixed Return');
const periodName = (frequency?: string) => ({ daily: 'day', weekly: 'week', monthly: 'month', fixed: 'term' }[frequency || 'fixed'] || 'term');
const holdingRate = (item: Holding) => item.total_profit_rate != null ? `${Number(item.total_profit_rate).toFixed(2)}% total` : item.profit_rate == null ? 'Fixed return' : `${Number(item.profit_rate).toFixed(2)}% / ${item.payout_frequency}`;
const interval = (frequency?: string) => ({ daily: 1, weekly: 7, monthly: 30 }[frequency || ''] || 0);
const errorText = (error: unknown) => error instanceof Error ? error.message : 'Something went wrong. Please try again.';

export default function InvestmentPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyLastPage, setHistoryLastPage] = useState(1);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [profits, setProfits] = useState<ProfitRow[]>([]);
  const [profitPage, setProfitPage] = useState(1);
  const [profitLastPage, setProfitLastPage] = useState(1);
  const [profitLoading, setProfitLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [amount, setAmount] = useState('');
  const [duration, setDuration] = useState(0);
  const [tab, setTab] = useState('overview');
  const [planFilter, setPlanFilter] = useState('all');
  const [filter, setFilter] = useState('active');
  const [detailId, setDetailId] = useState<number | null>(null);
  const [confirmCancelId, setConfirmCancelId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [failure, setFailure] = useState('');
  const selected = plans.find(plan => plan.id === selectedId) || null;
  useEffect(() => {
    if (!selected) return;
    const availableDays = days(selected);
    if (availableDays.length > 0 && !availableDays.includes(duration)) setDuration(availableDays[0]);
  }, [selected, duration]);

  const load = useCallback(async () => {
    try {
      const [planRes, historyRes, overviewRes, profitRes] = await Promise.all([
        apiClient.get('/user/investments', { params: { per_page: 100 } }),
        apiClient.get('/user/investments/history', { params: { per_page: 50 } }),
        apiClient.get('/user/investments/overview'),
        apiClient.get('/user/investments/profit-history'),
      ]);
      const availablePlans: Plan[] = planRes.data.data?.data || [];
      setPlans(availablePlans);
      setHoldings(historyRes.data.data?.data || []);
      setHistoryPage(1); setHistoryLastPage(Number(historyRes.data.data?.last_page || 1));
      setOverview(overviewRes.data.data || null);
      setProfits(profitRes.data.data?.data || []);
      setProfitPage(1); setProfitLastPage(Number(profitRes.data.data?.last_page || 1));
    } catch (error) { setFailure(errorText(error)); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => {
    void load();
    const refresh = () => { if (!document.hidden) void load(); };
    const timer = window.setInterval(refresh, 60000);
    window.addEventListener('focus', refresh);
    return () => { window.clearInterval(timer); window.removeEventListener('focus', refresh); };
  }, [load]);
  const loadMoreProfit = async () => {
    if (profitLoading || profitPage >= profitLastPage) return;
    setProfitLoading(true);
    try { const response = await apiClient.get('/user/investments/profit-history', { params: { page: profitPage + 1 } }); setProfits(current => [...current, ...(response.data.data?.data || [])]); setProfitPage(profitPage + 1); }
    catch (error) { setFailure(errorText(error)); }
    finally { setProfitLoading(false); }
  };
  const loadMore = async () => {
    if (historyLoading || historyPage >= historyLastPage) return;
    setHistoryLoading(true);
    try { const response = await apiClient.get('/user/investments/history', { params: { per_page: 50, page: historyPage + 1 } }); setHoldings(current => [...current, ...(response.data.data?.data || [])]); setHistoryPage(historyPage + 1); }
    catch (error) { setFailure(errorText(error)); }
    finally { setHistoryLoading(false); }
  };
  const select = (plan: Plan) => { setSelectedId(plan.id); setAmount(String(plan.investment_amount)); setDuration(days(plan)[0]); setFailure(''); };
  const choosePlan = (plan: Plan) => {
    select(plan);
    window.requestAnimationFrame(() => document.getElementById('create-investment')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };
  const preview = useMemo(() => {
    if (!selected) return null;
    const principal = Number(amount);
    const length = duration || Number(selected.duration);
    const perDays = interval(selected.payout_frequency);
    const periods = perDays ? Math.ceil(length / perDays) : 1;
    const rate = selected.profit_rate == null ? null : Number(selected.profit_rate);
    const durationRate = selected.duration_rates?.find(row => Number(row.duration_days) === length);
    const totalRate = durationRate ? Number(durationRate.total_profit_rate) : null;
    const profit = totalRate != null ? Math.round(principal * totalRate) / 100 : rate == null ? Number(selected.return_amount) - Number(selected.investment_amount) : Math.round(principal * rate * periods) / 100;
    return { principal, length, periods, rate, totalRate, profit, total: principal + profit, perPayment: profit / periods };
  }, [selected, amount, duration]);
  const valid = selected && preview && preview.principal > 0 && preview.principal >= Number(selected.min_amount ?? selected.investment_amount) && preview.principal <= Number(selected.max_amount ?? selected.investment_amount) && days(selected).includes(preview.length);
  const buy = async () => {
    if (!selected || !preview || !valid || busy) return;
    setBusy(true); setFailure(''); setMessage('');
    try {
      await apiClient.post('/user/investments', { investment_id: selected.id, amount: preview.principal, duration_days: preview.length });
      setMessage('Investment created successfully.'); await load(); setTab('my');
    } catch (error) { setFailure(errorText(error)); }
    finally { setBusy(false); }
  };
  const shown = holdings.filter(item => filter === 'all' || item.status === filter);
  const detail = holdings.find(item => item.id === detailId);
  const cancel = async () => {
    if (!confirmCancelId || busy) return;
    setBusy(true); setFailure('');
    try { await apiClient.post(`/user/investments/${confirmCancelId}/cancel`); setMessage('Investment cancelled and principal refunded.'); setConfirmCancelId(null); setDetailId(null); await load(); }
    catch (error) { setFailure(errorText(error)); setConfirmCancelId(null); }
    finally { setBusy(false); }
  };
  const metrics = [
    ['Total Investment', overview?.total_invested, 'fa-sack-dollar', 'gold'],
    ['Total Profit Earned', overview?.total_profit_paid, 'fa-arrow-trend-up', 'green'],
    ['Expected Profit', overview?.total_profit_expected, 'fa-chart-line', 'purple'],
    ['Total Paid Profit', overview?.total_profit_paid, 'fa-circle-check', 'green'],
    ['Remaining Profit', overview?.remaining_profit, 'fa-hourglass-half', 'cyan'],
    ['Active Investments', overview?.active_investments, 'fa-layer-group', 'gold'],
  ] as const;
  const visiblePlans = plans.filter(plan => planFilter === 'all' || (plan.payout_frequency || 'fixed') === planFilter);
  const tabs = [
    ['overview', 'Overview', 'fa-chart-pie'],
    ['my', 'My Investments', 'fa-wallet'],
    ['schedule', 'Payment Schedule', 'fa-calendar-check'],
    ['profit', 'Profit History', 'fa-arrow-trend-up'],
    ['plans', 'Plans & Details', 'fa-layer-group'],
    ['calculator', 'Profit Calculator', 'fa-calculator'],
  ] as const;
  const packageFilters = [
    ['all', 'All Packages'], ['fixed', 'Fixed Return'], ['daily', 'Daily'],
    ['weekly', 'Weekly'], ['monthly', 'Monthly'],
  ] as const;
  const showPlans = tab === 'overview' || tab === 'plans' || tab === 'calculator';
  const showHistory = tab === 'overview' || tab === 'my' || tab === 'schedule' || tab === 'profit';
  const expectedProfit = (item: Holding) => item.profit_rate == null
    ? Math.max(0, Number(item.return_amount) - Number(item.investment_amount))
    : Number(item.total_profit);
  const paidProfit = (item: Holding) => item.profit_rate == null
    ? (item.status === 'completed' ? expectedProfit(item) : 0)
    : Number(item.paid_profit);

  return (
    <main className={`${styles.page} bg-navy-blue rounded-4`}>
      <header className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.eyebrow}><i className="fa-solid fa-sparkles" aria-hidden="true" /> YOUR INVESTMENT HUB</span>
          <h1>Grow your balance<br /><span>with a plan that fits.</span></h1>
          <p>Explore plans, preview your returns, and follow every payout from one place.</p>
          {/* <button type="button" className={styles.heroButton} onClick={() => { setTab('plans'); window.setTimeout(() => document.getElementById('investment-plans')?.scrollIntoView({ behavior: 'smooth' }), 0); }}>
            Explore plans <i className="fa-solid fa-arrow-right" aria-hidden="true" />
          </button> */}
        </div>
        <div className={styles.heroArt} aria-hidden="true">
          <div className={styles.heroRing}><i className="fa-solid fa-coins" /></div>
          <span className={styles.orbitOne}><i className="fa-solid fa-chart-line" /></span>
          <span className={styles.orbitTwo}><i className="fa-solid fa-star" /></span>
        </div>
      </header>

      <nav className={styles.tabs} aria-label="Investment sections">
        {tabs.map(([id, name, icon]) => (
          <button
            key={id}
            type="button"
            className={tab === id ? styles.activeTab : ''}
            aria-current={tab === id ? 'page' : undefined}
            onClick={() => {
              setTab(id);
              if (id === 'overview' || id === 'schedule') setFilter('active');
              if (id === 'my') setFilter('all');
            }}
          >
            <i className={`fa-solid ${icon}`} aria-hidden="true" /> {name}
          </button>
        ))}
      </nav>

      {failure && <div className={styles.error} role="alert"><i className="fa-solid fa-circle-exclamation" aria-hidden="true" /> {failure}</div>}
      {message && <div className={styles.success} role="status"><i className="fa-solid fa-circle-check" aria-hidden="true" /> {message}</div>}

      {loading ? (
        <div className={styles.loading} role="status">Loading your investment dashboard…</div>
      ) : (
        <>
          <section className={styles.metrics} aria-label="Investment overview">
            {metrics.map(([name, value, icon, tone]) => (
              <article className={`${styles.metric} ${styles[`metric_${tone}`]}`} key={name}>
                <span className={styles.metricIcon}><i className={`fa-solid ${icon}`} aria-hidden="true" /></span>
                <div>
                  <small>{name}</small>
                  <strong>{name === 'Active Investments' ? Number(value || 0) : money(value)}</strong>
                </div>
              </article>
            ))}
          </section>

          {showPlans && (
            <>
              <section className={styles.section} id="investment-plans">
                <div className={styles.sectionTitle}>
                  <div><span className={styles.kicker}>FIND YOUR PLAN</span><h2>Choose an investment package</h2></div>
                  <div className={styles.planFilters} role="group" aria-label="Filter packages">
                    {packageFilters.map(([id, name]) => (
                      <button key={id} type="button" className={planFilter === id ? styles.currentFilter : ''} aria-pressed={planFilter === id} onClick={() => setPlanFilter(id)}>{name}</button>
                    ))}
                  </div>
                </div>
                <div className={styles.planGrid}>
                  {visiblePlans.map(plan => {
                    const durationRates = plan.duration_rates?.map(row => Number(row.total_profit_rate)) || [];
                    const rate = durationRates.length ? Math.max(...durationRates) : plan.profit_rate == null
                      ? (Number(plan.return_amount) - Number(plan.investment_amount)) / Number(plan.investment_amount) * 100
                      : Number(plan.profit_rate);
                    return (
                      <article className={`${styles.plan} ${styles[`plan_${plan.payout_frequency || 'fixed'}`] || ''} ${selectedId === plan.id ? styles.selectedPlan : ''}`} key={plan.id}>
                        <div className={styles.planTop}>
                          <span className={styles.planIcon}><i className={`fa-solid ${iconClass(plan)}`} aria-hidden="true" /></span>
                          <span className={styles.planType}>{label(plan.payout_frequency)}</span>
                        </div>
                        <h3>{plan.name}</h3>
                        <div className={styles.planRate}>{Number.isFinite(rate) ? `${rate.toFixed(2)}%` : '—'} <small>{durationRates.length ? 'total profit, up to' : `per ${plan.profit_rate == null || plan.payout_frequency === 'fixed' ? 'term' : periodName(plan.payout_frequency)}`}</small></div>
                        {plan.short_description && <p className={styles.planDescription}>{plan.short_description}</p>}
                        <div className={styles.planFacts}>
                          <div><i className="fa-solid fa-circle-check" aria-hidden="true" /><span>{days(plan).map(d => `${d} days`).join(' · ')}</span></div>
                          <div><i className="fa-solid fa-circle-check" aria-hidden="true" /><span>{plan.min_amount == null ? money(plan.investment_amount) : `${money(plan.min_amount)} – ${money(plan.max_amount ?? plan.investment_amount)}`}</span></div>
                          <div><i className="fa-solid fa-circle-check" aria-hidden="true" /><span>Principal returned at maturity</span></div>
                        </div>
                        <button type="button" className={styles.planSelect} onClick={() => choosePlan(plan)}>
                          {selectedId === plan.id ? 'Selected plan' : 'Select plan'} <i className={`fa-solid ${selectedId === plan.id ? 'fa-check' : 'fa-arrow-right'}`} aria-hidden="true" />
                        </button>
                      </article>
                    );
                  })}
                  {visiblePlans.length === 0 && <p className={styles.empty}>No plans are available in this category.</p>}
                </div>
              </section>

              {selected && <div className={styles.createGrid}>
                <section className={styles.section} id="create-investment">
                  <div className={styles.sectionTitle}><div><span className={styles.kicker}>GET STARTED</span><h2>{tab === 'calculator' ? 'Profit calculator' : 'Create investment'}</h2></div></div>
                  <div className={styles.fields}>
                    <label>Package type
                      <select value={selectedId ?? ''} onChange={event => { const plan = plans.find(item => item.id === Number(event.target.value)); if (plan) select(plan); }}>
                        <option value="">Select a plan</option>
                        {plans.map(plan => <option key={plan.id} value={plan.id}>{plan.name}</option>)}
                      </select>
                    </label>
                    <label>Duration
                      <select value={duration || ''} disabled={!selected} onChange={event => setDuration(Number(event.target.value))}>
                        {selected ? days(selected).map(d => <option value={d} key={d}>{d} days</option>) : <option value="">Select a plan</option>}
                      </select>
                    </label>
                  </div>
                  <label className={styles.amountLabel}>Investment amount <span>USD</span> 
                    <input type="number" min="0.01" step="0.01" value={amount} onChange={event => setAmount(event.target.value)} placeholder="Enter an amount" disabled={!selected} />
                  </label>
                  <div className="w-100 text-end text-warning"><small className='text-end'>Min {selected ? money(selected.min_amount ?? selected.investment_amount) : '—'} / Max {selected ? money(selected.max_amount ?? selected.investment_amount) : '—'}</small></div>

                  <div className={styles.quickAmounts} aria-label="Quick amounts">
                    {[100, 250, 500, 1000, 2000, 5000].map(value => (
                      <button key={value} type="button" className={Number(amount) === value ? styles.quickSelected : ''} onClick={() => setAmount(String(value))} disabled={!selected || value < Number(selected.min_amount ?? selected.investment_amount) || value > Number(selected.max_amount ?? selected.investment_amount)}>{money(value)}</button>
                    ))}
                  </div>
                  {selected && !valid && amount && <p className={styles.hint}>Enter an amount within this plan’s allowed range.</p>}
                  <button type="button" className={styles.investButton} onClick={buy} disabled={!valid || busy}>
                    {busy ? 'Processing…' : 'Invest now'} <i className="fa-solid fa-arrow-right" aria-hidden="true" />
                  </button>
                </section>

                <section className={`${styles.section} ${styles.summaryPanel}`}>
                  <div className={styles.sectionTitle}><div><span className={styles.kicker}>BEFORE YOU INVEST</span><h2>Plan summary</h2></div>{selected && <span className={styles.liveBadge}><i className="fa-solid fa-circle" aria-hidden="true" /> Live preview</span>}</div>
                  {selected && preview ? (
                    <>
                      <div className={styles.summaryHighlight}><span>Estimated total return</span><strong>{money(preview.total)}</strong><small>Including your {money(preview.principal)} principal</small></div>
                      <dl className={styles.summary}>
                        <div><dt>Selected plan</dt><dd>{selected.name}</dd></div>
                        <div><dt>Profit rate</dt><dd>{preview.totalRate != null ? `${preview.totalRate.toFixed(2)}% total for ${preview.length} days` : preview.rate == null ? 'Fixed legacy return' : `${preview.rate.toFixed(2)}% per ${periodName(selected.payout_frequency)}`}</dd></div>
                        <div><dt>Total profit</dt><dd className={styles.positive}>{money(preview.profit)}</dd></div>
                        <div><dt>Profit per payment</dt><dd>{money(preview.perPayment)}</dd></div>
                        <div><dt>Total payments</dt><dd>{preview.periods}</dd></div>
                        <div><dt>Investment period</dt><dd>{preview.length} days</dd></div>
                        <div><dt>Principal return</dt><dd>At maturity</dd></div>
                      </dl>
                    </>
                  ) : <div className={styles.summaryEmpty}><i className="fa-solid fa-chart-pie" aria-hidden="true" /><p>Select a plan to see its payout estimate.</p></div>}
                </section>
              </div>}
            </>
          )}

          {showHistory && (
            <section className={`${styles.section} ${styles.historySection}`}>
              <div className={styles.sectionTitle}>
                <div><span className={styles.kicker}>YOUR ACTIVITY</span><h2>{tab === 'schedule' ? 'Payment schedule' : tab === 'profit' ? 'Profit history' : tab === 'overview' ? 'Active investments' : 'My investments'}</h2></div>
                {tab !== 'profit' && <select className={styles.statusFilter} value={filter} onChange={event => setFilter(event.target.value)} aria-label="Filter investment status"><option value="all">All statuses</option><option value="active">Active</option><option value="completed">Completed</option><option value="closed">Cancelled</option></select>}
              </div>
              {tab === 'profit' ? (
                <>
                  <div className={`${styles.tableScroll} ${styles.profitTable}`}><table><thead><tr><th>Date</th><th>Investment</th><th>Transaction ID</th><th>Profit</th></tr></thead><tbody>{profits.map(row => <tr key={row.id}><td>{date(row.created_at)}</td><td>{row.description}</td><td>{row.trx_id || '—'}</td><td className={styles.positive}>+{money(row.amount)}</td></tr>)}</tbody></table></div>
                  {profits.length === 0 && <p className={styles.empty}>No profit payments yet.</p>}
                  {profitPage < profitLastPage && <button type="button" className={styles.loadMore} onClick={loadMoreProfit} disabled={profitLoading}>{profitLoading ? 'Loading…' : 'Load more profit'}</button>}
                </>
              ) : (
                <>
                  <div className={`${styles.tableScroll} ${styles.holdingsTable}`}>
                    <table className={styles.investmentTable}>
                      <thead><tr><th>Plan</th><th>Investment</th><th>Profit</th><th>Payment schedule</th><th>Progress</th><th>Status</th></tr></thead>
                      <tbody>{shown.map(item => {
                        const expected = expectedProfit(item);
                        const paid = paidProfit(item);
                        const remaining = item.status === 'closed' ? 0 : Math.max(0, expected - paid);
                        const progress = expected > 0 ? Math.min(100, paid / expected * 100) : item.status === 'completed' ? 100 : 0;
                        return (
                          <tr key={item.id}>
                            <td><strong>{item.investment?.name || 'Investment'}</strong><small>#{item.code_no || item.id}</small></td>
                            <td><strong>{money(item.investment_amount)}</strong><small>{holdingRate(item)}</small></td>
                            <td><div className={styles.profitStack}>
                              <span>Total <strong className={styles.positive}>{money(expected)}</strong></span>
                              <span>Paid <strong>{money(paid)}</strong></span>
                              <span>Remaining <strong className={styles.remaining}>{money(remaining)}</strong></span>
                            </div></td>
                            <td className={styles.scheduleCell}><span>Next <strong>{item.status === 'active' ? date(item.next_payment_at || item.ended_at) : '—'}</strong></span><span>Principal <strong>{date(item.ended_at)}</strong></span></td>
                            <td><div className={styles.progress} aria-label={`${progress.toFixed(0)}% of profit paid`}><span style={{ width: `${progress}%` }} /></div><small>{progress.toFixed(0)}% paid</small></td>
                            <td><div className={styles.statusActions}><span className={`${styles.status} ${styles[item.status] || ''}`}>{item.status}</span><button type="button" className={styles.viewButton} onClick={() => setDetailId(detailId === item.id ? null : item.id)}>{detailId === item.id ? 'Hide' : 'Details'}</button></div></td>
                          </tr>
                        );
                      })}</tbody>
                    </table>
                  </div>
                  <div className={styles.mobileHoldings}>
                    {shown.map(item => {
                      const expected = expectedProfit(item);
                      const paid = paidProfit(item);
                      const remaining = item.status === 'closed' ? 0 : Math.max(0, expected - paid);
                      const progress = expected > 0 ? Math.min(100, paid / expected * 100) : item.status === 'completed' ? 100 : 0;
                      return (
                        <article className={styles.mobileHolding} key={item.id}>
                          <div className={styles.mobileHoldingTop}>
                            <div><strong>{item.investment?.name || 'Investment'}</strong><small>#{item.code_no || item.id}</small><small>{holdingRate(item)}</small></div>
                            <span className={`${styles.status} ${styles[item.status] || ''}`}>{item.status}</span>
                          </div>
                          <div className={styles.mobileHoldingGrid}>
                            <span>Invested <strong>{money(item.investment_amount)}</strong></span>
                            <span>Total profit <strong className={styles.positive}>{money(expected)}</strong></span>
                            <span>Paid profit <strong>{money(paid)}</strong></span>
                            <span>Remaining <strong className={styles.remaining}>{money(remaining)}</strong></span>
                            <span>Next payment <strong>{item.status === 'active' ? date(item.next_payment_at || item.ended_at) : '—'}</strong></span>
                            <span>Principal return <strong>{date(item.ended_at)}</strong></span>
                          </div>
                          <div className={styles.mobileHoldingBottom}>
                            <div className={styles.progress} aria-label={`${progress.toFixed(0)}% of profit paid`}><span style={{ width: `${progress}%` }} /></div>
                            <button type="button" className={styles.viewButton} onClick={() => setDetailId(detailId === item.id ? null : item.id)}>Details</button>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                  {shown.length === 0 && <p className={styles.empty}>No investments found for this status.</p>}
                  {detail && <div className={styles.detail}><h3>{detail.investment?.name || 'Investment'} #{detail.code_no}</h3><div><span>Started: {date(detail.started_at)}</span><span>Next profit: {date(detail.next_payment_at)}</span><span>Maturity: {date(detail.ended_at)}</span><span>Paid installments: {detail.paid_periods || 0} / {detail.total_periods || 1}</span></div>{detail.status === 'active' && <button type="button" onClick={() => setConfirmCancelId(detail.id)}>Cancel investment</button>}</div>}
                  {historyPage < historyLastPage && <button type="button" className={styles.loadMore} onClick={loadMore} disabled={historyLoading}>{historyLoading ? 'Loading…' : 'Load more investments'}</button>}
                </>
              )}
            </section>
          )}
        </>
      )}
      {confirmCancelId && <div className={styles.dialogBackdrop}><div className={styles.dialog} role="dialog" aria-modal="true" aria-label="Cancel investment"><h2>Cancel investment?</h2><p>Your principal will return to your wallet. Profit already paid stays in your wallet; future profit payments stop.</p><div><button type="button" onClick={() => setConfirmCancelId(null)} disabled={busy}>Keep investment</button><button type="button" onClick={cancel} disabled={busy}>{busy ? 'Cancelling…' : 'Yes, cancel'}</button></div></div></div>}
    </main>
  );
}
