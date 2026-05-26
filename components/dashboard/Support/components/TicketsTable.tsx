'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { TicketItem, TicketMessage } from '@/types/SupportTypes';
import { getTicketMessages, replyToTicket, closeTicket } from '@/app/api/support';
const statusClass = (s: string) =>
  s === 'Closed' ? 'closed' : s === 'In Progress' ? 'progress' : 'open';

const formatDate = (d: string) =>
  d ? new Date(d).toLocaleString('en-GB', { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : '-';

// ──────────────────────────────────────────────────────────────
// Conversation Modal
// ──────────────────────────────────────────────────────────────
function ConversationModal({
  ticket,
  onClose,
  onStatusChange,
}: {
  ticket: TicketItem;
  onClose: () => void;
  onStatusChange: (id: string, status: TicketItem['status']) => void;
}) {
  const [messages, setMessages]   = useState<TicketMessage[]>([]);
  const [loading, setLoading]     = useState(true);
  const [reply, setReply]         = useState('');
  const [sending, setSending]     = useState(false);
  const [closing, setClosing]     = useState(false);
  const [ticketData, setTicketData] = useState(ticket);
  const bodyRef = useRef<HTMLDivElement>(null);

  const scrollBottom = () =>
    setTimeout(() => { if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight; }, 50);

  // Load messages
  useEffect(() => {
    (async () => {
      try {
        const { messages: msgs, ticket: fresh } = await getTicketMessages(ticket.id);
        setMessages(msgs);
        setTicketData(fresh);
        // mark as read in parent
        onStatusChange(ticket.id, fresh.status);
        scrollBottom();
      } catch {
        /* silently fail */
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticket.id]);

  const handleSend = async () => {
    if (!reply.trim() || sending) return;
    setSending(true);
    try {
      const msg = await replyToTicket(ticketData.id, reply.trim());
      setMessages(prev => [...prev, msg]);
      setReply('');
      scrollBottom();
    } catch {
      /* handle error */
    } finally {
      setSending(false);
    }
  };

  const handleClose = async () => {
    if (closing) return;
    setClosing(true);
    try {
      await closeTicket(ticketData.id);
      setTicketData(prev => ({ ...prev, status: 'Closed' }));
      onStatusChange(ticketData.id, 'Closed');
    } catch {
      /* handle error */
    } finally {
      setClosing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="rt-modal-overlay" role="dialog" aria-modal="true">
      <button className="rt-modal-backdrop" type="button" onClick={onClose} aria-label="Close" />

      <div className="bg-light-white rt-modal--lg ticket-chat-modal col-12 col-md-6">
        {/* Header */}
        <div className="rt-modal-head">
          <div className="ticket-chat-header-info">
            <span className="ticket-chat-id">{ticketData.id}</span>
            <h6 className="rt-modal-title">{ticketData.subject}</h6>
            <div><span className={`ticket-status ${statusClass(ticketData.status)} ${ticketData.status === 'In Progress' ? 'pb-3' : ''}`}>{ticketData.status}</span></div>
          </div>
          <div className="d-flex align-items-center gap-2">
            {ticketData.status !== 'Closed' && (
              <button
                type="button"
                className="ticket-action-btn close-btn"
                onClick={handleClose}
                disabled={closing}
              >
                {closing ? 'Closing…' : 'Close Ticket'}
              </button>
            )}
            <button type="button" className="rt-modal-x" onClick={onClose} aria-label="Close">✕</button>
          </div>
        </div>

        {/* Messages body */}
        <div className="ticket-chat-body bg-black" ref={bodyRef}>
          {loading ? (
            <div className="ticket-chat-loading">Loading messages…</div>
          ) : messages.length === 0 ? (
            <div className="ticket-chat-empty">No messages yet.</div>
          ) : (
            messages.map(msg => (
              <div key={msg.id} className={`chat-bubble-wrap ${msg.is_admin ? 'admin' : 'user'}`}>
                <div className="chat-bubble">
                  <span className="chat-sender">{msg.is_admin ? 'Support Team' : 'You'}</span>
                  <p className="chat-text">{msg.message}</p>
                  <span className="chat-time">{formatDate(msg.created_at)}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Reply input */}
        <div className="ticket-chat-footer bg-transparent">
          {ticketData.status !== 'Closed' ? (
            <>
              <textarea
                className="ticket-chat-input"
                placeholder="Type your message… (Enter to send)"
                value={reply}
                onChange={e => setReply(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
              />
              <button
                type="button"
                className="btn--primary ticket-chat-send"
                onClick={handleSend}
                disabled={!reply.trim() || sending}
              >
                {sending ? '…' : '➤'}
              </button>
            </>
          ) : (
            <p className="ticket-chat-closed-note">This ticket is closed.</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// TicketsTable (main export)
// ──────────────────────────────────────────────────────────────
export default function TicketsTable({
  tickets,
  loading,
  onCloseTicket,
  onOpenCreate,
  onTicketStatusChange,
}: {
  tickets: TicketItem[];
  loading: boolean;
  onCloseTicket: (id: string) => void;
  onOpenCreate: () => void;
  onTicketStatusChange: (id: string, status: TicketItem['status'], unread?: number) => void;
}) {
  const [chatTicket, setChatTicket] = useState<TicketItem | null>(null);

  const handleStatusChange = useCallback((id: string, status: TicketItem['status']) => {
    onTicketStatusChange(id, status, 0); // mark unread as 0 after opening
  }, [onTicketStatusChange]);

  return (
    <div className="ticket-section">
      <div className="ticket-head-row">
        <h5 className="m-0">
          My Tickets
        </h5>

        <button
          type="button"
          className="btn--primary py-2 px-3 text-sm d-flex align-items-center justify-content-center"
          onClick={onOpenCreate}
        >
          + New Ticket <span className="arrow">›</span>
        </button>
      </div>

      {/* Desktop table */}
      <div className="table-responsive rounded border border-dark-light d-none d-lg-block">
        <table className="ticket-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Subject</th>
              <th>Category</th>
              <th>Status</th>
              <th>Created</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="ticket-empty py-4">Loading tickets…</td></tr>
            ) : tickets.length === 0 ? (
              <tr>
                <td colSpan={6} className="ticket-empty py-4">
                  No tickets yet. Click <b>New Ticket</b> to create one.
                </td>
              </tr>
            ) : (
              tickets.map(t => (
                <tr key={t.id} className={(t.unread_count ?? 0) > 0 ? 'ticket-row-unread' : ''}>
                  <td>
                    <span className="font-weight-bold">{t.id}</span>
                  </td>
                  <td>
                    {t.subject}
                    {(t.unread_count ?? 0) > 0 && (
                      <span className="unread-badge ms-2">{t.unread_count} new</span>
                    )}
                  </td>
                  <td>{t.category}</td>
                  <td>
                    <span className={`ticket-status ${statusClass(t.status)} ${t.status === 'In Progress' ? 'pb-3' : ''}`}>{t.status}</span>
                  </td>
                  <td>{formatDate(t.created_at)}</td>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      {/* View conversation */}
                      <button
                        type="button"
                        className="ticket-action-btn"
                        onClick={() => setChatTicket(t)}
                        title="View conversation"
                      >
                        💬 Chat
                        {(t.unread_count ?? 0) > 0 && (
                          <span className="unread-dot">{t.unread_count}</span>
                        )}
                      </button>

                      {/* Close */}
                      {t.status !== 'Closed' && (
                        <button
                          type="button"
                          className="ticket-action-btn close-btn"
                          onClick={() => onCloseTicket(t.id)}
                        >
                          Close
                        </button>
                      )}

                      {t.status === 'Closed' && <span className="ticket-muted">—</span>}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="d-lg-none">
        {loading ? (
          <div className="ticket-empty py-4">Loading tickets…</div>
        ) : tickets.length === 0 ? (
          <div className="ticket-empty py-4">
            No tickets yet. Click <b>New Ticket</b> to create one.
          </div>
        ) : (
          tickets.map(t => (
            <div key={t.id} className={`ticket-card ${(t.unread_count ?? 0) > 0 ? 'ticket-card-unread' : ''}`}>
              <div className="ticket-card-header">
                <span className={`ticket-status ${statusClass(t.status)}`}>{t.status}</span>
                <span>{formatDate(t.created_at)}</span>
              </div>

              <div className="ticket-card-body">
                <h6>
                  {t.subject}
                  {(t.unread_count ?? 0) > 0 && (
                    <span className="unread-badge ms-2">{t.unread_count} new</span>
                  )}
                </h6>
                <p><b>Category:</b> {t.category}</p>
              </div>

              <div className="ticket-card-footer mt-2 d-flex gap-2 flex-wrap">
                <button
                  type="button"
                  className="ticket-action-btn"
                  onClick={() => setChatTicket(t)}
                >
                  💬 Chat
                  {(t.unread_count ?? 0) > 0 && (
                    <span className="unread-dot">{t.unread_count}</span>
                  )}
                </button>

                {t.status !== 'Closed' ? (
                  <button type="button" className="ticket-action-btn close-btn" onClick={() => onCloseTicket(t.id)}>
                    Close
                  </button>
                ) : (
                  <span className="ticket-muted">—</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Conversation modal */}
      {chatTicket && (
        <ConversationModal
          ticket={chatTicket}
          onClose={() => setChatTicket(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}