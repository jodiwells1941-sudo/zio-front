'use client';

import React from 'react';
import { TicketItem } from '@/types/SupportTypes';

export default function TicketsTable({
  tickets,
  onCloseTicket,
  onOpenCreate,
}: {
  tickets: TicketItem[];
  onCloseTicket: (id: string) => void;
  onOpenCreate: () => void;
}) {
  return (
    <div className="ticket-section">
      <div className="ticket-head-row">
        <h5 className="m-0">Tickets</h5>

        <button type="button" className="btn--primary py-2 px-3 text-sm d-flex align-items-center justify-content-center" onClick={onOpenCreate}>
          + New Ticket <span className="arrow">›</span>
        </button>
      </div>

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
            {tickets.length === 0 ? (
              <tr>
                <td colSpan={6} className="ticket-empty py-4">
                  No tickets yet. Click <b>New Ticket</b> to create one.
                </td>
              </tr>
            ) : (
              tickets.map((t) => (
                <tr key={t.id}>
                  <td>{t.id}</td>
                  <td>{t.subject}</td>
                  <td>{t.category}</td>
                  <td>
                    <span className={`ticket-status ${t.status === 'Closed' ? 'closed' : t.status === 'In Progress' ? 'progress' : 'open'}`}>
                      {t.status}
                    </span>
                  </td>
                  <td>{t.createdAt}</td>
                  <td>
                    {t.status !== 'Closed' ? (
                      <button type="button" className="ticket-action-btn" onClick={() => onCloseTicket(t.id)}>
                        Close
                      </button>
                    ) : (
                      <span className="ticket-muted">—</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>


      {/* Mobile view */}
      <div className="d-lg-none">
        {tickets.length === 0 ? (
          <div className="ticket-empty py-4">
            No tickets yet. Click <b>New Ticket</b> to create one.
          </div>
        ) : (
          tickets.map((t) => (
            <div key={t.id} className="ticket-card">
              <div className="ticket-card-header">
                <span className={`ticket-status ${t.status === 'Closed' ? 'closed' : t.status === 'In Progress' ? 'progress' : 'open'}`}>
                  {t.status}
                </span>
                <span>{t.createdAt}</span>
              </div>

              <div className="ticket-card-body">
                <h6>{t.subject}</h6>
                <p><b>Category:</b> {t.category}</p>
              </div>

               {/* message */}
              <div className="ticket-card-message">
                <span>message:</span>
                <small className='text-xs d-block'>{t.message}</small>
              </div>

              <div className="ticket-card-footer mt-2">
                {t.status !== 'Closed' ? (
                  <button type="button" className="ticket-action-btn" onClick={() => onCloseTicket(t.id)}>
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


    </div>
  );
}