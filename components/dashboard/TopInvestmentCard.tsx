'use client';

import { useEffect, useRef, useState } from 'react';
import Slider from 'react-slick';
import { investmentsApi } from '@/app/api/lottery';
import InvestmentPlanCard, { type InvestmentPlan } from './Investment/InvestmentPlanCard';
import LotterySkeleton from './LotterySkeleton';
import styles from './TopInvestmentCard.module.css';

export default function TopInvestmentSection() {
  const sliderRef = useRef<Slider>(null);
  const [plans, setPlans] = useState<InvestmentPlan[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const loadPlans = async () => {
      const first = await investmentsApi(1);
      const lastPage = Math.max(1, Number(first?.data?.last_page) || 1);
      const otherPages = await Promise.all(
        Array.from({ length: lastPage - 1 }, (_, index) => investmentsApi(index + 2)),
      );
      if (active) {
        setPlans([first, ...otherPages].flatMap(response => response?.data?.data || []));
      }
    };
    loadPlans()
      .catch(() => { if (active) setPlans([]); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduceMotion(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  if (loading) return <LotterySkeleton />;
  if (!plans.length) return <p className={styles.empty}>No investment packages are available right now.</p>;

  return <div className={styles.carousel} aria-label="Investment packages">
    <Slider
      ref={sliderRef}
      dots={false}
      arrows={false}
      infinite={plans.length > 1}
      slidesToShow={1}
      slidesToScroll={1}
      speed={reduceMotion ? 0 : 500}
      autoplay={plans.length > 1}
      autoplaySpeed={3500}
      pauseOnHover={false}
      pauseOnFocus={false}
      accessibility
      afterChange={setActiveIndex}
    >
      {plans.map(plan => <div key={plan.id} className={styles.slide}>
        <InvestmentPlanCard plan={plan} compact href={`/dashboard/investment/?plan=${plan.id}`} />
      </div>)}
    </Slider>
    {plans.length > 1 && <div className={styles.pagination} aria-label="Choose investment package">
      {plans.map((plan, index) => <button
        key={plan.id}
        type="button"
        className={`${styles.dot} ${activeIndex === index ? styles.activeDot : ''}`}
        aria-label={`Show ${plan.name}`}
        aria-current={activeIndex === index ? 'true' : undefined}
        onClick={() => sliderRef.current?.slickGoTo(index)}
      />)}
    </div>}
  </div>;
}
