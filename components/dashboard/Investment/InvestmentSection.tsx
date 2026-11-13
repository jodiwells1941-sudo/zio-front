'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { investmentsApi } from '@/app/api/lottery';
import { useAuth } from '@/hooks/useAuth';
import InvestmentPlanCard, { type InvestmentPlan } from './InvestmentPlanCard';
import planStyles from '@/app/dashboard/investment/investment.module.css';
import styles from './InvestmentSection.module.css';

type SectionProps = {
  bannerSrc?: string;
  title: string;
  description: string;
  wrapperClassName?: string;
};

export default function InvestmentSection({ bannerSrc, title, description, wrapperClassName = 'investment-area' }: SectionProps) {
  const { isLoggedIn } = useAuth();
  const [plans, setPlans] = useState<InvestmentPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    investmentsApi(1)
      .then(response => {
        if (active) setPlans(response?.data?.data || []);
      })
      .catch(() => {
        if (active) setError('Investment packages are temporarily unavailable.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  return <section className={styles.section}>
    {bannerSrc && <Image src={bannerSrc} alt="" width={1400} height={520} className={styles.banner} />}
    <div className={wrapperClassName}>
      <div className={styles.heading}>
        <span className={styles.eyebrow}><i className="fa-solid fa-crown" aria-hidden="true" /> INVESTMENT PLANS</span>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      {loading ? <p className={styles.state}>Loading investment packages…</p> : error ? <p className={styles.state} role="alert">{error}</p> : plans.length ? (
        <div className={`${planStyles.planGrid} ${styles.grid}`}>
          {plans.map(plan => {
            const destination = `/dashboard/investment/?plan=${plan.id}`;
            const href = isLoggedIn ? destination : `/sign-in?redirect=${encodeURIComponent(destination)}`;
            return <InvestmentPlanCard key={plan.id} plan={plan} href={href} />;
          })}
        </div>
      ) : <p className={styles.state}>No investment packages are available right now.</p>}
    </div>
  </section>;
}
