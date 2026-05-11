import React from 'react';
import Image from 'next/image';
import { SupportCardType } from '../../../../types/SupportTypes';

export default function SupportCard({ item }: { item: SupportCardType }) {
  return (
    <div className="support-card">
      <div className="card-inner">
        <div className="icon-box">
          <Image src={item.imgSrc} alt={item.title} width={44} height={44} />
        </div>
        <div className="text-box">
          <h3>{item.title}</h3>
          <p>{item.description}</p>
        </div>
      </div>

      <button type="button" className="floating-btn">
        {item.buttonText} <span className="arrow">›</span>
      </button>
    </div>
  );
}