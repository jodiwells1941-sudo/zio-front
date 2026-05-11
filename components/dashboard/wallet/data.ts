import type { P2PCard, SummaryItem, TransferRow } from './types';

// export const summaryItems: SummaryItem[] = [
//   { imgSrc: '/images/new/total.png', label: 'Total', price: '$2000.00' },
//   { imgSrc: '/images/new/available.png', label: 'Available for withdrawal', price: '$0' },
//   { imgSrc: '/images/new/bonuses.png', label: 'Total', price: '$0' },
// ];

export const paymentMethods = [
  'BINANCE',
];

export const amountPreset = [25, 50, 100, 200, 500];

export const p2pCards: P2PCard[] = [
  {
    name: 'Darrell Steward',
    platform: 'Platform TK 124.92 / USD',
    methodName: 'Bkash',
    timeText: '5 minute',
    rate: '124.92',
    limit: '10000 – 50000 BDT',
    available: '100 USD',
  },
  {
    name: 'Shamoun Patras',
    platform: 'Platform TK 124.56 / USD',
    methodName: 'Nagad',
    timeText: '10 minute',
    rate: '124.92',
    limit: '10000 – 50000 BDT',
    available: '100 USD',
  },
];

export const transferRows: TransferRow[] = [
  { sl: 1, userId: '54856', type: 'Sent', amount: '$56', time: '05:54:41', status: 1 },
  { sl: 2, userId: '55856', type: 'Sent', amount: '$56', time: '05:54:41', status: 2 },
];