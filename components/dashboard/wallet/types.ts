export type TabKey = 'tab1' | 'tab2' | 'tab3' | 'tab4' | 'tab5' | 'tab6';
export type P2PTabKey = 'wallet-balance' | 'wallet-add';

export type SummaryItem = {
  imgSrc: string;
  label: string;
  price: string;
};

export type P2PCard = {
  name: string;
  platform: string;
  methodName: string;
  timeText: string;
  rate: string;
  limit: string;
  available: string;
};

export type TransferRow = {
  sl: number;
  userId: string;
  type: 'Sent' | 'Received';
  amount: string;
  time: string;
  status: number
};