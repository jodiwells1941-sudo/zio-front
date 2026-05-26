'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { TicketItem } from '@/types/SupportTypes';
import { createTicket } from '@/app/api/support';

type Props = {
  open: boolean;
  onCreate: (ticket: TicketItem) => void;
  categories: string[];
  onClose: () => void;
};

export default function CreateTicket({ open, onCreate, categories, onClose }: Props) {
  const finalCategories = useMemo(() => (categories?.length ? categories : ['Other']), [categories]);

  const [subject, setSubject]   = useState('');
  const [category, setCategory] = useState(finalCategories[0] ?? 'Other');
  const [message, setMessage]   = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]       = useState('');

  useEffect(() => {
    if (!finalCategories.includes(category)) setCategory(finalCategories[0] ?? 'Other');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finalCategories.join('|')]);

  const canSubmit = useMemo(() => subject.trim().length >= 3 && message.trim().length >= 5, [subject, message]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || submitting) return;

    setSubmitting(true);
    setError('');

    try {
      const newTicket = await createTicket({
        subject: subject.trim(),
        category,
        message: message.trim(),
      });

      onCreate(newTicket);
      setSubject('');
      setMessage('');
      setCategory(finalCategories[0] ?? 'Other');
      onClose();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error && 'response' in err ? (err as any).response?.data?.message : undefined;
      setError(errorMessage ?? 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="rt-modal-overlay" role="dialog" aria-modal="true">
      <button className="rt-modal-backdrop" type="button" onClick={onClose} aria-label="Close" />

      <div className="bg-light-white rt-modal--lg">
        <div className="rt-modal-head">
          <h6 className="rt-modal-title">Create New Ticket</h6>
          <button type="button" className="rt-modal-x" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="rt-modal-body">
          {error && (
            <div className="ticket-error-alert mb-3">{error}</div>
          )}

          <form className="ticket-form" onSubmit={handleSubmit}>
            <div className="ticket-form-grid">
              <div className="input-box">
                <label>Subject</label>
                <input
                  type="text"
                  placeholder="Write ticket subject"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                />
              </div>

              <div className="input-box">
                <label htmlFor="category">Category</label>
                <select value={category} onChange={e => setCategory(e.target.value)} id="category">
                  {finalCategories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="input-box textarea mt-4 pt-3">
              <label>Message</label>
              <textarea
                placeholder="Write your problem details..."
                value={message}
                onChange={e => setMessage(e.target.value)}
              />
            </div>

            <div className="rt-modal-foot">
              <button type="button" className="ticket-action-btn" onClick={onClose} disabled={submitting}>
                Cancel
              </button>
              <button
                type="submit"
                disabled={!canSubmit || submitting}
                className="btn--primary py-2 px-3 text-sm d-flex align-items-center justify-content-center"
              >
                {submitting ? 'Submitting…' : <>Submit Ticket <span className="arrow">›</span></>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}