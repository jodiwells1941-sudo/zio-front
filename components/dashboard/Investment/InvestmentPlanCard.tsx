'use client';

import Image from 'next/image';
import Link from 'next/link';
import styles from '@/app/dashboard/investment/investment.module.css';

export type InvestmentPlan = {
  id: number;
  name: string;
  short_description?: string | null;
  icon_key?: string | null;
  icon_image_url?: string | null;
  card_image_url?: string | null;
  duration: number;
  investment_amount: number | string;
  return_amount: number | string;
  payout_frequency?: string;
  profit_rate?: number | string | null;
  min_amount?: number | string | null;
  max_amount?: number | string | null;
  duration_options?: number[] | null;
  duration_rates?: { duration_days: number; total_profit_rate: number | string }[] | null;
};

const money = (value: number | string | null | undefined) => `$${Number(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const periodDays = (frequency?: string) => ({ daily: 1, weekly: 7, monthly: 30 }[frequency || ''] || 0);
const periodName = (frequency?: string) => ({ daily: 'day', weekly: 'week', monthly: 'month' }[frequency || ''] || 'term');
const payoutLabel = (frequency?: string) => ({ daily: 'Every day', weekly: 'Every 7 days', monthly: 'Every 30 days' }[frequency || ''] || 'At maturity');
const yearlyPeriods: Record<string, number> = { daily: 365, weekly: 52, monthly: 12 };
const iconClass = (plan: InvestmentPlan) => ({ crown: 'fa-crown', daily: 'fa-calendar-day', weekly: 'fa-calendar-week', monthly: 'fa-calendar-days', coins: 'fa-coins', growth: 'fa-chart-line', shield: 'fa-shield-halved', gem: 'fa-gem' }[plan.icon_key || ''] || (plan.payout_frequency === 'fixed' ? 'fa-crown' : 'fa-calendar-days'));
const planDays = (plan: InvestmentPlan) => plan.duration_rates?.length ? plan.duration_rates.map(row => Number(row.duration_days)) : plan.profit_rate != null && plan.duration_options?.length ? plan.duration_options.map(Number) : [Number(plan.duration)];
const totalRate = (plan: InvestmentPlan) => {
  if (plan.duration_rates?.length) return Math.max(...plan.duration_rates.map(row => Number(row.total_profit_rate)));
  if (plan.profit_rate != null) {
    const period = periodDays(plan.payout_frequency);
    return Number(plan.profit_rate) * (period ? Math.ceil(Math.max(...planDays(plan)) / period) : 1);
  }
  const principal = Number(plan.investment_amount);
  return principal > 0 ? (Number(plan.return_amount) - principal) / principal * 100 : 0;
};
const paymentRate = (plan: InvestmentPlan) => {
  const period = periodDays(plan.payout_frequency);
  if (!period) return totalRate(plan);
  if (plan.duration_rates?.length) {
    const best = plan.duration_rates.reduce((current, row) => Number(row.total_profit_rate) > Number(current.total_profit_rate) ? row : current);
    return Number(best.total_profit_rate) / Math.ceil(Number(best.duration_days) / period);
  }
  if (plan.profit_rate != null) return Number(plan.profit_rate);
  return totalRate(plan) / Math.ceil(Number(plan.duration) / period);
};

type Props = {
  plan: InvestmentPlan;
  selected?: boolean;
  onSelect?: () => void;
  href?: string;
  compact?: boolean;
};

export default function InvestmentPlanCard({ plan, selected = false, onSelect, href, compact = false }: Props) {
  const frequency = plan.payout_frequency || 'fixed';
  const rate = totalRate(plan);
  const perPaymentRate = paymentRate(plan);
  const annualRate = yearlyPeriods[frequency] ? perPaymentRate * yearlyPeriods[frequency] : null;
  const availableDays = planDays(plan).filter(Number.isFinite).sort((a, b) => a - b);
  const action = <>{selected ? 'Selected plan' : 'Select plan'} <i className={`fa-solid ${selected ? 'fa-check' : 'fa-arrow-right'}`} aria-hidden="true" /></>;

  return <article className={`${styles.plan} ${styles[`plan_${frequency}`] || ''} ${selected ? styles.selectedPlan : ''} ${compact ? styles.planCompact : ''}`}>
    {(frequency === 'fixed' || frequency === 'daily') && <span className={styles.planRibbon}>{frequency === 'fixed' ? 'Most Stable' : <>Popular <i className="fa-solid fa-star ms-1 fs-10" aria-hidden="true" /></>}</span>}
    <span className={styles.planIcon}>{plan.icon_image_url ? <Image src={plan.icon_image_url} alt="" width={43} height={40} unoptimized /> : <i className={`fa-solid ${iconClass(plan)}`} aria-hidden="true" />}</span>
    <div className={`${styles.planFrame} mb-4`}>
      <span className={`${styles.planFrameCorner} ${styles.planFrameTopLeft}`} />
      <span className={`${styles.planFrameCorner} ${styles.planFrameTopRight}`} />
      <span className={`${styles.planFrameText} fs-5`}>{plan.name}</span>
      <span className={`${styles.planFrameCorner} ${styles.planFrameBottomLeft}`} />
      <span className={`${styles.planFrameCorner} ${styles.planFrameBottomRight}`} />
    </div>
    <p className={styles.planDescription}>{plan.short_description || (frequency === 'fixed' ? 'Return at maturity' : `Profit ${payoutLabel(frequency).toLowerCase()}`)}</p>
    <div className={styles.planRate}><small>Up to</small> <strong>{Number.isFinite(rate) ? `${rate.toFixed(2)}%` : '—'}</strong> <span>Profit</span></div>
    <div className={styles.planHighlights}>
      <div><i className="fa-solid fa-check" aria-hidden="true" /><span>Profit Rate: <strong>{Number.isFinite(perPaymentRate) ? `${perPaymentRate.toFixed(2)}%` : '—'} {frequency === 'fixed' ? '(One Time)' : `/ ${periodName(frequency)}`}</strong></span></div>
      {annualRate !== null && Number.isFinite(annualRate) && <div className={styles.planAnnual}><i className="fa-solid fa-check" aria-hidden="true" /><strong>≈ {annualRate.toFixed(2)}% / Year</strong></div>}
    </div>
    <div className={styles.planFacts}>
      <div><i className="fa-regular fa-calendar-days" aria-hidden="true" /><span>Duration: {availableDays.length ? `${availableDays[0]} days${availableDays.length > 1 ? ` · Up to ${availableDays[availableDays.length - 1]} days` : ''}` : '—'}</span></div>
      <div><i className="fa-solid fa-coins" aria-hidden="true" /><span>Payout: {frequency === 'fixed' ? '1 Time' : payoutLabel(frequency)}</span></div>
      <div><i className="fa-regular fa-calendar-check" aria-hidden="true" /><span>{frequency === 'fixed' ? 'Total Payment' : 'Total Payment (Yearly)'}: {yearlyPeriods[frequency] ? `${yearlyPeriods[frequency]} times` : '1 Time'}</span></div>
      <div><i className="fa-solid fa-circle-check" aria-hidden="true" /><span>Capital: 100% Return</span></div>
      <div><i className="fa-solid fa-shield-halved" aria-hidden="true" /><span>Min: {money(plan.min_amount ?? plan.investment_amount)} · Max: {money(plan.max_amount ?? plan.investment_amount)}</span></div>
    </div>
    <div className={styles.planArt} aria-hidden="true">{plan.card_image_url ? <Image src={plan.card_image_url} alt="" width={110} height={68} unoptimized /> : <><i className={`fa-solid ${frequency === 'fixed' ? 'fa-shield-halved' : 'fa-calendar-days'}`} /><i className="fa-solid fa-coins" /></>}</div>
    {href ? <Link className={styles.planSelect} href={href}>{action}</Link> : <button type="button" className={styles.planSelect} onClick={onSelect}>{action}</button>}
  </article>;
}
