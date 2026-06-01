"use client";

import apiClient from "@/utils/apiClient";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

// ─── Types ─────────────────────────────────────────────────────────────────

type Submission = {
  id: number;
  status: "pending" | "approved" | "rejected" | "paid";
  video_link: string;
  admin_note: string | null;
  paid_at: string | null;
};

type AffiliatePackage = {
  id: number;
  name: string;
  required_views: number;
  amount: number;
  submission: Submission | null;
};

// ─── API helpers ───────────────────────────────────────────────────────────

const fetchPackages = async (): Promise<AffiliatePackage[]> => {
  const res = await apiClient.get("/user/affiliate-packages");
  return res.data?.data ?? [];
};

const submitPackage = async (packageId: number, videoLink: string) => {
  const res = await apiClient.post(`/user/affiliate-packages/${packageId}/submit`, {
    video_link: videoLink,
  });
  return res.data;
};

// ─── Status config ─────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  pending:  { label: "Pending", cls: "status-pending",  icon: "fa-clock" },
  approved: { label: "Approved",       cls: "status-approved", icon: "fa-check-circle" },
  rejected: { label: "Rejected",       cls: "status-rejected", icon: "fa-times-circle" },
  paid:     { label: "Paid",           cls: "status-paid",     icon: "fa-wallet" },
} as const;

// ─── Main component ────────────────────────────────────────────────────────

export default function AffiliatePackages() {
  const [packages, setPackages]         = useState<AffiliatePackage[]>([]);
  const [loading, setLoading]           = useState(true);
  const [submitting, setSubmitting]     = useState<number | null>(null); // packageId being submitted
  const [videoLinks, setVideoLinks]     = useState<Record<number, string>>({});
  const [openSubmit, setOpenSubmit]     = useState<number | null>(null); // packageId with open form

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchPackages();
      setPackages(data);
    } catch {
      toast.error("Failed to load packages.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const handleSubmit = async (pkg: AffiliatePackage) => {
    const link = videoLinks[pkg.id]?.trim();
    if (!link) {
      toast.error("Please enter a video link.");
      return;
    }

    setSubmitting(pkg.id);
    try {
      const res = await submitPackage(pkg.id, link);
      if (res.error) {
        toast.error(res.message);
      } else {
        toast.success(res.message);
        setOpenSubmit(null);
        setVideoLinks(prev => ({ ...prev, [pkg.id]: "" }));
        await load(); // refresh to show updated status
      }
    } catch {
      toast.error("Submission failed. Please try again.");
    } finally {
      setSubmitting(null);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-4">
        <div className="spinner-border text-warning spinner-border-sm" role="status" />
      </div>
    );
  }

  if (!packages.length) return null;

  return (
    <div className="affiliate-packages-section mb-4">
      <h2 className="section-title mb-4">Affiliate Packages</h2>

      <div className="row g-3">
        {packages.map(pkg => (
          <div key={pkg.id} className="col-md-6 col-lg-4">
            <PackageCard
              pkg={pkg}
              videoLink={videoLinks[pkg.id] ?? ""}
              isOpen={openSubmit === pkg.id}
              isSubmitting={submitting === pkg.id}
              onChangeLink={val =>
                setVideoLinks(prev => ({ ...prev, [pkg.id]: val }))
              }
              onToggleOpen={() =>
                setOpenSubmit(prev => (prev === pkg.id ? null : pkg.id))
              }
              onSubmit={() => handleSubmit(pkg)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── PackageCard ───────────────────────────────────────────────────────────

function PackageCard({
  pkg,
  videoLink,
  isOpen,
  isSubmitting,
  onChangeLink,
  onToggleOpen,
  onSubmit,
}: {
  pkg: AffiliatePackage;
  videoLink: string;
  isOpen: boolean;
  isSubmitting: boolean;
  onChangeLink: (v: string) => void;
  onToggleOpen: () => void;
  onSubmit: () => void;
}) {
  const sub    = pkg.submission;
  const status = sub?.status ?? null;
  const cfg    = status ? STATUS_CONFIG[status] : null;

  // Can submit: no submission yet, or previously rejected
  const canSubmit = !sub || sub.status === "rejected";

  return (
    <div className={`info-card p-4 h-100 package-card ${status ? `package-card--${status}` : ""}`}>

      {/* Header */}
      <div className="d-flex align-items-start justify-content-between mb-3">
        <div>
          <h6 className="text-white fw-bold mb-1">{pkg.name}</h6>
          <div className="d-flex gap-3 py-2">
            <span className="text-secondary small fs-6 text-warning">
              <i className="fas fa-eye me-1" />
              {pkg.required_views.toLocaleString()} views
            </span>
            <span className="text-success small fw-bold fs-6">
              <i className="fas fa-dollar-sign me-1" />
              {pkg.amount.toFixed(2)} reward
            </span>
          </div>
        </div>

        {/* Status badge */}
        {cfg && (
          <span className={`package-status-badge ${cfg.cls}`}>
            <i className={`fas ${cfg.icon} me-1`} />
            {cfg.label}
          </span>
        )}
      </div>

      {/* Rejected — show admin note */}
      {sub?.status === "rejected" && sub.admin_note && (
        <div className="rejection-note mb-3">
          <i className="fas fa-info-circle me-1" />
          {sub.admin_note}
        </div>
      )}

      {/* Paid — show paid date */}
      {sub?.status === "paid" && sub.paid_at && (
        <div className="paid-note mb-3">
          <i className="fas fa-check-circle me-1" />
          Paid on {new Date(sub.paid_at).toLocaleDateString()}
        </div>
      )}

      {/* Submitted link (for pending/approved) */}
      {sub && sub.status !== "rejected" && (
        <div className="submitted-link mb-3">
          <span className="text-secondary small">Submitted:</span>
          <a
            href={sub.video_link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary small ms-1 text-truncate d-inline-block"
            style={{ maxWidth: "180px", verticalAlign: "bottom" }}
          >
            {sub.video_link}
          </a>
        </div>
      )}

      {/* Submit / Resubmit button */}
      {canSubmit && !isOpen && (
        <button
          type="button"
          className="btn btn-claim-gradient w-100 mt-2"
          onClick={onToggleOpen}
        >
          <i className="fas fa-upload me-2" />
          {sub?.status === "rejected" ? "Resubmit" : "Submit Video Link"}
        </button>
      )}

      {/* Submission form */}
      {canSubmit && isOpen && (
        <div className="submit-form mt-3">
          <input
            type="url"
            className="referral-box mb-2 w-full px-3"
            placeholder="https://youtube.com/watch?v=..."
            value={videoLink}
            onChange={e => onChangeLink(e.target.value)}
          />
          <div className="d-flex gap-2">
            <button
              type="button"
              className="btn btn-claim-gradient flex-grow-1"
              disabled={isSubmitting || !videoLink.trim()}
              onClick={onSubmit}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" />
                  Submitting...
                </>
              ) : (
                <>
                  <i className="fas fa-paper-plane me-2" />
                  Submit
                </>
              )}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onToggleOpen}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

    </div>
  );
}