'use client';

import React, { useEffect, useState } from 'react';
import {
  allCountries,
  type CountryTelephoneData,
} from 'country-telephone-data';
import { updateMerchantApplicationApi } from '@/app/api/merchant';

/* =========================================================
   TYPES — mirrors the /merchant/account API response
========================================================= */

export type MerchantApplicationStatus = 'pending' | 'approved' | 'rejected';

export type MerchantApplication = {
  id: number;
  user_id: number;
  full_name: string;
  username: string;
  email: string;
  phone_country_code: string;
  phone: string;
  dob: string;
  country: string;
  city: string;
  address: string;
  language: string;
  source: string;

  business_type: string;
  business_name: string;
  registration_number: string;
  tax_id: string;
  business_email: string;
  business_phone_country_code: string;
  business_phone: string;
  business_address: string;
  operation_type: string;

  trade_coin: string;
  payment_methods: string[];
  daily_volume: string;
  average_order: string;
  trading_source: string;

  national_id_path: string;
  selfie_path: string;
  business_proof_path: string | null;
  address_proof_path: string;

  deposit_paid: boolean;
  deposit_amount: string;
  agreed_terms: boolean;

  status: MerchantApplicationStatus;
  rejection_reason: string | null;

  created_at: string;
  updated_at: string;

  national_id_url: string;
  selfie_url: string;
  business_proof_url: string | null;
  address_proof_url: string;
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

type MerchantProfileProps = {
  application: MerchantApplication | null;
  stats?: MerchantStats | null;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  // Called after a successful profile/business edit so the parent page can
  // keep its own copy of the application in sync.
  onUpdated?: (updated: MerchantApplication) => void;
};

const PAYMENT_METHOD_OPTIONS = ['Bank Transfer', 'bKash', 'Nagad', 'Rocket'];
const BUSINESS_TYPE_OPTIONS = ['Individual', 'Company', 'Partnership'];
const TRADE_COIN_OPTIONS = ['USDT', 'USDC', 'BTC'];
const OPERATION_TYPE_OPTIONS = [
  'Manually (I will manage orders)',
  'Automatically',
];

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
  if (status === 'approved') return 'top-rated-badge';
  if (status === 'rejected') return 'top-rated-badge status-rejected';
  return 'top-rated-badge status-pending';
}

function extractErrorMessage(err: any, fallback: string): string {
  const apiMessage =
    err?.response?.data?.message ||
    (err?.response?.data?.errors &&
      (Object.values(err.response.data.errors as Record<string, any>) as any)[0]?.[0]);

  return apiMessage || fallback;
}

const quickActions = [
  { icon: 'fa-solid fa-paper-plane', title: 'Create Advertisement' },
  { icon: 'fa-solid fa-rectangle-ad', title: 'My Advertisements' },
  { icon: 'fa-solid fa-bag-shopping', title: 'My Orders' },
  { icon: 'fa-solid fa-sliders', title: 'Earnings & Commission' },
  { icon: 'fa-solid fa-shield-halved', title: 'Security Deposit' },
];

/* =========================================================
   EDIT FORM STATE TYPES
========================================================= */

type ProfileFormState = {
  full_name: string;
  username: string;
  phone_country_code: string;
  phone: string;
};

type BusinessFormState = {
  business_type: string;
  business_name: string;
  registration_number: string;
  tax_id: string;
  business_email: string;
  business_phone_country_code: string;
  business_phone: string;
  business_address: string;
  operation_type: string;
  trade_coin: string;
  payment_methods: string[];
};

function toProfileForm(app: MerchantApplication): ProfileFormState {
  return {
    full_name: app.full_name,
    username: app.username,
    phone_country_code: app.phone_country_code || '+880',
    phone: app.phone,
  };
}

function toBusinessForm(app: MerchantApplication): BusinessFormState {
  return {
    business_type: app.business_type,
    business_name: app.business_name,
    registration_number: app.registration_number,
    tax_id: app.tax_id,
    business_email: app.business_email,
    business_phone_country_code: app.business_phone_country_code || '+880',
    business_phone: app.business_phone,
    business_address: app.business_address,
    operation_type: app.operation_type,
    trade_coin: app.trade_coin,
    payment_methods: app.payment_methods || [],
  };
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function MerchantProfile({
  application,
  stats = null,
  loading = false,
  error = null,
  onRetry,
  onUpdated,
}: MerchantProfileProps) {
  const [current, setCurrent] = useState<MerchantApplication | null>(application);

  useEffect(() => {
    setCurrent(application);
  }, [application]);

  const handleAction = (action: string) => {
    console.log(`Navigate to: ${action}`);
  };

  const applyUpdate = (updated: MerchantApplication) => {
    setCurrent(updated);
    onUpdated?.(updated);
  };

  /* ---------------- PROFILE EDIT ---------------- */

  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState<ProfileFormState | null>(null);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const startEditingProfile = () => {
    if (!current) return;
    setProfileForm(toProfileForm(current));
    setProfileError(null);
    setEditingProfile(true);
  };

  const cancelEditingProfile = () => {
    setEditingProfile(false);
    setProfileError(null);
  };

  const saveProfile = async () => {
    if (!profileForm) return;

    if (!profileForm.full_name || !profileForm.username || !profileForm.phone) {
      setProfileError('Full name, username, and phone are required.');
      return;
    }

    setProfileSaving(true);
    setProfileError(null);

    try {
      const res = await updateMerchantApplicationApi(profileForm);
      const updated = res?.data?.application;

      if (updated) {
        applyUpdate(updated);
      } else if (current) {
        applyUpdate({ ...current, ...profileForm });
      }

      setEditingProfile(false);
    } catch (err: any) {
      setProfileError(extractErrorMessage(err, 'Unable to save your profile. Please try again.'));
    } finally {
      setProfileSaving(false);
    }
  };

  /* ---------------- BUSINESS EDIT ---------------- */

  const [editingBusiness, setEditingBusiness] = useState(false);
  const [businessForm, setBusinessForm] = useState<BusinessFormState | null>(null);
  const [businessSaving, setBusinessSaving] = useState(false);
  const [businessError, setBusinessError] = useState<string | null>(null);

  const startEditingBusiness = () => {
    if (!current) return;
    setBusinessForm(toBusinessForm(current));
    setBusinessError(null);
    setEditingBusiness(true);
  };

  const cancelEditingBusiness = () => {
    setEditingBusiness(false);
    setBusinessError(null);
  };

  const toggleBusinessPaymentMethod = (method: string) => {
    setBusinessForm((prev) => {
      if (!prev) return prev;

      const exists = prev.payment_methods.includes(method);

      return {
        ...prev,
        payment_methods: exists
          ? prev.payment_methods.filter((item) => item !== method)
          : [...prev.payment_methods, method],
      };
    });
  };

  const saveBusiness = async () => {
    if (!businessForm) return;

    if (
      !businessForm.business_type ||
      !businessForm.tax_id ||
      !businessForm.business_email ||
      !businessForm.business_phone ||
      !businessForm.business_address ||
      !businessForm.operation_type ||
      !businessForm.trade_coin ||
      businessForm.payment_methods.length === 0
    ) {
      setBusinessError('Please complete all required business fields.');
      return;
    }

    setBusinessSaving(true);
    setBusinessError(null);

    try {
      const res = await updateMerchantApplicationApi(businessForm);
      const updated = res?.data?.application;

      if (updated) {
        applyUpdate(updated);
      } else if (current) {
        applyUpdate({ ...current, ...businessForm });
      }

      setEditingBusiness(false);
    } catch (err: any) {
      setBusinessError(extractErrorMessage(err, 'Unable to save your business information. Please try again.'));
    } finally {
      setBusinessSaving(false);
    }
  };

  /* ---------------- RENDER STATES ---------------- */

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

  if (!current) {
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

  const application = current;

  const merchantId = `#MER${String(application.id).padStart(6, '0')}`;
  const memberSince = formatDate(application.created_at);

  const businessPhone = application.business_phone
    ? `${application.business_phone_country_code} ${application.business_phone}`
    : '-';

  const businessAddress = application.business_address || '-';

  const documents = [
    { title: 'National ID / Passport', url: application.national_id_url },
    { title: 'Selfie with ID', url: application.selfie_url },
    { title: 'Business Proof', url: application.business_proof_url },
    { title: 'Address Proof', url: application.address_proof_url },
  ];

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

              <div className="merchant-section-header">
                <h3 style={{ display: 'none' }} />
                {!editingProfile ? (
                  <button
                    className="merchant-small-edit ms-auto"
                    onClick={startEditingProfile}
                  >
                    <i className="fa-solid fa-pen" />
                    Edit
                  </button>
                ) : (
                  <div className="d-flex gap-2 ms-auto">
                    <button
                      type="button"
                      className="merchant-small-edit"
                      onClick={cancelEditingProfile}
                      disabled={profileSaving}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="merchant-outline-btn"
                      onClick={saveProfile}
                      disabled={profileSaving}
                    >
                      {profileSaving ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                )}
              </div>

              {profileError && (
                <div className="application-error">
                  <i className="fa-solid fa-circle-exclamation" />
                  <span>{profileError}</span>
                </div>
              )}

              {!editingProfile ? (
                <>
                  <div className="merchant-profile-top">

                    <div className="merchant-avatar-wrapper">
                      <div className="merchant-avatar">
                        <div className="merchant-avatar-fallback">
                          <i className="fa-solid fa-user" />
                        </div>
                      </div>

                      <span className={statusBadgeClass(application.status)}>
                        <i
                          className={
                            application.status === 'approved'
                              ? 'fa-solid fa-circle-check'
                              : application.status === 'rejected'
                              ? 'fa-solid fa-circle-xmark'
                              : 'fa-solid fa-hourglass-half'
                          }
                        />
                        {application.status === 'approved'
                          ? 'Verified Merchant'
                          : statusLabel(application.status)}
                      </span>
                    </div>

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
                          <span>Phone</span>
                          <strong>
                            {application.phone
                              ? `${application.phone_country_code} ${application.phone}`
                              : '-'}
                          </strong>
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
                </>
              ) : (
                profileForm && (
                  <div className="row g-4">
                    <div className="col-lg-6">
                      <FormField
                        label="Full Name"
                        required
                        value={profileForm.full_name}
                        onChange={(value) =>
                          setProfileForm((prev) => prev && { ...prev, full_name: value })
                        }
                      />

                      <FormField
                        label="Username"
                        required
                        value={profileForm.username}
                        onChange={(value) =>
                          setProfileForm((prev) => prev && { ...prev, username: value })
                        }
                      />

                      <FormField
                        label="Email Address"
                        value={application.email}
                        disabled
                        helper="Email cannot be changed here."
                      />
                    </div>

                    <div className="col-lg-6">
                      <FormPhone
                        label="Phone Number"
                        required
                        countryCode={profileForm.phone_country_code}
                        phone={profileForm.phone}
                        onCountryCodeChange={(value) =>
                          setProfileForm((prev) => prev && { ...prev, phone_country_code: value })
                        }
                        onPhoneChange={(value) =>
                          setProfileForm((prev) => prev && { ...prev, phone: value })
                        }
                      />
                    </div>
                  </div>
                )
              )}
            </section>

            {/* BUSINESS INFORMATION */}
            <section className="merchant-card business-info-card">

              <div className="merchant-section-header">
                <h3>Business Information</h3>

                {!editingBusiness ? (
                  <button
                    className="merchant-small-edit"
                    onClick={startEditingBusiness}
                  >
                    <i className="fa-solid fa-pen" />
                    Edit
                  </button>
                ) : (
                  <div className="d-flex gap-2">
                    <button
                      type="button"
                      className="merchant-small-edit"
                      onClick={cancelEditingBusiness}
                      disabled={businessSaving}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="merchant-outline-btn"
                      onClick={saveBusiness}
                      disabled={businessSaving}
                    >
                      {businessSaving ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                )}
              </div>

              {businessError && (
                <div className="application-error">
                  <i className="fa-solid fa-circle-exclamation" />
                  <span>{businessError}</span>
                </div>
              )}

              {!editingBusiness ? (
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
                      icon="fa-solid fa-location-dot"
                      label="Business Address"
                      value={businessAddress}
                      multiline
                    />

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
              ) : (
                businessForm && (
                  <div className="row g-4">

                    <div className="col-lg-6">

                      <FormSelect
                        label="Business Type"
                        required
                        value={businessForm.business_type}
                        options={BUSINESS_TYPE_OPTIONS}
                        onChange={(value) =>
                          setBusinessForm((prev) => prev && { ...prev, business_type: value })
                        }
                      />

                      <FormField
                        label="Business Name"
                        value={businessForm.business_name}
                        onChange={(value) =>
                          setBusinessForm((prev) => prev && { ...prev, business_name: value })
                        }
                      />

                      <FormField
                        label="Business Registration Number"
                        value={businessForm.registration_number}
                        onChange={(value) =>
                          setBusinessForm((prev) => prev && { ...prev, registration_number: value })
                        }
                      />

                      <FormField
                        label="Tax ID / NID Number"
                        required
                        value={businessForm.tax_id}
                        onChange={(value) =>
                          setBusinessForm((prev) => prev && { ...prev, tax_id: value })
                        }
                      />

                      <FormField
                        label="Business Contact Email"
                        required
                        type="email"
                        value={businessForm.business_email}
                        onChange={(value) =>
                          setBusinessForm((prev) => prev && { ...prev, business_email: value })
                        }
                      />

                    </div>

                    <div className="col-lg-6">

                      <FormPhone
                        label="Business Contact Phone"
                        required
                        countryCode={businessForm.business_phone_country_code}
                        phone={businessForm.business_phone}
                        onCountryCodeChange={(value) =>
                          setBusinessForm((prev) => prev && { ...prev, business_phone_country_code: value })
                        }
                        onPhoneChange={(value) =>
                          setBusinessForm((prev) => prev && { ...prev, business_phone: value })
                        }
                      />

                      <FormTextarea
                        label="Business Address"
                        required
                        value={businessForm.business_address}
                        onChange={(value) =>
                          setBusinessForm((prev) => prev && { ...prev, business_address: value })
                        }
                      />

                      <FormSelect
                        label="How will you operate your ads?"
                        required
                        value={businessForm.operation_type}
                        options={OPERATION_TYPE_OPTIONS}
                        onChange={(value) =>
                          setBusinessForm((prev) => prev && { ...prev, operation_type: value })
                        }
                      />

                      <FormSelect
                        label="Preferred Trade Coin"
                        required
                        value={businessForm.trade_coin}
                        options={TRADE_COIN_OPTIONS}
                        onChange={(value) =>
                          setBusinessForm((prev) => prev && { ...prev, trade_coin: value })
                        }
                      />

                      <div className="field-group">
                        <label className="field-label">
                          Preferred Payment Methods <b>*</b>
                        </label>

                        <div className="payment-methods">
                          {PAYMENT_METHOD_OPTIONS.map((method) => (
                            <button
                              type="button"
                              key={method}
                              className={
                                businessForm.payment_methods.includes(method)
                                  ? 'selected'
                                  : ''
                              }
                              onClick={() => toggleBusinessPaymentMethod(method)}
                            >
                              {method}
                              {businessForm.payment_methods.includes(method) && (
                                <i className="fa-solid fa-check" />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                    </div>

                  </div>
                )
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

            {/* DOCUMENTS */}
            <section className="merchant-card verification-card">

              <div className="merchant-section-header">
                <h3>Submitted Documents</h3>
              </div>

              <div className="verification-grid">

                {documents.map((doc) => (
                  <div className="verification-item" key={doc.title}>
                    <div className="verification-icon">
                      <i className="fa-regular fa-file-lines" />
                    </div>

                    <div className="verification-content">
                      <span>{doc.title}</span>

                      <div className="verification-value">
                        {doc.url ? (
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-success"
                          >
                            View Document
                          </a>
                        ) : (
                          <strong>Not Provided</strong>
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

/* ================= EDIT FORM COMPONENTS ================= */

function FormField({
  label,
  required,
  value,
  type,
  disabled,
  helper,
  onChange,
}: {
  label: string;
  required?: boolean;
  value: string;
  type?: string;
  disabled?: boolean;
  helper?: string;
  onChange?: (value: string) => void;
}) {
  return (
    <div className="field-group">
      <label className="field-label">
        {label}
        {required && <b>*</b>}
      </label>

      <div className="field-input-wrapper">
        <input
          type={type ?? 'text'}
          value={value}
          disabled={disabled}
          onChange={(event) => onChange?.(event.target.value)}
        />
      </div>

      {helper && <small className="field-helper">{helper}</small>}
    </div>
  );
}

function FormTextarea({
  label,
  required,
  value,
  onChange,
}: {
  label: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="field-group">
      <label className="field-label">
        {label}
        {required && <b>*</b>}
      </label>

      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

function FormSelect({
  label,
  required,
  value,
  options,
  onChange,
}: {
  label: string;
  required?: boolean;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="field-group">
      <label className="field-label">
        {label}
        {required && <b>*</b>}
      </label>

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

function FormPhone({
  label,
  required,
  countryCode,
  phone,
  onCountryCodeChange,
  onPhoneChange,
}: {
  label: string;
  required?: boolean;
  countryCode: string;
  phone: string;
  onCountryCodeChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
}) {
  return (
    <div className="field-group">
      <label className="field-label">
        {label}
        {required && <b>*</b>}
      </label>

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