import React from 'react';
import type { SupportCardType } from '../../../../types/SupportTypes';
import SupportCard from './SupportCard';

export default function QuestionSection({ cards }: { cards: SupportCardType[] }) {
  return (
    <div className="question-section">
      <div className="section-header">
        <h2>You Still Have A Question?</h2>
        <p>
          If you can&apos;t find answer to your question, fill your query &amp; submit, or you can always contact us. We
          answer to you shortly
        </p>
      </div>

      <div className="cards-container">
        {cards.map((c) => (
          <SupportCard key={c.title} item={c} />
        ))}
      </div>
    </div>
  );
}