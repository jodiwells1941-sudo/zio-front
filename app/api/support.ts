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
}): Promise<TicketItem> => {
  const res = await apiClient.post('/user/support-ticket/create', payload);
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
export const replyToTicket = async (
  ticketId: string,
  message: string
): Promise<TicketMessage> => {
  const res = await apiClient.post(`/user/support-ticket/${ticketId}/reply`, { message });
  return res.data.data;
};
 
// ─── Close a ticket ───────────────────────────────────────────
export const closeTicket = async (ticketId: string): Promise<void> => {
  await apiClient.post(`/user/support-ticket/${ticketId}/close`);
};