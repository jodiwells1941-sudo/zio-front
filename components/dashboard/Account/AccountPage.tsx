"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  allCountries,
  type CountryTelephoneData,
} from "country-telephone-data";

// ─── Types ────────────────────────────────────────────────────────────────────

type Profile = {
  user_id: string;
  username: string;
  avatarSrc: string;
  totalWins: string;
  winsDue: string;
};

type Balance = {
  total: string;
  real: string;
  bonus: string;
  pendingWithdrawals: string;
};

type PersonalInfo = {
  name: string;
  email: string;
  emailVerified: boolean;
  countryCode: string;
  phone: string;
  phoneVerified: boolean;
};

type SecurityInfo = {
  lastChangeText: string;
};

type AccountPageProps = {
  title?: string;
  isVerified: number;
  profile: Profile;
  balance: Balance;
  personalInfo: PersonalInfo;
  security: SecurityInfo;
  onWalletClick?: () => void;
  onWithdrawalClick?: () => void;
  onSavePersonalInfo?: (data: PersonalInfo) => void;
  onSaveSecurity?: (payload: {
    oldPassword: string;
    password: string;
    confirmPassword: string;
    twoStepEnabled: boolean;
  }) => void;
  onAvatarChange?: () => void;
  onAvatarDelete?: () => void;
};

// ─── Root page ────────────────────────────────────────────────────────────────

export default function AccountPage({
  title = "Account",
  isVerified,
  profile,
  balance,
  personalInfo,
  security,
  onWalletClick,
  onWithdrawalClick,
  onSavePersonalInfo,
  onSaveSecurity,
  onAvatarChange,
  onAvatarDelete,
}: AccountPageProps) {
  return (
    <div className="content-area flex-grow-1 px-xl-0 px-2">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h2 className="page-title">{title}</h2>

        {isVerified == 3 && 
          <Link
            href="/dashboard/verify-profile"
            className="btn--primary py-2 px-3 text-sm d-flex align-items-center justify-content-center"
          >
            Verify Profile
          </Link>
        }
        {isVerified == 1 && 
          <div className="verified-status d-flex align-items-center">
            <i className="fas fa-check-circle chk fs-5" />
            <span className="ps-2">Verified</span>
          </div>
        }
        {isVerified == 2 && 
          <div className="verified-status d-flex align-items-center">
            {/* pending verification  */}
            <i className="fas fa-hourglass-half chk fs-5" />
            <span className="ps-2">Pending verification</span>
          </div>
        }
      </div>

      <div className="account-form-box-items">
        <ProfileCard profile={profile} />
        <BalanceCard
          isVerified={isVerified}
          balance={balance}
          onWalletClick={onWalletClick}
          onWithdrawalClick={onWithdrawalClick}
        />
      </div>

      <div className="account-edit-box-items">
        <EditProfile
          avatarSrc={profile.avatarSrc}
          onAvatarChange={onAvatarChange}
          onAvatarDelete={onAvatarDelete}
        />
        <PersonalInfoForm
          defaultValue={personalInfo}
          onSave={onSavePersonalInfo}
        />
        <SecuritySettings
          defaultValue={security}
          onSave={onSaveSecurity}
        />
      </div>
    </div>
  );
}

// ─── ProfileCard ──────────────────────────────────────────────────────────────

function ProfileCard({ profile }: { profile: Profile; }) {
  return (
    <div className="user-profile-card">
      <div className="user-header">
        <div className="avatar">
          <Image src={profile.avatarSrc} alt="User" width={56} height={56} />
        </div>
        <div className="user-name-wrapper">
          <h4 className="username">User ID: <span className="text-base change-link">{profile.user_id}</span></h4>
          <div className=" text-xl">
            {profile.username}
          </div>
        </div>
      </div>

      <div className="user-stats">
        <div className="stat-row">
          <span>Total all-time wins</span>
          <span className="val">{profile.totalWins}</span>
        </div>
        <div className="stat-row">
          <span>Wins due</span>
          <span className="val">{profile.winsDue}</span>
        </div>
      </div>
    </div>
  );
}

// ─── BalanceCard ──────────────────────────────────────────────────────────────

function BalanceCard({
  isVerified,
  balance,
  onWalletClick,
  onWithdrawalClick,
}: {
  isVerified: number;
  balance: Balance;
  onWalletClick?: () => void;
  onWithdrawalClick?: () => void;
}) {
  return (
    <div className="balance-card">
      <div className="balance-header d-flex justify-content-between">
        <div className="">
          <span className="label">Balance</span>
          <h2 className="amount">{balance.total}</h2>
        </div>
        {/* show verification status if not verified */}
        {isVerified !== 1 && (
          <div className="verification-status">
            <span className="badge bg-warning text-dark">Not Verified</span>
          </div>
        )}
        {isVerified === 1 && (
          <div className="verification-status">
            <span className="badge bg-success">Verified</span>
          </div>
        )}
      </div>

      <div className="balance-breakdown">
        <div className="item">
          <span className="text">Real money</span>
          <span className="price">{balance.real}</span>
        </div>
        <div className="item">
          <span className="text">Bonus money</span>
          <span className="price">{balance.bonus}</span>
        </div>
        <div className="item">
          <span className="text">Pending Withdrawals</span>
          <span className="price">{balance.pendingWithdrawals}</span>
        </div>
      </div>

      <div className="action-buttons">
        <Link href="/dashboard/wallet/?tab=tab2">
          <button className="btn-withdrawal px-5" type="button">
            Deposit <i className="fas fa-chevron-right" />
          </button>
        </Link>
        <Link href="/dashboard/wallet?tab=tab5">
          <button className="btn-withdrawal px-5" type="button">
            <i className="fas fa-print" /> Withdrawal
          </button>
        </Link>
        <Link href="/dashboard/wallet?tab=tab3">
          <button className="btn-withdrawal px-5" type="button">
            P2P <i className="fas fa-chevron-right" />
          </button>
        </Link>
        <Link href="/dashboard/wallet?tab=tab4">
          <button className="btn-withdrawal px-5" type="button">
            Transfer <i className="fas fa-chevron-right" />
          </button>
        </Link>
      </div>
    </div>
  );
}

// ─── EditProfile (avatar section) ────────────────────────────────────────────

function EditProfile({
  avatarSrc,
  onAvatarChange,
  onAvatarDelete,
}: {
  avatarSrc: string;
  onAvatarChange?: () => void;
  onAvatarDelete?: () => void;
}) {
  return (
    <div className="edit-profile-box">
      <h6>Edit Profile</h6>

      <div className="profile-card">
        <div className="avatar-section">
          <div className="text-content">
            <h2 className="title">Avatar</h2>
            <p className="subtitle">Edit your profile picture</p>
          </div>

          <div className="avatar-container">
            <div className="avatar-img-wrapper">
              <Image
                src={avatarSrc || "/images/avatar/one.png"}
                alt="Profile"
                width={70}
                height={70}
              />
            </div>

            {/* Edit button – triggers file input in parent via callback */}
            <button
              className="action-btn edit-btn"
              type="button"
              title="Edit Avatar"
              onClick={onAvatarChange}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>

            {/* Delete button */}
            <button
              className="action-btn delete-btn"
              type="button"
              title="Delete Avatar"
              onClick={onAvatarDelete}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                <line x1="10" y1="11" x2="10" y2="17" />
                <line x1="14" y1="11" x2="14" y2="17" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── PersonalInfoForm ─────────────────────────────────────────────────────────

function PersonalInfoForm({
  defaultValue,
  onSave,
}: {
  defaultValue: PersonalInfo;
  onSave?: (data: PersonalInfo) => void;
}) {
  const [form, setForm] = useState<PersonalInfo>(defaultValue);

  // Keep in sync if parent re-provides data (e.g. after user loads)
  useState(() => {
    setForm(defaultValue);
  });

  const update = <K extends keyof PersonalInfo>(key: K, value: PersonalInfo[K]) =>
    setForm((p) => ({ ...p, [key]: value }));

  return (
    <div className="personal-info-wrapper">
      <div className="info-header">
        <div className="text-group">
          <h2>Personal information</h2>
          <p>Change your identity information</p>
        </div>
        <button className="btn-save" type="button" onClick={() => onSave?.(form)}>
          Save
        </button>
      </div>

      <form className="info-form" onSubmit={(e) => e.preventDefault()}>
        <div className="field-group">
          <label>Your name</label>
          <input
            type="text"
            placeholder="Your name"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
          />
        </div>

        <div className="field-group">
          <label>Email address</label>
          {/* Email is read-only — cannot be changed */}
          <input
            type="email"
            placeholder="Your email"
            value={form.email}
            disabled
            readOnly
          />
          <div className={`status ${form.emailVerified ? "verified" : "unverified"}`}>
            <span className="icon">{form.emailVerified ? "✔" : "!"}</span>{" "}
            {form.emailVerified ? "Email verified" : "Not verified"}
          </div>
        </div>

        <div className="field-group">
          <label>Phone (optional)</label>
          <div className="phone-input-container">
            <div className="country-code">
              <select
                value={form.countryCode}
                onChange={(e) => update("countryCode", e.target.value)}
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
              type="text"
              placeholder="00++"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
            />
          </div>
          <div className={`status ${form.phoneVerified ? "verified" : "unverified"}`}>
            <span className="icon">{form.phoneVerified ? "✔" : "!"}</span>{" "}
            {form.phoneVerified ? "Verified" : "Not verified"}
          </div>
        </div>
      </form>
    </div>
  );
}

// ─── SecuritySettings ─────────────────────────────────────────────────────────

function SecuritySettings({
  defaultValue,
  onSave,
}: {
  defaultValue: SecurityInfo;
  onSave?: (payload: {
    oldPassword: string;
    password: string;
    confirmPassword: string;
    twoStepEnabled: boolean;
  }) => void;
}) {
  const [oldPassword,      setOldPassword]      = useState("");
  const [password,         setPassword]         = useState("");
  const [confirmPassword,  setConfirmPassword]  = useState("");
  const [showOld,          setShowOld]          = useState(false);
  const [show1,            setShow1]            = useState(false);
  const [show2,            setShow2]            = useState(false);
  const [twoStepEnabled,   setTwoStepEnabled]   = useState(false);

  // Password validation rules
  const has8      = password.length >= 8;
  const hasUpper  = /[A-Z]/.test(password);
  const hasLower  = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);

  const EyeIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );

  return (
    <div className="personal-info-wrapper">
      <div className="info-header">
        <div className="text-group">
          <h2>Security</h2>
          <p>{defaultValue.lastChangeText}</p>
        </div>
      </div>

      <div className="password-settings-container">
        {/* ── Old password ── */}
        <div className="input-group">
          <label>Old Password *</label>
          <div className="input-wrapper">
            <input
              type={showOld ? "text" : "password"}
              placeholder="Old password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />
            <button className="eye-btn" type="button" onClick={() => setShowOld((p) => !p)}>
              <EyeIcon />
            </button>
          </div>
        </div>

        {/* ── New password ── */}
        <div className="input-group">
          <label>Password *</label>
          <div className="input-wrapper">
            <input
              type={show1 ? "text" : "password"}
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button className="eye-btn" type="button" onClick={() => setShow1((p) => !p)}>
              <EyeIcon />
            </button>
          </div>

          <div className="validation-row">
            <div className={`status ${has8 ? "success" : "muted"}`}>
              <span className="icon">{has8 ? "✔" : "✖"}</span> 8 character
            </div>
            <div className={`status ${hasUpper && hasLower ? "success" : "muted"}`}>
              <span className="icon">{hasUpper && hasLower ? "✔" : "✖"}</span> Capital &amp; small
            </div>
            <div className={`status ${hasNumber ? "success" : "muted"}`}>
              <span className="icon">{hasNumber ? "✔" : "✖"}</span> Numbers
            </div>
            <div className={`status ${hasSymbol ? "success" : "muted"}`}>
              <span className="icon">{hasSymbol ? "✔" : "✖"}</span> Symbols
            </div>
          </div>
        </div>

        {/* ── Confirm password ── */}
        <div className="input-group">
          <label>Confirm password *</label>
          <div className="input-wrapper">
            <input
              type={show2 ? "text" : "password"}
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button className="eye-btn" type="button" onClick={() => setShow2((p) => !p)}>
              <EyeIcon />
            </button>
          </div>
        </div>

        <div className="info-header">
          <button
            className="btn-save"
            type="button"
            onClick={() =>
              onSave?.({ oldPassword, password, confirmPassword, twoStepEnabled })
            }
          >
            Save
          </button>
        </div>

        {/* ── Two-step toggle ── */}
        <div
          className="two-step-wrapper"
          role="button"
          tabIndex={0}
          onClick={() => setTwoStepEnabled((p) => !p)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") setTwoStepEnabled((p) => !p);
          }}
        >
          <div className="checkbox-orange">
            <span className="check-mark">{twoStepEnabled ? "✔" : ""}</span>
          </div>
          <div className="text-content">
            <h3>Two-step authentication</h3>
            <p>
              If you activate this check then any time you want to log in you
              have to confirm yourself with email or text.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}