'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { TicketItem, TicketMessage } from '@/types/SupportTypes';
import { getTicketMessages, replyToTicket, closeTicket } from '@/app/api/support';
import Swal from 'sweetalert2';

const statusClass = (s: string) =>
  s === 'Closed' ? 'closed' : s === 'In Progress' ? 'progress' : 'open';

const formatDate = (d: string) =>
  d
    ? new Date(d).toLocaleString('en-GB', {
        year: 'numeric', month: 'short', day: '2-digit',
        hour: '2-digit', minute: '2-digit',
      })
    : '-';

// ─── Small helper: renders a message's file attachment ────────
function MessageAttachment({ url }: { url: string }) {
  const isImage = /\.(png|jpe?g|gif|webp|bmp|svg)(\?.*)?$/i.test(url);

  if (isImage) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="chat-attachment-link">
        <img
          src={url}
          alt="attachment"
          className="chat-attachment-img"
          style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 6, marginTop: 6, display: 'block' }}
        />
      </a>
    );
  }

  // Non-image fallback (pdf, doc, etc.)
  const filename = url.split('/').pop() ?? 'attachment';
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="chat-attachment-file"
      style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 6, fontSize: '0.8rem' }}
    >
      📎 {filename}
    </a>
  );
}

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
  const [messages, setMessages]       = useState<TicketMessage[]>([]);
  const [loading, setLoading]         = useState(true);
  const [reply, setReply]             = useState('');
  const [replyFile, setReplyFile]     = useState<File | null>(null);
  const [sending, setSending]         = useState(false);
  const [closing, setClosing]         = useState(false);
  const [ticketData, setTicketData]   = useState(ticket);
  const bodyRef  = useRef<HTMLDivElement>(null);
  const fileRef  = useRef<HTMLInputElement>(null);

  const scrollBottom = () =>
    setTimeout(() => {
      if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }, 50);

  // Load messages on open
  useEffect(() => {
    (async () => {
      try {
        const { messages: msgs, ticket: fresh } = await getTicketMessages(ticket.id);
        setMessages(msgs);
        setTicketData(fresh);
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
    if ((!reply.trim() && !replyFile) || sending) return;
    setSending(true);
    try {
      const msg = await replyToTicket(ticketData.id, reply.trim(), replyFile);
      setMessages(prev => [...prev, msg]);
      setReply('');
      setReplyFile(null);
      if (fileRef.current) fileRef.current.value = '';
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
    onClose();

    const result = await Swal.fire({
      title: "Close this ticket?",
      text: "Are you sure you want to close this ticket? You can reopen it later if needed.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, close it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await closeTicket(ticketData.id);
        setTicketData(prev => ({ ...prev, status: 'Closed' }));
        onStatusChange(ticketData.id, 'Closed');
      } catch {
        /* handle error */
      } finally {
        setClosing(false);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const canSend = (reply.trim().length > 0 || replyFile !== null) && !sending;

  return (
    <div className="rt-modal-overlay" role="dialog" aria-modal="true">
      <button className="rt-modal-backdrop" type="button" onClick={onClose} aria-label="Close" />

      <div className="bg-light-white rt-modal--lg ticket-chat-modal col-12 col-md-6">
        {/* Header */}
        <div className="rt-modal-head">
          <div className="ticket-chat-header-info">
            <span className="ticket-chat-id">{ticketData.id}</span>
            <h6 className="rt-modal-title">{ticketData.subject}</h6>
            <div>
              <span
                className={`ticket-status ${statusClass(ticketData.status)} ${ticketData.status === 'In Progress' ? 'pb-3' : ''}`}
              >
                {ticketData.status}
              </span>
            </div>
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
            <button type="button" className="rt-modal-x" onClick={onClose} aria-label="Close">
              ✕
            </button>
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
                <div className={`chat-bubble ${msg.is_admin ? 'bg-light-dark' : 'bg-success'}`}>
                  <span className="chat-sender">{msg.is_admin ? 'Support Team' : 'You'}</span>
                  <p className="chat-text">{msg.message}</p>
                  {/* ── File attachment ── */}
                  {msg.file && <MessageAttachment url={msg.file} />}
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
              <div className="ticket-chat-input-wrap" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <textarea
                  className="ticket-chat-input"
                  placeholder="Type your message… (Enter to send)"
                  value={reply}
                  onChange={e => setReply(e.target.value)}
                  onKeyDown={handleKeyDown}
                />

                {/* File picker row */}
                <div className="d-flex align-items-center gap-2" style={{ fontSize: '0.8rem' }}>
                  <label
                    htmlFor="chat-file-upload"
                    className="ticket-action-btn"
                    style={{ cursor: 'pointer', margin: 0 }}
                    title="Attach image"
                  >
                    📎 {replyFile ? replyFile.name : 'Attach file'}
                  </label>
                  <input
                    id="chat-file-upload"
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={e => setReplyFile(e.target.files?.[0] ?? null)}
                  />
                  {replyFile && (
                    <button
                      type="button"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: 0 }}
                      onClick={() => {
                        setReplyFile(null);
                        if (fileRef.current) fileRef.current.value = '';
                      }}
                    >
                      ✕ remove
                    </button>
                  )}
                </div>
              </div>

              <button
                type="button"
                className="btn--primary ticket-chat-send"
                onClick={handleSend}
                disabled={!canSend}
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

  const handleStatusChange = useCallback(
    (id: string, status: TicketItem['status']) => {
      onTicketStatusChange(id, status, 0);
    },
    [onTicketStatusChange],
  );

  return (
    <div className="ticket-section">
      <div className="ticket-head-row">
        <h5 className="m-0">My Tickets</h5>
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
              <tr>
                <td colSpan={6} className="ticket-empty py-4">Loading tickets…</td>
              </tr>
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
                    <span
                      className={`ticket-status ${statusClass(t.status)} ${t.status === 'In Progress' ? 'pb-3' : ''}`}
                    >
                      {t.status}
                    </span>
                  </td>
                  <td>{formatDate(t.created_at)}</td>
                  <td>
                    <div className="d-flex align-items-center gap-2">
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
            <div
              key={t.id}
              className={`ticket-card ${(t.unread_count ?? 0) > 0 ? 'ticket-card-unread' : ''}`}
            >
              <div className="ticket-card-header">
                <span
                  className={`ticket-status ${statusClass(t.status)} ${t.status === 'In Progress' ? 'pb-3' : ''}`}
                >
                  {t.status}
                </span>
                <span>{formatDate(t.created_at)}</span>
              </div>

              <div className="ticket-card-body">
                <h6>
                  {t.subject}
                  {(t.unread_count ?? 0) > 0 && (
                    <span className="unread-badge ms-2">{t.unread_count} new</span>
                  )}
                </h6>
                <p>
                  <b>Category:</b> {t.category}
                </p>
              </div>

              <div className="ticket-card-footer mt-3 d-flex gap-2 flex-wrap">
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
                  <button
                    type="button"
                    className="ticket-action-btn close-btn"
                    onClick={() => onCloseTicket(t.id)}
                  >
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