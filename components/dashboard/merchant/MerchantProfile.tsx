'use client';

import React, { useEffect, useState } from 'react';
import {
  allCountries,
  type CountryTelephoneData,
} from 'country-telephone-data';

/* =========================================================
   TYPES — mirrors the /merchant/account API response
========================================================= */

export type MerchantApplicationStatus = 'pending' | 'approved' | 'rejected';

export type MerchantApplication = {
  id: number;
  user_id: number;
  full_name: string;
  avatar: string | null;
  avatar_url: string | null;
  username: string;
  email: string;
  phone_country_code: string;
  phone: string;
  country: string;
  address: string;

  business_type: string;
  business_name: string;
  tax_id: string;
  business_email: string;
  business_phone_country_code: string;
  business_phone: string;
  operation_type: string;

  trade_coin: string;
  payment_methods: string[];

  deposit_paid: boolean;
  deposit_amount: string;
  agreed_terms: boolean;

  status: MerchantApplicationStatus;
  rejection_reason: string | null;

  created_at: string;
  updated_at: string;
};

// Trading/earnings stats aren't part of the application API — they'd come
// from a separate merchant-dashboard/stats endpoint. Kept optional so the
// page renders honestly ("—") instead of fabricating numbers until that
// endpoint is wired up.
export type MerchantStats = {
  totalOrders?: number;
  completedOrders?: number;
  completedPercent?: number;
  positiveFeedbackPercent?: number;
  responseTime?: string;
  totalTradingVolume?: string;
  buyVolume?: string;
  sellVolume?: string;
  totalEarnings?: string;
  level?: number;
  xpCurrent?: number;
  xpTarget?: number;
};

// Fields the Personal Information card can edit.
type ProfileDraft = Pick<
  MerchantApplication,
  'full_name' | 'phone_country_code' | 'phone' | 'address'
>;

// Fields the Business Information card can edit.
type BusinessDraft = Pick<
  MerchantApplication,
  | 'business_name'
  | 'business_email'
  | 'business_phone_country_code'
  | 'business_phone'
  | 'operation_type'
  | 'trade_coin'
  | 'payment_methods'
>;

export type MerchantProfileUpdatePayload = Partial<ProfileDraft & BusinessDraft>;

type MerchantProfileProps = {
  application: MerchantApplication | null;
  stats?: MerchantStats | null;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  // Called with only the fields that changed. Should resolve once the
  // backend has confirmed the update (throwing on failure re-opens the
  // form with the error shown inline).
  onUpdate?: (
    section: 'profile' | 'business',
    data: MerchantProfileUpdatePayload
  ) => Promise<void>;
  onAvatarUpload?: (file: File) => Promise<void>;
};

/* =========================================================
   HELPERS
========================================================= */

function formatDate(value?: string | null): string {
  if (!value) return '-';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function formatMoney(value?: string | number | null): string {
  const num = Number(value);
  if (!Number.isFinite(num)) return '-';
  return num.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function statusLabel(status: MerchantApplicationStatus): string {
  if (status === 'approved') return 'Approved';
  if (status === 'rejected') return 'Rejected';
  return 'Pending Review';
}

function statusBadgeClass(status: MerchantApplicationStatus): string {
  if (status === 'approved') return 'top-rated-badge mt-10';
  if (status === 'rejected') return 'top-rated-badge status-rejected';
  return 'top-rated-badge status-pending';
}

const PAYMENT_METHOD_OPTIONS = ['Bank Transfer', 'bKash', 'Nagad', 'Rocket'];
const TRADE_COIN_OPTIONS = ['USDT', 'USDC', 'BTC'];
const OPERATION_TYPE_OPTIONS = [
  'Manually (I will manage orders)',
  'Automatically',
];

const quickActions = [
  { icon: 'fa-solid fa-paper-plane', title: 'Create Advertisement' },
  { icon: 'fa-solid fa-rectangle-ad', title: 'My Advertisements' },
  { icon: 'fa-solid fa-bag-shopping', title: 'My Orders' },
  { icon: 'fa-solid fa-sliders', title: 'Earnings & Commission' },
  { icon: 'fa-solid fa-shield-halved', title: 'Security Deposit' },
];

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function MerchantProfile({
  application,
  stats = null,
  loading = false,
  error = null,
  onRetry,
  onUpdate,
  onAvatarUpload,
}: MerchantProfileProps) {
  const handleAction = (action: string) => {
    console.log(`Navigate to: ${action}`);
  };

  const [editingSection, setEditingSection] =
    useState<null | 'profile' | 'business'>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [profileDraft, setProfileDraft] = useState<ProfileDraft>({
    full_name: '',
    phone_country_code: '+880',
    phone: '',
    address: '',
  });

  const [businessDraft, setBusinessDraft] = useState<BusinessDraft>({
    business_name: '',
    business_email: '',
    business_phone_country_code: '+880',
    business_phone: '',
    operation_type: OPERATION_TYPE_OPTIONS[0],
    trade_coin: TRADE_COIN_OPTIONS[0],
    payment_methods: [],
  });

  // Keep the drafts in sync with the latest server data whenever we're
  // not actively editing that section (e.g. after a refetch).
  useEffect(() => {
    if (application && editingSection !== 'profile') {
      setProfileDraft({
        full_name: application.full_name,
        phone_country_code: application.phone_country_code,
        phone: application.phone,
        address: application.address,
      });
    }
  }, [application, editingSection]);

  useEffect(() => {
    if (application && editingSection !== 'business') {
      setBusinessDraft({
        business_name: application.business_name,
        business_email: application.business_email,
        business_phone_country_code: application.business_phone_country_code,
        business_phone: application.business_phone,
        operation_type: application.operation_type,
        trade_coin: application.trade_coin,
        payment_methods: application.payment_methods ?? [],
      });
    }
  }, [application, editingSection]);

  const startEdit = (section: 'profile' | 'business') => {
    if (!onUpdate) {
      handleAction(section === 'profile' ? 'Edit Profile' : 'Edit Business');
      return;
    }

    setSaveError(null);
    setEditingSection(section);
  };

  const cancelEdit = () => {
    setSaveError(null);
    setEditingSection(null);
  };

  const toggleBusinessPaymentMethod = (method: string) => {
    setBusinessDraft((previous) => {
      const exists = previous.payment_methods.includes(method);

      return {
        ...previous,
        payment_methods: exists
          ? previous.payment_methods.filter((item) => item !== method)
          : [...previous.payment_methods, method],
      };
    });
  };

  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const avatarInputRef = React.useRef<HTMLInputElement>(null);

  const handleAvatarSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = ''; // allow re-selecting the same file later

    if (!file || !onAvatarUpload) return;

    setAvatarError(null);
    setAvatarUploading(true);

    try {
      await onAvatarUpload(file);
    } catch (err: any) {
      setAvatarError(
        err?.response?.data?.message ||
          err?.message ||
          'Unable to upload avatar. Please try again.'
      );
    } finally {
      setAvatarUploading(false);
    }
  };

  const saveSection = async (section: 'profile' | 'business') => {
    if (!onUpdate) return;

    setSaving(true);
    setSaveError(null);

    try {
      await onUpdate(section, section === 'profile' ? profileDraft : businessDraft);
      setEditingSection(null);
    } catch (err: any) {
      setSaveError(
        err?.response?.data?.message ||
          err?.message ||
          'Unable to save changes. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="merchant-profile-page">
        <div className="merchant-profile-container">
          <div className="merchant-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
            <i className="fa-solid fa-circle-notch fa-spin fs-2" />
            <p style={{ marginTop: 12 }}>Loading your merchant profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="merchant-profile-page">
        <div className="merchant-profile-container">
          <div className="merchant-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
            <i className="fa-solid fa-circle-exclamation fs-2 text-danger" />
            <p style={{ marginTop: 12 }}>{error}</p>
            {onRetry && (
              <button className="merchant-outline-btn" onClick={onRetry}>
                <i className="fa-solid fa-rotate-right" />
                Try Again
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="merchant-profile-page">
        <div className="merchant-profile-container">
          <div className="merchant-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
            <i className="fa-solid fa-store-slash fs-2" />
            <h2 style={{ marginTop: 12 }}>No Merchant Application Found</h2>
            <p>You haven&apos;t submitted a merchant application yet.</p>
            <a href="/dashboard/merchant/application" className="sidebar-purple-btn">
              Apply Now
              <i className="fa-solid fa-arrow-up-right-from-square" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  const merchantId = `#MER${String(application.id).padStart(6, '0')}`;
  const memberSince = formatDate(application.created_at);

  const personalPhone = application.phone
    ? `${application.phone_country_code} ${application.phone}`
    : '-';

  const businessPhone = application.business_phone
    ? `${application.business_phone_country_code} ${application.business_phone}`
    : '-';

  const verification = [
    {
      icon: 'fa-solid fa-id-card',
      title: 'KYC Verification',
      value: statusLabel(application.status),
      status: application.status === 'approved' ? 'verified' : 'normal',
    },
    {
      icon: 'fa-regular fa-envelope',
      title: 'Business Email',
      value: application.business_email || '-',
      status: 'normal',
    },
    {
      icon: 'fa-solid fa-building-shield',
      title: 'Security Deposit',
      value: `${formatMoney(application.deposit_amount)} ${application.trade_coin}`,
      subtitle: application.deposit_paid ? 'Paid & Refundable' : 'Not Paid',
      status: application.deposit_paid ? 'verified' : 'normal',
    },
    {
      icon: 'fa-solid fa-file-signature',
      title: 'Terms & Policy',
      value: application.agreed_terms ? 'Agreed' : 'Not Agreed',
      status: application.agreed_terms ? 'verified' : 'normal',
    },
  ];

  return (
    <div className="merchant-profile-page">
      <div className="merchant-profile-container">

        {/* HEADER */}
        <div className="merchant-page-header">
          <div>
            <h1>Merchant Profile</h1>
            <p>Manage your profile, business info and account settings.</p>
          </div>

          <button
            className="merchant-outline-btn"
            onClick={() => startEdit('profile')}
          >
            <i className="fa-solid fa-pen-to-square" />
            Edit Profile
          </button>
        </div>

        {application.status === 'rejected' && application.rejection_reason && (
          <div className="application-error">
            <i className="fa-solid fa-circle-exclamation" />
            <span>
              Your application was rejected: {application.rejection_reason}
            </span>
          </div>
        )}

        {/* MAIN GRID */}
        <div className="merchant-profile-grid">

          {/* ================= LEFT COLUMN ================= */}
          <div className="merchant-profile-main">

            {/* PROFILE CARD */}
            <section className="merchant-card merchant-profile-card">

              <div className="merchant-profile-top">

                {/* <div className="merchant-avatar-wrapper">
                  <div className="merchant-avatar">
                    <div className="merchant-avatar-fallback">
                      <i className="fa-solid fa-user" />
                    </div>
                  </div>

                  <span className={statusBadgeClass(application.status)}>
                    <i
                      className={
                        application.status === 'approved'
                          ? 'fa-solid fa-circle-check me-2 text-info'
                          : application.status === 'rejected'
                          ? 'fa-solid fa-circle-xmark me-2'
                          : 'fa-solid fa-hourglass-half me-2'
                      }
                    />
                    {application.status === 'approved'
                      ? 'Verified Merchant'
                      : statusLabel(application.status)}
                  </span>
                </div> */}
                <div className="merchant-avatar-wrapper">
                   <div className="merchant-avatar">
                    {application.avatar_url ? (
                      <img
                        src={application.avatar_url}
                        alt={application.full_name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                      />
                    ) : (
                      <div className="merchant-avatar-fallback">
                        <i className="fa-solid fa-user" />
                      </div>
                    )}
                  </div>

                  {onAvatarUpload && (
                    <>
                      <button
                        type="button"
                        className="merchant-avatar-edit-btn"
                        onClick={() => avatarInputRef.current?.click()}
                        disabled={avatarUploading}
                        aria-label="Change avatar"
                      >
                        {avatarUploading ? (
                          <i className="fa-solid fa-circle-notch fa-spin" />
                        ) : (
                          <i className="fa-solid fa-camera" />
                        )}
                      </button>

                      <input
                        ref={avatarInputRef}
                        type="file"
                        accept="image/png, image/jpeg, image/webp"
                        style={{ display: 'none' }}
                        onChange={handleAvatarSelect}
                      />
                    </>
                  )}

                  <span className={statusBadgeClass(application.status)}>
                      <i
                        className={
                          application.status === 'approved'
                            ? 'fa-solid fa-circle-check me-2 text-info'
                            : application.status === 'rejected'
                            ? 'fa-solid fa-circle-xmark me-2'
                            : 'fa-solid fa-hourglass-half me-2'
                        }
                      />
                      {application.status === 'approved'
                        ? 'Verified Merchant'
                        : statusLabel(application.status)}
                  </span>
                </div>

                {avatarError && <FieldError message={avatarError} />}

                <div className="merchant-profile-details">

                  <div className="merchant-name-row">
                    <h2>{application.full_name}</h2>
                  </div>

                  <div className="merchant-meta-grid">

                    <div className="merchant-meta-item">
                      <span>Merchant ID</span>
                      <strong>{merchantId}</strong>
                    </div>

                    <div className="merchant-meta-item">
                      <span>Username</span>
                      <strong>{application.username}</strong>
                    </div>

                    <div className="merchant-meta-item">
                      <span>Member Since</span>
                      <strong>{memberSince}</strong>
                    </div>

                  </div>
                </div>
              </div>

              {/* PROFILE STATS */}
              <div className="merchant-stats-row">

                <div className="merchant-stat">
                  <span>Total Orders</span>
                  <strong>{stats?.totalOrders ?? '—'}</strong>
                </div>

                <div className="merchant-stat">
                  <span>Completed Orders</span>
                  <strong>
                    {stats?.completedOrders ?? '—'}
                    {stats?.completedPercent !== undefined && (
                      <small> ({stats.completedPercent}%)</small>
                    )}
                  </strong>
                </div>

                <div className="merchant-stat">
                  <span>Positive Feedback</span>
                  <strong>
                    {stats?.positiveFeedbackPercent !== undefined
                      ? `${stats.positiveFeedbackPercent}%`
                      : '—'}
                  </strong>
                </div>

                <div className="merchant-stat">
                  <span>Response Time</span>
                  <strong>{stats?.responseTime ?? '—'}</strong>
                </div>

              </div>
            </section>

            {/* PERSONAL INFORMATION (editable) */}
            <section className="merchant-card business-info-card">

              <SectionHeader
                title="Personal Information"
                editing={editingSection === 'profile'}
                saving={saving}
                editable={Boolean(onUpdate)}
                onEdit={() => startEdit('profile')}
                onCancel={cancelEdit}
                onSave={() => saveSection('profile')}
              />

              {editingSection === 'profile' && saveError && (
                <FieldError message={saveError} />
              )}

              {editingSection === 'profile' ? (
                <div className="business-info-grid">
                  <div className="business-column">

                    <EditInput
                      label="Full Name"
                      value={profileDraft.full_name}
                      onChange={(value) =>
                        setProfileDraft((p) => ({ ...p, full_name: value }))
                      }
                    />

                    <EditPhone
                      label="Phone Number"
                      countryCode={profileDraft.phone_country_code}
                      phone={profileDraft.phone}
                      onCountryCodeChange={(value) =>
                        setProfileDraft((p) => ({
                          ...p,
                          phone_country_code: value,
                        }))
                      }
                      onPhoneChange={(value) =>
                        setProfileDraft((p) => ({ ...p, phone: value }))
                      }
                    />

                  </div>

                  <div className="business-column">

                    <EditTextarea
                      label="Address"
                      value={profileDraft.address}
                      onChange={(value) =>
                        setProfileDraft((p) => ({ ...p, address: value }))
                      }
                    />

                  </div>
                </div>
              ) : (
                <div className="business-info-grid">
                  <div className="business-column">

                    <InfoItem
                      icon="fa-solid fa-user"
                      label="Full Name"
                      value={application.full_name || '-'}
                    />

                    <InfoItem
                      icon="fa-regular fa-envelope"
                      label="Email"
                      value={application.email || '-'}
                    />

                    <InfoItem
                      icon="fa-solid fa-phone"
                      label="Phone"
                      value={personalPhone}
                    />

                  </div>

                  <div className="business-column">

                    <InfoItem
                      icon="fa-solid fa-earth-asia"
                      label="Country"
                      value={application.country || '-'}
                    />

                    <InfoItem
                      icon="fa-solid fa-location-dot"
                      label="Address"
                      value={application.address || '-'}
                      multiline
                    />

                  </div>
                </div>
              )}
            </section>

            {/* BUSINESS INFORMATION (editable) */}
            <section className="merchant-card business-info-card">

              <SectionHeader
                title="Business Information"
                editing={editingSection === 'business'}
                saving={saving}
                editable={Boolean(onUpdate)}
                onEdit={() => startEdit('business')}
                onCancel={cancelEdit}
                onSave={() => saveSection('business')}
              />

              {editingSection === 'business' && saveError && (
                <FieldError message={saveError} />
              )}

              {editingSection === 'business' ? (
                <div className="business-info-grid">
                  <div className="business-column">

                    {/* Business type and tax ID are tied to KYC review and
                        aren't self-editable here. */}
                    <InfoItem
                      icon="fa-solid fa-building"
                      label="Business Type"
                      value={application.business_type || '-'}
                    />

                    <EditInput
                      label="Business Name"
                      value={businessDraft.business_name}
                      onChange={(value) =>
                        setBusinessDraft((p) => ({ ...p, business_name: value }))
                      }
                    />

                    <EditInput
                      label="Business Email"
                      type="email"
                      value={businessDraft.business_email}
                      onChange={(value) =>
                        setBusinessDraft((p) => ({
                          ...p,
                          business_email: value,
                        }))
                      }
                    />

                    <EditPhone
                      label="Business Phone"
                      countryCode={businessDraft.business_phone_country_code}
                      phone={businessDraft.business_phone}
                      onCountryCodeChange={(value) =>
                        setBusinessDraft((p) => ({
                          ...p,
                          business_phone_country_code: value,
                        }))
                      }
                      onPhoneChange={(value) =>
                        setBusinessDraft((p) => ({
                          ...p,
                          business_phone: value,
                        }))
                      }
                    />

                  </div>

                  <div className="business-column">

                    <InfoItem
                      icon="fa-solid fa-file-invoice"
                      label="Tax ID / NID"
                      value={application.tax_id || '-'}
                    />

                    <EditSelect
                      label="Preferred Coin"
                      value={businessDraft.trade_coin}
                      options={TRADE_COIN_OPTIONS}
                      onChange={(value) =>
                        setBusinessDraft((p) => ({ ...p, trade_coin: value }))
                      }
                    />

                    <EditSelect
                      label="Ad Operation Type"
                      value={businessDraft.operation_type}
                      options={OPERATION_TYPE_OPTIONS}
                      onChange={(value) =>
                        setBusinessDraft((p) => ({
                          ...p,
                          operation_type: value,
                        }))
                      }
                    />

                    <div className="field-group">
                      <label className="field-label">Payment Methods</label>

                      <div className="payment-methods">
                        {PAYMENT_METHOD_OPTIONS.map((method) => (
                          <button
                            type="button"
                            key={method}
                            className={
                              businessDraft.payment_methods.includes(method)
                                ? 'selected'
                                : ''
                            }
                            onClick={() => toggleBusinessPaymentMethod(method)}
                          >
                            {method}

                            {businessDraft.payment_methods.includes(method) && (
                              <i className="fa-solid fa-check" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>
              ) : (
                <div className="business-info-grid">
                  <div className="business-column">

                    <InfoItem
                      icon="fa-solid fa-building"
                      label="Business Type"
                      value={application.business_type || '-'}
                    />

                    <InfoItem
                      icon="fa-solid fa-building-columns"
                      label="Business Name"
                      value={application.business_name || '-'}
                    />

                    <InfoItem
                      icon="fa-regular fa-envelope"
                      label="Business Email"
                      value={application.business_email || '-'}
                    />

                    <InfoItem
                      icon="fa-solid fa-phone"
                      label="Business Phone"
                      value={businessPhone}
                    />

                  </div>

                  <div className="business-column">

                    <InfoItem
                      icon="fa-solid fa-file-invoice"
                      label="Tax ID / NID"
                      value={application.tax_id || '-'}
                    />

                    <InfoItem
                      icon="fa-brands fa-bitcoin"
                      label="Preferred Coin"
                      value={application.trade_coin || '-'}
                    />

                    <InfoItem
                      icon="fa-solid fa-money-bill-transfer"
                      label="Payment Methods"
                      value={
                        application.payment_methods?.length
                          ? application.payment_methods.join(', ')
                          : '-'
                      }
                    />

                  </div>

                </div>
              )}
            </section>

            {/* VERIFICATION */}
            <section className="merchant-card verification-card">

              <div className="merchant-section-header">
                <h3>Verification & Security</h3>
              </div>

              <div className="verification-grid">

                {verification.map((item) => (
                  <div className="verification-item" key={item.title}>
                    <div className="verification-icon">
                      <i className={item.icon} />
                    </div>

                    <div className="verification-content">
                      <span>{item.title}</span>

                      <div className="verification-value">
                        <strong
                          className={
                            item.status === 'verified' ? 'text-success' : ''
                          }
                        >
                          {item.value}
                        </strong>

                        {'subtitle' in item && item.subtitle && (
                          <small>{item.subtitle}</small>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

              </div>
            </section>

            {/* PERFORMANCE */}
            <section className="merchant-card performance-card">

              <div className="merchant-section-header">
                <h3>Performance Overview</h3>

                <button className="performance-filter">
                  This Month
                  <i className="fa-solid fa-chevron-down" />
                </button>
              </div>

              <div className="performance-grid">

                <PerformanceItem
                  title="Total Trading Volume"
                  value={stats?.totalTradingVolume ?? '—'}
                  subtitle="(This Month)"
                />

                <PerformanceItem
                  title="Buy Volume"
                  value={stats?.buyVolume ?? '—'}
                  subtitle="(This Month)"
                />

                <PerformanceItem
                  title="Sell Volume"
                  value={stats?.sellVolume ?? '—'}
                  subtitle="(This Month)"
                />

                <PerformanceItem
                  title="Total Earnings"
                  value={stats?.totalEarnings ?? '—'}
                  subtitle="(This Month)"
                />

              </div>
            </section>

          </div>

          {/* ================= RIGHT COLUMN ================= */}
          <aside className="merchant-profile-sidebar">

            {/* PROFILE COMPLETION */}
            <section className="merchant-card completion-card">

              <h3>Application Status</h3>

              <div className="completion-circle">
                <div className="completion-circle-inner">
                  <strong>{statusLabel(application.status)}</strong>
                  <span>
                    {application.status === 'approved'
                      ? 'Complete'
                      : application.status === 'rejected'
                      ? 'Action Needed'
                      : 'Under Review'}
                  </span>
                </div>
              </div>

              <p>
                {application.status === 'approved' &&
                  'Your merchant profile is complete. Keep it up!'}
                {application.status === 'pending' &&
                  'Our team is reviewing your application.'}
                {application.status === 'rejected' &&
                  (application.rejection_reason ||
                    'Please review and resubmit your application.')}
              </p>

              <button
                className="sidebar-purple-btn"
                onClick={() => handleAction('View Public Profile')}
              >
                View Public Profile
                <i className="fa-solid fa-arrow-up-right-from-square" />
              </button>

            </section>

            {/* MERCHANT LEVEL */}
            <section className="merchant-card level-card">

              <h3>Merchant Level</h3>

              <div className="level-content">

                <div className="level-icon">
                  <i className="fa-solid fa-shield-halved" />
                  <i className="fa-solid fa-star level-star" />
                </div>

                <div className="level-info">
                  <strong>
                    {stats?.level !== undefined ? `Level ${stats.level}` : '—'}
                  </strong>
                  <p>
                    {stats?.level !== undefined
                      ? 'Keep completing orders to level up.'
                      : 'Level data isn\u2019t available yet.'}
                  </p>
                </div>

              </div>

              <div className="xp-row">
                <div className="xp-progress">
                  <span
                    style={{
                      width:
                        stats?.xpCurrent !== undefined && stats?.xpTarget
                          ? `${Math.min(
                              100,
                              (stats.xpCurrent / stats.xpTarget) * 100
                            )}%`
                          : '0%',
                    }}
                  />
                </div>

                <strong>
                  {stats?.xpCurrent !== undefined && stats?.xpTarget
                    ? `${stats.xpCurrent} / ${stats.xpTarget} XP`
                    : '— / — XP'}
                </strong>
              </div>

            </section>

            {/* QUICK ACTIONS */}
            <section className="merchant-card quick-actions-card">

              <h3>Quick Actions</h3>

              <div className="quick-actions-list">

                {quickActions.map((action) => (
                  <button
                    key={action.title}
                    className="quick-action"
                    onClick={() => handleAction(action.title)}
                  >
                    <span className="quick-action-icon">
                      <i className={action.icon} />
                    </span>

                    <span>{action.title}</span>

                    <i className="fa-solid fa-chevron-right action-arrow" />
                  </button>
                ))}

              </div>

            </section>

          </aside>

        </div>
      </div>
    </div>
  );
}

/* ================= SECTION HEADER (view/edit toggle) ================= */

function SectionHeader({
  title,
  editing,
  saving,
  editable,
  onEdit,
  onCancel,
  onSave,
}: {
  title: string;
  editing: boolean;
  saving: boolean;
  editable: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
}) {
  return (
    <div className="merchant-section-header">
      <h3>{title}</h3>

      {editing ? (
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className="merchant-small-edit"
            type="button"
            onClick={onCancel}
            disabled={saving}
          >
            <i className="fa-solid fa-xmark" />
            Cancel
          </button>

          <button
            className="merchant-small-edit"
            type="button"
            onClick={onSave}
            disabled={saving}
          >
            {saving ? (
              <i className="fa-solid fa-circle-notch fa-spin" />
            ) : (
              <i className="fa-solid fa-check" />
            )}
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      ) : (
        editable && (
          <button className="merchant-small-edit" type="button" onClick={onEdit}>
            <i className="fa-solid fa-pen" />
            Edit
          </button>
        )
      )}
    </div>
  );
}

/* ================= DISPLAY COMPONENTS ================= */

function InfoItem({
  icon,
  label,
  value,
  multiline = false,
}: {
  icon: string;
  label: string;
  value: string;
  multiline?: boolean;
}) {
  return (
    <div className="info-item">

      <div className="info-item-icon">
        <i className={icon} />
      </div>

      <div className="info-item-content">
        <span>{label}</span>

        <strong className={multiline ? 'multiline-value' : ''}>
          {multiline
            ? value.split('\n').map((line, index) => (
                <React.Fragment key={line}>
                  {index > 0 && <br />}
                  {line}
                </React.Fragment>
              ))
            : value}
        </strong>
      </div>

    </div>
  );
}

function PerformanceItem({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: string;
  subtitle: string;
}) {
  return (
    <div className="performance-item">
      <span>{title}</span>
      <strong>{value}</strong>
      <small>{subtitle}</small>
    </div>
  );
}

/* ================= EDIT COMPONENTS ================= */

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="field-error" role="alert" aria-live="polite">
      <i className="fa-solid fa-circle-exclamation" style={{ marginRight: 5 }} />
      {message}
    </p>
  );
}

function EditInput({
  label,
  value,
  type = 'text',
  onChange,
}: {
  label: string;
  value: string;
  type?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="field-group">
      <label className="field-label">{label}</label>

      <div className="field-input-wrapper">
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
    </div>
  );
}

function EditTextarea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="field-group">
      <label className="field-label">{label}</label>

      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

function EditSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="field-group">
      <label className="field-label">{label}</label>

      <div className="select-input-wrapper">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <i className="fa-solid fa-chevron-down" />
      </div>
    </div>
  );
}

function EditPhone({
  label,
  countryCode,
  phone,
  onCountryCodeChange,
  onPhoneChange,
}: {
  label: string;
  countryCode: string;
  phone: string;
  onCountryCodeChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
}) {
  return (
    <div className="field-group">
      <label className="field-label">{label}</label>

      <div className="phone-input-container">
        <div className="country-code">
          <select
            className="bg-transparent"
            value={countryCode}
            onChange={(event) => onCountryCodeChange(event.target.value)}
          >
            {allCountries.map((country: CountryTelephoneData) => (
              <option key={country.iso2} value={`+${country.dialCode}`}>
                 (+{country.dialCode})
              </option>
            ))}
          </select>
        </div>

        <div className="divider" />

        <input
          className="bg-transparent ps-2"
          type="text"
          placeholder="Phone number"
          value={phone}
          onChange={(event) => onPhoneChange(event.target.value)}
        />
      </div>
    </div>
  );
}