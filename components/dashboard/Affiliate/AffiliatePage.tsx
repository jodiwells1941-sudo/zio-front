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

type AffiliateBlock = {
  exists: boolean;
  id?: number;
  referral_code: string | null;
  referral_link: string | null;
  commission: string;
  total_earnings: string;
  available_balance: string;
  status: string | null;
};

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
  const [loading, setLoading]             = useState(true);
  const [currentPage, setCurrentPage]     = useState(1);
  const [profile, setProfile]             = useState<AffiliateProfile | null>(null);
  const [stats, setStats]                 = useState<AffiliateStats | null>(null);
  const [activeReferral, setActiveReferral] = useState<{ link: string | null; code: string | null }>({ link: null, code: null });
  const [defaultAffiliate, setDefaultAffiliate] = useState<AffiliateBlock | null>(null);
  const [specialAffiliate, setSpecialAffiliate] = useState<AffiliateBlock | null>(null);
  const [referredUsers, setReferredUsers] = useState<ReferredUserRow[]>([]);
  const [pagination, setPagination]       = useState<Pagination>({ current: 1, pages: [1] });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await getAffiliateData(currentPage);
        const d = data?.data;
        if (!d) return;

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

        setDefaultAffiliate(d.affiliates?.default ?? null);
        setSpecialAffiliate(d.affiliates?.special ?? null);

        setActiveReferral({
          link: d.referral?.link,
          code: d.referral?.code,
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
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [currentPage]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="spinner-border text-warning" role="status" />
      </div>
    );
  }

  if (!profile || !stats) return null;

  return (
    <AffiliatePage
      title={title}
      profile={profile}
      stats={stats}
      activeReferral={activeReferral}
      defaultAffiliate={defaultAffiliate}
      specialAffiliate={specialAffiliate}
      referredUsers={referredUsers}
      pagination={pagination}
      onPageChange={setCurrentPage}
    />
  );
}

// ─── Presentational component ──────────────────────────────────────────────

function AffiliatePage({
  title = "Affiliate",
  profile,
  stats,
  activeReferral,
  defaultAffiliate,
  specialAffiliate,
  referredUsers,
  pagination,
  onPageChange,
}: {
  title?: string;
  profile: AffiliateProfile;
  stats: AffiliateStats;
  activeReferral: { link: string | null; code: string | null };
  defaultAffiliate: AffiliateBlock | null;
  specialAffiliate: AffiliateBlock | null;
  referredUsers: ReferredUserRow[];
  pagination: Pagination;
  onPageChange?: (page: number) => void;
}) {
  const [refLink, setRefLink] = useState(activeReferral.link ?? "");

  const handleCopy = async (link?: string) => {
    const text = link ?? refLink;
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Referral link copied!");
    } catch {
      const input = document.createElement("input");
      input.value = text;
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
    <div>
      <h2 className="page-title mb-4">{title}</h2>

      <section className="your-information-box-items">
        <div className="containers">

          {/* ── Profile + Stats ── */}
          <h2 className="section-title mb-4">Your Information</h2>
          <div className="row g-4 mb-4">
            <div className="col-lg-6">
              <ProfileCard profile={profile} />
            </div>
            <div className="col-lg-6">
              <StatisticsCard stats={stats} />
            </div>
          </div>

          {/* ── Affiliate Blocks ── */}
          <h2 className="section-title mb-4">Your Affiliate Accounts</h2>
          <div className="row g-4 mb-4">

            {/* Default affiliate — always exists */}
            <div className="col-lg-6">
              <AffiliateBlockCard
                type="default"
                label="Default Affiliate"
                badge="Auto"
                badgeClass="badge-default"
                description="Auto-created when you registered. Share this link to start earning."
                block={defaultAffiliate}
                onCopy={handleCopy}
                onShare={handleShare}
                refLink={refLink}
                onChangeLink={setRefLink}
                isActive={!specialAffiliate?.exists}
              />
            </div>

            {/* Special affiliate — may or may not exist */}
            <div className="col-lg-6">
              <AffiliateBlockCard
                type="special"
                label="Special Affiliate"
                badge="Special"
                badgeClass="badge-special"
                description={
                  specialAffiliate?.exists
                    ? "Admin-assigned special commission rate."
                    : "Not assigned yet. Contact support to get a special affiliate account."
                }
                block={specialAffiliate}
                onCopy={handleCopy}
                onShare={handleShare}
                refLink={refLink}
                onChangeLink={setRefLink}
                isActive={!!specialAffiliate?.exists}
              />
            </div>
          </div>

          {/* ── Active referral link (used for share buttons) ── */}
          <div className="col-12 mb-4">
            <ReferralCard
              link={refLink}
              onChangeLink={setRefLink}
              onCopy={() => handleCopy()}
              onShare={handleShare}
            />
          </div>

          {/* ── Referred Users Table ── */}
          <h2 className="section-title mb-4 mt-3">Referred Users</h2>
          <ReferredUsersTable
            rows={referredUsers}
            pagination={pagination}
            onPageChange={onPageChange}
          />

        </div>
      </section>
    </div>
  );
}

// ─── AffiliateBlockCard ────────────────────────────────────────────────────

function AffiliateBlockCard({
  type, label, badge, badgeClass, description, block, onCopy, isActive,
}: {
  type: "default" | "special";
  label: string;
  badge: string;
  badgeClass: string;
  description: string;
  block: AffiliateBlock | null;
  onCopy: (link: string) => void;
  onShare: (p: SharePlatform) => void;
  refLink: string;
  onChangeLink: (v: string) => void;
  isActive: boolean;
}) {
  const exists = block?.exists ?? false;

  return (
    <div className={`info-card p-4 h-100 ${isActive ? "affiliate-card-active" : ""}`}>
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div className="d-flex align-items-center gap-2">
          <i className={`fas ${type === "special" ? "fa-star text-warning" : "fa-user text-info"} `} />
          <h6 className="text-white mb-0 fw-bold">{label}</h6>
        </div>
        <span className={`badge ${badgeClass}`}>{badge}</span>
      </div>

      <p className="text-secondary small mb-3">{description}</p>

      {exists && block ? (
        <>
          {/* Commission + Earnings row */}
          <div className="row g-2 mb-3">
            <div className="col-6">
              <div className="stat-mini">
                <p className="text-secondary small mb-0">Commission</p>
                <h6 className="text-white mb-0">{block.commission}</h6>
              </div>
            </div>
            <div className="col-6">
              <div className="stat-mini">
                <p className="text-secondary small mb-0">Earnings</p>
                <h6 className="text-white mb-0">{block.total_earnings}</h6>
              </div>
            </div>
            <div className="col-6">
              <div className="stat-mini">
                <p className="text-secondary small mb-0">Available</p>
                <h6 className="text-white mb-0">{block.available_balance}</h6>
              </div>
            </div>
            <div className="col-6">
              <div className="stat-mini">
                <p className="text-secondary small mb-0">Status</p>
                <span className={`badge ${block.status === "active" ? "bg-success" : "bg-danger"}`}>
                  {block.status}
                </span>
              </div>
            </div>
          </div>

          {/* Referral code + copy */}
          {block.referral_code && (
            <div className="d-flex gap-2 align-items-center">
              <code className="referral-code-mini flex-grow-1">{block.referral_code}</code>
              <button
                type="button"
                className="btn btn-copy-link btn-sm"
                onClick={() => block.referral_link && onCopy(block.referral_link)}
              >
                <i className="far fa-copy" /> Copy
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="not-enrolled-mini text-center py-3">
          <i className="fas fa-lock fa-lg text-secondary mb-2 d-block" />
          <p className="text-secondary small mb-0">Not activated</p>
        </div>
      )}
    </div>
  );
}

// ─── Other sub-components (unchanged) ─────────────────────────────────────

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
            <span><i className="fas fa-award me-1" />{profile.levelLabel}</span>
            <span><i className="fas fa-coins me-1" />{profile.commissionLabel}</span>
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
          <p className="small fw-bold text-white mb-2">Active Referral Link</p>
          <div className="d-flex gap-2">
            <div className="flex-grow-1">
              <input
                type="text"
                className="referral-box"
                placeholder="https://yourdomain.com/sign-up?ref=xxxxx"
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

function PaginationBar({ pagination, onPageChange }: {
  pagination: Pagination;
  onPageChange?: (page: number) => void;
}) {
  const goTo = (p: number) => onPageChange?.(p);
  return (
    <div className="pagination-wrapper">
      <button className="page-item" onClick={() => goTo(Math.max(1, pagination.current - 1))}>&lt;</button>
      {pagination.pages.map((p) => (
        <button
          key={p}
          className={`page-item ${p === pagination.current ? "active" : ""}`}
          onClick={() => goTo(p)}
        >
          {p}
        </button>
      ))}
      {pagination.showDots && <span className="dots">...</span>}
      <button className="page-item" onClick={() => goTo(pagination.current + 1)}>&gt;</button>
    </div>
  );
}