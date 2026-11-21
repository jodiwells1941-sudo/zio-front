"use client";

import { useEffect, useMemo, useState } from "react";
import apiClient from "@/utils/apiClient";
import { getMerchantAccountData, type MerchantAccountResponse } from "@/app/api/merchant";

type Level = {
  id: string;
  name: string;
  level: string;
  icon: string;
  className: string;
  requirements: string[];
  current?: boolean;
  minOrdersCompleted?: number;
  platformCharge?: number;
  bonusPercent?: number;
  securityDepositAmount?: number;
  securityDepositRefundable?: boolean;
  securityDepositRequired?: boolean;
  maxAds?: number;
  orderLimit?: number;
  prioritySupport?: string;
  payoutHours?: number;
  disputeHandling?: string;
};

export default function MerchantLevel() {
  const [visibleLevels, setVisibleLevels] = useState<Level[]>([]);
  const [selectedLevelId, setSelectedLevelId] = useState("");
  const [tiersLoading, setTiersLoading] = useState(true);
  const [tiersError, setTiersError] = useState(false);
  const [merchantData, setMerchantData] = useState<MerchantAccountResponse | null>(null);
  const [activationLoading, setActivationLoading] = useState(false);
  const [activationMessage, setActivationMessage] = useState("");
  const [activationError, setActivationError] = useState("");

  useEffect(() => {
    let cancelled = false;
    apiClient.get("/user/merchant-level-tiers")
      .then(response => response.data)
      .then(result => {
        if (cancelled) return;
        if (!Array.isArray(result?.data)) {
          setVisibleLevels([]);
          setTiersError(true);
          setTiersLoading(false);
          return;
        }
        const mapped: Level[] = result.data.map((tier: Record<string, unknown>) => {
          const name = String(tier.name ?? "Merchant");
          const color = String(tier.color ?? "bronze").toLowerCase();
          const minOrders = Number(tier.min_orders_completed ?? 0);
          const depositAmount = Number(tier.security_deposit_amount ?? 0);
          const depositRequired = tier.security_deposit_required === true || tier.security_deposit_required === 1 || tier.security_deposit_required === "1";
          const depositRefundable = tier.security_deposit_refundable === true || tier.security_deposit_refundable === 1 || tier.security_deposit_refundable === "1";
          const requirements = [`${minOrders.toLocaleString()} completed orders`];
          if (depositRequired) requirements.push(depositAmount > 0 ? `Security deposit: $${depositAmount.toLocaleString()} USD` : "Security deposit required");
          return {
            id: String(tier.id ?? name.toLowerCase()),
            name,
            level: String(tier.level_label ?? "Merchant Level"),
            icon: String(tier.icon ?? "fa-solid fa-medal"),
            className: color,
            requirements,
            current: false,
            minOrdersCompleted: minOrders,
            platformCharge: Number(tier.platform_charge_percent ?? 0),
            bonusPercent: Number(tier.bonus_percent ?? 0),
            securityDepositAmount: depositAmount,
            securityDepositRefundable: depositRefundable,
            securityDepositRequired: depositRequired,
            maxAds: Number(tier.max_active_ads ?? 0),
          };
        });
        setVisibleLevels(mapped);
        setSelectedLevelId(currentId => mapped.some(level => level.id === currentId) ? currentId : (mapped[0]?.id ?? ""));
        setTiersLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setVisibleLevels([]);
          setTiersError(true);
          setTiersLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    getMerchantAccountData()
      .then(data => {
        if (!cancelled) {
          setMerchantData(data);
          if (data.merchant_level?.active_tier_id) setSelectedLevelId(data.merchant_level.active_tier_id);
        }
      })
      .catch(() => { if (!cancelled) setMerchantData(null); });
    return () => { cancelled = true; };
  }, []);

  const selectedLevel = useMemo(() => visibleLevels.find(level => level.id === selectedLevelId) ?? visibleLevels[0], [visibleLevels, selectedLevelId]);
  const benefits = useMemo(() => selectedLevel ? [
    { icon: "fa-solid fa-percent", title: "Platform Charge", value: `${selectedLevel.platformCharge ?? 0}%` },
    { icon: "fa-solid fa-gift", title: "Bonus", value: `${selectedLevel.bonusPercent ?? 0}%` },
    { icon: "fa-solid fa-rectangle-ad", title: "Maximum Active Ads", value: String(selectedLevel.maxAds ?? 0) },
  ] : [], [selectedLevel]);
  const completedOrders = Number(merchantData?.stats.completed_orders ?? 0);
  const orderTarget = Number(selectedLevel?.minOrdersCompleted ?? 0);
  const currentDeposit = Number(merchantData?.merchant_level.tier_security_deposit_amount ?? 0);
  const depositTarget = selectedLevel?.securityDepositRequired ? Number(selectedLevel.securityDepositAmount ?? 0) : 0;
  const walletBalance = Number(merchantData?.stats.total_balance.usdt ?? 0);
  const activeTierId = merchantData?.merchant_level.active_tier_id ?? null;
  const activeTierIndex = visibleLevels.findIndex(level => level.id === activeTierId);
  const activeTierConfigMissing = Boolean(activeTierId && activeTierIndex < 0);
  const activeTier = activeTierIndex >= 0 ? visibleLevels[activeTierIndex] : undefined;
  const nextTier = visibleLevels[activeTierIndex + 1] ?? (activeTierIndex === -1 ? visibleLevels[0] : undefined);
  const activeTierDepositTarget = activeTier?.securityDepositRequired ? Number(activeTier.securityDepositAmount ?? 0) : 0;
  const activeOrderProgress = activeTier && Number(activeTier.minOrdersCompleted ?? 0) > 0
    ? Math.min(100, completedOrders / Number(activeTier.minOrdersCompleted) * 100)
    : 100;
  const activeDepositProgress = activeTierDepositTarget > 0
    ? Math.min(100, currentDeposit / activeTierDepositTarget * 100)
    : 100;
  const activeTierProgress = Math.round((activeOrderProgress + activeDepositProgress) / 2);
  const activeTierRequirementsMet = !activeTier || (
    completedOrders >= Number(activeTier.minOrdersCompleted ?? 0) && currentDeposit >= activeTierDepositTarget
  );
  const selectedIsNextTier = Boolean(selectedLevel && nextTier && selectedLevel.id === nextTier.id);
  const selectedOrdersMet = completedOrders >= orderTarget;
  const depositToCharge = Math.max(0, depositTarget - currentDeposit);
  const depositCanBeFunded = walletBalance >= depositToCharge;
  const orderProgress = orderTarget > 0 ? Math.min(100, completedOrders / orderTarget * 100) : 100;
  const depositProgress = depositTarget <= 0 || currentDeposit >= depositTarget
    ? 100
    : depositCanBeFunded
      ? 100
      : Math.min(100, currentDeposit / depositTarget * 100);
  const requirementProgress = Math.round((orderProgress + depositProgress) / 2);
  const canActivateSelectedTier = Boolean(
    merchantData && selectedLevel && !activeTierConfigMissing && selectedIsNextTier && selectedOrdersMet && activeTierRequirementsMet && depositCanBeFunded
  );
  const activationHint = !merchantData
    ? "An approved merchant account is required to activate a tier."
    : !selectedLevel
      ? "Select a tier to continue."
      : activeTierId === selectedLevel.id
        ? "This tier is already active on your account."
        : activeTierConfigMissing
          ? "Your active tier is no longer available. Contact support before changing tiers."
          : !nextTier
          ? "You have reached the highest active tier."
          : !selectedIsNextTier
            ? `Activate tiers in order. The next tier is ${nextTier.name}.`
            : !activeTierRequirementsMet
              ? "Meet all requirements for your active tier before advancing."
              : !selectedOrdersMet
                ? `Complete ${Math.max(0, orderTarget - completedOrders).toLocaleString()} more orders to qualify.`
                : !depositCanBeFunded
                  ? `Add ${(depositToCharge - walletBalance).toLocaleString()} USD to your wallet for the refundable deposit.`
                  : `Ready to activate ${selectedLevel.name}. The refundable deposit will be reserved during activation.`;

  const activateSelectedTier = async () => {
    if (!selectedLevel || !canActivateSelectedTier || activationLoading) return;
    setActivationLoading(true);
    setActivationMessage("");
    setActivationError("");
    try {
      await apiClient.post("/user/merchant/level/activate", { tier_id: selectedLevel.id });
      const refreshedAccount = await getMerchantAccountData();
      setMerchantData(refreshedAccount);
      setSelectedLevelId(refreshedAccount.merchant_level.active_tier_id ?? selectedLevel.id);
      setActivationMessage(`${selectedLevel.name} is now active. Its refundable security deposit is held in the admin security reserve.`);
    } catch (error: unknown) {
      const responseData = (error as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } })?.response?.data;
      const firstValidationMessage = responseData?.errors ? Object.values(responseData.errors).flat()[0] : undefined;
      setActivationError(firstValidationMessage || responseData?.message || "Could not activate this tier. Please review the requirements and try again.");
    } finally {
      setActivationLoading(false);
    }
  };
  const snapshot = [
    { icon: "fa-solid fa-circle-check", label: "Completed orders", value: merchantData ? completedOrders.toLocaleString() : "—", accent: "green" },
    { icon: "fa-solid fa-arrows-rotate", label: "Active orders", value: merchantData ? Number(merchantData.order_summary.active).toLocaleString() : "—", accent: "blue" },
    { icon: "fa-solid fa-chart-pie", label: "Success rate", value: merchantData ? `${Number(merchantData.stats.success_rate).toFixed(1)}%` : "—", accent: "purple" },
    { icon: "fa-solid fa-rectangle-ad", label: "Active ads", value: merchantData ? Number(merchantData.ads_overview.total).toLocaleString() : "—", accent: "gold" },
  ];

  return (
    <section className="merchant-level-page">

      {/* Header */}
      <div className="merchant-level-header">
        <div>
          <h1>Merchant Level / Tier</h1>
          <p>
            Review the requirements and configured benefits for each merchant tier.
          </p>
        </div>

        <div className="level-header-actions">
          <span className="merchant-tier-managed-badge">
            <i className="fa-solid fa-shield-halved" aria-hidden="true" />
            Platform configured tiers
          </span>
        </div>
      </div>

      {/* Level Cards */}
      <div className="level-cards">
        {visibleLevels.map((level) => (
          <button
            type="button"
            key={level.name}
            className={`level-card ${level.className} ${selectedLevel?.id === level.id ? "selected" : ""}`}
            onClick={() => setSelectedLevelId(level.id)}
            aria-pressed={selectedLevel?.id === level.id}
            aria-label={`Show ${level.name} tier details`}
          >
            <div className="level-card-top">
              <div className="level-badge">
                <i className={level.icon} />
              </div>

              <div className="level-name-area">
                <h3>{level.name}</h3>

                {activeTierId === level.id ? (
                  <span className="current-level-badge">
                    Active Tier
                  </span>
                ) : (
                  <span>{level.level}</span>
                )}
              </div>
            </div>

            <div className="requirements-title">
              Requirements
            </div>

            <div className="requirements-list">
              {level.requirements.map((requirement) => (
                <div
                  className="requirement-item"
                  key={requirement}
                >
                  <i className="fa-regular fa-circle-check" />
                  <span>{requirement}</span>
                </div>
              ))}
            </div>

            <span className="tier-select-hint" aria-hidden="true">
              {selectedLevel?.id === level.id ? "Selected" : "View tier details"}
              <i className={`fa-solid ${selectedLevel?.id === level.id ? "fa-check" : "fa-arrow-right"}`} />
            </span>
          </button>
        ))}
      </div>
      {!tiersLoading && visibleLevels.length === 0 && (
        <div className="merchant-tier-empty" role="status">
          <i className="fa-solid fa-layer-group" aria-hidden="true" />
          <span>{tiersError ? "We could not load merchant tiers. Please refresh the page to try again." : "No merchant tiers are available right now. Please check back later."}</span>
        </div>
      )}
      {tiersLoading && (
        <div className="merchant-tier-empty" role="status">
          <span className="merchant-tier-spinner" aria-hidden="true" />
          <span>Loading merchant tiers…</span>
        </div>
      )}

      {/* Selected tier progress and admin-configured benefits */}
      <div className="row g-3 merchant-level-main">
        <div className="col-12 col-xl-7">
          <div className="merchant-panel progress-panel tier-progress-panel">
            <div className="panel-title-row">
              <div>
                <span className="tier-panel-eyebrow">SELECTED TIER REQUIREMENTS</span>
                <h2>{selectedLevel ? `${selectedLevel.name} requirements` : "Tier requirements"}</h2>
              </div>
              <span className="level-selected-label"><i className="fa-solid fa-circle-check" aria-hidden="true" /> {selectedLevel?.name ?? "Select a tier"}</span>
            </div>
            <p className="tier-requirements-intro">Review the required minimums and compare them with your current account.</p>
            <div className="tier-progress-track" role="progressbar" aria-label="Selected tier requirements progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={merchantData && selectedLevel ? requirementProgress : 0}>
              <span style={{ width: `${merchantData && selectedLevel ? requirementProgress : 0}%` }} />
            </div>
            <div className="tier-requirements-grid">
              <article className="tier-requirement-card">
                <div className="tier-requirement-card-heading">
                  <span className="tier-requirement-icon"><i className="fa-solid fa-list-check" aria-hidden="true" /></span>
                  <span><small>ORDER REQUIREMENT</small><strong>Minimum completed orders</strong></span>
                </div>
                <div className="tier-requirement-values">
                  <span>Required<strong>{selectedLevel ? (orderTarget > 0 ? orderTarget.toLocaleString() : "No minimum") : "—"}</strong></span>
                  <span>Your total<strong>{merchantData ? completedOrders.toLocaleString() : "—"}</strong></span>
                </div>
                <div className={`tier-requirement-status ${merchantData && orderProgress >= 100 ? "is-met" : ""}`}>
                  <i className={`fa-solid ${merchantData && orderProgress >= 100 ? "fa-circle-check" : "fa-circle-info"}`} aria-hidden="true" />
                  {!selectedLevel ? "Select a tier to see its requirement" : !merchantData ? "Your current progress is unavailable" : orderTarget === 0 ? "No order minimum for this tier" : orderProgress >= 100 ? "Order requirement met" : `${Math.max(0, orderTarget - completedOrders).toLocaleString()} more orders needed`}
                </div>
              </article>
              <article className="tier-requirement-card">
                <div className="tier-requirement-card-heading">
                  <span className="tier-requirement-icon"><i className="fa-solid fa-shield-halved" aria-hidden="true" /></span>
                  <span><small>SECURITY REQUIREMENT</small><strong>Security deposit</strong></span>
                </div>
                <div className="tier-requirement-values">
                  <span>Required<strong>{selectedLevel ? (selectedLevel.securityDepositRequired ? `${depositTarget.toLocaleString()} USD` : "Not required") : "—"}</strong></span>
                  <span>Your deposit<strong>{merchantData ? `${currentDeposit.toLocaleString()} USD` : "—"}</strong></span>
                </div>
                <div className={`tier-requirement-status ${merchantData && depositProgress >= 100 ? "is-met" : ""}`}>
                  <i className={`fa-solid ${merchantData && depositProgress >= 100 ? "fa-circle-check" : "fa-circle-info"}`} aria-hidden="true" />
                  {!selectedLevel ? "Select a tier to see its requirement" : !selectedLevel.securityDepositRequired ? "No deposit required for this tier" : !merchantData ? "Your current deposit is unavailable" : currentDeposit >= depositTarget ? "Deposit requirement met" : depositCanBeFunded ? `Funds available; ${(depositToCharge).toLocaleString()} USD will be reserved on activation` : `Add ${(depositToCharge - walletBalance).toLocaleString()} USD to your wallet`}
                </div>
              </article>
            </div>
            {selectedLevel?.securityDepositRequired && selectedLevel.securityDepositRefundable && (
              <div className="selected-tier-refund"><i className="fa-solid fa-rotate-left" aria-hidden="true" /> The security deposit is refundable.</div>
            )}
            {activeTier && selectedLevel && activeTier.id !== selectedLevel.id && (
              <div className={`tier-current-prerequisite ${activeTierRequirementsMet ? "is-met" : ""}`}>
                <div className="tier-current-prerequisite-heading">
                  <span><i className={`fa-solid ${activeTierRequirementsMet ? "fa-circle-check" : "fa-lock"}`} aria-hidden="true" /> Next level unlocks after {activeTier.name} requirements</span>
                  <strong>{activeTierProgress}%</strong>
                </div>
                <div className="tier-prerequisite-track"><span style={{ width: `${activeTierProgress}%` }} /></div>
                <small>Orders: {completedOrders.toLocaleString()} / {Number(activeTier.minOrdersCompleted ?? 0).toLocaleString()} · Deposit: {currentDeposit.toLocaleString()} / {activeTierDepositTarget.toLocaleString()} USD</small>
              </div>
            )}
            {!merchantData && <p className="tier-data-note">Your live merchant progress is temporarily unavailable.</p>}
            {activationError && <div className="tier-activation-alert is-error" role="alert">{activationError}</div>}
            {activationMessage && <div className="tier-activation-alert is-success" role="status">{activationMessage}</div>}
            <div className="tier-activation-footer">
              <p>{activationHint}</p>
              <button type="button" className="tier-activate-button" onClick={activateSelectedTier} disabled={!canActivateSelectedTier || activationLoading}>
                <i className={`fa-solid ${activationLoading ? "fa-spinner fa-spin" : activeTierId === selectedLevel?.id ? "fa-check" : "fa-arrow-up"}`} aria-hidden="true" />
                {activationLoading ? "Activating…" : activeTierId === selectedLevel?.id ? "Active Tier" : "Activate Tier"}
              </button>
            </div>
          </div>
        </div>

        <div className="col-12 col-xl-5">
          <div className="merchant-panel benefits-panel tier-benefits-panel">
            <div className="panel-title-row">
              <div>
                <span className="tier-panel-eyebrow">TIER BENEFITS</span>
                <h2>{selectedLevel?.name ?? "Selected tier"}</h2>
              </div>
              <span className="level-selected-label"><i className="fa-solid fa-circle-check" aria-hidden="true" /> Selected</span>
            </div>
            <div className="benefits-list">
              {benefits.map(benefit => (
                <div className="benefit-row" key={benefit.title}>
                  <div className="benefit-title"><i className={benefit.icon} aria-hidden="true" /><span>{benefit.title}</span></div>
                  <strong>{benefit.value}</strong>
                </div>
              ))}
            </div>
            <p className="tier-benefits-note">These values come from the current tier settings.</p>
          </div>
        </div>
      </div>

      <section className="merchant-panel tier-snapshot-panel">
        <div className="tier-section-heading">
          <div><span className="tier-panel-eyebrow">ACCOUNT ACTIVITY</span><h2>Merchant Snapshot</h2></div>
          <span className="tier-live-indicator"><i /> Live account data</span>
        </div>
        <div className="tier-snapshot-grid">
          {snapshot.map(item => (
            <div className="tier-snapshot-item" key={item.label}>
              <span className={`tier-snapshot-icon ${item.accent}`}><i className={item.icon} aria-hidden="true" /></span>
              <span className="tier-snapshot-copy"><small>{item.label}</small><strong>{item.value}</strong></span>
            </div>
          ))}
        </div>
      </section>

      <section className="merchant-panel tier-guidance-panel">
        <div className="tier-section-heading">
          <div><span className="tier-panel-eyebrow">NEXT STEPS</span><h2>How to qualify for {selectedLevel?.name ?? "a tier"}</h2></div>
        </div>
        <div className="tier-guidance-grid">
          <article className="tier-guidance-item">
            <span className="tier-guidance-icon"><i className="fa-solid fa-list-check" aria-hidden="true" /></span>
            <div><h3>Complete orders</h3><p>{orderTarget > 0 ? `${Math.max(0, orderTarget - completedOrders).toLocaleString()} more completed ${Math.max(0, orderTarget - completedOrders) === 1 ? "order" : "orders"} to meet this tier's requirement.` : "There is no minimum completed-order requirement for this tier."}</p></div>
          </article>
          <article className="tier-guidance-item">
            <span className="tier-guidance-icon"><i className="fa-solid fa-shield-halved" aria-hidden="true" /></span>
            <div><h3>Security deposit</h3><p>{!selectedLevel?.securityDepositRequired ? "No security deposit is required for this tier." : currentDeposit >= depositTarget ? "The required security deposit is met." : `Add ${(depositTarget - currentDeposit).toLocaleString()} USD to meet this tier's refundable deposit requirement.`}</p></div>
          </article>
          <article className="tier-guidance-item">
            <span className="tier-guidance-icon"><i className="fa-solid fa-rectangle-ad" aria-hidden="true" /></span>
            <div><h3>Ad allowance</h3><p>{selectedLevel ? `This tier allows up to ${Number(selectedLevel.maxAds ?? 0).toLocaleString()} active ads.` : "Select a tier to view its ad allowance."}</p></div>
          </article>
        </div>
      </section>
    </section>
  );
}
