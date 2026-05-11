import React from 'react';
import type { P2PTabKey } from '../types';

export default function P2PTabButton({
  tab,
  label,
  activeTab,
  onChange,
}: {
  tab: P2PTabKey;
  label: string;
  activeTab: P2PTabKey;
  onChange: (tab: P2PTabKey) => void;
}) {
  const isActive = activeTab === tab;

  return (
    <button
      type="button"
      className={`wallet-tab-btn ${
        isActive
          ? label === 'Sell'
            ? 'bg-danger text-white active'
            : 'active'
          : ''
      }`}
      onClick={() => onChange(tab)}
    >
      {label}
    </button>
  );
}