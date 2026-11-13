'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import apiClient from '@/utils/apiClient';
import InvestmentPlanCard, { type InvestmentPlan } from '@/components/dashboard/Investment/InvestmentPlanCard';
import styles from './investment.module.css';

type Plan = InvestmentPlan;
type Holding = { id: number; code_no: string; started_at: string; closed_at?: string | null; principal_repaid_at?: string | null; investment_amount: number | string; return_amount: number | string; total_profit: number | string; paid_profit: number | string; paid_periods: number; total_periods: number; next_payment_at?: string | null; ended_at: string; status: string; payout_frequency?: string; profit_rate?: number | string | null; total_profit_rate?: number | string | null; investment?: { name: string } };
type Overview = { total_invested: number; total_profit_expected: number; total_profit_paid: number; remaining_profit: number; active_investments: number };
type ProfitRow = { id: number | string; amount: number | string; description: string; created_at: string; trx_id?: string };
const money = (value: number | string | null | undefined) => `$${Number(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const date = (value?: string | null) => value ? new Date(value).toLocaleString() : '—';
const days = (plan: Plan) => plan.duration_rates?.length ? plan.duration_rates.map(row => Number(row.duration_days)) : plan.profit_rate != null && plan.duration_options?.length ? plan.duration_options.map(Number) : [Number(plan.duration)];
const durationOptionLabel = (length: number, frequency?: string) => {
  const dayLabel = `${length} ${length === 1 ? 'Day' : 'Days'}`;
  const unit = length > 0 && length % 365 === 0
    ? `${length / 365} ${length === 365 ? 'Year' : 'Years'}`
    : length > 0 && length % 30 === 0
      ? `${length / 30} ${length === 30 ? 'Month' : 'Months'}`
      : frequency === 'weekly' && length > 0 && length % 7 === 0
        ? `${length / 7} ${length === 7 ? 'Week' : 'Weeks'}`
        : null;
  return unit ? `${unit} - ${dayLabel}` : dayLabel;
};
const iconClass = (plan: Plan) => ({ crown: 'fa-crown', daily: 'fa-calendar-day', weekly: 'fa-calendar-week', monthly: 'fa-calendar-days', coins: 'fa-coins', growth: 'fa-chart-line', shield: 'fa-shield-halved', gem: 'fa-gem' }[plan.icon_key || ''] || (plan.payout_frequency === 'fixed' ? 'fa-crown' : 'fa-calendar-days'));
const label = (frequency?: string) => ({ daily: 'Daily Income', weekly: 'Weekly Income', monthly: 'Monthly Income', fixed: 'Fixed Return' }[frequency || 'fixed'] || 'Fixed Return');
const periodName = (frequency?: string) => ({ daily: 'day', weekly: 'week', monthly: 'month', fixed: 'term' }[frequency || 'fixed'] || 'term');
const holdingRate = (item: Holding) => item.total_profit_rate != null ? `${Number(item.total_profit_rate).toFixed(2)}% total` : item.profit_rate == null ? 'Fixed return' : `${Number(item.profit_rate).toFixed(2)}% / ${item.payout_frequency}`;
const remainingCapital = (item: Holding) => item.status === 'active' && !item.principal_repaid_at ? Number(item.investment_amount) : 0;
const nextProfitAmount = (item: Holding) => {
  if (item.status !== 'active') return null;
  const periods = Math.max(1, Number(item.total_periods) || 1);
  const paidPeriods = Number(item.paid_periods) || 0;
  if (paidPeriods >= periods) return null;
  const totalProfit = item.profit_rate == null
    ? Math.max(0, Number(item.return_amount) - Number(item.investment_amount))
    : Number(item.total_profit);
  const totalCents = Math.round(totalProfit * 100);
  const paidCents = Math.round(Number(item.paid_profit || 0) * 100);
  const nextCents = paidPeriods + 1 === periods ? totalCents - paidCents : Math.round(totalCents / periods);
  return Math.max(0, nextCents) / 100;
};
const tableRate = (item: Holding) => {
  const total = item.total_profit_rate != null ? Number(item.total_profit_rate) : Number(item.investment_amount) > 0 ? Number(item.total_profit || Number(item.return_amount) - Number(item.investment_amount)) / Number(item.investment_amount) * 100 : 0;
  const period = item.profit_rate != null ? Number(item.profit_rate) : total;
  const frequency = item.payout_frequency === 'fixed' || !item.payout_frequency ? 'Term' : periodName(item.payout_frequency);
  return { period: `${period.toFixed(2)}% / ${frequency}`, total: item.total_profit_rate != null || item.payout_frequency !== 'fixed' ? `${total.toFixed(2)}% total` : '' };
};
const tableDate = (value?: string | null) => value ? new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
const timeUntil = (value: string | null | undefined, now: number) => {
  if (!value || !now) return '—';
  const seconds = Math.max(0, Math.floor((new Date(value).getTime() - now) / 1000));
  if (seconds === 0) return 'Due now';
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor(seconds % 86400 / 3600);
  const minutes = Math.floor(seconds % 3600 / 60);
  const remainingSeconds = seconds % 60;
  return `In ${days ? `${days}d ` : ''}${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
};
const interval = (frequency?: string) => ({ daily: 1, weekly: 7, monthly: 30 }[frequency || ''] || 0);
const calculatePreview = (plan: Plan, principal: number, length: number) => {
  const perDays = interval(plan.payout_frequency);
  const periods = perDays ? Math.ceil(length / perDays) : 1;
  const rate = plan.profit_rate == null ? null : Number(plan.profit_rate);
  const durationRate = plan.duration_rates?.find(row => Number(row.duration_days) === length);
  const totalRate = durationRate ? Number(durationRate.total_profit_rate) : null;
  const profit = totalRate != null ? Math.round(principal * totalRate) / 100 : rate == null ? Number(plan.return_amount) - Number(plan.investment_amount) : Math.round(principal * rate * periods) / 100;
  return { principal, length, periods, rate, totalRate, profit, total: principal + profit, perPayment: profit / periods };
};
const paymentRows = (item: Holding) => {
  const count = Math.max(1, Number(item.total_periods) || 1);
  const totalCents = Math.round(Number(item.total_profit || 0) * 100);
  const regularCents = Math.round(totalCents / count);
  const durationDays = Math.max(0, Math.round((new Date(item.ended_at).getTime() - new Date(item.started_at).getTime()) / 86400000));
  const periodDays = interval(item.payout_frequency);
  return Array.from({ length: count }, (_, index) => {
    const number = index + 1;
    const amountCents = number === count ? totalCents - regularCents * (count - 1) : regularCents;
    const dueDate = periodDays && item.started_at
      ? new Date(new Date(item.started_at).getTime() + Math.min(durationDays, periodDays * number) * 86400000).toISOString()
      : item.ended_at;
    return { number, amount: amountCents / 100, dueDate, state: number <= Number(item.paid_periods || 0) ? 'Paid' : item.status === 'closed' ? 'Cancelled' : 'Upcoming' };
  });
};
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
  const [now, setNow] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState('');
  const initialPlanApplied = useRef(false);
  const [autoScrollPlanId, setAutoScrollPlanId] = useState<number | null>(null);
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
  useEffect(() => {
    if (loading || initialPlanApplied.current || plans.length === 0) return;
    initialPlanApplied.current = true;
    const requestedId = Number(new URLSearchParams(window.location.search).get('plan'));
    const requestedPlan = plans.find(plan => plan.id === requestedId);
    if (!requestedPlan) return;
    setSelectedId(requestedPlan.id);
    setDuration(days(requestedPlan)[0]);
    setTab('overview');
    setPlanFilter('all');
    setAutoScrollPlanId(requestedPlan.id);
  }, [loading, plans]);
  useEffect(() => {
    if (!selected || selected.id !== autoScrollPlanId) return;
    const frame = window.requestAnimationFrame(() => {
      document.getElementById('create-investment')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setAutoScrollPlanId(null);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [selected, autoScrollPlanId]);
  useEffect(() => {
    setNow(Date.now());
    const timer = window.setInterval(() => { if (!document.hidden) setNow(Date.now()); }, 1000);
    return () => window.clearInterval(timer);
  }, []);
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
  const select = (plan: Plan) => { setSelectedId(plan.id); setAmount(''); setDuration(days(plan)[0]); setFailure(''); };
  const choosePlan = (plan: Plan) => {
    select(plan);
    window.requestAnimationFrame(() => document.getElementById('create-investment')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };
  const preview = useMemo(() => {
    if (!selected) return null;
    const principal = Number(amount === '' ? selected.investment_amount : amount);
    const length = duration || Number(selected.duration);
    return calculatePreview(selected, principal, length);
  }, [selected, amount, duration]);
  const valid = selected && preview && amount !== '' && preview.principal > 0 && preview.principal >= Number(selected.min_amount ?? selected.investment_amount) && preview.principal <= Number(selected.max_amount ?? selected.investment_amount) && days(selected).includes(preview.length);
  const buy = async () => {
    if (!selected || !preview || !valid || busy) return;
    setBusy(true); setFailure('');
    try {
      const response = await apiClient.post('/user/investments', { investment_id: selected.id, amount: preview.principal, duration_days: preview.length });
      if (response.data?.error) throw new Error(response.data.message || 'Investment could not be created.');
      toast.success(response.data?.message || 'Investment created successfully.');
      await load(); setTab('my');
    } catch (error) { toast.error(errorText(error)); }
    finally { setBusy(false); }
  };
  const shown = holdings.filter(item => filter === 'all' || item.status === filter);
  const detail = holdings.find(item => item.id === detailId);
  const metrics = [
    ['Total Invested', overview?.total_invested, 'fa-coins', 'gold'],
    ['Total Profit Earned', overview?.total_profit_paid, 'fa-arrow-trend-up', 'green'],
    ['Expected Profit', overview?.total_profit_expected, 'fa-chart-line', 'purple'],
    ['Total Paid Profit', overview?.total_profit_paid, 'fa-shield-halved', 'green'],
    ['Remaining Profit', overview?.remaining_profit, 'fa-clock-rotate-left', 'amber'],
    ['Active Plans', overview?.active_investments, 'fa-layer-group', 'cyan'],
  ] as const;
  const visiblePlans = plans.filter(plan => planFilter === 'all' || (plan.payout_frequency || 'fixed') === planFilter);
  const tabs = [
    ['overview', 'All Package', 'fa-chart-pie'],
    ['my', 'My Investments', 'fa-wallet'],
    ['schedule', 'Payment Schedule', 'fa-calendar-check'],
    ['profit', 'Profit History', 'fa-arrow-trend-up'],
    ['plans', 'Plans & Details', 'fa-layer-group'],
    ['calculator', 'Profit Calculator', 'fa-calculator'],
  ] as const;
  const packageFilters = [
    ['all', 'All Packages', 'fa-calendar-days'], ['daily', 'Daily', 'fa-calendar-day'],
    ['weekly', 'Weekly', 'fa-calendar-week'], ['monthly', 'Monthly', 'fa-calendar-days'],
    ['fixed', 'Fixed Return', 'fa-award'],
  ] as const;
  const showPlans = tab === 'overview' || tab === 'plans';
  const showHistory = tab === 'overview' || tab === 'my' || tab === 'schedule' || tab === 'profit';
  const expectedProfit = (item: Holding) => item.profit_rate == null
    ? Math.max(0, Number(item.return_amount) - Number(item.investment_amount))
    : Number(item.total_profit);
  const paidProfit = (item: Holding) => item.profit_rate == null
    ? (item.status === 'completed' ? expectedProfit(item) : 0)
    : Number(item.paid_profit);
  const detailExpectedProfit = detail ? expectedProfit(detail) : 0;
  const detailProfitProgress = detailExpectedProfit > 0 && detail
    ? Math.min(100, Math.max(0, paidProfit(detail) / detailExpectedProfit * 100))
    : detail?.status === 'completed' ? 100 : 0;

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

      {loading ? (
        <div className={styles.loading} role="status">Loading your investment dashboard…</div>
      ) : (
        <>
          {tab !== 'calculator' && <section className={styles.metrics} aria-label="Investment overview">
            {metrics.map(([name, value, icon, tone]) => (
              <article className={`${styles.metric} ${styles[`metric_${tone}`]}`} key={name}>
                <span className={styles.metricIcon}><i className={`fa-solid ${icon}`} aria-hidden="true" /></span>
                <div>
                  <small>{name}</small>
                  <strong>{name === 'Active Plans' ? Number(value || 0) : money(value)}</strong>
                </div>
              </article>
            ))}
          </section>}

          {showPlans && (
              <section className={`${styles.section} ${styles.planSection}`} id="investment-plans">
                <div className={`${styles.sectionTitle} ${styles.planSectionTitle}`}>
                  <h2><i className="fa-solid fa-crown" aria-hidden="true" /> Choose an Investment Package</h2>
                  <div className={styles.planFilters} role="group" aria-label="Filter packages">
                    {packageFilters.map(([id, name, icon]) => (
                      <button key={id} type="button" className={planFilter === id ? styles.currentFilter : ''} aria-pressed={planFilter === id} onClick={() => setPlanFilter(id)}><i className={`fa-solid ${icon}`} aria-hidden="true" /> {name}</button>
                    ))}
                  </div>
                </div>
                <div className={styles.planGrid}>
                  {visiblePlans.map(plan => <InvestmentPlanCard key={plan.id} plan={plan} selected={selectedId === plan.id} onSelect={() => choosePlan(plan)} />)}
                  {visiblePlans.length === 0 && <p className={styles.empty}>No plans are available in this category.</p>}
                </div>
              </section>
          )}

          {((showPlans && selected) || tab === 'calculator') && <div className={styles.createGrid}>
                <section className={styles.section} id="create-investment">
                  <div className={styles.sectionTitle}><div><span className={styles.kicker}>GET STARTED</span><h2>{tab === 'calculator' ? 'Profit calculator' : 'Create investment'}</h2></div></div>
                  <div className={styles.fields}>
                    <div className={styles.packageField}>
                      <label htmlFor="investment-package">Package type</label>
                      <div className={`${styles.selectedPackage} ${selected ? styles[`package_${selected.payout_frequency || 'fixed'}`] : ''}`}>
                        <span className={styles.selectedPackageIcon}><i className={`fa-solid ${selected ? iconClass(selected) : 'fa-layer-group'}`} aria-hidden="true" /></span>
                        <span className={styles.selectedPackageInfo}>
                          <select id="investment-package" className={styles.packageSelect} value={selectedId ?? ''} onChange={event => { const plan = plans.find(item => item.id === Number(event.target.value)); if (plan) select(plan); }}>
                            <option value="" disabled>Select an investment package</option>
                            {plans.map(plan => <option key={plan.id} value={plan.id}>{plan.name}</option>)}
                          </select>
                          <i className="fa-solid fa-chevron-down" aria-hidden="true" />
                          {selected && <small className='ps-2'>{label(selected.payout_frequency)}{selected.short_description ? ` · ${selected.short_description}` : ''}</small>}
                        </span>
                        {selected && <i className="fa-solid fa-circle-check" aria-label="Selected package" />}
                        {selected && <span className={styles.selectedPackageFacts}><span><i className="fa-solid fa-calendar-days" aria-hidden="true" /> {days(selected).map(day => `${day}d`).join(' · ')}</span><span><i className="fa-solid fa-coins" aria-hidden="true" /> {money(selected.min_amount ?? selected.investment_amount)} – {money(selected.max_amount ?? selected.investment_amount)}</span></span>}
                      </div>
                    </div>
                    <label className={styles.durationField}>Duration
                      <select value={duration || ''} disabled={!selected} onChange={event => setDuration(Number(event.target.value))}>
                        {selected ? days(selected).map(d => {
                          const option = calculatePreview(selected, Number(amount === '' ? selected.investment_amount : amount), d);
                          const percent = option.totalRate ?? (option.principal > 0 ? option.profit / option.principal * 100 : 0);
                          return <option value={d} key={d}>{durationOptionLabel(d, selected.payout_frequency)} - {percent.toFixed(2)}%</option>;
                        }) : <option value="">Select a plan</option>}
                      </select>
                    </label>
                  </div>
                  <label className={styles.amountLabel}>Investment amount <span>USD</span> 
                    <input type="number" min="0.01" step="0.01" value={amount} onChange={event => setAmount(event.target.value)} placeholder="Your Amount" disabled={!selected} />
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
                      {/* {amount === '' && <p className={styles.summaryExample}>Example based on this plan&apos;s default amount. Enter your amount to see your return.</p>} */}
                      <dl className={styles.summary}>
                        <div className={styles.summaryRow}><dt><i className="fa-solid fa-chart-line" aria-hidden="true" /> Selected Plan</dt><span className={styles.summaryColon}>:</span><dd>{selected.name}</dd></div>
                        <div className={styles.summaryRow}><dt><i className="fa-solid fa-money-bill-trend-up" aria-hidden="true" /> Investment Amount</dt><span className={styles.summaryColon}>:</span><dd>{money(preview.principal)}</dd></div>
                        <div className={styles.summaryRow}><dt><i className="fa-solid fa-percent" aria-hidden="true" /> {selected.payout_frequency === 'daily' ? 'Daily Per Payment' : selected.payout_frequency === 'weekly' ? 'Weekly Per Payment' : selected.payout_frequency === 'monthly' ? 'Monthly Per Payment' : 'Profit Rate'}</dt><span className={styles.summaryColon}>:</span><dd>{preview.totalRate != null ? selected.payout_frequency === 'fixed' ? `${preview.totalRate.toFixed(2)}% for ${preview.length} days` : `${(preview.totalRate / preview.periods).toFixed(2)}% / ${periodName(selected.payout_frequency)} (${preview.totalRate.toFixed(2)}% total)` : preview.rate == null ? `${(preview.principal > 0 ? preview.profit / preview.principal * 100 : 0).toFixed(2)}% total` : `${preview.rate.toFixed(2)}% / ${periodName(selected.payout_frequency)}`}</dd></div>
                        <div className={styles.summaryRow}><dt><i className="fa-solid fa-circle-dollar-to-slot" aria-hidden="true" /> Total Profit</dt><span className={styles.summaryColon}>:</span><dd className={styles.positive}>{money(preview.profit)}</dd></div>
                        <div className={styles.summaryRow}><dt><i className="fa-solid fa-calendar-check" aria-hidden="true" /> {selected.payout_frequency === 'daily' ? 'Daily Per Payment' : selected.payout_frequency === 'weekly' ? 'Weekly Per Payment' : selected.payout_frequency === 'monthly' ? 'Monthly Per Payment' : 'Profit Per Payment'}</dt><span className={styles.summaryColon}>:</span><dd>{money(preview.perPayment)} <small>({selected.payout_frequency === 'fixed' ? 'At maturity' : `Every ${interval(selected.payout_frequency)} days`})</small></dd></div>
                        <div className={styles.summaryRow}><dt><i className="fa-solid fa-calendar-days" aria-hidden="true" /> Total Payments</dt><span className={styles.summaryColon}>:</span><dd>{preview.periods} {preview.periods === 1 ? 'time' : 'times'}</dd></div>
                        <div className={styles.summaryRow}><dt><i className="fa-regular fa-calendar" aria-hidden="true" /> Investment Period</dt><span className={styles.summaryColon}>:</span><dd>{preview.length} days</dd></div>
                        <div className={styles.summaryRow}><dt><i className="fa-regular fa-clock" aria-hidden="true" /> Profit Payout</dt><span className={styles.summaryColon}>:</span><dd>{selected.payout_frequency === 'fixed' ? 'At maturity' : `Every ${interval(selected.payout_frequency)} days`}</dd></div>
                        <div className={styles.summaryRow}><dt><i className="fa-solid fa-sack-dollar" aria-hidden="true" /> Principal Return</dt><span className={styles.summaryColon}>:</span><dd>After {preview.length} days</dd></div>
                      </dl>
                      <div className={styles.summaryTotal}><span className={styles.summaryTotalIcon}><i className="fa-solid fa-layer-group" aria-hidden="true" /></span><strong>Total Return</strong><span className={styles.summaryColon}>:</span><b>{money(preview.total)}</b></div>
                    </>
                  ) : <div className={styles.summaryEmpty}><i className="fa-solid fa-chart-pie" aria-hidden="true" /><p>Select a plan to see its payout estimate.</p></div>}
                </section>
              </div>}

          {showHistory && (
            <section className={`${styles.section} ${styles.historySection}`}>
              <div className={styles.sectionTitle}>
                <div><span className={styles.kicker}>YOUR ACTIVITY</span><h2>{tab === 'schedule' ? 'Payment schedule' : tab === 'profit' ? 'Profit history' : tab === 'overview' ? `My Active Investments (${overview?.active_investments || 0})` : 'My investments'}</h2></div>
                <div className={styles.historyControls}>{tab !== 'profit' && <select className={styles.statusFilter} value={filter} onChange={event => setFilter(event.target.value)} aria-label="Filter investment status"><option value="all">All statuses</option><option value="active">Active</option><option value="completed">Completed</option><option value="closed">Cancelled</option></select>}{tab === 'overview' && <button type="button" className={styles.viewAll} onClick={() => { setTab('my'); setFilter('all'); }}>View all <i className="fa-solid fa-arrow-right" aria-hidden="true" /></button>}</div>
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
                      <thead><tr><th>#</th><th>Plan &amp; ID</th><th>Amount</th><th>Profit Rate</th><th>Total Profit</th><th>Paid Profit</th><th>Remaining</th><th>Next Profit Payment</th><th>Principal Return</th><th>Progress</th><th>Action</th></tr></thead>
                      <tbody>{shown.map((item, index) => {
                        const expected = expectedProfit(item);
                        const paid = paidProfit(item);
                        const remaining = item.status === 'closed' ? 0 : Math.max(0, expected - paid);
                        const nextProfit = nextProfitAmount(item);
                        const progress = expected > 0 ? Math.min(100, paid / expected * 100) : item.status === 'completed' ? 100 : 0;
                        const rate = tableRate(item);
                        return (
                          <tr key={item.id}>
                            <td className={styles.rowNumber}>{index + 1}</td>
                            <td><div className={styles.planCell}><span className={`${styles.holdingIcon} ${styles[`holding_${item.payout_frequency || 'fixed'}`]}`}><i className={`fa-solid ${item.payout_frequency === 'daily' ? 'fa-calendar-day' : item.payout_frequency === 'weekly' ? 'fa-calendar-week' : item.payout_frequency === 'monthly' ? 'fa-calendar-days' : 'fa-crown'}`} aria-hidden="true" /></span><span><strong>{item.investment?.name || 'Investment'}</strong><small className={styles.investmentId}>{item.code_no || `#${item.id}`}</small></span></div></td>
                            <td className={styles.amountCell}>{money(item.investment_amount)}</td>
                            <td><span className={styles.rateCell}>{rate.period}</span>{rate.total && <small>{rate.total}</small>}</td>
                            <td className={styles.totalProfitCell}>{money(expected)}</td>
                            <td>{money(paid)}</td>
                            <td className={styles.remainingCell}><div className={styles.remainingBreakdown}><span>Profit <strong>{money(remaining)}</strong></span><span>Capital <strong>{money(remainingCapital(item))}</strong></span></div></td>
                            <td><div className={styles.dateCell}><i className="fa-regular fa-clock" aria-hidden="true" /><span><strong className='text-warning'>{item.status === 'active' ? timeUntil(item.next_payment_at || item.ended_at, now) : '—'}</strong><small>{item.status === 'active' ? tableDate(item.next_payment_at || item.ended_at) : 'No upcoming payment'}</small>{nextProfit !== null && <small className={styles.nextProfitAmount}>Profit Amount — {money(nextProfit)}</small>}</span></div></td>
                            <td><div className={styles.dateCell}><i className="fa-regular fa-calendar" aria-hidden="true" /><span><strong className='text-warning'>{item.principal_repaid_at ? 'Returned' : item.status === 'closed' ? 'Cancelled' : timeUntil(item.ended_at, now)}</strong><small>{tableDate(item.principal_repaid_at || (item.status === 'closed' ? item.closed_at : item.ended_at))}</small><small className={styles.capitalReturn}>Capital Return — ({money(item.investment_amount)})</small></span></div></td>
                            <td><div className={styles.progressCell}><span className={`${styles.status} ${styles[item.status] || ''}`}>{item.status}</span><div className={styles.progressLine}><div className={styles.progress} aria-label={`${progress.toFixed(2)}% of profit paid`}><span style={{ width: `${progress}%` }} /></div><small>{progress.toFixed(2)}%</small></div></div></td>
                            <td><button type="button" className={styles.viewButton} onClick={() => setDetailId(detailId === item.id ? null : item.id)}>{detailId === item.id ? 'Hide' : 'Details'}</button></td>
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
                      const nextProfit = nextProfitAmount(item);
                      const progress = expected > 0 ? Math.min(100, paid / expected * 100) : item.status === 'completed' ? 100 : 0;
                      return (
                        <article className={styles.mobileHolding} key={item.id}>
                          <div className={styles.mobileHoldingTop}>
                            <div><strong>{item.investment?.name || 'Investment'}</strong><small className={styles.investmentId}>{item.code_no || `#${item.id}`}</small><small>{holdingRate(item)}</small></div>
                          </div>
                          <div className={styles.mobileHoldingGrid}>
                            <span>Invested <strong>{money(item.investment_amount)}</strong></span>
                            <span>Total profit <strong className={styles.positive}>{money(expected)}</strong></span>
                            <span>Paid profit <strong>{money(paid)}</strong></span>
                            <span>Remaining <strong className={styles.remaining}>Profit — {money(remaining)}<br />Capital — {money(remainingCapital(item))}</strong></span>
                            <span>Next payment <strong>{item.status === 'active' ? timeUntil(item.next_payment_at || item.ended_at, now) : '—'}</strong>{nextProfit !== null && <small>Profit Amount — {money(nextProfit)}</small>}</span>
                            <span>Principal return <strong>{item.principal_repaid_at ? 'Returned' : item.status === 'closed' ? 'Cancelled' : timeUntil(item.ended_at, now)}</strong><small>{tableDate(item.principal_repaid_at || (item.status === 'closed' ? item.closed_at : item.ended_at))}</small><small>Capital Return — ({money(item.investment_amount)})</small></span>
                          </div>
                          <div className={styles.mobileHoldingBottom}>
                            <div className={styles.progressCell}><span className={`${styles.status} ${styles[item.status] || ''}`}>{item.status}</span><div className={styles.progressLine}><div className={styles.progress} aria-label={`${progress.toFixed(2)}% of profit paid`}><span style={{ width: `${progress}%` }} /></div><small>{progress.toFixed(2)}%</small></div></div>
                            <button type="button" className={styles.viewButton} onClick={() => setDetailId(detailId === item.id ? null : item.id)}>Details</button>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                  {shown.length === 0 && <p className={styles.empty}>No investments found for this status.</p>}
                  {detail && shown.some(item => item.id === detail.id) && <section className={styles.detail} aria-label={`Payment details for ${detail.code_no || detail.id}`}>
                    <div className={styles.detailHeading}><div><small>INVESTMENT DETAILS</small><h3>{detail.investment?.name || 'Investment'} <span>#{detail.code_no || detail.id}</span></h3></div><span className={`${styles.status} ${styles[detail.status] || ''}`}>{detail.status}</span></div>
                    <div className={styles.detailStats}>
                      <div><span>Invested amount</span><strong>{money(detail.investment_amount)}</strong></div>
                      <div><span>Total profit rate</span><strong>{detail.total_profit_rate != null ? `${Number(detail.total_profit_rate).toFixed(2)}%` : detail.profit_rate != null ? `${(Number(detail.profit_rate) * Math.max(1, Number(detail.total_periods) || 1)).toFixed(2)}%` : 'Fixed return'}</strong></div>
                      <div><span>Expected profit</span><strong className={styles.positive}>{money(expectedProfit(detail))}</strong></div>
                      <div><span>Profit paid</span><strong>{money(paidProfit(detail))}</strong></div>
                      <div><span>Remaining profit</span><strong className={styles.remaining}>{money(detail.status === 'closed' ? 0 : Math.max(0, expectedProfit(detail) - paidProfit(detail)))}</strong></div>
                      <div><span>Payment progress</span><strong>{detail.paid_periods || 0} / {detail.total_periods || 1}</strong></div>
                      <div className={styles.capitalCard}>
                        <div className={styles.capitalCardTitle}>
                          <span className={styles.capitalCardIcon}><i className="fa-solid fa-coins" aria-hidden="true" /></span>
                          <span>Capital Return</span>
                        </div>
                        <div className={styles.capitalCardTimer}>
                          <small>{detail.status === 'active' ? 'Time remaining' : 'Capital status'}</small>
                          <strong>{detail.status === 'active' ? timeUntil(detail.ended_at, now) : detail.principal_repaid_at ? 'Returned' : detail.status === 'closed' ? 'Refunded' : 'Completed'}</strong>
                          <div className={styles.capitalProfitProgress}>
                              <div className={styles.capitalProfitProgressHeader}><small>Profit Progress</small><b>{detailProfitProgress.toFixed(2)}%</b></div>
                              <div className={styles.capitalProfitProgressBar} role="progressbar" aria-label="Profit paid" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Number(detailProfitProgress.toFixed(2))}><span style={{ width: `${detailProfitProgress}%` }} /></div>
                            </div>
                        </div>
                        <div className={styles.capitalCardValue}>
                          <div className={styles.capitalCardAmountRow}>
                            <strong>{money(detail.investment_amount)}</strong>
                            <small className={`${styles.capitalBadge} ${detail.status === 'active' ? '' : styles.capitalBadgeDone}`}>{detail.status === 'active' ? 'Upcoming' : detail.status === 'closed' ? 'Refunded' : 'Returned'}</small>
                          </div>
                          <small>{detail.status === 'active' ? 'Scheduled' : detail.status === 'closed' ? 'Refunded' : 'Returned'} · {tableDate(detail.principal_repaid_at || (detail.status === 'closed' ? detail.closed_at : detail.ended_at))}</small>
                        </div>
                      </div>
                    </div>
                    <div className={styles.detailDates}><span>Started: <strong>{date(detail.started_at)}</strong></span><span>Next payment: <strong>{detail.status === 'active' ? date(detail.next_payment_at) : '—'}</strong></span><span>Principal return: <strong>{detail.principal_repaid_at ? date(detail.principal_repaid_at) : `Scheduled ${date(detail.ended_at)}`}</strong></span></div>
                    <h4 className='mb-0'>Profit payment schedule</h4>
                    <div className={styles.paymentList}>
                      {paymentRows(detail).map(row => {
                        const isNextPayment = detail.status === 'active' && row.state === 'Upcoming' && row.number === Number(detail.paid_periods || 0) + 1;
                        const dueAt = isNextPayment ? detail.next_payment_at || row.dueDate : row.dueDate;
                        const payoutType = !detail.payout_frequency || detail.payout_frequency === 'fixed' ? 'One time' : detail.payout_frequency === 'daily' ? 'Daily' : detail.payout_frequency === 'weekly' ? 'Weekly' : 'Monthly';
                        return <div className={`${styles.paymentRow} ${isNextPayment ? styles.paymentNext : ''}`} key={row.number}>
                          <span className={styles.paymentNumber}>{row.number}</span>
                          <span className={styles.paymentInfo}><strong>{payoutType === 'One time' ? 'One-Time' : payoutType} Profit Payout</strong><small>Payment {row.number} · {date(dueAt)}</small></span>
                          <span className={styles.paymentId}><small>ID - #{detail.code_no || detail.id}</small></span>
                          <span className={styles.paymentMiddle} aria-hidden="true">{isNextPayment && <span className={styles.paymentCountdownMiddle}><i className="fa-regular fa-clock" /> {timeUntil(dueAt, now)}</span>}</span>
                          <span className={styles.paymentRate}>{Number(detail.investment_amount) > 0 ? `${(row.amount / Number(detail.investment_amount) * 100).toFixed(2)}% · ${payoutType}` : '—'}</span>
                          <span className={styles.paymentAmount}><strong>{money(row.amount)}</strong><small>{payoutType}</small></span>
                          <span className={styles.paymentStatus}>
                            <span className={`${styles.paymentState} ${row.state === 'Paid' ? styles.paymentPaid : row.state === 'Cancelled' ? styles.paymentCancelled : ''}`}>{row.state}</span>
                            {isNextPayment && <small className={styles.paymentCountdown}><i className="fa-regular fa-clock" aria-hidden="true" /> {timeUntil(dueAt, now)}</small>}
                          </span>
                        </div>;
                      })}
                    </div>
                  </section>}
                  {historyPage < historyLastPage && <button type="button" className={styles.loadMore} onClick={loadMore} disabled={historyLoading}>{historyLoading ? 'Loading…' : 'Load more investments'}</button>}
                </>
              )}
            </section>
          )}
        </>
      )}
    </main>
  );
}
