/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  getMerchantAppeals,
  getMerchantAppealStats,
  AppealRow,
  AppealStats,
  PaginatedAppeals,
} from "@/app/api/merchant";
import { AppealLineChart, AppealDonutChart, ReasonSlice } from "./AppealCharts";

// Palette cycled onto whatever reasons the backend actually returns —
// real appeal types don't come with a color, so we assign one here.
const REASON_COLORS = ["#fbbf24", "#3b82f6", "#f59e0b", "#fb923c", "#ef4444", "#22c55e", "#06b6d4"];

// Fallback shown only if /appeal-stats fails to load (e.g. before the
// migration has run in an environment) so the dashboard doesn't blank out.
const FALLBACK_STATS: AppealStats = {
  total: 0,
  pending: 0,
  under_review: 0,
  resolved: 0,
  cancelled: 0,
  overview: [],
  reasons: [],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function renderStatusBadge(status?: string) {
  const s = (status || "").toLowerCase();

  if (s.includes("pending") || s.includes("appealed")) {
    return (
      <span className="appeal-status appeal-status-pending">
        <i className="fa-solid fa-clock me-1" />
        Pending
      </span>
    );
  }

  if (s.includes("under") || s.includes("review")) {
    return (
      <span className="appeal-status appeal-status-review">
        <i className="fa-solid fa-magnifying-glass me-1" />
        Under Review
      </span>
    );
  }

  if (
    s.includes("resolved") ||
    s.includes("success") ||
    s.includes("approved")
  ) {
    return (
      <span className="appeal-status appeal-status-resolved">
        <i className="fa-solid fa-circle-check me-1" />
        Resolved
      </span>
    );
  }

  if (s.includes("rejected") || s.includes("cancel")) {
    return (
      <span className="appeal-status appeal-status-rejected">
        <i className="fa-solid fa-circle-xmark me-1" />
        Rejected
      </span>
    );
  }

  return (
    <span className="appeal-status appeal-status-default">
      {status || "Unknown"}
    </span>
  );
}

function normalizeImageUrl(url?: string | null) {
  if (!url) return "/images/avatar/profile-img.png";

  let clean = url.trim();

  const lastHttp = Math.max(clean.lastIndexOf("http://"), clean.lastIndexOf("https://"));
  if (lastHttp > 0) {
    clean = clean.slice(lastHttp);
  }

  if (/^https?:\/\//i.test(clean)) return clean;

  const base = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "").replace(/\/api$/i, "");
  if (!base) return clean;

  return clean.startsWith("/") ? `${base}${clean}` : `${base}/${clean}`;
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

interface StatCardProps {
  icon: string;
  iconBg: string;
  label: string;
  value: number | string;
  footnote?: string;
  footnoteColor?: string;
}

function StatCard({ icon, iconBg, label, value, footnote, footnoteColor }: StatCardProps) {
  return (
    <div className="bg-dark"
      style={{
        // background: "#12141c",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 14,
        padding: "16px 18px",
        flex: "1 1 180px",
        minWidth: 160,
      }}
    >
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: 10,
          background: iconBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 14,
          color: "#fff",
          fontSize: 15,
        }}
      >
        <i className={icon} />
      </div>
      <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 700, color: "#fff", lineHeight: 1.1 }}>{value}</div>
      {footnote && (
        <div style={{ fontSize: 12, color: footnoteColor ?? "rgba(255,255,255,0.4)", marginTop: 6 }}>
          {footnote}
        </div>
      )}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AppealCenterPage() {
  const router = useRouter();
  const [appeals, setAppeals] = useState<AppealRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginatedAppeals | null>(null);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [page, setPage] = useState(1);

  const [stats, setStats] = useState<AppealStats>(FALLBACK_STATS);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(false);

  const fetchStats = async () => {
    setStatsLoading(true);
    setStatsError(false);
    try {
      const res = await getMerchantAppealStats(30);
      setStats(res);
    } catch (err) {
      console.error("Error fetching appeal stats:", err);
      setStats(FALLBACK_STATS);
      setStatsError(true);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchAppeals = async (page = 1) => {
    setLoading(true);
    setError(null);

    try {
      const res = await getMerchantAppeals({
        page,
        per_page: 10,
      });

      setAppeals(res.data.data);
      setPagination(res.data);
      setPage(res.data.current_page);
      setTotalCount(res.total_appeal_count);
    } catch (err: any) {
      console.error("Error fetching appeals:", err);

      setError(err?.message || "Failed to load appeals");
      setAppeals([]);
      setPagination(null);
      setTotalCount(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppeals(1);
    void fetchStats();
  }, []);

  const currentPage = pagination?.current_page || 1;
  const perPage = pagination?.per_page || 10;
  const total = pagination?.total ?? totalCount ?? 0;

  const totalPages = Math.max(1, Math.ceil(total / perPage));

  const reasonSlices: ReasonSlice[] = stats.reasons.map((r, i) => ({
    label: r.label,
    value: r.value,
    color: REASON_COLORS[i % REASON_COLORS.length],
  }));

  const pct = (n: number) => (stats.total > 0 ? ((n / stats.total) * 100).toFixed(1) : "0.0");

  return (
    <div className="appeal-page bg-navy-blue">
      <div className="container-fluid appeal-container">
        <div className="appeal-section">

          {/* =========================================
              HEADER
          ========================================== */}
          <div
            className="appeal-header"
            style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}
          >
            <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: "linear-gradient(135deg,#fbbf24,#f59e0b)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontSize: 18,
                  flexShrink: 0,
                }}
              >
                <i className="fa-solid fa-comments" />
              </div>
              <div>
                <h2 className="appeal-title pt-0 mt-0" style={{ marginBottom: 2 }}>
                  Dispute &amp; Appeal Center
                </h2>
                <p className="appeal-description" style={{ margin: 0 }}>
                  Manage and track all your disputes and appeals in one place.
                </p>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <span className="bg-dark"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 14px",
                  borderRadius: 10,
                  // background: "#171a24",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "rgba(255,255,255,0.75)",
                  fontSize: 13,
                }}
              >
                <i className="fa-regular fa-calendar" />
                Charts: Last 30 Days
              </span>
              <button
                type="button"
                onClick={() => router.push("/dashboard/local-buy-sell/appeal-center/create")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 16px",
                  borderRadius: 10,
                  background: "linear-gradient(135deg,#fbbf24,#f59e0b)",
                  border: "none",
                  color: "#17110a",
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                <i className="fa-solid fa-plus" />
                Create New Appeal
              </button>
            </div>
          </div>

          {statsError && (
            <div className="appeal-error" role="alert">
              <div className="appeal-error-icon"><i className="fa-solid fa-triangle-exclamation" /></div>
              <div className="appeal-error-content"><h5>Unable to load appeal statistics</h5><p>Try loading the dashboard statistics again.</p></div>
              <button type="button" className="appeal-retry-btn" onClick={() => void fetchStats()}>Retry</button>
            </div>
          )}

          {/* =========================================
              STAT CARDS
          ========================================== */}
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", margin: "18px 0" }}>
            <StatCard
              icon="fa-solid fa-comments"
              iconBg="linear-gradient(135deg,#fbbf24,#f59e0b)"
              label="Total Appeals"
              value={statsLoading ? "…" : totalCount ?? (statsError ? "—" : stats.total)}
            />
            <StatCard
              icon="fa-solid fa-clock"
              iconBg="#f59e0b"
              label="Pending"
              value={statsLoading ? "…" : statsError ? "—" : stats.pending}
              footnote={statsLoading || statsError ? undefined : `${pct(stats.pending)}% of total`}
              footnoteColor="#f59e0b"
            />
            <StatCard
              icon="fa-solid fa-eye"
              iconBg="#3b82f6"
              label="Under Review"
              value={statsLoading ? "…" : statsError ? "—" : stats.under_review}
              footnote={statsLoading || statsError ? undefined : `${pct(stats.under_review)}% of total`}
              footnoteColor="#3b82f6"
            />
            <StatCard
              icon="fa-solid fa-circle-check"
              iconBg="#22c55e"
              label="Resolved"
              value={statsLoading ? "…" : statsError ? "—" : stats.resolved}
              footnote={statsLoading || statsError ? undefined : `${pct(stats.resolved)}% of total`}
              footnoteColor="#22c55e"
            />
            <StatCard
              icon="fa-solid fa-circle-xmark"
              iconBg="#ef4444"
              label="Cancelled"
              value={statsLoading ? "…" : statsError ? "—" : stats.cancelled}
              footnote={statsLoading || statsError ? undefined : `${pct(stats.cancelled)}% of total`}
              footnoteColor="#ef4444"
            />
          </div>

          {/* =========================================
              CHARTS ROW  (Quick Actions / Appeal Tips columns intentionally omitted)
          ========================================== */}
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 18 }}>
            <div className="bg-dark"
              style={{
                flex: "2 1 420px",
                // background: "#12141c",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 14,
                padding: 18,
                minWidth: 0,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <h4 style={{ fontSize: 15, color: "#fff", margin: 0 }}>Appeal Overview</h4>
              </div>
              {statsLoading ? (
                <div style={{ height: 260, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.35)" }}>
                  Loading…
                </div>
              ) : statsError ? (
                <div style={{ height: 260, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.5)" }}>Unable to load chart.</div>
              ) : stats.overview.length === 0 ? (
                <div style={{ height: 260, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.35)" }}>
                  No appeals in the last 30 days.
                </div>
              ) : (
                <AppealLineChart data={stats.overview} />
              )}
            </div>

            <div className="bg-dark"
              style={{ 
                flex: "1 1 300px",
                // background: "#12141c",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 14,
                padding: 18,
                minWidth: 0,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <h4 style={{ fontSize: 15, color: "#fff", margin: 0 }}>Appeal by Reason</h4>
              </div>
              {statsLoading ? (
                <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.35)" }}>
                  Loading…
                </div>
              ) : statsError ? (
                <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.5)" }}>Unable to load reasons.</div>
              ) : reasonSlices.length === 0 ? (
                <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.35)" }}>
                  No appeals to break down yet.
                </div>
              ) : (
                <AppealDonutChart data={reasonSlices} />
              )}
              {/* <button
                type="button"
                style={{
                  width: "100%",
                  marginTop: 16,
                  padding: "8px 0",
                  borderRadius: 8,
                  background: "transparent",
                  border: "1px solid rgba(251,191,36,0.4)",
                  color: "#fbbf24",
                  fontSize: 13,
                }}
                onClick={() => router.push("/dashboard/appeals?tab=reasons")}
              >
                View Full Report
              </button> */}
            </div>
          </div>

          {/* =========================================
              CONTENT CARD — RECENT APPEALS
          ========================================== */}
          <div className="rounded bg-dark">

            <div className="appeal-content-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h4 className="appeal-content-title">
                  <i className="fa-solid fa-shield-halved me-2" />
                  Appeals
                </h4>
                {/* <p className="appeal-content-subtitle">
                  Review and monitor your customer disputes.
                </p> */}
              </div>
              {/* <button
                type="button"
                onClick={() => router.push("/dashboard/appeals/all")}
                style={{ background: "transparent", border: "none", color: "#fbbf24", fontSize: 13 }}
              >
                View All Appeals <i className="fa-solid fa-arrow-right ms-1" />
              </button> */}
            </div>

            {loading && (
              <div className="appeal-loading">
                {[1, 2, 3, 4].map((item) => (
                  <div key={item} className="appeal-skeleton-row">
                    <div className="appeal-skeleton skeleton-id" />
                    <div className="appeal-skeleton skeleton-order" />
                    <div className="appeal-skeleton skeleton-type" />
                    <div className="appeal-user-skeleton">
                      <div className="appeal-skeleton skeleton-avatar" />
                      <div>
                        <div className="appeal-skeleton skeleton-name" />
                        <div className="appeal-skeleton skeleton-client" />
                      </div>
                    </div>
                    <div className="appeal-skeleton skeleton-amount" />
                    <div className="appeal-skeleton skeleton-status" />
                    <div className="appeal-skeleton skeleton-date" />
                  </div>
                ))}
              </div>
            )}

            {!loading && error && (
              <div className="appeal-error">
                <div className="appeal-error-icon">
                  <i className="fa-solid fa-triangle-exclamation" />
                </div>
                <div className="appeal-error-content">
                  <h5>Unable to load appeals</h5>
                  <p>{error}</p>
                </div>
                <button type="button" className="appeal-retry-btn" onClick={() => fetchAppeals(1)}>
                  <i className="fa-solid fa-rotate-right me-2" />
                  Retry
                </button>
              </div>
            )}

            {!loading && !error && appeals.length === 0 && (
              <div className="appeal-empty">
                <div className="appeal-empty-icon">
                  <i className="fa-solid fa-comments" />
                </div>
                <h4>No Appeals Found</h4>
                <p>You do not have any appeals right now. Appeals for your orders will appear here.</p>
              </div>
            )}

            {!loading && !error && appeals.length > 0 && (
              <div className="appeal-table-wrapper">
                <table className="appeal-table">
                  <thead>
                    <tr>
                      <th>Appeal ID</th>
                      <th>Order ID</th>
                      <th>Type</th>
                      <th>Filed By</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appeals.map((a) => (
                      <tr
                        key={a.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => router.push(`/dashboard/local-buy-sell/my-orders/${a.viewer_side === 'seller' ? 'sell-view' : 'buy-view'}?trade_id=${a.p2p_order_id}`)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            router.push(`/dashboard/local-buy-sell/my-orders/${a.viewer_side === 'seller' ? 'sell-view' : 'buy-view'}?trade_id=${a.p2p_order_id}`);
                          }
                        }}
                        style={{ cursor: "pointer" }}
                      >
                        <td>
                          <span className="appeal-id">APL-{String(a.id).padStart(4, "0")}</span>
                        </td>
                        <td>
                          <span className="order-id">#{a.order_id}</span>
                        </td>
                        <td>
                          <span className="appeal-type">
                            <i className="fa-solid fa-scale-balanced" />
                            {a.type}
                          </span>
                        </td>
                        <td>
                          <div className="appeal-user">
                            <div className="appeal-user-avatar">
                              <Image
                                src={normalizeImageUrl(a.user_image)}
                                alt={a.customer || "User"}
                                width={40}
                                height={40}
                                unoptimized
                              />
                            </div>
                            <div className="appeal-user-info">
                              <div className="appeal-user-name">{a.customer || "Unknown User"}</div>
                              <div className="appeal-user-client">With {a.client || "counterparty"}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="appeal-amount">{a.amount}</span>
                        </td>
                        <td>{renderStatusBadge(a.status_text || a.status)}</td>
                        <td>
                          <div className="appeal-date">
                            <i className="fa-regular fa-calendar" />
                            {a.date}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {!loading && !error && totalPages > 1 && (
              <div className="appeal-pagination">
                <span className="pagination-info">Showing <strong>{(currentPage - 1) * perPage + 1}–{Math.min(currentPage * perPage, total)}</strong> of <strong>{total}</strong> appeals</span>
                <div className="pagination-buttons">
                  <button type="button" className="pagination-btn" disabled={page <= 1} onClick={() => fetchAppeals(page - 1)}>Previous</button>
                  <span className="pagination-current" aria-label={`Page ${page} of ${totalPages}`}>{page}</span>
                  <button type="button" className="pagination-btn" disabled={page >= totalPages} onClick={() => fetchAppeals(page + 1)}>Next</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
