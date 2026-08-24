"use client";

import React from "react";

const ratingStats = [
  {
    title: "Average Rating",
    value: "4.9",
    suffix: "/5",
    icon: "fa-solid fa-star",
    type: "rating",
    extra: "★★★★★",
    sub: "Based on 1,248 reviews",
    growth: "↗ 0.2",
    period: "vs Apr 2025",
  },
  {
    title: "Total Reviews",
    value: "1,248",
    icon: "fa-regular fa-message",
    type: "purple",
    growth: "↗ 12.6%",
    period: "vs Apr 2025",
  },
  {
    title: "Positive Reviews",
    value: "1,193",
    suffix: "(95.6%)",
    icon: "fa-regular fa-thumbs-up",
    type: "green",
    growth: "↗ 2.4%",
    period: "vs Apr 2025",
  },
  {
    title: "Neutral Reviews",
    value: "42",
    suffix: "(3.4%)",
    icon: "fa-solid fa-minus",
    type: "yellow",
    growth: "↓ 0.6%",
    period: "vs Apr 2025",
    negative: true,
  },
  {
    title: "Negative Reviews",
    value: "13",
    suffix: "(1.0%)",
    icon: "fa-regular fa-thumbs-down",
    type: "red",
    growth: "↓ 0.4%",
    period: "vs Apr 2025",
    negative: true,
  },
];

const ratingBreakdown = [
  { label: "5 Stars", value: 1108, percent: "88.8%" },
  { label: "4 Stars", value: 85, percent: "6.8%" },
  { label: "3 Stars", value: 42, percent: "3.4%" },
  { label: "2 Stars", value: 9, percent: "0.7%" },
  { label: "1 Star", value: 4, percent: "0.3%" },
];

const highlights = [
  {
    title: "Fast Payment",
    count: "874 mentions",
    icon: "fa-solid fa-rocket",
    type: "green",
  },
  {
    title: "Good Communication",
    count: "762 mentions",
    icon: "fa-solid fa-comment-dots",
    type: "blue",
  },
  {
    title: "Trustworthy",
    count: "691 mentions",
    icon: "fa-solid fa-shield-halved",
    type: "purple",
  },
  {
    title: "Reliable",
    count: "558 mentions",
    icon: "fa-solid fa-circle-check",
    type: "yellow",
  },
  {
    title: "Best Price",
    count: "421 mentions",
    icon: "fa-solid fa-tag",
    type: "red",
  },
];

const reviews = [
  {
    name: "Rakib Hasan",
    avatar: "/assets/images/reviews/user-1.jpg",
    rating: 5,
    time: "31 May 2025, 09:45 PM",
    comment:
      "Very fast payment and great communication. Highly recommended!",
    order: "#ORD250531000125",
    side: "Buy USDT",
    amount: "500.00 USDT",
    type: "buy",
  },
  {
    name: "Nusrat Jahan",
    avatar: "/assets/images/reviews/user-2.jpg",
    rating: 5,
    time: "31 May 2025, 08:45 PM",
    comment:
      "Trusted merchant. Smooth transaction. Will trade again.",
    order: "#ORD250531000124",
    side: "Sell USDT",
    amount: "300.00 USDT",
    type: "sell",
  },
  {
    name: "Tanzen Ahmed",
    avatar: "/assets/images/reviews/user-3.jpg",
    rating: 4,
    time: "31 May 2025, 08:30 PM",
    comment:
      "Good service and quick response. Keep it up!",
    order: "#ORD250531000123",
    side: "Buy USDT",
    amount: "450.00 USDT",
    type: "buy",
  },
];

export default function MerchantReviews() {
  return (
    <section className="merchant-reviews-page">

      {/* ================= HEADER ================= */}
      <div className="merchant-page-header">
        <div>
          <h1>Merchant Reviews &amp; Ratings</h1>
          <p>See what your customers say about you.</p>
        </div>

        <div className="merchant-header-actions">
          <button className="merchant-date-btn">
            <span>01 May 2025 - 31 May 2025</span>
            <i className="fa-regular fa-calendar" />
          </button>

          <button className="merchant-primary-btn">
            <i className="fa-solid fa-download" />
            Export Report
          </button>
        </div>
      </div>

      {/* ================= STAT CARDS ================= */}
      <div className="row g-3 review-stat-row">
        {ratingStats.map((stat) => (
          <div className="col-12 col-sm-6 col-xl" key={stat.title}>
            <div className={`review-stat-card ${stat.type}`}>

              <div className="review-stat-title">
                {stat.title}
              </div>

              <div className="review-stat-main">
                <div className="review-stat-icon">
                  <i className={stat.icon} />
                </div>

                <div className="review-stat-value">
                  {stat.value}

                  {stat.suffix && (
                    <small>{stat.suffix}</small>
                  )}
                </div>
              </div>

              {stat.extra && (
                <div className="stat-stars">
                  {stat.extra}
                </div>
              )}

              {stat.sub && (
                <div className="review-stat-sub">
                  {stat.sub}
                </div>
              )}

              <div
                className={`review-stat-growth ${
                  stat.negative ? "negative" : ""
                }`}
              >
                {stat.growth}
                <span>{stat.period}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ================= TOP ANALYTICS ================= */}
      <div className="row g-3 review-top-grid">

        {/* Rating Breakdown */}
        <div className="col-12 col-xl-5">
          <div className="review-card rating-breakdown-card">

            <div className="review-card-header">
              <h2>Rating Breakdown</h2>
            </div>

            <div className="rating-breakdown-content">

              <div className="rating-bars">
                {ratingBreakdown.map((rating) => (
                  <div className="rating-row" key={rating.label}>

                    <span className="rating-label">
                      {rating.label}
                    </span>

                    <div className="rating-progress">
                      <span
                        style={{
                          width: rating.percent,
                        }}
                      />
                    </div>

                    <span className="rating-count">
                      {rating.value}
                    </span>

                    <span className="rating-percent">
                      ({rating.percent})
                    </span>
                  </div>
                ))}
              </div>

              <div className="rating-donut-wrapper">
                <div className="rating-donut">
                  <div className="rating-donut-center">
                    <strong>4.9</strong>

                    <div className="donut-stars">
                      ★★★★★
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Rating Trend */}
        <div className="col-12 col-xl-5">
          <div className="review-card rating-trend-card">

            <div className="review-card-header">
              <h2>Rating Trend</h2>

              <button className="review-select">
                Daily
                <i className="fa-solid fa-chevron-down" />
              </button>
            </div>

            <div className="trend-legend">
              <span>
                <b />
                Average Rating
              </span>
            </div>

            <div className="rating-chart">

              <div className="chart-y-axis">
                <span>5.0</span>
                <span>4.5</span>
                <span>4.0</span>
                <span>3.5</span>
                <span>3.0</span>
              </div>

              <div className="trend-chart-area">

                <div className="trend-grid">
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                </div>

                <div className="trend-line">
                  {[
                    78, 76, 70, 68, 62, 58, 53, 50,
                    45, 48, 40, 47, 38, 34, 31, 32,
                    28, 34, 25, 29, 23, 20, 17, 22,
                    15, 12,
                  ].map((top, index) => (
                    <i
                      key={index}
                      style={{ top: `${top}%` }}
                    />
                  ))}
                </div>

                <div className="trend-fill" />

                <div className="trend-dates">
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

        {/* Highlights */}
        <div className="col-12 col-xl-2">
          <div className="review-card highlights-card">

            <div className="review-card-header">
              <h2>Review Highlights</h2>
            </div>

            <div className="highlight-list">
              {highlights.map((item) => (
                <div
                  className="highlight-item"
                  key={item.title}
                >
                  <div
                    className={`highlight-icon ${item.type}`}
                  >
                    <i className={item.icon} />
                  </div>

                  <div>
                    <strong>{item.title}</strong>
                    <span>{item.count}</span>
                  </div>
                </div>
              ))}
            </div>

            <button className="outline-purple-btn">
              View All Feedback
            </button>

          </div>
        </div>

      </div>

      {/* ================= REVIEWS + RATE ================= */}
      <div className="row g-3 review-bottom-grid">

        {/* Recent Reviews */}
        <div className="col-12 col-xl-9">
          <div className="review-card recent-reviews-card">

            <div className="review-card-header">
              <h2>Recent Reviews</h2>
            </div>

            <div className="reviews-list">

              {reviews.map((review) => (
                <div
                  className="customer-review"
                  key={review.order}
                >

                  <div className="review-user">

                    <div className="review-avatar">
                      {review.avatar ? (
                        <img
                          src={review.avatar}
                          alt={review.name}
                        />
                      ) : (
                        <i className="fa-solid fa-user" />
                      )}
                    </div>

                    <div>
                      <div className="review-user-name">
                        {review.name}

                        <span className="verified-badge">
                          Verified Buyer
                        </span>
                      </div>

                      <small>{review.time}</small>
                    </div>

                  </div>

                  <div className="review-content">

                    <div className="review-rating-line">
                      <span className="review-stars">
                        {"★★★★★".slice(0, review.rating)}
                      </span>

                      <strong>{review.rating}.0</strong>
                    </div>

                    <p>{review.comment}</p>

                    <div className="review-order">
                      Order ID: {review.order}
                      <span>•</span>
                      {review.time}
                    </div>

                  </div>

                  <div className="review-order-value">

                    <span
                      className={`review-side ${
                        review.type === "buy"
                          ? "buy"
                          : "sell"
                      }`}
                    >
                      {review.side}
                    </span>

                    <strong
                      className={
                        review.type === "buy"
                          ? "buy-value"
                          : "sell-value"
                      }
                    >
                      {review.amount}
                    </strong>

                  </div>

                </div>
              ))}

            </div>

            <button className="view-all-reviews">
              View All Reviews
            </button>

          </div>
        </div>

        {/* Rate Your Experience */}
        <div className="col-12 col-xl-3">
          <div className="review-card rate-experience-card">

            <div className="review-card-header">
              <h2>Rate Your Experience</h2>
            </div>

            <p>
              Your feedback helps others choose
              the right merchant.
            </p>

            <div className="experience-stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star}>
                  <i className="fa-regular fa-star" />
                </button>
              ))}
            </div>

            <button className="merchant-primary-btn write-review-btn">
              Write a Review
            </button>

            <div className="review-note">
              <i className="fa-regular fa-circle-question" />
              Only completed orders can be reviewed.
            </div>

          </div>
        </div>

      </div>

    </section>
  );
}