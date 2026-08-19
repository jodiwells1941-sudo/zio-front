"use client";

import React from "react";

const stats = [
  {
    title: "Total Balance",
    value: "2,450.75 USDT",
    sub: "≈ 3,00,000.00 BDT",
    icon: "fa-solid fa-wallet",
    type: "purple",
  },
  {
    title: "Total Earnings (2%)",
    value: "1,285.50 USDT",
    sub: "≈ 1,57,200.00 BDT",
    growth: "+15.42%",
    icon: "fa-solid fa-chart-line",
    type: "green",
  },
  {
    title: "Completed Orders",
    value: "642",
    growth: "+18.35%",
    icon: "fa-solid fa-circle-check",
    type: "orange",
  },
  {
    title: "Success Rate",
    value: "98.42%",
    growth: "+2.18%",
    icon: "fa-solid fa-chart-pie",
    type: "blue",
  },
  {
    title: "Security Deposit",
    value: "350.50 USDT",
    sub: "Locked",
    icon: "fa-solid fa-shield-halved",
    type: "purple",
  },
];

const quickActions = [
  {
    title: "Create New Ad",
    text: "Start new advertisement",
    icon: "fa-solid fa-rectangle-ad",
  },
  {
    title: "My Advertisements",
    text: "Manage all your ads",
    icon: "fa-solid fa-gift",
  },
  {
    title: "Security Deposit",
    text: "Manage deposit",
    icon: "fa-solid fa-shield-halved",
  },
  {
    title: "Earnings & Commission",
    text: "View earnings",
    icon: "fa-solid fa-chart-line",
  },
  {
    title: "Payout",
    text: "Withdraw earnings",
    icon: "fa-solid fa-wallet",
  },
  {
    title: "Verification / KYC",
    text: "Manage verification",
    icon: "fa-solid fa-user-shield",
  },
];

const orders = [
  {
    id: "ORD789123",
    type: "USDT",
    side: "Buy",
    amount: "1,000.00 USDT",
    price: "120.25 BDT",
    earning: "24.05 USDT",
    date: "06 May 2024, 10:35 AM",
  },
  {
    id: "ORD789122",
    type: "USDT",
    side: "Sell",
    amount: "800.00 USDT",
    price: "120.50 BDT",
    earning: "19.28 USDT",
    date: "06 May 2024, 09:15 AM",
  },
  {
    id: "ORD789121",
    type: "USDT",
    side: "Buy",
    amount: "500.00 USDT",
    price: "120.10 BDT",
    earning: "12.01 USDT",
    date: "05 May 2024, 11:20 PM",
  },
  {
    id: "ORD789120",
    type: "USDT",
    side: "Sell",
    amount: "650.00 USDT",
    price: "119.90 BDT",
    earning: "15.59 USDT",
    date: "05 May 2024, 08:45 PM",
  },
  {
    id: "ORD789119",
    type: "USDT",
    side: "Buy",
    amount: "300.00 USDT",
    price: "120.30 BDT",
    earning: "7.22 USDT",
    date: "05 May 2024, 07:30 PM",
  },
];

export default function MerchantDashboard() {
  return (
    <section className="merchant-dashboard rounded">

      {/* Dashboard Header */}
      <div className="dashboard-header">
        <div className="dashboard-brand">
          <div className="dashboard-brand-icon">
            <i className="fa-solid fa-store" />
          </div>

          <div>
            <h5>Merchant Center Dashboard</h5>
            <p>{"Welcome back! Here's your business overview."}</p>
          </div>
        </div>

        <button className="dashboard-date">
          <i className="fa-regular fa-calendar" />
          Last 30 Days
          <i className="fa-solid fa-chevron-down" />
        </button>
      </div>

      {/* Stats */}
      <div className="row g-3 merchant-stats">
        {stats.map((stat) => (
          <div
            className="col-12 col-sm-6 col-lg"
            key={stat.title}
          >
            <div className={`stat-card ${stat.type}`}>
              <div className="stat-title">
                {stat.title}

                {stat.title.includes("Earnings") && (
                  <i className="fa-regular fa-circle-question" />
                )}
              </div>

              <div className="stat-value">
                {stat.value}
              </div>

              <div className="stat-bottom">
                <span>{stat.sub}</span>

                {stat.growth && (
                  <span className="stat-growth">
                    {stat.growth}
                  </span>
                )}

                {!stat.growth && (
                  <i className="fa-solid fa-chevron-right" />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main overview */}
      <div className="row g-3 dashboard-middle">

        {/* Earnings chart */}
        <div className="col-12 col-xl-7">
          <div className="dashboard-card earnings-card">
            <div className="card-heading">
              <h3>
                Earnings Overview
                <i className="fa-regular fa-circle-question" />
              </h3>

              <button className="small-select">
                30 Days
                <i className="fa-solid fa-chevron-down" />
              </button>
            </div>

            <div className="chart-legend">
              <span>
                <b className="legend-purple" />
                Commission Earnings (2%)
              </span>

              <span>
                <b className="legend-yellow" />
                Order Volume (USDT)
              </span>
            </div>

            <div className="fake-chart">
              <div className="chart-y-labels">
                <span>200</span>
                <span>160</span>
                <span>120</span>
                <span>80</span>
                <span>40</span>
                <span>0</span>
              </div>

              <div className="chart-content">
                <div className="chart-grid">
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                </div>

                <div className="chart-bars">
                  {[
                    35, 65, 50, 40, 42, 75, 58, 105,
                    120, 70, 82, 32, 48, 75, 90, 130,
                    62, 50, 42, 70, 82, 95, 60, 110,
                    75, 48, 55, 78, 100, 55, 35, 80,
                  ].map((height, index) => (
                    <div
                      key={index}
                      className="chart-bar"
                      style={{ height: `${height}px` }}
                    />
                  ))}
                </div>

                <div className="chart-line">
                  <span className="line-point p1" />
                  <span className="line-point p2" />
                  <span className="line-point p3" />
                  <span className="line-point p4" />
                  <span className="line-point p5" />
                  <span className="line-point p6" />
                  <span className="line-point p7" />
                  <span className="line-point p8" />
                </div>

                <div className="chart-dates">
                  <span>May 02</span>
                  <span>May 06</span>
                  <span>May 10</span>
                  <span>May 14</span>
                  <span>May 18</span>
                  <span>May 22</span>
                  <span>May 26</span>
                  <span>May 30</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order summary */}
        <div className="col-12 col-md-6 col-xl-3">
          <div className="dashboard-card order-summary">
            <div className="card-heading">
              <h3>Order Summary</h3>
            </div>

            <SummaryItem
              icon="fa-solid fa-arrows-rotate"
              type="blue"
              title="Active Orders"
              value="28"
            />

            <SummaryItem
              icon="fa-solid fa-circle-check"
              type="green"
              title="Completed Orders"
              value="642"
            />

            <SummaryItem
              icon="fa-solid fa-circle-xmark"
              type="red"
              title="Cancelled Orders"
              value="12"
            />

            <SummaryItem
              icon="fa-solid fa-scale-balanced"
              type="yellow"
              title="Disputes"
              value="3"
            />
          </div>
        </div>

        {/* Ads */}
        <div className="col-12 col-md-6 col-xl-2">
          <div className="dashboard-card ads-card">
            <div className="card-heading">
              <h3>Advertisement Overview</h3>
            </div>

            <div className="ads-chart">
              <div className="ads-ring">
                <div>
                  <small>Total Ads</small>
                  <strong>24</strong>
                </div>
              </div>
            </div>

            <div className="ads-legend">
              <span>
                <i className="dot purple-dot" />
                Buying Ads
                <strong>12</strong>
              </span>

              <span>
                <i className="dot yellow-dot" />
                Selling Ads
                <strong>12</strong>
              </span>
            </div>

            <button className="manage-ads">
              Manage Ads
            </button>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="dashboard-card quick-actions">
        <div className="card-heading">
          <h3>Quick Actions</h3>
        </div>

        <div className="row g-2">
          {quickActions.map((action) => (
            <div className="col-6 col-md-4 col-xl-2" key={action.title}>
              <button className="quick-action">
                <span>
                  <i className={action.icon} />
                </span>

                <div>
                  <strong>{action.title}</strong>
                  <small>{action.text}</small>
                </div>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Recent orders */}
      <div className="dashboard-card recent-orders">
        <div className="card-heading">
          <h3>Recent Orders</h3>

          <button className="view-all">
            View All Orders
          </button>
        </div>

        <div className="table-responsive">
          <table className="merchant-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Type</th>
                <th>Side</th>
                <th>Amount</th>
                <th>Price</th>
                <th>Earning (2%)</th>
                <th>Status</th>
                <th>Date &amp; Time</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>{order.id}</td>

                  <td>
                    <span className="usdt-icon">
                      ₮
                    </span>
                    {order.type}
                  </td>

                  <td>
                    <span
                      className={
                        order.side === "Buy"
                          ? "buy-text"
                          : "sell-text"
                      }
                    >
                      {order.side}
                    </span>
                  </td>

                  <td>{order.amount}</td>

                  <td>{order.price}</td>

                  <td>
                    <strong className="earning-text">
                      {order.earning}
                    </strong>
                  </td>

                  <td>
                    <span className="completed-badge">
                      Completed
                    </span>
                  </td>

                  <td>{order.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button className="orders-bottom-link">
          View All Orders
        </button>
      </div>
    </section>
  );
}

function SummaryItem({
  icon,
  type,
  title,
  value,
}: {
  icon: string;
  type: string;
  title: string;
  value: string;
}) {
  return (
    <div className="summary-item">
      <div className={`summary-icon ${type}`}>
        <i className={icon} />
      </div>

      <div className="summary-info">
        <span>{title}</span>
        <strong>{value}</strong>
      </div>

      <i className="fa-solid fa-chevron-right summary-arrow" />
    </div>
  );
}