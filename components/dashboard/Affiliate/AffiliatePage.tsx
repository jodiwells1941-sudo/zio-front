"use client";

import { getAffiliateData } from "@/app/api/affiliate";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

// ─── Types ─────────────────────────────────────────────────────────────────

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

type Referral = { link: string | null; code: string | null };

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
  | "facebook" | "telegram" | "discord" | "linkedin"
  | "twitter"  | "youtube"  | "tiktok"  | "skype";

const SHARE_ITEMS: Array<{ platform: SharePlatform; iconClass: string }> = [
  { platform: "facebook",  iconClass: "fab fa-facebook-f" },
  { platform: "telegram",  iconClass: "fab fa-telegram-plane" },
  { platform: "discord",   iconClass: "fab fa-discord" },
  { platform: "linkedin",  iconClass: "fab fa-linkedin-in" },
  { platform: "twitter",   iconClass: "fab fa-twitter" },
  { platform: "youtube",   iconClass: "fab fa-youtube" },
  { platform: "tiktok",    iconClass: "fab fa-tiktok" },
  { platform: "skype",     iconClass: "fab fa-skype" },
];

// ─── Container ─────────────────────────────────────────────────────────────

export default function AffiliatePageContainer({ title = "Affiliate" }: { title?: string }) {
  const [loading, setLoading]       = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const [profile, setProfile]               = useState<AffiliateProfile | null>(null);
  const [stats, setStats]                   = useState<AffiliateStats | null>(null);
  const [referral, setReferral]             = useState<Referral | null>(null);
  const [referredUsers, setReferredUsers]   = useState<ReferredUserRow[]>([]);
  const [pagination, setPagination]         = useState<Pagination>({ current: 1, pages: [1] });
  const [hasAffiliate, setHasAffiliate]     = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        // apiClient throws on 4xx/5xx — catch and parse manually if needed
        const data = await getAffiliateData(currentPage);

        const d = data?.data;
        if (!d) return;

  console.log('d ====', d);


        // Detect whether user actually has an affiliate account
        setHasAffiliate(!!d.referral?.code);

        setProfile({
          name:            d.profile.name,
          avatarSrc:       d.profile.avatar_src,
          levelLabel:      d.profile.level_label,
          commissionLabel: d.profile.commission_label,
          availableAmount: d.profile.available_amount,
        });

        setStats({
          totalEarnings: d.stats.total_earnings,
          usersReferred: d.stats.users_referred,
          last30Days:    d.stats.last_30_days,
        });

        setReferral({
          link: d.referral.link,
          code: d.referral.code,
        });

        setReferredUsers(
          (d.referred_users?.data ?? []).map((u: {
            id: string | number;
            name: string;
            avatar_src: string;
            registered: string;
            time: string;
            total_earned: string;
          }) => ({
            id:          String(u.id),
            name:        u.name,
            avatarSrc:   u.avatar_src,
            registered:  u.registered,
            time:        u.time,
            totalEarned: u.total_earned,
          }))
        );

        const last    = d.pagination?.last    ?? 1;
        const current = d.pagination?.current ?? 1;
        const pages   = Array.from({ length: Math.min(last, 5) }, (_, i) => i + 1);
        setPagination({ current, pages, showDots: last > 5 });

      } catch (err) {
        console.error("Affiliate load error:", err);
        // Don't show a crash — just leave the empty-state visible
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [currentPage]);

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="spinner-border text-warning" role="status" />
      </div>
    );
  }

  // ── No affiliate account yet ─────────────────────────────────────────────
  if (!hasAffiliate && profile) {
    return (
      <div className="">
        <h2 className="page-title mb-4">{title}</h2>
        <section className="your-information-box-items">
          <div className="containers">
            {/* Still show the profile card so the page isn't blank */}
            <h2 className="section-title mb-4">Your Information</h2>
            <div className="row g-4">
              <div className="col-lg-6">
                <ProfileCard profile={profile} />
              </div>
              <div className="col-lg-6">
                <StatisticsCard stats={{ totalEarnings: "$0.00", usersReferred: 0, last30Days: "$0.00" }} />
              </div>
            </div>

            {/* "Not enrolled" notice */}
            <div className="info-card p-4 mt-4 text-center">
              <i className="fas fa-link fa-2x text-secondary mb-3 d-block" />
              <h5 className="text-white mb-2">You don&apos;t have an affiliate account yet</h5>
              <p className="text-secondary small mb-0">
                Contact support or wait for an admin to activate your affiliate account.
              </p>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // ── Data not ready (edge case) ────────────────────────────────────────────
  if (!profile || !stats || !referral) return null;

  // ── Full affiliate dashboard ──────────────────────────────────────────────
  return (
    <AffiliatePage
      title={title}
      profile={profile}
      stats={stats}
      referral={referral}
      referredUsers={referredUsers}
      pagination={pagination}
      onPageChange={setCurrentPage}
    />
  );
}

// ─── Presentational component ──────────────────────────────────────────────

function AffiliatePage({
  profile, stats, referral, referredUsers, pagination,
  title = "Affiliate", onPageChange,
}: {
  title?: string;
  profile: AffiliateProfile;
  stats: AffiliateStats;
  referral: Referral;
  referredUsers: ReferredUserRow[];
  pagination: Pagination;
  onPageChange?: (page: number) => void;
}) {
  const [refLink, setRefLink] = useState(referral.link ?? "");

  const handleCopy = async () => {
    if (!refLink) return;
    try {
      await navigator.clipboard.writeText(refLink);
      toast.success("Referral link copied to clipboard!");
    } catch {
      const input = document.createElement("input");
      input.value = refLink;
      document.body.appendChild(input);
      input.select();
      try { input.setSelectionRange(0, 99999); document.execCommand("copy"); } catch { /* ignore */ }
      document.body.removeChild(input);
    }
  };

  const handleShare = (platform: SharePlatform) => {
    const encoded = encodeURIComponent(refLink);
    const map: Record<SharePlatform, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encoded}`,
      telegram: `https://t.me/share/url?url=${encoded}`,
      discord:  `https://discord.com/channels/@me`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`,
      twitter:  `https://twitter.com/intent/tweet?url=${encoded}`,
      youtube:  `https://www.youtube.com`,
      tiktok:   `https://www.tiktok.com`,
      skype:    `https://web.skype.com/share?url=${encoded}`,
    };
    if (["discord", "youtube", "tiktok"].includes(platform)) {
      void handleCopy();
      return;
    }
    window.open(map[platform], "_blank", "noopener,noreferrer");
  };

  return (
    <div className="">
      <h2 className="page-title mb-4">{title}</h2>
      <section className="your-information-box-items">
        <div className="containers">
          <h2 className="section-title mb-4">Your Information</h2>
          <div className="row g-4">
            <div className="col-lg-6"><ProfileCard profile={profile} /></div>
            <div className="col-lg-6"><StatisticsCard stats={stats} /></div>
            <div className="col-12">
              <ReferralCard link={refLink} onChangeLink={setRefLink} onCopy={handleCopy} onShare={handleShare} />
            </div>
          </div>

          <h2 className="section-title mb-4 mt-3">Referred Users</h2>
          <ReferredUsersTable rows={referredUsers} pagination={pagination} onPageChange={onPageChange} />
        </div>
      </section>
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────

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
            <span className="badge-star ms-2"><i className="fas fa-star" /></span>
          </h4>
          <div className="level-small d-flex gap-3 text-secondary">
            <span><i className="fas fa-award me-1" /> {profile.levelLabel}</span>
            <span><i className="fas fa-coins me-1" /> {profile.commissionLabel}</span>
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
            {/* <button type="button" className="btn btn-claim-gradient">Claim</button> */}
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
        <i className="fas fa-chart-line me-2 text-secondary" />Statistics
      </h5>
      <div className="row g-4">
        <div className="col-6">
          <div className="stat-item d-flex">
            <div className="icon-square bg-pink me-3"><i className="fas fa-wallet" /></div>
            <div>
              <h5 className="price-text">{stats.totalEarnings}</h5>
              <p className="small text-secondary">Total Earnings</p>
            </div>
          </div>
        </div>
        <div className="col-6">
          <div className="stat-item d-flex">
            <div className="icon-square-round me-3">
              <Image src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" width={24} height={24} alt="" />
            </div>
            <div>
              <h5 className="price-text">{stats.usersReferred}</h5>
              <p className="small text-secondary">Users Referred</p>
            </div>
          </div>
        </div>
        <div className="col-12">
          <div className="stat-item d-flex">
            <div className="icon-square bg-blue me-3"><i className="fas fa-clock" /></div>
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
  link, onChangeLink, onCopy, onShare,
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
                placeholder="https://yourdomain.com/r/xxxxx"
                value={link}
                onChange={(e) => onChangeLink(e.target.value)}
              />
            </div>
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
  rows, pagination, onPageChange,
}: {
  rows: ReferredUserRow[];
  pagination: Pagination;
  onPageChange?: (page: number) => void;
}) {
  return (
    <div className="statiscal-table-wrapper">
      <div className="table-responsive">
        <table className="table custom-style-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Registered</th>
              <th>Time</th>
              <th>Total Earned</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center text-secondary py-4">
                  No referred users yet.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
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
              ))
            )}
          </tbody>
        </table>
        <PaginationBar pagination={pagination} onPageChange={onPageChange} />
      </div>
    </div>
  );
}

function PaginationBar({
  pagination, onPageChange,
}: {
  pagination: Pagination;
  onPageChange?: (page: number) => void;
}) {
  const goTo = (p: number) => onPageChange?.(p);
  return (
    <div className="pagination-wrapper">
      <button className="page-item" onClick={() => goTo(Math.max(1, pagination.current - 1))}>
        &lt;
      </button>
      {pagination.pages.map((p) => (
        <button
          key={p}
          className={`page-item ${p === pagination.current ? "active" : ""}`}
          onClick={() => goTo(p)}
        >
          {p}
        </button>
      ))}
      {pagination.showDots ? <span className="dots">...</span> : null}
      <button className="page-item" onClick={() => goTo(pagination.current + 1)}>
        &gt;
      </button>
    </div>
  );
}