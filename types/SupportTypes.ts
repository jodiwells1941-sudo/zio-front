export type TicketStatus = 'Open' | 'In Progress' | 'Closed';
 
export interface TicketItem {
  id: string;           // e.g. "T-ABC123"
  subject: string;
  category: string;
  message?: string;     // only on create (first message)
  status: TicketStatus;
  unread_count?: number; // unread replies from admin
  created_at: string;
}
 
export interface TicketMessage {
  id: number;
  message: string;
  is_admin: boolean;
  sender?: string;
  created_at: string;
}