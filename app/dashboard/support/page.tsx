'use client';

import { closeTicket, getMyTicketList } from '@/app/api/support';
import CreateTicket from '@/components/dashboard/Support/components/CreateTicket';
import FaqSection from '@/components/dashboard/Support/components/FaqSection';
import PopularTopics from '@/components/dashboard/Support/components/PopularTopics';
import QuestionSection from '@/components/dashboard/Support/components/QuestionSection';
import SupportHeader from '@/components/dashboard/Support/components/SupportHeader';
import SupportIntro from '@/components/dashboard/Support/components/SupportIntro';
import TicketsTable from '@/components/dashboard/Support/components/TicketsTable';
import { faqs, supportCards, topics } from '@/components/dashboard/Support/data';
import { TicketItem } from '@/types/SupportTypes';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

const CATEGORIES = [
  'Account', 'Support', 'Payment', 'Bonus promotions',
  'Winning', 'Security', 'Partnerships', 'Other',
];

export default function SupportPage() {
  const [tickets, setTickets]     = useState<TicketItem[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  // ── Fetch tickets on mount ─────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const data = await getMyTicketList();
        // Sort: unread first, then by date
        const sorted = [...data].sort((a, b) => {
          const ua = a.unread_count ?? 0;
          const ub = b.unread_count ?? 0;
          if (ub !== ua) return ub - ua;
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
        setTickets(sorted);
      } catch {
        /* silently fail — user sees empty state */
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ── Categories (manual + topic titles) ────────────────────
  const topicCategories = useMemo(() => topics.map(t => t.title), []);
  const categories = useMemo(
    () => Array.from(new Set([...CATEGORIES, ...topicCategories])),
    [topicCategories]
  );

  // ── FAQ search ─────────────────────────────────────────────
  const filteredFaqs = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return faqs;
    return faqs.filter(f => (f.question + ' ' + f.answer).toLowerCase().includes(q));
  }, [search]);

  // ── Ticket actions ─────────────────────────────────────────
  const handleCreateTicket = useCallback((ticket: TicketItem) => {
    setTickets(prev => [ticket, ...prev]);
  }, []);

  const handleCloseTicket = useCallback(async (id: string) => {
    try {
      await closeTicket(id);
      setTickets(prev => prev.map(t => t.id === id ? { ...t, status: 'Closed' } : t));
    } catch {
      /* optionally show a toast */
    }
  }, []);

  // Called from conversation modal when status / unread changes
  const handleTicketStatusChange = useCallback(
    (id: string, status: TicketItem['status'], unread = 0) => {
      setTickets(prev =>
        prev.map(t => t.id === id ? { ...t, status, unread_count: unread } : t)
      );
    },
    []
  );

  return (
    <div className="support-main-wrapper pt-0 px-xl-0 px-2">
      <SupportHeader />
      <SupportIntro search={search} setSearch={setSearch} />

      <TicketsTable
        tickets={tickets}
        loading={loading}
        onCloseTicket={handleCloseTicket}
        onOpenCreate={() => setModalOpen(true)}
        onTicketStatusChange={handleTicketStatusChange}
      />

      <PopularTopics topics={topics} />
      <FaqSection faqs={filteredFaqs} />
      <QuestionSection cards={supportCards} />

      <CreateTicket
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={handleCreateTicket}
        categories={categories}
      />
    </div>
  );
}