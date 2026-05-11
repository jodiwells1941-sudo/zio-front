"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

type AffiliateProfile = {
  name: string;
  avatarSrc: string;
  levelLabel: string;
  commissionLabel: string;
  availableAmount: string;
};

type AffiliateStats = {
  totalEarnings: string;
  usersReferred: number;
  last30Days: string;
};

type Referral = { link: string };

type ReferredUserRow = {
  id: string;
  name: string;
  avatarSrc: string;
  registered: string;
  time: string;
  totalEarned: string;
};

type Pagination = {
  current: number;
  pages: number[];
  showDots?: boolean;
};

type SharePlatform =
  | "facebook"
  | "telegram"
  | "discord"
  | "linkedin"
  | "twitter"
  | "youtube"
  | "tiktok"
  | "skype";

const SHARE_ITEMS: Array<{ platform: SharePlatform; iconClass: string }> = [
  { platform: "facebook", iconClass: "fab fa-facebook-f" },
  { platform: "telegram", iconClass: "fab fa-telegram-plane" },
  { platform: "discord", iconClass: "fab fa-discord" },
  { platform: "linkedin", iconClass: "fab fa-linkedin-in" },
  { platform: "twitter", iconClass: "fab fa-twitter" },
  { platform: "youtube", iconClass: "fab fa-youtube" },
  { platform: "tiktok", iconClass: "fab fa-tiktok" },
  { platform: "skype", iconClass: "fab fa-skype" },
];

export default function AffiliatePage({
  profile,
  stats,
  referral,
  referredUsers,
  pagination,
  title = "Affiliate",
}: {
  title?: string;
  profile: AffiliateProfile;
  stats: AffiliateStats;
  referral: Referral;
  referredUsers: ReferredUserRow[];
  pagination: Pagination;
}) {
  const [refLink, setRefLink] = useState(referral.link);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(refLink);
      // optional toast / alert
      // alert("Copied!");
    } catch {
      // fallback
      const input = document.createElement("input");
      input.value = refLink;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
    }
  };

  const handleShare = (platform: SharePlatform) => {
    // Basic share URL examples (replace with your own)
    const encoded = encodeURIComponent(refLink);

    const map: Record<SharePlatform, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encoded}`,
      telegram: `https://t.me/share/url?url=${encoded}`,
      discord: `https://discord.com/channels/@me`, // no direct share URL, usually copy link
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`,
      twitter: `https://twitter.com/intent/tweet?url=${encoded}`,
      youtube: `https://www.youtube.com`, // no direct share URL
      tiktok: `https://www.tiktok.com`, // no direct share URL
      skype: `https://web.skype.com/share?url=${encoded}`,
    };

    const url = map[platform];
    // For platforms without direct share, just copy:
    if (platform === "discord" || platform === "youtube" || platform === "tiktok") {
      void handleCopy();
      return;
    }
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="">

      <h2 className="page-title mb-4">{title}</h2>

      <section className="your-information-box-items">
        <div className="containers">
          <h2 className="section-title mb-4">Your Information</h2>

          <div className="row g-4">
            <div className="col-lg-6">
              <ProfileCard profile={profile} />
            </div>

            <div className="col-lg-6">
              <StatisticsCard stats={stats} />
            </div>

            <div className="col-12">
              <ReferralCard
                link={refLink}
                onChangeLink={setRefLink}
                onCopy={handleCopy}
                onShare={handleShare}
              />
            </div>
          </div>

          <h2 className="section-title mb-4 mt-3">Your Information</h2>

          <ReferredUsersTable rows={referredUsers} pagination={pagination} />
        </div>
      </section>
    </div>
  );
}

function ProfileCard({ profile }: { profile: AffiliateProfile }) {
  return (
    <div className="info-card profile-main">
      <div className="profile-main-items d-flex mb-4">
        <div className="avatar-wrapper me-3">
          <Image src={profile.avatarSrc} alt="Profile" width={64} height={64} className="profile-img" />
        </div>

        <div className="profile-details">
          <h4 className="text-white fw-bold d-flex align-items-center">
            {profile.name}
            <span className="badge-star ms-2">
              <i className="fas fa-star" />
            </span>
          </h4>

          <div className="level-small d-flex gap-3 text-secondary">
            <span>
              <i className="fas fa-award me-1" /> {profile.levelLabel}
            </span>
            <span>
              <i className="fas fa-coins me-1" /> {profile.commissionLabel}
            </span>
          </div>

          <div className="balance-info d-flex align-items-center justify-content-between mt-4">
            <div className="d-flex align-items-center">
              <div className="icon-circle-gold me-3">
                <i className="fas fa-coins text-warning" />
              </div>
              <div>
                <h3 className="text-white fw-bold">{profile.availableAmount}</h3>
                <p className="text-secondary small">Available</p>
              </div>
            </div>

            <button type="button" className="btn btn-claim-gradient">
              Claim
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatisticsCard({ stats }: { stats: AffiliateStats }) {
  return (
    <div className="info-card">
      <h5 className="title">
        <i className="fas fa-chart-line me-2 text-secondary" />
        Statistics
      </h5>

      <div className="row g-4">
        <div className="col-6">
          <div className="stat-item d-flex">
            <div className="icon-square bg-pink me-3">
              <i className="fas fa-wallet" />
            </div>
            <div>
              <h5 className="price-text">{stats.totalEarnings}</h5>
              <p className="small text-secondary">Total Earnings</p>
            </div>
          </div>
        </div>

        <div className="col-6">
          <div className="stat-item d-flex">
            <div className="icon-square-round me-3">
              <Image
                src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                width={24}
                height={24}
                alt=""
              />
            </div>
            <div>
              <h5 className="price-text">{stats.usersReferred}</h5>
              <p className="small text-secondary">Users Referred</p>
            </div>
          </div>
        </div>

        <div className="col-12">
          <div className="stat-item d-flex">
            <div className="icon-square bg-blue me-3">
              <i className="fas fa-clock" />
            </div>
            <div>
              <h5 className="price-text">{stats.last30Days}</h5>
              <p className="small text-secondary">Last 30 Days</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReferralCard({
  link,
  onChangeLink,
  onCopy,
  onShare,
}: {
  link: string;
  onChangeLink: (v: string) => void;
  onCopy: () => void;
  onShare: (p: SharePlatform) => void;
}) {
  return (
    <div className="info-card p-4">
      <div className="row g-4 align-items-end">
        <div className="col-lg-6">
          <p className="small fw-bold text-white mb-2">Your Referral Link</p>

          <div className="d-flex gap-2">
            <div className="flex-grow-1">
              <input
                type="text"
                className="referral-box"
                placeholder="https://likeafaucet.com/r/e8ac"
                value={link}
                onChange={(e) => onChangeLink(e.target.value)}
              />
            </div>

            <button type="button" className="btn-icon-square" aria-label="Edit referral link">
              <i className="fas fa-pencil-alt" />
            </button>

            <button type="button" className="btn btn-copy-link" onClick={onCopy}>
              <i className="far fa-copy" /> Copy Link
            </button>
          </div>
        </div>

        <div className="col-lg-6">
          <p className="small fw-bold text-white mb-2">Share Your Link</p>
          <div className="d-flex flex-wrap gap-2">
            {SHARE_ITEMS.map((s) => (
              <button
                key={s.platform}
                type="button"
                className="share-icon"
                onClick={() => onShare(s.platform)}
                aria-label={`Share on ${s.platform}`}
              >
                <i className={s.iconClass} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ReferredUsersTable({
  rows,
  pagination,
}: {
  rows: ReferredUserRow[];
  pagination: Pagination;
}) {
  return (
    <div className="statiscal-table-wrapper">
      <div className="table-responsive">
        <table className="table custom-style-table">
          <thead>
            <tr>
              <th>username</th>
              <th>Registered</th>
              <th>Time</th>
              <th>Total Earned</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>
                  <div className="user-info">
                    <Image src={r.avatarSrc} alt="" width={32} height={32} />
                    <span>{r.name}</span>
                  </div>
                </td>
                <td>{r.registered}</td>
                <td>{r.time}</td>
                <td>
                  <div className="earned-info">
                    <span className="coin-icon">$</span> {r.totalEarned}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination is now UNDER the table, inside table-responsive */}
        <PaginationBar pagination={pagination} />
      </div>
    </div>
  );
}

function PaginationBar({ pagination }: { pagination: Pagination }) {
  return (
    <div className="pagination-wrapper">
      <Link href="#" className="page-item">
        &lt;
      </Link>

      {pagination.pages.map((p) => (
        <Link key={p} href="#" className={`page-item ${p === pagination.current ? "active" : ""}`}>
          {p}
        </Link>
      ))}

      {pagination.showDots ? <span className="dots">...</span> : null}

      <Link href="#" className="page-item">
        &gt;
      </Link>
    </div>
  );
}