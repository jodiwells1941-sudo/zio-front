"use client";

import React, { useState } from "react";

type ToggleProps = {
  checked: boolean;
  onChange: () => void;
};

function Toggle({ checked, onChange }: ToggleProps) {
  return (
    <button
      type="button"
      className={`merchant-toggle ${checked ? "active" : ""}`}
      onClick={onChange}
      aria-pressed={checked}
    >
      <span />
    </button>
  );
}

type SettingCardProps = {
  icon: string;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
};

function SettingCard({
  icon,
  title,
  description,
  children,
  className = "",
}: SettingCardProps) {
  return (
    <div className={`merchant-setting-card ${className}`}>
      <div className="setting-card-header">
        <div className="setting-header-icon">
          <i className={icon} />
        </div>

        <div>
          <h3>{title}</h3>
          {description && <p>{description}</p>}
        </div>
      </div>

      {children}
    </div>
  );
}

const paymentMethods = [
  {
    name: "bKash",
    icon: "fa-solid fa-b",
    type: "bkash",
  },
  {
    name: "Nagad",
    icon: "fa-solid fa-n",
    type: "nagad",
  },
  {
    name: "Rocket",
    icon: "fa-solid fa-wallet",
    type: "rocket",
  },
  {
    name: "Bank Transfer",
    icon: "fa-solid fa-building-columns",
    type: "bank",
  },
];

export default function MerchantSettings() {
  const [activeTab, setActiveTab] = useState("General");

  const [showBadge, setShowBadge] = useState(true);
  const [autoRelease, setAutoRelease] = useState(true);

  const [notifications, setNotifications] = useState({
    order: true,
    payment: true,
    completed: true,
    dispute: true,
    marketing: true,
  });

  const [displayName, setDisplayName] = useState("Hori Shankar Rai");
  const [bio, setBio] = useState(
    "Trusted P2P merchant. Fast payment, secure trade. Customer satisfaction is my priority."
  );

  const [orderType, setOrderType] = useState("Buy");
  const [expiry, setExpiry] = useState("30 Minutes (Recommended)");
  const [maxAds, setMaxAds] = useState("20 Ads");
  const [currency, setCurrency] = useState("USDT");

  const [saved, setSaved] = useState(false);

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = () => {
    setSaved(true);

    window.setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  const tabs = [
    "General",
    "Trading",
    "Payment Methods",
    "Notifications",
    "Security",
    "API & Webhooks",
  ];

  return (
    <section className="merchant-settings-page">

      {/* =====================================================
          PAGE HEADER
      ====================================================== */}
      <div className="merchant-settings-header">
        <div className="settings-title-area">
          <h1>Merchant Settings</h1>
          <p>
            Configure your trading preferences and manage your merchant
            account.
          </p>
        </div>

        <div className="settings-header-actions">
          <div className="merchant-level-badge">
            <span className="level-star">
              <i className="fa-solid fa-star" />
            </span>

            <div>
              <strong>Gold Merchant</strong>
            </div>
          </div>

          <div className="merchant-id-box">
            Merchant ID: <strong>MRC738492</strong>
          </div>

          <button
            type="button"
            className="settings-save-btn"
            onClick={handleSave}
          >
            <i
              className={`fa-solid ${
                saved ? "fa-check" : "fa-floppy-disk"
              }`}
            />
            {saved ? "Saved" : "Save Changes"}
          </button>
        </div>
      </div>

      {/* =====================================================
          TABS
      ====================================================== */}
      <div className="merchant-settings-tabs">
        {tabs.map((tab) => (
          <button
            type="button"
            key={tab}
            className={activeTab === tab ? "active" : ""}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* =====================================================
          SETTINGS GRID
      ====================================================== */}
      <div className="merchant-settings-grid">

        {/* ================= ACCOUNT SETTINGS ================= */}
        <SettingCard
          icon="fa-regular fa-user"
          title="Account Settings"
          description=""
          className="account-card"
        >
          <div className="setting-field">
            <label htmlFor="displayName">Display Name</label>

            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />

            <small>
              This name will be visible to other users in P2P market.
            </small>
          </div>

          <div className="setting-field">
            <div className="label-row">
              <label htmlFor="merchantBio">Business Bio</label>

              <span className="character-count">
                {bio.length}/200
              </span>
            </div>

            <textarea
              id="merchantBio"
              rows={3}
              maxLength={200}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>

          <div className="setting-toggle-row">
            <div>
              <strong>Show Verified Badge</strong>
              <span>
                Display your verification and badge on public profile
              </span>
            </div>

            <Toggle
              checked={showBadge}
              onChange={() => setShowBadge(!showBadge)}
            />
          </div>
        </SettingCard>

        {/* ================= TRADING PREFERENCES ================= */}
        <SettingCard
          icon="fa-solid fa-sliders"
          title="Trading Preferences"
        >
          <div className="setting-field">
            <label>Default Order Type</label>

            <div className="radio-group">
              <label className="custom-radio">
                <input
                  type="radio"
                  checked={orderType === "Buy"}
                  onChange={() => setOrderType("Buy")}
                />
                <span />
                Buy
              </label>

              <label className="custom-radio">
                <input
                  type="radio"
                  checked={orderType === "Sell"}
                  onChange={() => setOrderType("Sell")}
                />
                <span />
                Sell
              </label>
            </div>
          </div>

          <div className="setting-toggle-row">
            <div>
              <strong>Auto Release</strong>
              <span>
                Automatically release crypto after payment confirmation
                period
              </span>
            </div>

            <Toggle
              checked={autoRelease}
              onChange={() => setAutoRelease(!autoRelease)}
            />
          </div>

          <div className="setting-field">
            <label>Order Expiry Time</label>

            <select
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
            >
              <option>15 Minutes</option>
              <option>30 Minutes (Recommended)</option>
              <option>45 Minutes</option>
              <option>60 Minutes</option>
            </select>
          </div>

          <div className="setting-field">
            <label>Max Active Ads</label>

            <select
              value={maxAds}
              onChange={(e) => setMaxAds(e.target.value)}
            >
              <option>10 Ads</option>
              <option>20 Ads</option>
              <option>30 Ads</option>
              <option>50 Ads</option>
            </select>
          </div>

          <div className="setting-field">
            <label>Default Currency</label>

            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              <option>USDT</option>
              <option>USDC</option>
              <option>BTC</option>
              <option>ETH</option>
            </select>
          </div>
        </SettingCard>

        {/* ================= CURRENT STATUS ================= */}
        <SettingCard
          icon="fa-solid fa-shield-halved"
          title="Your Current Status"
          className="status-card"
        >
          <div className="merchant-status-content">

            <div className="gold-status-icon">
              <i className="fa-solid fa-star" />
            </div>

            <h4>Gold Merchant</h4>
            <span className="status-level">Level 2 / 4</span>

            <div className="status-check-list">
              <div>
                <i className="fa-solid fa-circle-check" />
                <span>Verified Merchant</span>
              </div>

              <div>
                <i className="fa-solid fa-circle-check" />
                <span>Security Deposit Active</span>
              </div>

              <div>
                <i className="fa-solid fa-circle-check" />
                <span>High Completion Rate</span>
              </div>

              <div>
                <i className="fa-solid fa-circle-check" />
                <span>Positive Feedback 97.6%</span>
              </div>
            </div>

            <button type="button" className="outline-purple-btn">
              View Profile
            </button>
          </div>
        </SettingCard>

        {/* ================= PAYMENT METHODS ================= */}
        <SettingCard
          icon="fa-solid fa-users-gear"
          title="Payment Method Settings"
          description="Manage your preferred payment methods"
          className="payment-card"
        >
          <div className="payment-method-list">
            {paymentMethods.map((method) => (
              <div
                className="payment-method-item"
                key={method.name}
              >
                <div
                  className={`payment-method-icon ${method.type}`}
                >
                  <i className={method.icon} />
                </div>

                <strong>{method.name}</strong>

                <span className="active-pill">
                  Active
                </span>

                <button
                  type="button"
                  className="payment-action edit"
                  aria-label={`Edit ${method.name}`}
                >
                  <i className="fa-solid fa-pen" />
                </button>

                <button
                  type="button"
                  className="payment-action delete"
                  aria-label={`Delete ${method.name}`}
                >
                  <i className="fa-regular fa-trash-can" />
                </button>
              </div>
            ))}
          </div>

          <button type="button" className="add-payment-btn">
            <i className="fa-solid fa-plus" />
            Add New Payment Method
          </button>
        </SettingCard>

        {/* ================= NOTIFICATION SETTINGS ================= */}
        <SettingCard
          icon="fa-regular fa-bell"
          title="Notification Settings"
          description="Choose when you want to receive notifications"
        >
          <div className="notification-list">
            <NotificationRow
              title="New Order Notification"
              description="Get notified when you receive a new order"
              checked={notifications.order}
              onChange={() => toggleNotification("order")}
            />

            <NotificationRow
              title="Payment Received"
              description="Notify when buyer marks payment as done"
              checked={notifications.payment}
              onChange={() => toggleNotification("payment")}
            />

            <NotificationRow
              title="Order Completed"
              description="Get notified on successful completion"
              checked={notifications.completed}
              onChange={() => toggleNotification("completed")}
            />

            <NotificationRow
              title="Dispute / Appeal"
              description="Important alerts for dispute cases"
              checked={notifications.dispute}
              onChange={() => toggleNotification("dispute")}
            />

            <NotificationRow
              title="Marketing & Updates"
              description="Receive latest news and bonus offers"
              checked={notifications.marketing}
              onChange={() => toggleNotification("marketing")}
            />
          </div>
        </SettingCard>

        {/* ================= QUICK ACTIONS ================= */}
        <SettingCard
          icon="fa-solid fa-bolt"
          title="Quick Actions"
          className="quick-settings-card"
        >
          <div className="quick-settings-list">
            <QuickAction
              icon="fa-solid fa-plus"
              text="Create New Advertisement"
            />

            <QuickAction
              icon="fa-solid fa-bag-shopping"
              text="View My Orders"
            />

            <QuickAction
              icon="fa-solid fa-dollar-sign"
              text="Earnings & Commission"
            />

            <QuickAction
              icon="fa-solid fa-shield-halved"
              text="Security Deposit"
            />

            <QuickAction
              icon="fa-solid fa-user-shield"
              text="Verification Settings"
            />
          </div>
        </SettingCard>

        {/* ================= SECURITY ================= */}
        <SettingCard
          icon="fa-solid fa-shield-halved"
          title="Security Settings"
          description="Keep your merchant account secure"
        >
          <div className="security-list">
            <div className="security-item">
              <div className="security-icon">
                <i className="fa-solid fa-lock" />
              </div>

              <div className="security-info">
                <strong>Two-Factor Authentication</strong>
                <span>Your account is protected with 2FA</span>
              </div>

              <span className="enabled-pill">
                Enabled
              </span>
            </div>

            <div className="security-item">
              <div className="security-icon">
                <i className="fa-regular fa-clock" />
              </div>

              <div className="security-info">
                <strong>Login Activity</strong>
                <span>Monitor your recent login sessions</span>
              </div>

              <i className="fa-solid fa-chevron-right security-arrow" />
            </div>
          </div>
        </SettingCard>

        {/* ================= API ================= */}
        <SettingCard
          icon="fa-solid fa-link"
          title="API & Webhook"
          description="Integrate with your systems for better control"
        >
          <div className="webhook-status">
            <span />
            Active
          </div>

          <div className="setting-field">
            <label>Webhook URL</label>

            <div className="webhook-input">
              <input
                type="text"
                readOnly
                value="https://yourdomain.com/api/p2p/webhook"
              />

              <button type="button">
                <i className="fa-regular fa-copy" />
              </button>
            </div>
          </div>

          <button type="button" className="manage-api-btn">
            <i className="fa-solid fa-gear" />
            Manage API Keys
          </button>
        </SettingCard>

        {/* ================= HELP ================= */}
        <SettingCard
          icon="fa-solid fa-headset"
          title="Need Help?"
          className="help-card"
        >
          <p className="help-text">
            Have questions? Our support team is ready to help you 24/7.
          </p>

          <button type="button" className="support-btn">
            <i className="fa-solid fa-headset" />
            Contact Support
          </button>
        </SettingCard>
      </div>
    </section>
  );
}

/* =========================================================
   NOTIFICATION ROW
========================================================= */

function NotificationRow({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="notification-row">
      <div>
        <strong>{title}</strong>
        <span>{description}</span>
      </div>

      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

/* =========================================================
   QUICK ACTION
========================================================= */

function QuickAction({
  icon,
  text,
}: {
  icon: string;
  text: string;
}) {
  return (
    <button type="button" className="quick-setting-btn">
      <span>
        <i className={icon} />
      </span>

      <strong>{text}</strong>

      <i className="fa-solid fa-chevron-right arrow" />
    </button>
  );
}