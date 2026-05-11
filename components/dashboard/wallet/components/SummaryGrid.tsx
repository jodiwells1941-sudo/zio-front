'use client';

import Image from 'next/image';
import type { SummaryItem } from '../types';
import { useAuth } from '@/hooks/useAuth';

export default function SummaryGrid() {

  const { user } =  useAuth();

  const summaryItems: SummaryItem[] = [
    { imgSrc: '/images/new/total.png', label: 'Total', price: user ? `$${user?.balance?.toFixed(2)}` : '$0.00' },
    { imgSrc: '/images/new/available.png', label: 'Available for withdrawal', price: '$0.00' },
    { imgSrc: '/images/new/bonuses.png', label: 'Bonuses', price: '$0.00' },
  ];

  return (
    <div className="wallet-box-items">
      <div className="row g-4">
        {summaryItems.map((it) => (
          <div key={it.imgSrc + it.label} className="col-xxl-4 col-xl-6 col-lg-4 col-md-6">
            <div className="wallet-box-items-1">
              <Image src={it.imgSrc} alt="" width={48} height={48} />
              <div className="text">
                <p>{it.label}</p>
                <p className="price">{it.price}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}