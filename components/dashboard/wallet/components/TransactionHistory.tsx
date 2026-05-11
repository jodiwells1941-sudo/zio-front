import React, { useState, useEffect, useCallback } from 'react';
import StatusTd from './StatusTd';
import { TransactionCard } from './TransactionCard';
import PaginationControls from '../../PaginationControls';
import { GetTransferListApi } from '@/app/api/p2p';

const statusMap: Record<number, 1 | 2 | 3> = {
  1: 1, // success
  2: 2, // pending
  3: 3, // failed
};

export default function TransactionHistory() {
  const [transferList, setTransferList]   = useState<any[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [isFetching, setIsFetching]       = useState(false);
  const [pagination, setPagination]       = useState({
    current_page:  1,
    last_page:     1,
    next_page_url: null,
    prev_page_url: null,
    total:         0,
    per_page:      20,
  });

  // ── Fetch ──────────────────────────────────────────────────────
  const fetchTransferList = useCallback(async (page: number) => {
    page === 1 ? setIsDataLoading(true) : setIsFetching(true);

    try {
      const res = await GetTransferListApi({ params: { page } });      

      setTransferList(res?.data?.data || []);
      setPagination({
        current_page:  res?.data?.current_page  ?? 1,
        last_page:     res?.data?.last_page      ?? 1,
        next_page_url: res?.data?.next_page_url  ?? null,
        prev_page_url: res?.data?.prev_page_url  ?? null,
        total:         res?.data?.total          ?? 0,
        per_page:      res?.data?.per_page       ?? 20,
      });
    } catch (error) {
      console.error('Error fetching transfer list:', error);
      setTransferList([]);
    } finally {
      setIsDataLoading(false);
      setIsFetching(false);
    }
  }, []);

  // ── Page change ────────────────────────────────────────────────
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.last_page) {
      setPagination((prev) => ({ ...prev, current_page: newPage }));
      fetchTransferList(newPage);
    }
  };

  // ── Initial load ───────────────────────────────────────────────
  useEffect(() => {
    fetchTransferList(1);
  }, [fetchTransferList]);

  // ── Sl # offset across pages ───────────────────────────────────
  const slOffset = (pagination.current_page - 1) * pagination.per_page;  

  return (
    <div className="transaction-details">
      <h3 className="pb-2">Transaction Details</h3>

      {/* ── Desktop Table ── */}
      <div className="table-responsive d-none d-md-block">
        <table>
          <thead>
            <tr>
              <th>Sl #</th>
              {/* <th>User ID</th> */}
              <th>Transaction Type</th>
              <th>Amount</th>
              <th>Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {isDataLoading && transferList.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-4">Loading...</td>
              </tr>
            ) : transferList.length > 0 ? (
              transferList.map((r: any, index: number) => (
                <tr key={`${r.id}-${r.uu_id}`}>
                  <td>{slOffset + index + 1}</td>
                  <td>{r.type == 'credit' ? 'Deposit' : 'Withdrawal'}</td>
                  <td>$ {Number(r.amount).toFixed(2)}</td>
                  <td>{r.date}</td>
                  <td>
                    {/* {statusMap[r.status] === 1 ? (
                      <span className="status-confirmed">Confirmed</span>
                    ) : (
                      <span className="status-pending">Pending</span>
                    )} */}
                    {r.status == 1 ? (
                      <span className="status-confirmed">Approved</span>
                    ) : r.status == 2 ? (
                      <span className="status-pending">Rejected</span>
                    ) : (
                      <span className="status-failed">Pending</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-4">No transaction history found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Mobile Cards ── */}
      <div className="row g-4 d-md-none">
        {isDataLoading && transferList.length === 0 ? (
          <div className="col-12 text-center py-4">Loading...</div>
        ) : transferList.length > 0 ? (
          transferList.map((r: any, index: number) => (
            <div
              className="col-12 col-sm-6 col-lg-4 col-xl-3 p-0"
              key={`${r.id}-${r.uu_id}`}
            >
              <TransactionCard
                data={{
                  sl:       slOffset + index + 1,
                  userId:   r.uu_id,
                  userName: r.type === 'deposit' ? r.sender_name : r.receiver_name,
                  type:     r.is_sender ? 'Send' : 'Receive',
                  amount:   `$ ${Number(r.amount).toFixed(2)}`,
                  time:     r.date,
                  status:   statusMap[r.status] === 1 ? 1 : 2,
                }}
              />
            </div>
          ))
        ) : (
          <div className="col-12 text-center py-4">No transaction history found.</div>
        )}
      </div>

      {/* ── Pagination ── */}
      {pagination.total > 0 && (
        <PaginationControls
          pagination={pagination}
          currentPage={pagination.current_page}
          pageLoading={isFetching}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}