import React from 'react';
import { FaqItemType } from '../../../../types/SupportTypes';

export default function FaqItem({
  item,
  isOpen,
  onToggle,
}: {
  item: FaqItemType;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className={`faq-item ${isOpen ? 'active' : ''}`}>
      <div className="faq-header">
        <span className="question">
          {item.id}. {item.question}
        </span>
        <button type="button" className="toggle-btn" onClick={onToggle} aria-expanded={isOpen}>
          <span className="icon">{isOpen ? '-' : '+'}</span>
        </button>
      </div>

      <div className="faq-body" style={{ display: isOpen ? 'block' : 'none' }}>
        <p>{item.answer}</p>
      </div>
    </div>
  );
}