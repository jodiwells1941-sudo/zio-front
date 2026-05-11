'use client';

import React from 'react';
import Image from 'next/image';

// Winner Type Definition
interface WinnerType {
  id: number;
  rank: string;
  userId: string;
  winningNo: string;
  amount: string;
  tickets: string;
  hasAward: boolean;
}

// Component Props
interface WinnerTableProps {
  winners: WinnerType[];
}

const WinnerTable: React.FC<WinnerTableProps> = ({ winners }) => {
  // Check if winners array exists and has items
  if (!winners || winners.length === 0) {
    return <div className="text-center text-white p-3">No winners data available</div>;
  }

  return (
    <div className="winner-table-container" style={{ overflowX: 'auto' }}>
      <table className="winner-table-item" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#1a2b3c', color: 'white' }}>
            <th style={{ padding: '10px', textAlign: 'left' }}>Rank</th>
            <th style={{ padding: '10px', textAlign: 'left' }}>User ID</th>
            <th style={{ padding: '10px', textAlign: 'left' }}>Winning No.</th>
            <th style={{ padding: '10px', textAlign: 'left' }}>Amount</th>
            <th style={{ padding: '10px', textAlign: 'left' }}>Tickets</th>
          </tr>
        </thead>
        <tbody>
          {winners.map((winner) => (
            <tr key={winner.id} style={{ borderBottom: '1px solid #2a3b4c' }}>
              <td style={{ padding: '10px' }}>
                <span className="rank-badge" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Image 
                    src="/assets/images/new/award.png" 
                    alt="award" 
                    width={16} 
                    height={16} 
                    style={{ opacity: winner.hasAward ? 1 : 0 }}
                  /> 
                  {winner.rank}
                </span>
              </td>
              <td style={{ padding: '10px' }}>
                <span className="user-id" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Image 
                    src="/assets/images/new/user.png" 
                    alt="user" 
                    width={16} 
                    height={16} 
                  /> 
                  {winner.userId}
                </span>
              </td>
              <td style={{ padding: '10px' }}>
                <span className="win-no" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Image 
                    src="/assets/images/new/win.png" 
                    alt="win" 
                    width={16} 
                    height={16} 
                  /> 
                  {winner.winningNo}
                </span>
              </td>
              <td style={{ padding: '10px' }}>
                <span className="amount" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Image 
                    src="/assets/images/new/cash.png" 
                    alt="cash" 
                    width={16} 
                    height={16} 
                  /> 
                  {winner.amount}
                </span>
              </td>
              <td style={{ padding: '10px' }}>{winner.tickets}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default WinnerTable;