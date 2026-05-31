import apiClient from '@/utils/apiClient';
import { TicketItem, TicketMessage } from '@/types/SupportTypes';

// ─── Ticket list ──────────────────────────────────────────────
export const getMyTicketList = async (): Promise<TicketItem[]> => {
  const res = await apiClient.get('/user/support-ticket/list');
  return res.data.data;
};

// ─── Create ticket ────────────────────────────────────────────
export const createTicket = async (payload: {
  subject: string;
  category: string;
  message: string;
  file?: File;
}): Promise<TicketItem> => {
  const formData = new FormData();
  formData.append('subject', payload.subject);
  formData.append('category', payload.category);
  formData.append('message', payload.message);
  if (payload.file) formData.append('file', payload.file);

  const res = await apiClient.post('/user/support-ticket/create', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return res.data.data;
};

// ─── Get messages for a ticket ────────────────────────────────
export const getTicketMessages = async (
  ticketId: string
): Promise<{ messages: TicketMessage[]; ticket: TicketItem }> => {
  const res = await apiClient.get(`/user/support-ticket/${ticketId}/messages`);
  return { messages: res.data.data, ticket: res.data.ticket };
};

// ─── Reply to a ticket ────────────────────────────────────────
// Now accepts an optional file — sends multipart/form-data when a file is present.
export const replyToTicket = async (
  ticketId: string,
  message: string,
  file?: File | null,
): Promise<TicketMessage> => {
  if (file) {
    const formData = new FormData();
    formData.append('message', message);
    formData.append('file', file);

    const res = await apiClient.post(
      `/user/support-ticket/${ticketId}/reply`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return res.data.data;
  }

  // No file — send as JSON (lighter, no multipart overhead)
  const res = await apiClient.post(`/user/support-ticket/${ticketId}/reply`, { message });  
  return res.data.data;
};

// ─── Close a ticket ───────────────────────────────────────────
export const closeTicket = async (ticketId: string): Promise<void> => {
  await apiClient.post(`/user/support-ticket/${ticketId}/close`);
};
