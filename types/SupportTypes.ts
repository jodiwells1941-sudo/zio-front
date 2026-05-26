// export type TicketStatus = 'Open' | 'In Progress' | 'Closed';

// export interface TicketItem {
//   id: string;           // e.g. "T-ABC123"
//   subject: string;
//   category: string;
//   message?: string;     // only on create (first message)
//   status: TicketStatus;
//   unread_count?: number; // unread replies from admin
//   created_at: string;
// }

export interface TicketMessage {
  id: number;
  message: string;
  is_admin: boolean;
  sender?: string;
  created_at: string;
  file?: string | null;  // URL to attached image (if any)
}






// ========================================================= 
export type TopicItem = {
  title: string;
  imgSrc: string;
  glowClass: string;
};

export type FaqItemType = {
  id: number;
  question: string;
  answer: string;
};

export type SupportCardType = {
  title: string;
  description: string;
  imgSrc: string;
  buttonText: string;
};

export type TicketStatus = 'Open' | 'In Progress' | 'Closed';

export type TicketItem = {
  id: string;
  subject: string;
  category: string;
  message: string;
  status: TicketStatus;
  createdAt?: string;
  unread_count?: number;
  created_at: string;
};