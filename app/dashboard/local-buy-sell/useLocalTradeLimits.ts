'use client';

import { getLocalTradeLimits, LocalTradeLimits } from '@/app/api/p2padsapi';
import { useEffect, useState } from 'react';

export function useLocalTradeLimits() {
  const [limits, setLimits] = useState<LocalTradeLimits | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getLocalTradeLimits()
      .then(data => {
        if (active && Number.isFinite(data?.buy?.min) && Number.isFinite(data?.buy?.max)
          && Number.isFinite(data?.sell?.min) && Number.isFinite(data?.sell?.max)) {
          setLimits(data);
        }
      })
      .catch(() => { if (active) setLimits(null); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return { limits, loading };
}
