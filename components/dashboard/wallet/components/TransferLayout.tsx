import React, { useCallback, useEffect, useState } from 'react';
import type { TransferRow } from '../types';
import StatusTd from './StatusTd';
import { TransactionCard } from './TransactionCard';
import { GLOBAL_CONFIG } from '@/app/config';
import { GenerateEVoucherApi, GetEVoucherListApi, GetUserApi, GetWalletTransferListApi, RedeemEVoucherApi, WalletTransferApi } from '@/app/api/p2p';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import PaginationControls from '../../PaginationControls';
import { useAuth } from '@/hooks/useAuth';

const statusMap: Record<string, 1 | 2> = {
  Pending: 2,
  Confirmed: 1,
};

const INITIAL_PAGINATION_STATE = {
    current_page: 1,
    last_page: 1,
    next_page_url: null,
    prev_page_url: null,
    total: 0,
    per_page: 10,
};

const INITIAL_FILTER_STATE = {
    type: 'deposit',
    page: 1
};

const INITIAL_FORM_STATE = {
    amount: 25,
    receiverId: '',
    receiverName: '',
    receiverEmail: '',
    receiverPhone: '',
};

export default function TransferLayout({
  amountPreset,
  selectedAmount,
  setSelectedAmount,
  transferRows,
}: {
  amountPreset: number[];
  selectedAmount: number;
  setSelectedAmount: (v: number) => void;
  transferRows: TransferRow[];
}) {

  const [generateCode, setGenerateCode] = useState<boolean>(false);
  const [evoucherCode, setEVoucherCode] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [activeTab, setActiveTab] = useState('transfer-history');  
  const finalAmount = selectedAmount + (selectedAmount * GLOBAL_CONFIG.transferCommission / 100);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const { amount, receiverId, receiverName, receiverEmail, receiverPhone } = formData;
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { user } = useAuth();  

  useEffect(() => {
    setFormData(INITIAL_FORM_STATE);
    setFetchError(null);
  }, [selectedAmount]);

  useEffect(() => {
    if (!receiverId || receiverId.length < 3) {
      setFetchError(null);
      return;
    }

    const fetchUser = async () => {
      setIsLoading(true);
      setFetchError(null);

      try {
          const response = await GetUserApi({ userId: receiverId });

          if (response.error === false && response.data) {
              setFormData((prev) => ({
                  ...prev,
                  receiverName: response.data.name,
                  receiverEmail: response.data.email,
                  receiverPhone: response.data.phone,
              }));
          } else {
              setFetchError(response.message || 'User not found.');
              toast.error(response.message || 'User not found.');
              setFormData((prev) => ({
                  ...prev,
                  receiverName: '',
                  receiverEmail: '',
                  receiverPhone: '',
              }));
          }
      } catch (error) {
          toast.error(error instanceof Error ? error.message : 'Error connecting to the user service.');
          setFormData((prev) => ({
              ...prev,
              receiverName: '',
              receiverEmail: '',
              receiverPhone: '',
          }));
          setFetchError('Error connecting to the user service.');
      } finally {
          setIsLoading(false);
      }
  };

  const debounceTimer = setTimeout(fetchUser, 400);
  return () => clearTimeout(debounceTimer);
    
  }, [formData.receiverId]);


  // Handler for the final form submission
  const handlePurchase = async () => {
    setIsLoading(true);

    // validation
    if (!receiverName && amount < 20 && !receiverId) {
        toast.error('Please enter a valid receiver user ID and ensure amount is at least $20.');
        setIsLoading(false);
        return;
    }

    const transferData = { receiver_id: receiverId, amount: finalAmount };

    try {
        const response = await WalletTransferApi(transferData);

        if (!response?.error) {
            toast.success(response.message || 'Transfer successful!');
            setFormData(INITIAL_FORM_STATE);
        } else {
            toast.error(response.message || 'Transfer failed. Please try again.');
        }
    } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Error connecting to the transfer service.');
    } finally {
        setIsLoading(false);
    }
  };

  const submitForm = async () => {
    const result = await Swal.fire({
      title: "Transfer Confirmation",
      icon: "info",
      html: `You are about to transfer <strong>$${finalAmount}</strong> to <strong>${receiverName}</strong> ID: <strong>${receiverId}</strong>.`,
      showCloseButton: true,
      showCancelButton: true,
      focusConfirm: false,
      confirmButtonAriaLabel: "Thumbs up, great!",
      cancelButtonText: `No, Cancel!`,
      confirmButtonText: `Yes, Transfer!`,
      cancelButtonAriaLabel: "Thumbs down"
    });

    if (result.isConfirmed) {
      await handlePurchase();
    }
  };

  // =============================== load trasfer data list start  ====================================
  const [transferList, setTransferList] = useState([]);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(false);

  // Filter state (type is dynamic based on prop, page is managed)
  const [filterParams, setFilterParams] = useState({
      ...INITIAL_FILTER_STATE,
  });

  // Pagination state
  const [pagination, setPagination] = useState(INITIAL_PAGINATION_STATE);

  const fetchTransferList = useCallback(async (params : any) => {
      try {
          // Set both loading states
          setIsPageLoading(true);
          setIsDataLoading(true);

          const res = await GetWalletTransferListApi({
              params: params
          });

          const resData = res?.data;
          setTransferList(resData?.data || []);

          // Safely update pagination state
          setPagination(prev => ({
              ...prev,
              current_page: resData?.current_page ?? 1,
              last_page: resData?.last_page ?? 1,
              next_page_url: resData?.next_page_url ?? null,
              prev_page_url: resData?.prev_page_url ?? null,
              total: resData?.total ?? 0,
              per_page: resData?.per_page ?? prev.per_page,
          }));

      } catch (error) {
          console.error(`Error fetching wallet transfers:`, error);
          // Clear list on error
          setTransferList([]);
          setPagination(INITIAL_PAGINATION_STATE);
      } finally {
          setIsPageLoading(false);
          setIsDataLoading(false);
      }
  }, []);

  const handlePageChange = (newPage: number) => {
      if (newPage >= 1 && newPage <= pagination.last_page) {
          const newFilterParams = { ...filterParams, page: newPage };
          setFilterParams(newFilterParams);
          fetchTransferList(newFilterParams);
      }
  };

  useEffect(() => {
      // When component mounts, reset to page 1 and fetch data.
      const initialLoadParams = { type: INITIAL_FILTER_STATE.type, page: 1 };

      setFilterParams(initialLoadParams);
      fetchTransferList(initialLoadParams);
      getEvoucherList();

  }, [fetchTransferList]);

  // Determine the loading state for the table view
  // const showLoading = isDataLoading && transferList.length === 0;
  // =============================== load trasfer data list end  ====================================    

  // ============================== E-Voucher start ===================================
  // ── State ──────────────────────────────────────────────────────
  const [evoucherList, setEvoucherList]   = useState<any[]>([]);
  // const [isDataLoading, setIsDataLoading] = useState(false);
  // const [isPageLoading, setIsPageLoading] = useState(false);
  // const [pagination, setPagination]       = useState<any>(null);
  // const [filterParams, setFilterParams]   = useState({ page: 1 });

  // ── Fetch ───────────────────────────────────────────────────────
  const getEvoucherList = async (page = 1, isPageChange = false) => {
      isPageChange ? setIsPageLoading(true) : setIsDataLoading(true);

      try {
          const response = await GetEVoucherListApi({ page });

          if (!response?.error) {
              setEvoucherList(response.transfers || []);
              setPagination(response.pagination || null);
          } else {
              toast.error(response.message || 'Failed to load E-Voucher history.');
          }
      } catch (error) {
          toast.error('Error loading E-Voucher history.');
      } finally {
          setIsDataLoading(false);
          setIsPageLoading(false);
      }
  };

  // const handlePageChange = (page: number) => {
  //     setFilterParams((prev) => ({ ...prev, page }));
  //     getEvoucherList(page, true);
  // };

  // ── On mount ────────────────────────────────────────────────────
  useEffect(() => {
      getEvoucherList();
  }, []);

  const generateCodeConfirm = async () => {
    const result = await Swal.fire({
      title: "Generate E-Voucher Confirmation",
      icon: "info",
      html: `You are about to generate an E-Voucher worth <strong>$${selectedAmount}</strong>. Do you want to proceed?`,
      showCloseButton: true,
      showCancelButton: true,
      focusConfirm: false,
      confirmButtonAriaLabel: "Yes, generate it!",
      cancelButtonText: `No, Cancel!`,
      confirmButtonText: `Yes, Generate!`,
      cancelButtonAriaLabel: "No, cancel"
    });

    if (!result.isConfirmed) return;  // early return, cleaner

    try {
      const response = await GenerateEVoucherApi({ amount: finalAmount });

      if (!response?.error) {
        toast.success(response.message || 'E-Voucher generated successfully!');
        setEVoucherCode(response.transfer?.code || '');
        setGenerateCode(true);
        getEvoucherList();
      } else {
        toast.error(response.message || 'Failed to generate E-Voucher. Please try again.');
        setEVoucherCode('');
        setGenerateCode(false);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error generating E-Voucher.');
      setEVoucherCode('');
      setGenerateCode(false);
    }
  };

  const submitEVoucherCode = async (code: string) => {
    
    if (!code || code.trim() === "") {
      toast.error("Please enter a valid E-Voucher code");
      return;
    }

    try {
      const response = await RedeemEVoucherApi({ code: code.trim() });
      
      if (!response?.error) {
        toast.success(response.message || 'E-Voucher redeemed successfully!');
        getEvoucherList();
        setCode('');
      } else {
        toast.error(response.message || 'Failed to redeem E-Voucher.');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error connecting to service.');
    }
  };

  // evoucherList, setEVoucherList 

  // ============================== E-Voucher end ===================================

  return (
    <>
      <div className="transfer-wrapper">
        <div className="transfer-card p-3 p-md-4">
          <h2>Transfer Details</h2>

          <div className="amount-head">
            <span>Amount</span>
            <small>Instant | Min:25 | Max:400</small>
          </div>

          <div className="amount-select">
            {amountPreset.map((n) => (
              <button
                key={`t1-${n}`}
                type="button"
                // className={selectedAmount === n ? 'active' : ''}
                className={`${selectedAmount === n  ? 'active' : ''} d-none d-md-block` }
                onClick={() => setSelectedAmount(n)}
              >
                {n}
              </button>
            ))}
          </div>

          <div className="input-box">
            <input
              type="text"
              value={String(selectedAmount)}
              onChange={(e) => {
                const v = Number(e.target.value.replace(/[^\d.]/g, ''));
                if (!Number.isNaN(v)) setSelectedAmount(v);
              }}
            />
            <span>USD</span>
          </div>
          {selectedAmount > 0 && (<div className='text-warning mt-4'>
              Transfer Amount (Fee {GLOBAL_CONFIG.transferCommission}%): $ {finalAmount}
          </div>)}

          <label>Receiver User ID</label>
          <div className="input-box">
            <input type="text" placeholder="Your user ID here" value={formData?.receiverId || ''} onChange={(e) => setFormData({...formData, receiverId: e.target.value})} />
          </div>

          <label>User Name</label>
          <div className="input-box">
            <input disabled type="text" placeholder="Your user name here" value={formData?.receiverName || ''} />
          </div>

          <button type="button"  className="confirm-btn" onClick={submitForm} disabled={isLoading || !receiverName || amount < 20}>
            Confirm Transfer {finalAmount} USD
          </button>
        </div>

        <div className="transfer-card p-3 p-md-4">
          <h2>Transfer E-Voucher</h2>

          <div className="amount-head">
            <span>Amount</span>
            <small>Instant | Min:25 | Max:400</small>
          </div>

          <div className="amount-select">
            {amountPreset.map((n) => (
              <button
                key={`t2-${n}`}
                type="button"
                // className={selectedAmount === n ? 'active' : ''}
                className={`${selectedAmount === n  ? 'active' : ''} d-none d-md-block` }
                onClick={() => setSelectedAmount(n)}
              >
                {n}
              </button>
            ))}
          </div>

          <div className="input-box">
            <input
              type="text"
              value={String(selectedAmount)}
              onChange={(e) => {
                const v = Number(e.target.value.replace(/[^\d.]/g, ''));
                if (!Number.isNaN(v)) setSelectedAmount(v);
              }}
            />
            <span>USD</span>
          </div>

          {selectedAmount > 0 && (<div className='text-warning mt-4'>
              Transfer Amount (Fee {GLOBAL_CONFIG.transferCommission}%): $ {finalAmount}
          </div>)}

          {generateCode && (
            <div className="input-box mt-3 d-flex align-items-center">
              <input 
              disabled
              type="text"
              value={evoucherCode}
              readOnly
              />
              <button
              type="button"
              className="text-xl ms-2"
              onClick={async () => {
                if (!evoucherCode) {
                toast.error('No code to copy');
                return;
                }
                try {
                if (navigator.clipboard && navigator.clipboard.writeText) {
                  await navigator.clipboard.writeText(evoucherCode);
                } else {
                  const el = document.createElement('textarea');
                  el.value = evoucherCode;
                  document.body.appendChild(el);
                  el.select();
                  document.execCommand('copy');
                  document.body.removeChild(el);
                }
                toast.success('E-Voucher code copied to clipboard');
                } catch {
                toast.error('Failed to copy code');
                }
              }}
              >
              <i className="ti ti-copy"></i>
              </button>
            </div>
          )}

          <button type="button" className="confirm-btn" onClick={generateCodeConfirm}>
            Generate Code
          </button>

          <div className="p-3 p-md-4 border border-dark-light rounded-4 bg-dark mt-5">
            <h2>Submit E-Voucher</h2>

            <label htmlFor="">Submit Code</label>
            <div className="input-box">
              <input placeholder='Your Code'
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </div>

            <button type="button" className="confirm-btn" onClick={()=>submitEVoucherCode(code)}>
              Submit Code
            </button>
          </div>
        </div>
      </div>

      <div className='wallet-main-wrapprr wallet-paymet-box-items mt-4 pt-3'>
        <div className="wallet-tab-buttons mb-0 mt-4">
           <div className="wallet-tab-buttons mb-0">
              <button
                type="button"
                className={`wallet-tab-btn py-2 ${activeTab == 'tranfer-history' ? 'active' : ''}`}
                onClick={() => setActiveTab('tranfer-history')}
              >
                Tranfer History
              </button>
              <button
                type="button"
                className={`wallet-tab-btn py-2 ${activeTab == 'e-voucher-history' ? 'active' : ''}`}
                onClick={() => setActiveTab('e-voucher-history')}
              >
                E-voucher History
              </button>
            </div>
        </div>
      </div>

      {activeTab != 'e-voucher-history' && (
        <div className="transaction-details">
          <h3 className='pb-3 pb-md-0'>Tranfer History</h3>
          <div className="table-responsive d-none d-md-block">
            <table>
              <thead>
                <tr>
                  <th>Sl #</th>
                  <th>user ID</th>
                  <th>User Name</th>
                  <th>Transaction type</th>
                  <th>Amount</th>
                  <th>Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {isDataLoading && transferList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-4">
                      Loading...
                    </td>
                  </tr>
                ) : transferList.length > 0 ? (
                  transferList.map((r: any, index: number) => (
                    <tr key={`${r.sl}-${r.userId}-${r.type}`}>
                      <td>{index + 1}</td>
                      <td>{r.uu_id}</td>
                      <td>{r.type == 'deposit' ? r.sender_name : r.receiver_name}</td>
                      <td>{r.is_sender ? 'Send' : 'Receive'}</td>
                      <td>$ {Number(r.price).toFixed(2)} {r.fee > 0 ? `(Fee ${r.fee})` : ''}</td>
                      <td>{r.date}</td>
                      <StatusTd status={r.status} />
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-4">
                      No transfer history found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="row g-4 d-md-none">
            {isDataLoading && transferList.length === 0 ? (
              <div className="col-12 text-center py-4">Loading...</div>
            ) : transferList.length > 0 ? (
              transferList.map((transaction: any, index: number) => (
                <div
                  className="col-12 col-sm-6 col-lg-4 col-xl-3 p-0"
                  key={`${index + 1}-${transaction.uu_id}`}
                >
                  <TransactionCard
                    data={{
                      sl: index + 1,
                      userId: transaction.uu_id,
                      userName: transaction.type === 'deposit' ? transaction.sender_name : transaction.receiver_name,
                      type: transaction.is_sender ? 'Send' : 'Receive',
                      amount: `$ ${Number(transaction.price).toFixed(2)}${transaction.fee > 0 ? ` (Fee ${transaction.fee})` : ''}`,
                      time: transaction.date,
                      status: transaction.status,
                    }}
                  />
                </div>
              ))
            ) : (
              <div className="col-12 text-center py-4">No transfer history found.</div>
            )}
          </div>

          {/* Pagination Controls */}
            {pagination.total > 0 && (
              <PaginationControls
                pagination={pagination}
                currentPage={filterParams.page}
                pageLoading={isPageLoading}
                onPageChange={handlePageChange}
              />
            )}
        </div>
      )}

      {activeTab == 'e-voucher-history' && (
        // ── Table + Cards ───────────────────────────────────────────────
        <div className="transaction-details">
            <h3 className="pb-3 pb-md-0">E-voucher History</h3>

            {/* Desktop Table */}
            <div className="table-responsive d-none d-md-block">
                <table>
                    <thead>
                        <tr>
                            <th>Sl #</th>
                            <th>E-voucher Code</th>
                            <th>Transaction Type</th>
                            <th>Amount</th>
                            <th>Time</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isDataLoading && evoucherList.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="text-center py-4">Loading...</td>
                            </tr>
                        ) : evoucherList.length > 0 ? (
                            evoucherList.map((r: any, index: number) => (
                                <tr key={`${r.id}-${r.code}`}>
                                    <td>{((filterParams.page - 1) * 20) + index + 1}</td>
                                    <td>{r.code}</td>
                                    <td>{r.create_user_id === user?.id ? 'Send' : 'Receive'}</td>
                                    <td>$ {Number(r.amount).toFixed(2)}</td>
                                    <td>
                                      {new Date(r.created_at).toLocaleString('en-US', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: '2-digit',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        hour12: true,
                                      })}
                                    </td>
                                    <td>
                                      {r.status === 'completed' ? (
                                        <span className="status-confirmed">Completed</span>
                                      ) : (
                                        <span className="status-pending">Pending</span>
                                      )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="text-center py-4">No E-Voucher history found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

          {/* Mobile Cards */}
          <div className="row g-4 d-md-none">
            {isDataLoading && evoucherList.length === 0 ? (
                <div className="col-12 text-center py-4">Loading...</div>
            ) : evoucherList.length > 0 ? (
                evoucherList.map((r: any, index: number) => (
                    <div
                        className="col-12 col-sm-6 col-lg-4 col-xl-3 p-0"
                        key={`${r.id}-${r.code}`}
                    >
                        <TransactionCard
                            data={{
                                sl: ((filterParams.page - 1) * 20) + index + 1,
                                userId: r.code,                                          // E-voucher code as ID
                                userName: r.create_user_id === user?.id ? 'Send' : 'Receive',
                                type: r.create_user_id === user?.id ? 'Send' : 'Receive',
                                amount: `$ ${Number(r.amount).toFixed(2)}`,
                                time: r.created_at,
                                status: r.status === 'completed' ? 1 : 2,
                            }}
                        />
                    </div>
                ))
            ) : (
                <div className="col-12 text-center py-4">No E-Voucher history found.</div>
            )}
          </div>

            {/* Pagination */}
            {pagination && (
              <PaginationControls
                pagination={pagination}
                currentPage={filterParams.page}
                pageLoading={isPageLoading}
                onPageChange={handlePageChange}
              />
            )}
      </div>
      )}

    </>
  );
}