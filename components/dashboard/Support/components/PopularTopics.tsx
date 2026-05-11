import React from 'react';
import { TopicItem } from '../../../../types/SupportTypes';
import TopicCard from './TopicCard';

export default function PopularTopics({ topics }: { topics: TopicItem[] }) {
  return (
    <div className="popular-topics-section">
      <h2 className="section-title">Popular topics</h2>

      <div className="topics-grid">
        {topics.map((t) => (
          <TopicCard key={t.title} item={t} />
        ))}
      </div>
    </div>
  );
}