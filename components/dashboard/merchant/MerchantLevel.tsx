"use client";

import React from "react";

type Level = {
  name: string;
  level: string;
  icon: string;
  className: string;
  requirements: string[];
  current?: boolean;
};

const levels: Level[] = [
  {
    name: "Bronze",
    level: "Entry Level",
    icon: "fa-solid fa-medal",
    className: "bronze",
    requirements: [
      "Complete Verification",
      "Security Deposit",
    ],
  },
  {
    name: "Silver",
    level: "Level 1",
    icon: "fa-solid fa-medal",
    className: "silver",
    requirements: [
      "≥ 10,000 USDT Monthly Volume",
      "Completion Rate ≥ 90%",
    ],
  },
  {
    name: "Gold",
    level: "Current Level",
    icon: "fa-solid fa-star",
    className: "gold current",
    current: true,
    requirements: [
      "≥ 50,000 USDT Monthly Volume",
      "Completion Rate ≥ 96%",
      "Positive Feedback ≥ 95%",
    ],
  },
  {
    name: "Platinum",
    level: "Level 3",
    icon: "fa-solid fa-gem",
    className: "platinum",
    requirements: [
      "≥ 150,000 USDT Monthly Volume",
      "Completion Rate ≥ 97%",
      "Positive Feedback ≥ 97%",
    ],
  },
  {
    name: "Diamond",
    level: "Top Level",
    icon: "fa-solid fa-gem",
    className: "diamond",
    requirements: [
      "≥ 500,000 USDT Monthly Volume",
      "Completion Rate ≥ 98%",
      "Positive Feedback ≥ 98%",
    ],
  },
];

const benefits = [
  {
    icon: "fa-solid fa-percent",
    title: "Trading Fee (Taker)",
    value: "0.20%",
  },
  {
    icon: "fa-solid fa-percent",
    title: "Trading Fee (Maker)",
    value: "0.10%",
  },
  {
    icon: "fa-solid fa-rectangle-ad",
    title: "Max Active Ads",
    value: "20",
  },
  {
    icon: "fa-solid fa-wallet",
    title: "Order Limit per Ad",
    value: "500,000 USDT",
  },
  {
    icon: "fa-solid fa-headset",
    title: "Priority Support",
    value: "Medium",
  },
  {
    icon: "fa-solid fa-clock",
    title: "Payout Time",
    value: "24 Hours",
  },
  {
    icon: "fa-solid fa-shield-halved",
    title: "Dispute Handling",
    value: "Standard",
  },
];

const performance = [
  {
    icon: "fa-solid fa-dollar-sign",
    title: "Trading Volume",
    value: "102,450.50 USDT",
    growth: "18.6%",
    type: "yellow",
  },
  {
    icon: "fa-solid fa-circle-check",
    title: "Completed Orders",
    value: "965",
    growth: "14.2%",
    type: "green",
  },
  {
    icon: "fa-solid fa-clock",
    title: "Completion Rate",
    value: "96.2%",
    growth: "1.8%",
    type: "blue",
  },
  {
    icon: "fa-regular fa-thumbs-up",
    title: "Positive Feedback",
    value: "97.6%",
    growth: "1.2%",
    type: "purple",
  },
];

const upgradeSteps = [
  {
    icon: "fa-solid fa-chart-line",
    title: "Increase Trading Volume",
    description:
      "Trade more to meet the volume requirement for higher levels.",
  },
  {
    icon: "fa-solid fa-circle-check",
    title: "Maintain High Completion",
    description:
      "Keep your completion rate high by completing orders on time.",
  },
  {
    icon: "fa-solid fa-shield-halved",
    title: "Positive Feedback",
    description:
      "Provide excellent service to get more positive feedback.",
  },
  {
    icon: "fa-solid fa-thumbs-up",
    title: "Unlock Higher Benefits",
    description:
      "Enjoy lower fees, higher limits and priority support.",
  },
];

export default function MerchantLevel() {
  return (
    <section className="merchant-level-page">

      {/* Header */}
      <div className="merchant-level-header">
        <div>
          <h1>Merchant Level / Tier</h1>
          <p>
            Your level is based on your trading volume, completion rate and
            account performance.
          </p>
        </div>

        <div className="level-header-actions">
          <button className="level-date-btn">
            <span>01 May 2025 - 31 May 2025</span>
            <i className="fa-regular fa-calendar" />
          </button>

          <button className="level-history-btn">
            <i className="fa-solid fa-download" />
            Level History
          </button>
        </div>
      </div>

      {/* Level Cards */}
      <div className="level-cards">
        {levels.map((level, index) => (
          <div
            key={level.name}
            className={`level-card ${level.className}`}
          >
            {level.current && null}

            <div className="level-card-top">
              <div className="level-badge">
                <i className={level.icon} />
              </div>

              <div className="level-name-area">
                <h3>{level.name}</h3>

                {level.name === "Gold" ? (
                  <span className="current-level-badge">
                    Current Level
                  </span>
                ) : (
                  <span>{level.level}</span>
                )}
              </div>
            </div>

            <div className="requirements-title">
              Requirements
            </div>

            <div className="requirements-list">
              {level.requirements.map((requirement) => (
                <div
                  className="requirement-item"
                  key={requirement}
                >
                  <i className="fa-regular fa-circle-check" />
                  <span>{requirement}</span>
                </div>
              ))}
            </div>

            {index < levels.length - 1 && (
              <div className="level-card-arrow">
                <i className="fa-solid fa-chevron-right" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Progress + Benefits */}
      <div className="row g-3 merchant-level-main">

        {/* Progress */}
        <div className="col-12 col-xl-8">
          <div className="merchant-panel progress-panel">

            <div className="panel-title-row">
              <div>
                <h2>Your Progress to Next Level</h2>
              </div>

              <div className="progress-target">
                <span>Progress to</span>
                <strong>Platinum</strong>
                <b>68%</b>
              </div>
            </div>

            <div className="current-level-info">
              <div className="current-level-medal">
                <i className="fa-solid fa-star" />
              </div>

              <div>
                <h3>Gold</h3>
                <span>Current Level</span>
              </div>
            </div>

            <div className="level-progress">
              <div
                className="level-progress-fill"
                style={{ width: "68%" }}
              />
            </div>

            <div className="progress-stats">

              <div className="progress-stat">
                <div className="progress-stat-icon yellow">
                  <i className="fa-solid fa-chart-column" />
                </div>

                <div>
                  <span>Monthly Volume</span>
                  <strong>102,450 / 150,000 USDT</strong>
                </div>
              </div>

              <div className="progress-stat">
                <div className="progress-stat-icon blue">
                  <i className="fa-solid fa-circle-check" />
                </div>

                <div>
                  <span>Completion Rate</span>
                  <strong>96.2% / 97%</strong>
                </div>
              </div>

              <div className="progress-stat">
                <div className="progress-stat-icon purple">
                  <i className="fa-solid fa-thumbs-up" />
                </div>

                <div>
                  <span>Positive Feedback</span>
                  <strong>97.6% / 97%</strong>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="col-12 col-xl-4">
          <div className="merchant-panel benefits-panel">

            <h2>
              Your Level Benefits{" "}
              <span>(Gold)</span>
            </h2>

            <div className="benefits-list">
              {benefits.map((benefit) => (
                <div
                  className="benefit-row"
                  key={benefit.title}
                >
                  <div className="benefit-title">
                    <i className={benefit.icon} />
                    <span>{benefit.title}</span>
                  </div>

                  <strong>{benefit.value}</strong>
                </div>
              ))}
            </div>

            <button className="primary-level-btn">
              View All Benefits
              <i className="fa-solid fa-arrow-right" />
            </button>

          </div>
        </div>
      </div>

      {/* Performance */}
      <div className="merchant-panel performance-panel">

        <div className="panel-section-title">
          <h2>
            Performance Overview{" "}
            <span>(This Month)</span>
          </h2>
        </div>

        <div className="performance-grid">
          {performance.map((item) => (
            <div
              className="performance-item"
              key={item.title}
            >
              <div
                className={`performance-icon ${item.type}`}
              >
                <i className={item.icon} />
              </div>

              <div className="performance-content">
                <span>{item.title}</span>
                <strong>{item.value}</strong>

                <small>
                  <i className="fa-solid fa-arrow-up" />
                  {item.growth}{" "}
                  <em>vs Apr 2025</em>
                </small>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upgrade */}
      <div className="row g-3 mt-4">

        <div className="col-12 col-xl-9">
          <div className="merchant-panel upgrade-panel">

            <h2>How to Upgrade Your Level</h2>

            <div className="upgrade-steps">
              {upgradeSteps.map((step, index) => (
                <React.Fragment key={step.title}>

                  <div className="upgrade-step">
                    <div className="upgrade-icon">
                      <i className={step.icon} />
                    </div>

                    <div>
                      <h3>{step.title}</h3>
                      <p>{step.description}</p>
                    </div>
                  </div>

                  {index < upgradeSteps.length - 1 && (
                    <div className="upgrade-arrow">
                      <i className="fa-solid fa-arrow-right" />
                    </div>
                  )}

                </React.Fragment>
              ))}
            </div>

          </div>
        </div>

        {/* Help */}
        <div className="col-12 col-xl-3">
          <div className="merchant-panel help-panel">

            <h2>Need Help?</h2>

            <p>
              Contact our support team for more information about
              merchant levels.
            </p>

            <button className="support-btn">
              <i className="fa-solid fa-headset" />
              Contact Support
            </button>

          </div>
        </div>

      </div>
    </section>
  );
}
