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
  createdAt: string;
};