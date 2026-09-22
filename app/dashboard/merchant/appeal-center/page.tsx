/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  getMerchantAppeals,
  AppealRow,
  PaginatedAppeals,
} from "@/app/api/merchant";

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
  if (!url) return "/images/default-user.png";

  let clean = url.trim();

  // Defensive: if the string somehow contains a nested/duplicated
  // absolute URL (e.g. base + full URL), keep only the last one.
  const lastHttp = Math.max(clean.lastIndexOf("http://"), clean.lastIndexOf("https://"));
  if (lastHttp > 0) {
    clean = clean.slice(lastHttp);
  }

  // Already absolute — use as-is.
  if (/^https?:\/\//i.test(clean)) return clean;

  const base = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
  if (!base) return clean;

  return clean.startsWith("/") ? `${base}${clean}` : `${base}/${clean}`;
}

export default function AppealCenterPage() {
  const router = useRouter();
  const [appeals, setAppeals] = useState<AppealRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginatedAppeals | null>(null);
  const [totalCount, setTotalCount] = useState<number | null>(null);  

  const fetchAppeals = async (page = 1) => {
    setLoading(true);
    setError(null);

    try {
      const res = await getMerchantAppeals({
        page,
        per_page: 10,
      });

      const topTotal = typeof (res as any).total_appeal_count === "number" ? (res as any).total_appeal_count : null;

      // Normalize different API shapes
      const maybeData = (res as any).data;
      let list: any[] = [];
      let pageObj: any = null;

      if (Array.isArray(maybeData)) {
        list = maybeData;
      } else if (maybeData && Array.isArray(maybeData.data)) {
        list = maybeData.data;
        pageObj = maybeData;
      } else if (Array.isArray(res as any)) {
        list = res as any;
      }

      setAppeals(list as AppealRow[]);
      setPagination(pageObj ?? null);

      if (topTotal !== null) {
        setTotalCount(topTotal);
      } else if (pageObj && typeof pageObj.total === "number") {
        setTotalCount(pageObj.total);
      }
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
  }, []);

  const currentPage = pagination?.current_page || 1;
  const perPage = pagination?.per_page || 10;
  const total = pagination?.total || totalCount || 0;

  const totalPages = Math.max(
    1,
    Math.ceil(total / perPage)
  );

  return (
    <div className="appeal-page">
      <div className="container-fluid appeal-container">
        <div className="appeal-section">

          {/* =========================================
              HEADER
          ========================================== */}
          <div className="appeal-header">

            <div>

              <h2 className="appeal-title">
                Appeal Center
              </h2>

              <p className="appeal-description">
                Manage customer appeals, review disputes and track
                resolution status from one place.
              </p>
            </div>

            {/* Total Appeals */}
            <div className="appeal-total-card">
              <div className="appeal-total-icon">
                <i className="fa-solid fa-comments" />
              </div>

              <div>
                <div className="appeal-total-label">
                  Total Appeals
                </div>

                <div className="appeal-total-value">
                  {totalCount ?? total}
                </div>
              </div>
            </div>
          </div>

          {/* =========================================
              CONTENT CARD
          ========================================== */}
          <div className="appeal-content-card">

            {/* TOP BAR */}
            <div className="appeal-content-header">
              <div>
                <h4 className="appeal-content-title">
                  <i className="fa-solid fa-shield-halved me-2" />
                  Recent Appeals
                </h4>

                <p className="appeal-content-subtitle">
                  Review and monitor your customer disputes.
                </p>
              </div>
            </div>

            {/* =========================================
                LOADING
            ========================================== */}
            {loading && (
              <div className="appeal-loading">

                {[1, 2, 3, 4].map((item) => (
                  <div
                    key={item}
                    className="appeal-skeleton-row"
                  >
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

            {/* =========================================
                ERROR
            ========================================== */}
            {!loading && error && (
              <div className="appeal-error">

                <div className="appeal-error-icon">
                  <i className="fa-solid fa-triangle-exclamation" />
                </div>

                <div className="appeal-error-content">
                  <h5>Unable to load appeals</h5>
                  <p>{error}</p>
                </div>

                <button
                  type="button"
                  className="appeal-retry-btn"
                  onClick={() => fetchAppeals(1)}
                >
                  <i className="fa-solid fa-rotate-right me-2" />
                  Retry
                </button>

              </div>
            )}

            {/* =========================================
                EMPTY STATE
            ========================================== */}
            {!loading &&
              !error &&
              appeals.length === 0 && (
                <div className="appeal-empty">

                  <div className="appeal-empty-icon">
                    <i className="fa-solid fa-comments" />
                  </div>

                  <h4>No Appeals Found</h4>

                    <p>
                    You do not have any appeals right now.
                    New customer appeals will appear here.
                  </p>

                </div>
              )}

            {/* =========================================
                TABLE
            ========================================== */}
            {!loading &&
              !error &&
              appeals.length > 0 && (
                <>
                  <div className="appeal-table-wrapper">

                    <table className="appeal-table">

                      <thead>
                        <tr>
                          <th>Appeal ID</th>
                          <th>Order ID</th>
                          <th>Type</th>
                          <th>Customer</th>
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
                            onClick={() => router.push(`/dashboard/merchant/ads/p2p/?trade_id=${a.id}`)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") router.push(`/dashboard/merchant/ads/p2p/?trade_id=${a.id}`);
                            }}
                            style={{ cursor: "pointer" }}
                          >

                            {/* Appeal ID */}
                            <td>
                              <span className="appeal-id">
                                APL-
                                {String(a.id).padStart(4, "0")}
                              </span>
                            </td>

                            {/* Order ID */}
                            <td>
                              <span className="order-id">
                                #{a.order_id}
                              </span>
                            </td>

                            {/* Type */}
                            <td>
                              <span className="appeal-type">
                                <i className="fa-solid fa-scale-balanced" />
                                {a.type}
                              </span>
                            </td>

                            {/* User */}
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
                                  <div className="appeal-user-name">
                                    {a.customer || "Unknown User"}
                                  </div>

                                  <div className="appeal-user-client">
                                    {a.client || "Customer"}
                                  </div>
                                </div>

                              </div>
                            </td>

                            {/* Amount */}
                            <td>
                              <span className="appeal-amount">
                                {a.amount}
                              </span>
                            </td>

                            {/* Status */}
                            <td>
                              {renderStatusBadge(
                                a.status_text || a.status
                              )}
                            </td>

                            {/* Date */}
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

                  {/* =========================================
                      PAGINATION
                  ========================================== */}
                  {pagination && totalPages > 1 && (
                    <div className="appeal-pagination">

                      <div className="pagination-info">
                        Showing{" "}
                        <strong>
                          {(currentPage - 1) * perPage + 1}
                        </strong>{" "}
                        -{" "}
                        <strong>
                          {Math.min(
                            currentPage * perPage,
                            total
                          )}
                        </strong>{" "}
                        of{" "}
                        <strong>{total}</strong>
                      </div>

                      <div className="pagination-buttons">

                        <button
                          type="button"
                          className="pagination-btn"
                          disabled={currentPage <= 1}
                          onClick={() =>
                            fetchAppeals(
                              Math.max(
                                1,
                                currentPage - 1
                              )
                            )
                          }
                        >
                          <i className="fa-solid fa-chevron-left" />
                          Prev
                        </button>

                        <div className="pagination-current">
                          {currentPage}
                        </div>

                        <button
                          type="button"
                          className="pagination-btn"
                          disabled={
                            currentPage >= totalPages
                          }
                          onClick={() =>
                            fetchAppeals(
                              Math.min(
                                totalPages,
                                currentPage + 1
                              )
                            )
                          }
                        >
                          Next
                          <i className="fa-solid fa-chevron-right" />
                        </button>

                      </div>
                    </div>
                  )}

                </>
              )}

          </div>
        </div>
      </div>
    </div>
  );
}