'use client';

import React, { JSX, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import DepositLayout from '@/components/dashboard/wallet/components/DepositLayout';
import P2PLayout from '@/components/dashboard/wallet/components/P2PLayout';
import SummaryGrid from '@/components/dashboard/wallet/components/SummaryGrid';
import TabButton from '@/components/dashboard/wallet/components/TabButton';
import TransactionHistory from '@/components/dashboard/wallet/components/TransactionHistory';
import TransferLayout from '@/components/dashboard/wallet/components/TransferLayout';
import { amountPreset, p2pCards, paymentMethods, transferRows } from '@/components/dashboard/wallet/data';
import { P2PTabKey, TabKey } from '@/components/dashboard/wallet/types';
import WithdrawLayout from '@/components/dashboard/wallet/components/WithdrawLayout';

const VALID_TABS: TabKey[] = ['tab1', 'tab2', 'tab3', 'tab4', 'tab5', 'tab6'];

export default function WalletPage(): JSX.Element {
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState<TabKey>('tab1');
  const [activeP2PTab, setActiveP2PTab] = useState<P2PTabKey>('wallet-balance');
  const [selectedPayment, setSelectedPayment] = useState<string>('BINANCE');
  const [selectedAmount, setSelectedAmount] = useState<number>(25);

  // Read ?tab= from URL and set active tab on mount or param change
  useEffect(() => {
    const tabParam = searchParams.get('tab') as TabKey;
    if (tabParam && VALID_TABS.includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  return (
    <div className="px-xl-0 px-2">
      <div className="wallet-main-wrapprr w-100 pt-2">
        <h4 className="wallet-title d-none d-md-block">
          {activeTab === 'tab1' && 'Balance'}
          {activeTab === 'tab2' && 'Deposit'}
          {activeTab === 'tab3' && 'P2P'}
          {activeTab === 'tab4' && 'Transfer'}
          {activeTab === 'tab5' && 'Withdraw'}
          {activeTab === 'tab6' && 'Transactions History'}
        </h4>
        <div className="d-flex justify-content-between align-items-center d-md-none">
          <h4 className="wallet-title">wallet</h4>
          <div className="form-group-custom ">
            <select
              id="tab"
              className="select-custom form-control-custom w-100"
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value as TabKey)}
            >
              <option value="tab1">Balance</option>
              <option value="tab2">Deposit</option>
              <option value="tab3">P2P</option>
              <option value="tab4">Transfer</option>
              <option value="tab5">Withdraw</option>
              <option value="tab6">Transactions History</option>
            </select>
          </div>
        </div>

        <div className="custom-tabs">
          <div className="d-none d-md-block">
            <div className="tab-buttons">
              <TabButton tab="tab1" label="Balance"              activeTab={activeTab} onChange={setActiveTab} />
              <TabButton tab="tab2" label="Deposit"              activeTab={activeTab} onChange={setActiveTab} />
              <TabButton tab="tab3" label="P2P"                  activeTab={activeTab} onChange={setActiveTab} />
              <TabButton tab="tab4" label="Transfer"             activeTab={activeTab} onChange={setActiveTab} />
              <TabButton tab="tab5" label="Withdraw"             activeTab={activeTab} onChange={setActiveTab} />
              <TabButton tab="tab6" label="Transactions History" activeTab={activeTab} onChange={setActiveTab} />
            </div>
          </div>

          <div className="tab-contents w-100">
            <div className={`tab-content h-screen ${activeTab === 'tab1' ? 'active' : ''}`} id="tab1">
              <SummaryGrid />
            </div>

            <div className={`tab-content ${activeTab === 'tab2' ? 'active' : ''}`} id="tab2">
              <span className="d-none d-md-block"><SummaryGrid /></span>
              <DepositLayout
                title="Deposit Details"
                actionLabel="Deposit"
                paymentMethods={paymentMethods}
                amountPreset={amountPreset}
                selectedPayment={selectedPayment}
                setSelectedPayment={setSelectedPayment}
                selectedAmount={selectedAmount}
                setSelectedAmount={setSelectedAmount}
                setActiveTabValue={setActiveTab}
              />
            </div>

            <div className={`tab-content ${activeTab === 'tab3' ? 'active' : ''}`} id="tab3">
              <span className="d-none d-md-block"><SummaryGrid /></span>
              <P2PLayout activeP2PTab={activeP2PTab} setActiveP2PTab={setActiveP2PTab} />
            </div>

            <div className={`tab-content ${activeTab === 'tab4' ? 'active' : ''}`} id="tab4">
              <span className="d-none d-md-block"><SummaryGrid /></span>
              <TransferLayout
                amountPreset={amountPreset}
                selectedAmount={selectedAmount}
                setSelectedAmount={setSelectedAmount}
                transferRows={transferRows}
              />
            </div>

            <div className={`tab-content ${activeTab === 'tab5' ? 'active' : ''}`} id="tab5">
              <span className="d-none d-md-block"><SummaryGrid /></span>
              <WithdrawLayout
                title="Binance Withdraw Details"
                actionLabel="Withdraw"
                paymentMethods={paymentMethods}
                amountPreset={amountPreset}
                selectedPayment={selectedPayment}
                setSelectedPayment={setSelectedPayment}
                selectedAmount={selectedAmount}
                setSelectedAmount={setSelectedAmount}
                setActiveTabValue={setActiveTab}
              />
            </div>

            <div className={`tab-content ${activeTab === 'tab6' ? 'active' : ''}`} id="tab6">
              <TransactionHistory />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}