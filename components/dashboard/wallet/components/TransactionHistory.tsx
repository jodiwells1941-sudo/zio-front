import React, { useState, useEffect, useCallback } from 'react';
import { TransactionCard } from './TransactionCard';
import PaginationControls from '../../PaginationControls';
import { GetTransferListApi } from '@/app/api/p2p';

const statusMap: Record<number, string> = {
  1: 'approved',
  2: 'rejected',
  3: 'pending',
};

const typeLabelMap: Record<string, string> = {
  deposit: 'Deposit',
  deposit_bonus: 'Deposit Bonus',
  withdraw: 'Withdraw',
  withdraw_fee: 'Withdraw Fee',
  p2p_buy: 'P2P Buy',
  p2p_buy_bonus: 'P2P Buy Bonus',
  p2p_sell: 'P2P Sell',
  p2p_sell_fee: 'P2P Sell Fee',
  merchant_buy: 'Merchant Buy',
  merchant_buy_commission: 'Merchant Buy Commission',
  merchant_sell: 'Merchant Sell',
  merchant_sell_commission: 'Merchant Sell Commission',
  transfer_in: 'Transfer In',
  transfer_out: 'Transfer Out',
  transfer_fee: 'Transfer Fee',
  evoucher_buy: 'E-Voucher Buy',
  evoucher_redeem: 'E-Voucher Redeem',
  evoucher_fee: 'E-Voucher Fee',
  lottery_ticket_buy: 'Lottery Ticket Buy',
  lottery_win: 'Lottery Win',
  investment: 'Investment',
  investment_return: 'Investment Return',
  referral_reward: 'Referral Reward',
  affiliate_package_submission: 'Affiliate Package Submission',
  admin_wallet_add: 'Admin Wallet Add',
  security_deposit_add: 'Security Deposit Add',
  p2p_sell_ad: 'P2P Sell Ad',
  binance_deposit: 'Binance Deposit',
  binance_withdraw: 'Binance Withdraw',
  binance_wallet_bonus: 'Binance Wallet Bonus',
  binance_wallet_fee: 'Binance Wallet Fee',
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

  // console.log('transferList ==', transferList);
  

  // ── Fetch ──────────────────────────────────────────────────────
  const fetchTransferList = useCallback(async (page: number) => {
    page === 1 ? setIsDataLoading(true) : setIsFetching(true);

    try {
      const res = await GetTransferListApi({ params: { page } });      
      console.log('transferList == ==', res);

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

  const formatAmount = (r: any) => {
    const amountValue = typeof r.amount === 'string' && r.amount.trim() !== '' ? r.amount : (() => {
      const raw = Number(r.amount_raw ?? r.amount ?? 0);
      const positive = raw >= 0;
      const sign = positive ? '+' : '-';
      const abs = Math.abs(raw).toFixed(2);
      return `${sign}$${abs}`;
    })();

    const amountColor = String(r.amount_color || '').toLowerCase();
    const isNegative = amountColor === 'red' || (!amountColor && String(amountValue).trim().startsWith('-'));

    return (
      <span className={isNegative ? 'amount-negative' : 'amount-positive'}>
        {amountValue}
      </span>
    );
  };

  const getTypeLabel = (type?: string) => {
    const key = (type || '').toLowerCase();
    return typeLabelMap[key] || key.replace(/_/g, ' ').replace(/\b\w/g, (ch) => ch.toUpperCase());
  };

  const [selectedTx, setSelectedTx] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = (tx: any) => {
    setSelectedTx(tx);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedTx(null);
    setIsModalOpen(false);
  };

  const handleModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="transaction-details">
      <h3 className="pb-2">Transaction Details</h3>

      {/* ── Desktop Table ── */}
      <div className="table-responsive d-none d-md-block">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Date &amp; Time</th>
              <th>Type</th>
              <th>Description</th>
              <th>Payment Method</th>
              <th>Amount</th>
              <th>Status</th>
              <th>TX ID</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {isDataLoading && transferList.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-4">Loading...</td>
              </tr>
            ) : transferList.length > 0 ? (
              transferList.map((r: any, index: number) => (
                <tr key={r.id ?? `${index}`}>
                  <td>{slOffset + index + 1}</td>
                  <td>{r.date_time ?? r.date}</td>
                  <td>
                    <div className="d-flex align-items-center">
                      <span>{getTypeLabel(r.case_type || r.type || r.trx_type || 'Transfer')}</span>
                    </div>
                  </td>
                  <td>{r.description}</td>
                  <td>
                    <div className="d-flex align-items-center">
                      {r.payment_method_icon && (
                        <img src={r.payment_method_icon} alt={r.payment_method} className="me-2 bg-light rounded-2 p-1" style={{width:30,height:30}} />
                      )}
                      <span>{r.payment_method ?? '-'}</span>
                    </div>
                  </td>
                  <td>{formatAmount(r)}</td>
                  <td>
                    {String(r.status) == '1' ? (
                      <span className="status-approved">Approved</span>
                    ) : String(r.status) == '2' ? (
                      <span className="status-rejected">Rejected</span>
                    ) : String(r.status) == '3' ? (
                      <span className="status-pending">Pending</span>
                    ) : (
                      <span className="status-unknown">{r.status}</span>
                    )}
                  </td>
                  <td>{r.trx_id ?? '-'}</td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-sm btn-dark"
                      onClick={() => openModal(r)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="text-center py-4">No transaction history found.</td>
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
              key={r.id ?? `${index}`}>
              <TransactionCard
                data={{
                  sl:       slOffset + index + 1,
                  userId:   r.id,
                  userName: r.payment_method || r.trx_id || r.uu_id,
                  type:     getTypeLabel(r.case_type || r.type || 'Transfer'),
                  type_icon: r.type_icon,
                  amount:   r.amount ?? (r.amount_raw ? `${Number(r.amount_raw) >= 0 ? '+' : '-'}$${Math.abs(Number(r.amount_raw)).toFixed(2)}` : '-'),
                  amount_color: Number(r.amount_raw ?? r.amount ?? 0) >= 0 ? 'green' : 'red',
                  time:     r.date_time ?? r.date,
                  status:   Number(r.status) ?? 3,
                  payment_method: r.payment_method,
                  payment_method_icon: r.payment_method_icon,
                  trx_id: r.trx_id,
                  view_url: r.view_url,
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

      {isModalOpen && selectedTx && (
        <div className="rt-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="pm-modal-title">
          <button className="rt-modal-backdrop" type="button" onClick={closeModal} aria-label="Close modal" />

          <div className="bg-light-white rt-modal--lg" style={{ maxWidth: 680, width: '90%', borderRadius: 18, overflow: 'hidden', boxShadow: '0 20px 45px rgba(0,0,0,0.3)' }}>

            <div className="rt-modal-head" style={{ padding: '18px 22px', borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}>
              <h6 className="rt-modal-title" id="pm-modal-title" style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Transaction Details</h6>
              <button type="button" className="rt-modal-x" onClick={closeModal} aria-label="Close" style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.12)', background: 'transparent', color: '#fff' }}>✕</button>
            </div>

            <div className="rt-modal-body" style={{ padding: 20, background: '#0d1826' }}>
              <form onSubmit={handleModalSubmit} noValidate className="ticket-form" style={{ margin: 0 }}>
                <div style={{ display: 'grid', gap: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12 }}>
                    <span style={{ color: '#9aa9c2', fontSize: 13 }}>Transaction ID</span>
                    <strong style={{ color: '#fff', fontSize: 14 }}>{selectedTx.trx_id ?? '-'}</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12 }}>
                    <span style={{ color: '#9aa9c2', fontSize: 13 }}>Amount</span>
                    <div>{formatAmount(selectedTx)}</div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div style={{ padding: '14px 16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12 }}>
                      <div style={{ color: '#9aa9c2', fontSize: 12, marginBottom: 6 }}>Raw Amount</div>
                      <div style={{ color: '#fff', fontWeight: 600 }}>{selectedTx.amount_raw ?? '-'}</div>
                    </div>

                    <div style={{ padding: '14px 16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12 }}>
                      <div style={{ color: '#9aa9c2', fontSize: 12, marginBottom: 6 }}>Status</div>
                      <div>
                        {String(selectedTx.status) == '1' ? (
                          <span className="status-approved">Approved</span>
                        ) : String(selectedTx.status) == '2' ? (
                          <span className="status-rejected">Rejected</span>
                        ) : String(selectedTx.status) == '3' ? (
                          <span className="status-pending">Pending</span>
                        ) : (
                          <span className="status-unknown">{selectedTx.status}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div style={{ padding: '14px 16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12 }}>
                      <div style={{ color: '#9aa9c2', fontSize: 12, marginBottom: 6 }}>Type</div>
                      <div style={{ color: '#fff', fontWeight: 600 }}>{getTypeLabel(selectedTx.case_type || selectedTx.type)}</div>
                    </div>

                    <div style={{ padding: '14px 16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12 }}>
                      <div style={{ color: '#9aa9c2', fontSize: 12, marginBottom: 6 }}>Payment</div>
                      <div style={{ display: 'flex', alignItems: 'center', color: '#fff', fontWeight: 600 }}>
                        {selectedTx.payment_method_icon && (
                          <img className='bg-light rounded-2 p-1' src={selectedTx.payment_method_icon} alt={selectedTx.payment_method} style={{width:20,height:20,marginRight:8}} />
                        )}
                        {selectedTx.payment_method ?? '-'}
                      </div>
                    </div>
                  </div>

                  <div style={{ padding: '14px 16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12 }}>
                    <div style={{ color: '#9aa9c2', fontSize: 12, marginBottom: 6 }}>Date &amp; Time</div>
                    <div style={{ color: '#fff', fontWeight: 600 }}>{selectedTx.date_time ?? selectedTx.date}</div>
                  </div>

                  <div style={{ padding: '14px 16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12 }}>
                    <div style={{ color: '#9aa9c2', fontSize: 12, marginBottom: 6 }}>Description</div>
                    <div style={{ color: '#fff', lineHeight: 1.6 }}>{selectedTx.description}</div>
                  </div>
                </div>
              </form>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}