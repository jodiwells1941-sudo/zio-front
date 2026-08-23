"use client";

import React, { useMemo, useState } from "react";

type CommissionRecord = {
  date: string;
  type: "Buy Ads Commission" | "Sell Ads Commission";
  order: string;
  amount: string;
  status: "Completed" | "Pending";
};

const summaryCards = [
  {
    title: "Total Commission Earned",
    value: "245.80",
    suffix: "USDT",
    icon: "fa-solid fa-dollar-sign",
    type: "purple",
    footer: "↗ 18.6% vs Apr 2025",
    footerType: "success",
  },
  {
    title: "Pending Earnings",
    value: "32.40",
    suffix: "USDT",
    icon: "fa-regular fa-clock",
    type: "purple",
    footer: "Will be released on next settlement",
    footerType: "muted",
  },
  {
    title: "This Month Payout",
    value: "213.40",
    suffix: "USDT",
    icon: "fa-solid fa-wallet",
    type: "purple",
    footer: "↗ 15.2% vs Apr 2025",
    footerType: "success",
  },
  {
    title: "Total Payout",
    value: "1,245.60",
    suffix: "USDT",
    icon: "fa-solid fa-building-columns",
    type: "purple",
    footer: "All time total payout",
    footerType: "muted",
  },
  {
    title: "Available Balance",
    value: "213.40",
    suffix: "USDT",
    icon: "fa-solid fa-money-check-dollar",
    type: "purple",
    footer: "Ready to withdraw",
    footerType: "success",
  },
];

const commissionRecords: CommissionRecord[] = [
  {
    date: "31 May 2025, 09:45 PM",
    type: "Buy Ads Commission",
    order: "Order #OD250531000125",
    amount: "12.30",
    status: "Completed",
  },
  {
    date: "31 May 2025, 08:30 PM",
    type: "Sell Ads Commission",
    order: "Order #OD250531000124",
    amount: "15.60",
    status: "Completed",
  },
  {
    date: "31 May 2025, 07:10 PM",
    type: "Buy Ads Commission",
    order: "Order #OD250531000123",
    amount: "9.80",
    status: "Completed",
  },
  {
    date: "31 May 2025, 06:05 PM",
    type: "Sell Ads Commission",
    order: "Order #OD250531000122",
    amount: "11.20",
    status: "Completed",
  },
  {
    date: "31 May 2025, 05:15 PM",
    type: "Buy Ads Commission",
    order: "Order #OD250531000121",
    amount: "8.90",
    status: "Pending",
  },
  {
    date: "31 May 2025, 04:40 PM",
    type: "Sell Ads Commission",
    order: "Order #OD250531000120",
    amount: "10.60",
    status: "Pending",
  },
  {
    date: "31 May 2025, 03:22 PM",
    type: "Buy Ads Commission",
    order: "Order #OD250531000119",
    amount: "7.70",
    status: "Completed",
  },
];

const chartData = [
  22, 38, 34, 51, 29, 37, 42, 48, 40, 52,
  45, 39, 49, 43, 55, 47, 58, 41, 53, 56,
  50, 61, 57, 64,
];

const payoutData = [
  15, 25, 21, 36, 17, 13, 22, 19, 17, 18,
  27, 32, 25, 22, 19, 31, 20, 26, 35, 32,
  34, 39, 31, 34,
];

const tabs = [
  "Overview",
  "Commission Breakdown",
  "Payout History",
  "Settlement History",
];

export default function MerchantCommissionEarnings() {
  const [activeTab, setActiveTab] = useState("Overview");

  const commissionPoints = useMemo(
    () => createChartPoints(chartData),
    []
  );

  const payoutPoints = useMemo(
    () => createChartPoints(payoutData),
    []
  );

  return (
    <section className="merchant-earnings-page">

      {/* =========================================
          PAGE HEADER
      ========================================= */}
      <div className="earnings-page-header">
        <div>
          <h1>Merchant Commission &amp; Earnings</h1>

          <p>
            Track your commissions, earnings and payouts in one place.
          </p>
        </div>

        <div className="earnings-header-actions">
          <button className="earnings-date-picker">
            <span>01 May 2025 - 31 May 2025</span>
            <i className="fa-regular fa-calendar" />
          </button>

          <button className="download-report-btn">
            <i className="fa-solid fa-download" />
            Download Report
          </button>
        </div>
      </div>

      {/* =========================================
          SUMMARY CARDS
      ========================================= */}
      <div className="row g-2 g-lg-3 earnings-summary-row">
        {summaryCards.map((card) => (
          <div
            className="col-12 col-sm-6 col-xl"
            key={card.title}
          >
            <div className="earnings-summary-card">

              <div className="earnings-summary-top">
                <span>{card.title}</span>

                <div className={`earnings-summary-icon ${card.type}`}>
                  <i className={card.icon} />
                </div>
              </div>

              <div className="earnings-summary-value">
                <strong>{card.value}</strong>
                <span>{card.suffix}</span>
              </div>

              <div
                className={`earnings-summary-footer ${card.footerType}`}
              >
                {card.footer}
              </div>

            </div>
          </div>
        ))}
      </div>

      {/* =========================================
          TABS
      ========================================= */}
      <div className="earnings-tabs">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            className={activeTab === tab ? "active" : ""}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Overview" ? (
        <>
          {/* =========================================
              CHART + COMMISSION TYPE
          ========================================= */}
          <div className="row g-3 earnings-chart-row">

            {/* Earnings Chart */}
            <div className="col-12 col-xl-7">
              <div className="earnings-panel earnings-chart-panel">

                <div className="earnings-panel-header">
                  <h2>Earnings Overview</h2>

                  <button className="chart-filter">
                    Daily
                    <i className="fa-solid fa-chevron-down" />
                  </button>
                </div>

                <div className="chart-legends">
                  <span>
                    <i className="legend-box commission" />
                    Total Commission (USDT)
                  </span>

                  <span>
                    <i className="legend-box payout" />
                    Payout (USDT)
                  </span>
                </div>

                <div className="earnings-line-chart">

                  <div className="chart-y-axis">
                    <span>60</span>
                    <span>45</span>
                    <span>30</span>
                    <span>15</span>
                    <span>0</span>
                  </div>

                  <div className="chart-svg-wrapper">

                    <svg
                      viewBox="0 0 720 250"
                      preserveAspectRatio="none"
                      className="earnings-svg"
                    >
                      {/* Grid */}
                      <line x1="0" y1="20" x2="720" y2="20" />
                      <line x1="0" y1="70" x2="720" y2="70" />
                      <line x1="0" y1="120" x2="720" y2="120" />
                      <line x1="0" y1="170" x2="720" y2="170" />
                      <line x1="0" y1="220" x2="720" y2="220" />

                      {/* Commission fill */}
                      <polygon
                        className="commission-area"
                        points={`0,220 ${commissionPoints} 720,220`}
                      />

                      {/* Payout fill */}
                      <polygon
                        className="payout-area"
                        points={`0,220 ${payoutPoints} 720,220`}
                      />

                      {/* Commission line */}
                      <polyline
                        className="commission-line"
                        points={commissionPoints}
                      />

                      {/* Payout line */}
                      <polyline
                        className="payout-line"
                        points={payoutPoints}
                      />

                      {/* Commission points */}
                      {getPointObjects(chartData).map((point, index) => (
                        <circle
                          key={`commission-${index}`}
                          className="commission-point"
                          cx={point.x}
                          cy={point.y}
                          r="4"
                        />
                      ))}

                      {/* Payout points */}
                      {getPointObjects(payoutData).map((point, index) => (
                        <circle
                          key={`payout-${index}`}
                          className="payout-point"
                          cx={point.x}
                          cy={point.y}
                          r="3.5"
                        />
                      ))}
                    </svg>

                    <div className="chart-x-axis">
                      <span>May 01</span>
                      <span>May 06</span>
                      <span>May 11</span>
                      <span>May 16</span>
                      <span>May 21</span>
                      <span>May 26</span>
                      <span>May 31</span>
                    </div>

                  </div>
                </div>
              </div>
            </div>

            {/* Commission by Type */}
            <div className="col-12 col-xl-5">
              <div className="earnings-panel commission-type-panel">

                <div className="earnings-panel-header">
                  <h2>Commission by Type</h2>
                </div>

                <div className="commission-type-content">

                  <div className="commission-donut">
                    <div className="commission-donut-inner">
                      <strong>245.80</strong>
                      <span>USDT</span>
                      <small>Total</small>
                    </div>
                  </div>

                  <div className="commission-type-list">

                    <div className="commission-type-item">
                      <i className="type-dot buy" />

                      <div>
                        <span>Buy Ads Commission</span>
                        <strong>
                          122.90 USDT
                          <small>(50.0%)</small>
                        </strong>
                      </div>
                    </div>

                    <div className="commission-type-item">
                      <i className="type-dot sell" />

                      <div>
                        <span>Sell Ads Commission</span>
                        <strong>
                          122.90 USDT
                          <small>(50.0%)</small>
                        </strong>
                      </div>
                    </div>

                  </div>

                </div>
              </div>
            </div>
          </div>

          {/* =========================================
              RECORDS + SUMMARY
          ========================================= */}
          <div className="row g-3">

            {/* Recent Records */}
            <div className="col-12 col-xl-8">
              <div className="earnings-panel commission-records-panel">

                <div className="earnings-panel-header">
                  <h2>Recent Commission Records</h2>
                </div>

                <div className="table-responsive">
                  <table className="commission-table">

                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Type</th>
                        <th>Related To</th>
                        <th>Amount (USDT)</th>
                        <th>Status</th>
                      </tr>
                    </thead>

                    <tbody>
                      {commissionRecords.map((record) => (
                        <tr key={record.order}>

                          <td>{record.date}</td>

                          <td>
                            <span
                              className={
                                record.type === "Buy Ads Commission"
                                  ? "buy-type"
                                  : "sell-type"
                              }
                            >
                              {record.type}
                            </span>
                          </td>

                          <td>{record.order}</td>

                          <td>
                            <strong className="commission-amount">
                              {record.amount}
                            </strong>
                          </td>

                          <td>
                            <span
                              className={`commission-status ${
                                record.status === "Completed"
                                  ? "completed"
                                  : "pending"
                              }`}
                            >
                              {record.status}
                            </span>
                          </td>

                        </tr>
                      ))}
                    </tbody>

                  </table>
                </div>

                <button className="view-records-btn">
                  View All Records
                </button>

              </div>
            </div>

            {/* Commission Summary */}
            <div className="col-12 col-xl-4">
              <div className="earnings-panel commission-summary-panel">

                <div className="earnings-panel-header">
                  <h2>Commission Summary</h2>
                </div>

                <div className="summary-list">

                  <div>
                    <span>Buy Ads Commission</span>
                    <strong>122.90 USDT</strong>
                  </div>

                  <div>
                    <span>Sell Ads Commission</span>
                    <strong>122.90 USDT</strong>
                  </div>

                  <div className="summary-total">
                    <span>Total Commission</span>
                    <strong>245.80 USDT</strong>
                  </div>

                </div>

                <div className="next-settlement">
                  <div className="settlement-icon">
                    <i className="fa-regular fa-calendar-days" />
                  </div>

                  <div>
                    <strong>Next Settlement</strong>
                    <span>04 June 2025, 12:00 AM (UTC+6)</span>
                    <small>
                      Earnings will be added to your available balance
                    </small>
                  </div>
                </div>

                <button className="withdraw-earnings-btn">
                  Withdraw Earnings
                  <i className="fa-solid fa-arrow-right" />
                </button>

                <div className="available-balance">
                  Available Balance: <strong>213.40 USDT</strong>
                </div>

              </div>
            </div>

          </div>

          {/* =========================================
              HOW COMMISSION WORKS
          ========================================= */}
          <div className="earnings-panel commission-how-panel">

            <div className="how-commission-text">
              <h2>How Commission Works?</h2>

              <p>
                You will earn 2% commission from Buy ads and 2% from
                Sell ads created by you. Commissions will be calculated
                based on completed orders only.
              </p>
            </div>

            <div className="commission-steps">

              <CommissionStep
                icon="fa-solid fa-store"
                title="User places order"
                text="from your advertisement"
              />

              <span className="commission-step-arrow">
                <i className="fa-solid fa-arrow-right" />
              </span>

              <CommissionStep
                icon="fa-solid fa-shield-halved"
                title="Order completed"
                text="successfully"
              />

              <span className="commission-step-arrow">
                <i className="fa-solid fa-arrow-right" />
              </span>

              <CommissionStep
                icon="fa-solid fa-sack-dollar"
                title="Commission added"
                text="to your earnings"
              />

              <span className="commission-step-arrow">
                <i className="fa-solid fa-arrow-right" />
              </span>

              <CommissionStep
                icon="fa-solid fa-calendar-check"
                title="Settlement & payout"
                text="to your wallet"
              />

            </div>

          </div>
        </>
      ) : (
        <div className="earnings-empty-state">
          <div>
            <i className="fa-solid fa-chart-column" />
          </div>

          <h2>{activeTab}</h2>

          <p>
            Your {activeTab.toLowerCase()} information will appear here.
          </p>
        </div>
      )}

    </section>
  );
}


/* =========================================================
   COMMISSION STEP
========================================================= */

function CommissionStep({
  icon,
  title,
  text,
}: {
  icon: string;
  title: string;
  text: string;
}) {
  return (
    <div className="commission-step">
      <div className="commission-step-icon">
        <i className={icon} />
      </div>

      <div>
        <strong>{title}</strong>
        <span>{text}</span>
      </div>
    </div>
  );
}


/* =========================================================
   CHART HELPERS
========================================================= */

function createChartPoints(data: number[]) {
  return data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * 720;
      const y = 220 - (value / 70) * 200;

      return `${x},${y}`;
    })
    .join(" ");
}

function getPointObjects(data: number[]) {
  return data.map((value, index) => ({
    x: (index / (data.length - 1)) * 720,
    y: 220 - (value / 70) * 200,
  }));
}