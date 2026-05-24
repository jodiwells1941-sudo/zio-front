"use client";

import { useAuth } from "@/hooks/useAuth";
import { profileVerificationApi, submitProfileVerificationApi } from "@/app/api/auth";
import { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import { EditableName } from "./EditableName";
import { useRouter } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────

type VerificationStatus = "unverified" | "pending" | "approved" | "rejected";

type DocType = "passport" | "driving_license" | "national_id" | "other_document";

/** Each side (front / back) of a document */
interface SideState {
  file: File | null;       // newly selected file (not yet uploaded)
  preview: string | null;  // object URL (new selection) or full server URL (existing)
  isExisting: boolean;     // true when loaded from the server
}

/** State for one document type (e.g. passport) */
interface DocumentState {
  front: SideState;
  back: SideState;
  status: VerificationStatus;
}

type Side = "front" | "back";

// ─── Config ───────────────────────────────────────────────────────────────────

const DOC_TYPES: {
  id: DocType;
  /** Prefix that maps to <prefix>_front_image / <prefix>_back_image in the API */
  apiPrefix: string;
  icon: string;
  title: string;
  sub: string;
  color: string;
}[] = [
  {
    id: "passport",
    apiPrefix: "passport",
    icon: "fas fa-passport",
    title: "Passport",
    sub: "International travel document",
    color: "#3b82f6",
  },
  {
    id: "driving_license",
    apiPrefix: "driving_license",
    icon: "fas fa-car",
    title: "Driving Licence",
    sub: "Government issued ID",
    color: "#8b5cf6",
  },
  {
    id: "national_id",
    apiPrefix: "national_id",
    icon: "fas fa-id-card",
    title: "National ID",
    sub: "National identity card",
    color: "#22c55e",
  },
  {
    id: "other_document",
    apiPrefix: "other_document",
    icon: "fas fa-file-alt",
    title: "Other Govt. Doc",
    sub: "Any government document",
    color: "#f7a600",
  },
];

const emptySide = (): SideState => ({ file: null, preview: null, isExisting: false });

const EMPTY_DOCS: Record<DocType, DocumentState> = {
  passport:        { front: emptySide(), back: emptySide(), status: "unverified" },
  driving_license: { front: emptySide(), back: emptySide(), status: "unverified" },
  national_id:     { front: emptySide(), back: emptySide(), status: "unverified" },
  other_document:  { front: emptySide(), back: emptySide(), status: "unverified" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const storageUrl = (path: string | null | undefined): string | null => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${process.env.NEXT_PUBLIC_BACKEND_URL}/storage/${path}`;
};

const mapVerifyStatus = (status: number | undefined | null): VerificationStatus => {
  switch (status) {
    case 1: return "approved";
    case 2: return "pending";
    case 3: return "unverified";
    default: return "unverified";
  }
};

const formatCurrency = (amount: number | undefined | null): string => {
  if (amount == null) return "$0.00";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function VerifyProfilePage() {
  const { user } = useAuth();

  console.log('user ==', user);
  

  const userVerifyStatus = mapVerifyStatus(user?.verify_status);
  const isEmailVerified  = user?.email_verified_at;

  const [activeDoc,  setActiveDoc]  = useState<DocType>("passport");
  const [activeSide, setActiveSide] = useState<Side>("front");
  const [documents,  setDocuments]  = useState<Record<DocType, DocumentState>>(EMPTY_DOCS);
  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const route = useRouter();

  const docInputRef = useRef<HTMLInputElement>(null);

  // ── Load existing data ─────────────────────────────────────────────────────
  useEffect(() => {
    const fetchVerification = async () => {
      try {
        const res = await profileVerificationApi();
        const doc = res?.document;

        if (doc) {
          const dbStatus: VerificationStatus =
            (["unverified", "pending", "approved", "rejected"] as VerificationStatus[]).includes(doc.status)
              ? doc.status
              : "unverified";

          const mapDoc = (prefix: string): DocumentState => {
            const frontUrl = storageUrl(doc[`${prefix}_front_image`]);
            const backUrl  = storageUrl(doc[`${prefix}_back_image`]);
            const hasAny   = !!(frontUrl || backUrl);
            return {
              front:  { file: null, preview: frontUrl, isExisting: !!frontUrl },
              back:   { file: null, preview: backUrl,  isExisting: !!backUrl  },
              status: hasAny ? dbStatus : "unverified",
            };
          };

          setDocuments({
            passport:        mapDoc("passport"),
            driving_license: mapDoc("driving_license"),
            national_id:     mapDoc("national_id"),
            other_document:  mapDoc("other_document"),
          });
        }
      } catch {
        // Non-fatal — user may have no record yet
      } finally {
        setLoading(false);
      }
    };

    fetchVerification();
  }, []);

  // ── File selection ─────────────────────────────────────────────────────────
  const handleDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const currentSide = documents[activeDoc][activeSide];
    if (userVerifyStatus === "approved" && currentSide.isExisting) {
      toast.info("You cannot replace documents while verification is approved.");
      return;
    }

    setDocuments((prev) => ({
      ...prev,
      [activeDoc]: {
        ...prev[activeDoc],
        [activeSide]: {
          file,
          preview: URL.createObjectURL(file),
          isExisting: false,
        },
      },
    }));
    e.target.value = "";
  };

  const removeDoc = () => {
    const currentSide = documents[activeDoc][activeSide];
    if (userVerifyStatus === "approved" && currentSide.isExisting) {
      toast.info("You cannot remove documents while verification is approved.");
      return;
    }
    setDocuments((prev) => ({
      ...prev,
      [activeDoc]: {
        ...prev[activeDoc],
        [activeSide]: emptySide(),
      },
    }));
  };

  const triggerUpload = (docId: DocType, side: Side) => {
    setActiveDoc(docId);
    setActiveSide(side);
    // Let state settle before triggering click
    setTimeout(() => docInputRef.current?.click(), 0);
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    const hasNewFile = Object.values(documents).some(
      (d) => d.front.file || d.back.file
    );
    if (!hasNewFile) {
      toast.error("Please select at least one document image before submitting.");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();

      DOC_TYPES.forEach(({ id, apiPrefix }) => {
        if (documents[id].front.file) {
          formData.append(`${apiPrefix}_front_image`, documents[id].front.file as File);
        }
        if (documents[id].back.file) {
          formData.append(`${apiPrefix}_back_image`, documents[id].back.file as File);
        }
      });

      const res = await submitProfileVerificationApi(formData);
      toast.success(res?.message ?? "Documents submitted successfully.");
      // window.location.reload();
      route.push("/dashboard/account");
      // reload page  

      if (res && res.document) {
        if (res.document.status == "pending") {
          // update localStorage 
          const userData = JSON.parse(localStorage.getItem("user") || "{}");
          userData.verify_status = 2; // pending
          localStorage.setItem("user", JSON.stringify(userData));
        }
      }

      // Mark submitted sides as pending / existing
      setDocuments((prev) => {
        const next = { ...prev };
        DOC_TYPES.forEach(({ id }) => {
          const d = next[id];
          const newFront = d.front.file
            ? { ...d.front, file: null, isExisting: true }
            : d.front;
          const newBack = d.back.file
            ? { ...d.back, file: null, isExisting: true }
            : d.back;
          const hasAny = !!(newFront.preview || newBack.preview);
          next[id] = {
            front:  newFront,
            back:   newBack,
            status: hasAny ? "pending" : d.status,
          };
        });
        return next;
      });
    } catch (error: any) {
      toast.error(error?.message ?? "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Derived ────────────────────────────────────────────────────────────────
  const currentDocState  = documents[activeDoc];
  const currentSideState = currentDocState[activeSide];
  const activeColor      = DOC_TYPES.find((d) => d.id === activeDoc)?.color ?? "#f7a600";

  // Count docs that have at least one side uploaded
  const uploadedCount = Object.values(documents).filter(
    (d) => d.front.preview || d.back.preview
  ).length;

  const hasNewFile = Object.values(documents).some(
    (d) => d.front.file || d.back.file
  );

  const canModifySide = currentDocState.status !== "approved" || !currentSideState.isExisting;

  const stepState = (n: number) => {
    if (n === 1) return "done";
    if (n === 2) return uploadedCount > 0 ? "done" : "active";
    if (n === 3) return uploadedCount > 0 ? "active" : "";
    if (n === 4) return uploadedCount > 0 ? "active" : "";
    return "";
  };

  // ── Status badge ───────────────────────────────────────────────────────────
  const statusBadge = (status: VerificationStatus) => {
    const map: Record<VerificationStatus, { label: string; bg: string; color: string }> = {
      unverified: { label: "Not Submitted", bg: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.4)" },
      pending:    { label: "Pending",        bg: "rgba(247,166,0,0.15)",   color: "#f7a600" },
      approved:   { label: "Approved",       bg: "rgba(34,197,94,0.15)",   color: "#22c55e" },
      rejected:   { label: "Rejected",       bg: "rgba(239,68,68,0.15)",   color: "#ef4444" },
    };
    const { label, bg, color } = map[status];
    return (
      <span style={{
        display: "inline-block", padding: "2px 9px", borderRadius: 20,
        fontSize: 10, fontWeight: 700, background: bg, color, letterSpacing: ".04em",
      }}>
        {label}
      </span>
    );
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="vp mt-5 mt-md-0" style={{ textAlign: "center", padding: "60px 0" }}>
        <i className="fas fa-spinner fa-spin" style={{ fontSize: 28, color: "#f7a600" }} />
        <p style={{ marginTop: 12, color: "rgba(255,255,255,0.4)", fontSize: 13 }}>
          Loading verification data…
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="vp mt-5 mt-md-0">

        {/* Title */}
        <div className="vp-title">
          <i className="fas fa-shield-alt" />
          Identity Verification
        </div>

        {/* Steps */}
        <div className="vp-steps">
          {[
            { n: 1, label: "Profile Info" },
            { n: 2, label: "Document" },
            // { n: 3, label: "Under Review" },
            // { n: 4, label: "Status" },
          ].map((s, i) => (
            <div key={s.n} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div className={`vp-step ${stepState(s.n)}`}>
                <div className="vp-step-num">
                  {stepState(s.n) === "done"
                    ? <i className="fas fa-check" style={{ fontSize: 10 }} />
                    : s.n}
                </div>
                <span>{s.label}</span>
              </div>
              {i < 3 && <div className="vp-divider" />}
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="vp-progress-row">
          <div className="vp-progress-track">
            <div
              className="vp-progress-fill"
              style={{ width: `${Math.round((uploadedCount / 4) * 100)}%` }}
            />
          </div>
          <span className="vp-progress-label">
            {uploadedCount} of 4 doc types submitted
          </span>
        </div>

        {/* Profile card */}
        <div className="vp-card">
          <div className="vp-card-title"><i className="fas fa-user" /> Profile Overview</div>
          <div className="vp-profile-row">
            <img
              src={user?.avatar || "/images/avatar/one.png"}
              alt="Avatar"
              className="vp-avatar"
            />
            <div style={{ flex: 1 }}>
              <EditableName user={user} />
              <div className="vp-uid">User ID: {user?.uu_id || "—"}</div>
              {/* is verified  */}
              {currentDocState?.status === "approved" && (
                <div className="vp-verified">
                  <i className="fas fa-check-circle chk fs-6" />
                  <span className="ps-2">Verified</span>
                </div>
              )}
              <div className="vp-stats">
                {[
                  { val: formatCurrency(user?.balance), lbl: "Total Balance" },
                  { val: "0", lbl: "Tickets" },
                  { val: "0", lbl: "Referrals" },
                ].map((s) => (
                  <div key={s.lbl}>
                    <div className="vp-stat-val">{s.val}</div>
                    <div className="vp-stat-lbl">{s.lbl}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Personal information */}
        <div className="vp-card">
          <div className="vp-card-title"><i className="fas fa-info-circle" /> Personal Information</div>
          <div className="vp-info-grid">
            {[
              { lbl: "Full Name",           val: user?.name  || "—",                      icon: null },
              {
                lbl: "Email",
                val: user?.email || "—",
                icon: !isEmailVerified ? <i className="fas fa-times-circle crs" /> : <i className="fas fa-check-circle chk" />,
              },
              {
                lbl: "Phone",
                val: user?.phone || "—",
                icon: !user?.phone ? null : !user.phone_verified ? <i className="fas fa-times-circle crs" /> : <i className="fas fa-check-circle chk" />,
              },
              {
                lbl: "Account Status",
                val: user?.status === 1 ? "Active" : "Inactive",
                icon: user?.status === 1
                  ? <i className="fas fa-check-circle chk" />
                  : <i className="fas fa-times-circle crs" />,
              },
              {
                lbl: "Verification Status",
                val: currentDocState?.status === "approved" ? "Verified"
                   : currentDocState?.status === "rejected" ? "Rejected"
                   : currentDocState?.status === "pending"  ? "Pending"
                   : "Unverified",
                icon: currentDocState?.status === "approved"
                  ? <i className="fas fa-check-circle chk" />
                  : currentDocState?.status === "rejected"
                  ? <i className="fas fa-times-circle crs" />
                  : <i className="fas fa-clock crs" />,
              },
            ].map((item) => (
              <div key={item.lbl} className="vp-info-item">
                <div className="vp-info-lbl">
                  {item.lbl}
                  {/* {item.icon && <span style={{ marginLeft: 6 }}>{item.icon}</span>} */}
                </div>
                <div className="vp-info-val">{item.icon}{item.val}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Document verification */}
        <div className="vp-card">
          <div className="vp-card-title">
            <i className="fas fa-id-card" /> Document Verification
          </div>

          {/* Compact pill tabs — title only */}
          <div className="vp-doc-tab-row">
            {DOC_TYPES.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`vp-doc-tab ${activeDoc === tab.id ? "active" : ""}`}
                style={
                  activeDoc === tab.id
                    ? { color: tab.color, borderColor: tab.color, background: `${tab.color}12` }
                    : {}
                }
                onClick={() => setActiveDoc(tab.id)}
              >
                {/* left dot — always visible, small */}
                <span style={{
                  width: 7, height: 7, borderRadius: "50%",
                  background: activeDoc === tab.id ? tab.color : "rgba(255,255,255,0.2)",
                  display: "inline-block", flexShrink: 0,
                }} />

                {tab.title}

                {/* right dot — only on active, larger & glowing */}
                {activeDoc === tab.id && (
                  <span style={{
                    width: 12, height: 12, borderRadius: "50%",
                    background: tab.color,
                    display: "inline-block", flexShrink: 0,
                    marginLeft: "auto",
                    boxShadow: `0 0 6px 2px ${tab.color}80`,
                  }} />
                )}
              </button>
            ))}
          </div>

          {/* Both sides always visible side by side */}
          <div className="vp-panels-row">
            {(["front", "back"] as Side[]).map((side) => {
              const sideState = currentDocState[side];
              return (
                <div
                  key={side}
                  className={`vp-side-panel ${activeSide === side ? "active" : ""}`}
                  onClick={() => setActiveSide(side)}
                >
                  <div className="vp-side-header">
                    <span className="vp-side-label">
                      <i className={side === "front" ? "fas fa-id-card" : "fas fa-id-card-alt"} />
                      {side === "front" ? "Front side" : "Back side"}
                    </span>
                    {statusBadge(currentDocState.status)}
                  </div>

                  {sideState.preview ? (
                    <div className="vp-preview" style={{ height: "auto", background: "rgba(0,0,0,0.2)" }}>
                      <img
                        src={sideState.preview}
                        alt="Document preview"
                        style={{ width: "100%", height: "auto", objectFit: "contain", display: "block" }}
                      />
                      {canModifySide && (
                        <div className="vp-preview-overlay">
                          <button
                            type="button"
                            className="vp-remove-btn"
                            onClick={(e) => { e.stopPropagation(); removeDoc(); }}
                          >
                            <i className="fas fa-trash" /> Remove
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div
                      className="vp-side-zone"
                      onClick={(e) => {
                        e.stopPropagation();
                        canModifySide
                          ? triggerUpload(activeDoc, side)
                          : toast.info("Cannot upload while approved.");
                      }}
                    >
                      <i className="fas fa-cloud-upload-alt" />
                      <p>
                        <span style={{ color: activeColor }}>Click to upload</span>
                        <br />JPG, PNG or WebP · Max 2 MB
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <input ref={docInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleDocUpload} />

          <ul className="vp-tips mt-3">
            {[
              "Document must not be expired",
              "All four corners clearly visible",
              "No blur, glare, or shadows on text",
              "Upload both front and back sides",
              "Original document only — no photocopies",
            ].map((t) => (
              <li key={t}><i className="fas fa-circle" /> {t}</li>
            ))}
          </ul>
        </div>

        {/* Submit footer */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: 12,
          background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 14, padding: "18px 22px",
        }}>
          <div>
            <div style={{ fontSize: 13, color: "#fff", fontWeight: 600, marginBottom: 3 }}>
              Ready to submit?
            </div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
              {uploadedCount} doc type{uploadedCount !== 1 ? "s" : ""} on record
              {hasNewFile ? " · New files selected" : " · No new files selected"}
              &nbsp;· Review takes 1–3 business days
            </div>
          </div>

          <button
            type="button"
            className="vp-btn-primary"
            disabled={!hasNewFile || submitting}
            onClick={handleSubmit}
          >
            {submitting
              ? <><i className="fas fa-spinner fa-spin" /> Submitting…</>
              : <><i className="fas fa-paper-plane" /> Submit for Verification</>
            }
          </button>
        </div>

      </div>
    </>
  );
}

