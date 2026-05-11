import React from 'react';
import type { TabKey } from '../types';
import { useRouter } from 'next/navigation';

export default function TabButton({
  tab,
  label,
  activeTab,
  onChange,
}: {
  tab: TabKey;
  label: string;
  activeTab: TabKey;
  onChange: (tab: TabKey) => void;
}) {
  const router = useRouter();
  return (
    <button
      type="button"
      className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
      onClick={() => {
        onChange(tab);
        router.push(`?tab=${tab}`, { scroll: false });
      }}
      aria-current={activeTab === tab ? 'page' : undefined}
    >
      {label}
    </button>
  );
}