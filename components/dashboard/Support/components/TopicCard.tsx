import React from 'react';
import Image from 'next/image';
import { TopicItem } from '../../../../types/SupportTypes';

export default function TopicCard({ item }: { item: TopicItem }) {
  return (
    <div className={`topic-card ${item.glowClass}`}>
      <div className="icon-box">
        <Image src={item.imgSrc} alt={item.title} width={40} height={40} />
      </div>
      <h3>{item.title}</h3>
    </div>
  );
}