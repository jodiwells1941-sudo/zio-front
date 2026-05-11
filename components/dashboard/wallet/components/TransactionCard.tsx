'use client';


interface TransactionData {
  sl: string | number;
  userId: string;
  userName: string;
  type: string;
  amount: string;
  time: string;
  status:  1 | 2;
}

interface TransactionCardProps {
  data: TransactionData;
}

// ── Status config ──────────────────────────────────────────────
const statusConfig = {
  1: {
    headerBg: 'rgba(156, 236, 254, 0.08)',   // --primary-color tinted
    dotColor: '#9cecfe',                       // --primary-color
    label: 'SUCCESS',
    labelColor: '#9cecfe',
  },
  2: {
    headerBg: 'rgba(255, 186, 35, 0.08)',     // --secondary-color tinted
    dotColor: '#ffba23',                       // --secondary-color
    label: 'PENDING',
    labelColor: '#ffba23',
  },
};

// ── Transaction Icon ───────────────────────────────────────────
// const getTransactionIcon = (type: string) => {    
//   switch (type.toLowerCase()) {
//     case 'transfer':   return '↔';
//     case 'deposit':    return '↓';
//     case 'withdrawal': return '↑';
//     case 'payment':    return '₱';
//     default:           return '•';
//   }
// };

// ── Component ──────────────────────────────────────────────────
export function TransactionCard({ data }: TransactionCardProps) {
  const cfg = statusConfig[data.status] ?? statusConfig[2];  

  return (
    <>
      <div className="fc-card">
        {/* Header */}
        <div className="fc-header" style={{ background: cfg.headerBg }}>
          <div className="fc-status">
            <span className="fc-dot" style={{ background: cfg.dotColor }} />
            <span className="fc-status-label" style={{ color: cfg.labelColor }}>
              {cfg.label}
            </span>
          </div>
          <span className="fc-id">ID: {data.sl}</span>
        </div>

        {/* Body */}
        <div className="fc-body">
          <div className="fc-type-row">
            <div className="fc-icon-wrap">
              {/* {getTransactionIcon(data.type)}  */}
              <i className="fas fa-dollar-sign text-warning"></i>
            </div>
            <div>
              <p className="fc-type-name">{data.type}</p>
              <p className="fc-time">{data.time}</p>
            </div>
          </div>

          <div className="fc-divider" />

          {data.userId && (
            <div className="fc-uid-row">
              <span className="fc-uid-label">User ID</span>
              <span className="fc-uid-value">{data.userId}</span>
            </div>
          )}

          {data.userName && (
            <div className="fc-uid-row">
              <span className="fc-uid-label">Name</span>
              <span className="fc-uid-value">{data.userName}</span>
            </div>
          )}

          <div className="fc-amount-box mt-3">
            <p className="fc-amount-label">Amount</p>
            <p className="fc-amount-value">{data.amount}</p>
          </div>
        </div>
      </div>
    </>
  );
}