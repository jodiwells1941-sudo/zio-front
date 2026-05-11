import React, { useState } from 'react';
import { FaqItemType } from '../../../../types/SupportTypes';
import FaqItem from './FaqItem';

export default function FaqSection({ faqs }: { faqs: FaqItemType[] }) {
  const [openId, setOpenId] = useState<number>(4); // default open like your HTML

  return (
    <div className="faq-container">
      <h2 className="faq-title">Common Question</h2>

      <div className="faq-list">
        {faqs.map((f) => (
          <FaqItem
            key={f.id}
            item={f}
            isOpen={openId === f.id}
            onToggle={() => setOpenId(openId === f.id ? -1 : f.id)}
          />
        ))}
      </div>
    </div>
  );
}