"use client";

import {
  getMerchantAccountData,
  getMerchantOrders,
  getMerchantEarningsChart,
  MerchantAccountResponse,
  MerchantOrderRow,
  PaginatedOrders,
  EarningsChartResponse,
} from "@/app/api/merchant";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback, useMemo } from "react";

const quickActions = [
  { title: "Create New Ad", text: "Start new advertisement", icon: "fa-solid fa-rectangle-ad" },
  { title: "My Advertisements", text: "Manage all your ads", icon: "fa-solid fa-gift" },
  { title: "Security Deposit", text: "Manage deposit", icon: "fa-solid fa-shield-halved" },
  { title: "Earnings & Commission", text: "View earnings", icon: "fa-solid fa-chart-line" },
  { title: "Payout", text: "Withdraw earnings", icon: "fa-solid fa-wallet" },
  { title: "Verification / KYC", text: "Manage verification", icon: "fa-solid fa-user-shield" },
];

const MAX_BAR_HEIGHT = 150; // px — must match the chart's plotting-area height in CSS

export default function MerchantDashboard() {
  const router = useRouter();

  // ── Account summary ──────────────────────────────────────────────────
  const [account, setAccount] = useState<MerchantAccountResponse | null>(null);
  const [accountLoading, setAccountLoading] = useState(true);
  const [accountError, setAccountError] = useState<string | null>(null);

  // ── Recent orders (paginated) ────────────────────────────────────────
  const [orders, setOrders] = useState<PaginatedOrders | null>(null);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  // ── Earnings chart ────────────────────────────────────────────────────
  const [chart, setChart] = useState<EarningsChartResponse | null>(null);
  const [chartLoading, setChartLoading] = useState(true);
  const [chartError, setChartError] = useState<string | null>(null);
  const [chartDays, setChartDays] = useState(30);

  useEffect(() => {
    let cancelled = false;
    setAccountLoading(true);
    getMerchantAccountData()
      .then((data) => {
        if (!cancelled) setAccount(data);
      })
      .catch(() => {
        if (!cancelled) setAccountError("Failed to load dashboard data.");
      })
      .finally(() => {
        if (!cancelled) setAccountLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const fetchOrders = useCallback((targetPage: number) => {
    setOrdersLoading(true);
    setOrdersError(null);
    getMerchantOrders({ page: targetPage, per_page: 10 })
      .then((data) => {
        setOrders(data);
        setPage(data.current_page);
      })
      .catch(() => setOrdersError("Failed to load orders."))
      .finally(() => setOrdersLoading(false));
  }, []);

  useEffect(() => {
    fetchOrders(1);
  }, [fetchOrders]);

  const fetchChart = useCallback((days: number) => {
    setChartLoading(true);
    setChartError(null);
    getMerchantEarningsChart(days)
      .then((data) => setChart(data))
      .catch(() => setChartError("Failed to load chart data."))
      .finally(() => setChartLoading(false));
  }, []);

  useEffect(() => {
    fetchChart(chartDays);
  }, [chartDays, fetchChart]);

  const stats = account?.stats;
  const summary = account?.order_summary;
  const ads = account?.ads_overview;

  const statCards = stats
    ? [
        {
          title: "Total Balance",
          value: `${stats.total_balance.usdt.toLocaleString()} USDT`,
          sub: `≈ ${stats.total_balance.bdt.toLocaleString()} BDT`,
          icon: "fa-solid fa-wallet",
          type: "purple",
        },
        {
          title: "Total Earnings (2%)",
          value: `${stats.total_earnings.usdt.toLocaleString()} USDT`,
          sub: `≈ ${stats.total_earnings.bdt.toLocaleString()} BDT`,
          icon: "fa-solid fa-chart-line",
          type: "green",
        },
        {
          title: "Completed Orders",
          value: String(stats.completed_orders),
          icon: "fa-solid fa-circle-check",
          type: "orange",
        },
        {
          title: "Success Rate",
          value: `${stats.success_rate}%`,
          icon: "fa-solid fa-chart-pie",
          type: "blue",
        },
        {
          title: "Security Deposit",
          value: `${stats.security_deposit.toLocaleString()} USDT`,
          sub: "Locked",
          icon: "fa-solid fa-shield-halved",
          type: "purple",
        },
      ]
    : [];

  // Derive bar heights, line-point positions, and sampled x-axis labels
  // from the raw chart series returned by the API.
  const chartComputed = useMemo(() => {
    if (!chart || chart.labels.length === 0) return null;

    const maxVolume = Math.max(...chart.volume, 1);
    const maxEarnings = Math.max(...chart.earnings, 1);

    const bars = chart.volume.map((v) =>
      Math.max(4, Math.round((v / maxVolume) * MAX_BAR_HEIGHT))
    );

    // Vertical position of each line point, as a % from the bottom of the
    // plotting area, scaled against the max earnings value in range.
    const linePoints = chart.earnings.map((e) => Math.round((e / maxEarnings) * 100));

    // Sample ~8 evenly spaced date labels regardless of range length.
    const labelCount = Math.min(8, chart.labels.length);
    const step = Math.max(1, Math.floor(chart.labels.length / labelCount));
    const sampledLabels = chart.labels.filter((_, i) => i % step === 0).slice(0, labelCount);

    return { bars, linePoints, sampledLabels, maxVolume };
  }, [chart]);

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

        <div className="dashboard-header-actions">
          <button
            type="button"
            className="dashboard-profile-btn mb-2"
            onClick={() => router.push("/dashboard/merchant/profile")}
          >
            <i className="fa-solid fa-user" />
            <span>My Profile</span>
            <i className="fa-solid fa-arrow-right profile-arrow" />
          </button>

        </div>
      </div>

      {/* Stats */}
      {accountError && <div className="dashboard-error">{accountError}</div>}

      <div className="row g-3 merchant-stats">
        {accountLoading && !account
          ? Array.from({ length: 5 }).map((_, i) => (
              <div className="col-12 col-sm-6 col-lg" key={i}>
                <div className="stat-card skeleton" />
              </div>
            ))
          : statCards.map((stat) => (
              <div className="col-12 col-sm-6 col-lg" key={stat.title}>
                <div className={`stat-card ${stat.type}`}>
                  <div className="stat-title">
                    {stat.title}
                    {stat.title.includes("Earnings") && (
                      <i className="fa-regular fa-circle-question" />
                    )}
                  </div>

                  <div className="stat-value">{stat.value}</div>

                  <div className="stat-bottom">
                    <span>{stat.sub}</span>
                    <i className="fa-solid fa-chevron-right" />
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

              <select
                className="small-select"
                value={chartDays}
                onChange={(e) => setChartDays(Number(e.target.value))}
              >
                <option value={7}>7 Days</option>
                <option value={30}>30 Days</option>
                <option value={90}>90 Days</option>
              </select>
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

            {chartError && <div className="dashboard-error">{chartError}</div>}

            {chartLoading && !chart ? (
              <div className="fake-chart skeleton" style={{ height: 220 }} />
            ) : chartComputed ? (
              <div className="fake-chart">
                <div className="chart-y-labels">
                  {[1, 0.8, 0.6, 0.4, 0.2, 0].map((frac) => (
                    <span key={frac}>{Math.round(chartComputed.maxVolume * frac)}</span>
                  ))}
                </div>

                <div className="chart-content">
                  <div className="chart-grid">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <span key={i} />
                    ))}
                  </div>

                  <div className="chart-bars">
                    {chartComputed.bars.map((height, index) => (
                      <div
                        key={index}
                        className="chart-bar"
                        style={{ height: `${height}px` }}
                      />
                    ))}
                  </div>

                  <div className="chart-line">
                    {chartComputed.linePoints.map((pct, index) => (
                      <span
                        key={index}
                        className="line-point"
                        style={{
                          left: `${
                            (index / (chartComputed.linePoints.length - 1 || 1)) * 100
                          }%`,
                          bottom: `${pct}%`,
                        }}
                      />
                    ))}
                  </div>

                  <div className="chart-dates">
                    {chartComputed.sampledLabels.map((label, idx) => (
                      <span key={`${label}-${idx}`}>{label}</span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="chart-empty">No data for this range yet.</div>
            )}
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
              value={String(summary?.active ?? "—")}
            />

            <SummaryItem
              icon="fa-solid fa-circle-check"
              type="green"
              title="Completed Orders"
              value={String(summary?.completed ?? "—")}
            />

            <SummaryItem
              icon="fa-solid fa-circle-xmark"
              type="red"
              title="Cancelled Orders"
              value={String(summary?.cancelled ?? "—")}
            />

            <SummaryItem
              icon="fa-solid fa-scale-balanced"
              type="yellow"
              title="Disputes"
              value={String(summary?.disputes ?? "—")}
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
                  <strong>{ads?.total ?? "—"}</strong>
                </div>
              </div>
            </div>

            <div className="ads-legend">
              <span>
                <i className="dot purple-dot" />
                Buying Ads
                <strong>{ads?.buying ?? "—"}</strong>
              </span>

              <span>
                <i className="dot yellow-dot" />
                Selling Ads
                <strong>{ads?.selling ?? "—"}</strong>
              </span>
            </div>

            <button className="manage-ads">Manage Ads</button>
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

      {/* Recent orders — paginated */}
      <div className="dashboard-card recent-orders">
        <div className="card-heading">
          <h3>Recent Orders</h3>

          <button className="view-all" onClick={() => router.push("/dashboard/merchant/orders")}>
            View All Orders
          </button>
        </div>

        {ordersError && <div className="dashboard-error">{ordersError}</div>}

        <div className="table-responsive">
          <table className="merchant-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Type</th>
                <th>Side</th>
                <th>Amount</th>
                <th>Price</th>
                {/* <th>Earning (2%)</th> */}
                <th>Status</th>
                <th>Date &amp; Time</th>
              </tr>
            </thead>

            <tbody>
              {ordersLoading && !orders
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={8}>
                        <div className="skeleton-row" />
                      </td>
                    </tr>
                  ))
                : orders?.data.map((order: MerchantOrderRow) => (
                    <tr key={order.id}>
                      <td>{order.id}</td>

                      <td>
                        <span className="usdt-icon">₮</span>
                        {order.type}
                      </td>

                      <td>
                        <span className={order.side === "Buy" ? "buy-text" : "sell-text"}>
                          {order.side}
                        </span>
                      </td>

                      <td>{order.amount}</td>

                      <td>{order.price}</td>

                      {/* <td>
                        <strong className="earning-text">{order.earning}</strong>
                      </td> */}

                      <td>
                        <span className="completed-badge">{order.status}</span>
                      </td>

                      <td>{order.date}</td>
                    </tr>
                  ))}

              {!ordersLoading && orders && orders.data.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center">
                    No orders yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {orders && orders.last_page > 1 && (
          <div className="orders-pagination">
            <button disabled={page <= 1 || ordersLoading} onClick={() => fetchOrders(page - 1)}>
              <i className="fa-solid fa-chevron-left" /> Prev
            </button>

            <span className="page-indicator">
              Page {orders.current_page} of {orders.last_page} · {orders.total} orders
            </span>

            <button
              disabled={page >= orders.last_page || ordersLoading}
              onClick={() => fetchOrders(page + 1)}
            >
              Next <i className="fa-solid fa-chevron-right" />
            </button>
          </div>
        )}
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