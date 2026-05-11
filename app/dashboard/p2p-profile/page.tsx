"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import styles from "./P2PProfile.module.css";
import {
  BadgeCheckProps,
  PaymentFormData,
  StatCardProps,
  TabId,
  TabItem,
  ModalMode,
  UserPaymentMethod,
} from "@/types/P2PProfileTypes";
import DeleteConfirmModal from "@/components/dashboard/p2pProfile/Deleteconfirmmodal";
import P2PTopNav from "@/components/dashboard/p2p/P2PTopNav";
import PaymentModal from "@/components/dashboard/p2pProfile/Paymentmodal";
import PaymentCard from "./Paymentcard";
import {
  getUserPaymentMethods,
  createUserPaymentMethod,
  updateUserPaymentMethod,
  deleteUserPaymentMethod,
} from "@/app/api/common";
import { toast } from "react-toastify";
import { useAuth } from "@/hooks/useAuth";

// ─── Constants ────────────────────────────────────────────────────────────────

const TABS: TabItem[] = [
  { id: "payment",       label: "P2P Payment Methods"         },
  // { id: "my-ads",        label: "My Ads"                      },
  { id: "feedback",      label: "Feedback (16)"               },
  { id: "blocked",       label: "Blocked Users"               },
  { id: "follows",       label: "Follows"                     },
  { id: "restrictions",  label: "Restrictions Removal Center" },
  { id: "notifications", label: "Notification Settings"       },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatCard: React.FC<StatCardProps> = ({ label, value, unit }) => (
  <div className={styles.statCard}>
    <p className={styles.statLabel}>{label}</p>
    <p className={styles.statValue}>
      {value}
      {unit ? <span className={styles.statUnit}> {unit}</span> : null}
    </p>
  </div>
);

const BadgeCheck: React.FC<BadgeCheckProps> = ({ label }) => (
  <span className={styles.badge}>
    <i className={`fa-solid fa-check ${styles.badgeIcon}`} aria-hidden="true" />
    {label}
  </span>
);

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function P2PProfile(): React.JSX.Element {
  const [activeTab,      setActiveTab]      = useState<TabId>("payment");
  const [methods,        setMethods]        = useState<UserPaymentMethod[]>([]);
  const [loadingMethods, setLoadingMethods] = useState(false);
  const [error,          setError]          = useState<string | null>(null);
  const { user } = useAuth();

  const [modalMode,    setModalMode]    = useState<ModalMode | null>(null);
  const [editTarget,   setEditTarget]   = useState<UserPaymentMethod | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = useState<UserPaymentMethod | null>(null);
  const [saving,       setSaving]       = useState(false);

  const activeTabLabel = useMemo(
    () => TABS.find((t) => t.id === activeTab)?.label ?? "",
    [activeTab]
  );

  // ── Fetch all user payment methods ────────────────────────────────────────
  const loadMethods = useCallback(async () => {
    setLoadingMethods(true);
    setError(null);
    try {
      const res = await getUserPaymentMethods();
      setMethods(res?.data ?? []);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? e?.message ?? "Failed to load payment methods.");
    } finally {
      setLoadingMethods(false);
    }
  }, []);

  useEffect(() => {
    loadMethods();
  }, [loadMethods]);

  // ── Modal helpers ─────────────────────────────────────────────────────────
  const openAdd    = () => { setEditTarget(undefined); setModalMode("add"); };
  const openEdit   = (m: UserPaymentMethod) => { setEditTarget(m); setModalMode("edit"); };
  const openDelete = (id: number) =>
    setDeleteTarget(methods.find((m) => m.id === id) ?? null);
  const closeModal = () => { setModalMode(null); setEditTarget(undefined); };

  // ── Confirm delete ────────────────────────────────────────────────────────
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      await deleteUserPaymentMethod(deleteTarget.id);
      setMethods((prev) => prev.filter((m) => m.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (e: any) {
      alert(e?.response?.data?.message ?? e?.message ?? "Delete failed.");
      toast.error("Failed to delete payment method.");
    } finally {
      setSaving(false);
    }
  };

  // ── Add / Edit submit ─────────────────────────────────────────────────────
  const handleModalSubmit = async (data: PaymentFormData) => {
    setSaving(true);
    try {
      if (modalMode === "add") {
        const res = await createUserPaymentMethod(data);
        toast.success("Payment method added successfully.");
        setMethods((prev) => [res.data, ...prev]);
      } else if (modalMode === "edit" && editTarget) {
        const res = await updateUserPaymentMethod(editTarget.id, data);
        toast.success("Payment method updated successfully.");
        setMethods((prev) =>
          prev.map((m) => (m.id === editTarget.id ? res.data : m))
        );
      }
      closeModal();
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? e?.message ?? "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  console.log('user', user);
  

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      {modalMode !== null && (
        <PaymentModal
          mode={modalMode}
          initialData={editTarget}
          onClose={closeModal}
          onSubmit={handleModalSubmit}
        />
      )}

      {deleteTarget !== null && (
        <DeleteConfirmModal
          methodName={deleteTarget.method_name}
          onClose={() => setDeleteTarget(null)}
          onConfirm={confirmDelete}
        />
      )}

      <div className={`${styles.root} p-0`}>
        <P2PTopNav />

        <div className={styles.bgOrb1} />
        <div className={styles.bgOrb2} />

        <div className={`${styles.container} p-2 p-md-3`}>

          {/* ── Profile Header ── */}
          <div className={`${styles.profileHeader} d-flex flex-wrap justify-content-between align-items-center`}>
            <div className="d-flex align-items-center gap-2">
              <div className={styles.avatarWrap}>
                <div className={styles.avatar}>U</div>
                <span className={styles.onlineDot} />
              </div>
              <div>
                <div className="d-flex align-items-center gap-2">
                  <h5 className={styles.username}>User ID: 6767686</h5>
                  <i className={`fa-solid fa-circle-check ${styles.verifiedIcon}`} aria-hidden="true" />
                  <button type="button" className={styles.iconBtn} aria-label="Edit username">
                    <i className="fa-solid fa-pen" aria-hidden="true" />
                  </button>
                </div>
                <div className="d-flex flex-wrap gap-3">
                  <BadgeCheck label="Email" />
                  <BadgeCheck label="SMS" />
                  <BadgeCheck label="KYC" />
                  <BadgeCheck label="Address" />
                </div>
              </div>
            </div>

            <div className={`${styles.profileRight} d-flex align-items-center gap-4`}>
              <div className={styles.fundingRow}>
                <div className={`${styles.fundingLabel} text-warning`}>
                  My Balance
                  <i className="fa-solid fa-circle-exclamation ms-1" aria-hidden="true" />
                </div>
                <div className="d-flex align-items-center gap-1">
                  <span className={`${styles.fundingDots} fw-6`}>${user?.wallet?.amount?.toFixed(2)}</span>
                </div>
              </div>
              <div className={styles.fundingRow}>
                <div className={`${styles.fundingLabel} text-warning`}>
                  Security Balance
                  <i className="fa-solid fa-circle-exclamation ms-1" aria-hidden="true" />
                </div>
                <div className="d-flex align-items-center gap-1">
                  <span className={`${styles.fundingDots} fw-6`}>
                    <i className="fa-solid fa-lock me-1 text-secondary" aria-hidden="true" />
                    ${user?.wallet?.security_amount_for_ads?.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Stats ── */}
          <div className={`${styles.statsRow} d-flex flex-wrap align-items-center`}>
            <StatCard label="30d Trades"          value="4"      unit="Time(s)"   />
            <StatCard label="30d Completion Rate" value="100.00" unit="%"         />
            <StatCard label="Avg. Release Time"   value="0"      unit="Minute(s)" />
            <StatCard label="Avg. Pay Time"       value="2.72"   unit="Minute(s)" />
            <StatCard label="Positive Feedback"   value="100.00 % (16)"           />
            <button type="button" className={styles.moreBtn} aria-label="More options">
              <i className="fa-solid fa-ellipsis" aria-hidden="true" />
            </button>
          </div>

          {/* ── Tabs ── */}
          <div className={`${styles.tabsRow} d-flex flex-wrap`}>
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  className={`${styles.tab} ${isActive ? styles.tabActive : ""}`}
                  onClick={() => setActiveTab(tab.id)}
                  aria-current={isActive ? "page" : undefined}
                >
                  {tab.label}
                  {isActive && <span className={styles.tabUnderline} />}
                </button>
              );
            })}
          </div>

          {/* ── Tab Content ── */}
          {activeTab === "payment" ? (
            <div className={styles.tabContent}>
              <div className={`${styles.paymentTopRow} d-flex flex-wrap justify-content-between`}>
                <p className={styles.paymentInfo}>
                  P2P payment methods: When you sell cryptocurrencies, the payment method added
                  will be displayed to buyer as options to accept payment. Please ensure that the
                  account owner&apos;s name is consistent with your verified name. You can add up
                  to 20 payment methods.
                </p>
                <button
                  type="button"
                  className={styles.addBtn}
                  onClick={openAdd}
                  disabled={methods.length >= 20 || saving}
                >
                  <i className="fa-solid fa-plus" aria-hidden="true" />
                  <span>Add a payment method</span>
                </button>
              </div>

              {loadingMethods ? (
                <div className={styles.emptyTab}>
                  <i className="fa-solid fa-spinner fa-spin" aria-hidden="true" />
                  <p className={styles.emptyText}>Loading payment methods…</p>
                </div>
              ) : error ? (
                <div className={styles.emptyTab}>
                  <i className="fa-solid fa-triangle-exclamation" aria-hidden="true" />
                  <p className={styles.emptyText}>{error}</p>
                  <button
                    type="button"
                    className={styles.addBtn}
                    onClick={loadMethods}
                    style={{ marginTop: "0.75rem" }}
                  >
                    Retry
                  </button>
                </div>
              ) : (
                <div className={styles.paymentList}>
                  {methods.length === 0 ? (
                    <div className={styles.emptyTab}>
                      <i className="fa-solid fa-credit-card" aria-hidden="true" />
                      <p className={styles.emptyText}>No payment methods added yet.</p>
                    </div>
                  ) : (
                    methods.map((m) => (
                      <PaymentCard
                        key={m.id}
                        method={m}
                        onEdit={openEdit}
                        onDelete={openDelete}
                      />
                    ))
                  )}
                </div>
              )}
            </div>
          )
           : (
             <div className={styles.emptyTab}>
               <i className="fa-solid fa-inbox" aria-hidden="true" />
               <p className={styles.emptyText}>
                 No data available for <strong>{activeTabLabel}</strong>
               </p>
             </div>
           )}

        </div>
      </div>
    </>
  );
}