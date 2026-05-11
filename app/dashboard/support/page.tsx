'use client';

import CreateTicket from '@/components/dashboard/Support/components/CreateTicket';
import FaqSection from '@/components/dashboard/Support/components/FaqSection';
import PopularTopics from '@/components/dashboard/Support/components/PopularTopics';
import QuestionSection from '@/components/dashboard/Support/components/QuestionSection';
import SupportHeader from '@/components/dashboard/Support/components/SupportHeader';
import SupportIntro from '@/components/dashboard/Support/components/SupportIntro';
import TicketsTable from '@/components/dashboard/Support/components/TicketsTable';
import { faqs, supportCards, topics } from '@/components/dashboard/Support/data';
import { TicketItem } from '@/types/SupportTypes';
import React, { useMemo, useState } from 'react';

export default function SupportPage() {
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  // manual categories (always available)
  const manualCategories = useMemo(
    () => ['Account', 'Support', 'Payment', 'Bonus promotions', 'Winning', 'Education', 'Security', 'Retailers', 'Partnerships', 'Other'],
    []
  );

  // optional: include topics titles too
  const topicCategories = useMemo(() => topics.map((t) => t.title), []);
  const categories = useMemo(() => Array.from(new Set([...manualCategories, ...topicCategories])), [manualCategories, topicCategories]);

  const filteredFaqs = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return faqs;
    return faqs.filter((f) => (f.question + ' ' + f.answer).toLowerCase().includes(q));
  }, [search]);

  const handleCreateTicket = (ticket: TicketItem) => {
    setTickets((prev) => [ticket, ...prev]);
  };

  const handleCloseTicket = (id: string) => {
    setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, status: 'Closed' } : t)));
  };

  return (
    <div className="support-main-wrapper pt-0 px-xl-0 px-2">
      <SupportHeader />
      <SupportIntro search={search} setSearch={setSearch} />

      <TicketsTable
        tickets={tickets}
        onCloseTicket={handleCloseTicket}
        onOpenCreate={() => setModalOpen(true)}
      />

      <PopularTopics topics={topics} />
      <FaqSection faqs={filteredFaqs} />
      <QuestionSection cards={supportCards} />

      {/* React modal (no bootstrap => no backdrop crash) */}
      <CreateTicket
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={handleCreateTicket}
        categories={categories}
      />
    </div>
  );
}