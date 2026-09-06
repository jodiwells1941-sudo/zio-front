"use client";

import { useEffect, useState } from "react";
import { getDepositBonusTiersApi } from "@/app/api/wallet";

export type DepositBonusTier = {
  id: number;
  min_amount: string | number;
  max_amount: string | number | null;
  bonus_type: "fixed" | "percentage";
  bonus_value: string | number;
};

export type DepositBonusInfo = {
  bonus_amount: number;
  total_credit: number;
};

type DepositBonusProps = {
  paymentMethod: string;
  depositAmount: number | string;
  binanceAmount: number | string;
  depositBonus: DepositBonusInfo | null;
  isBonusLoading: boolean;
};

const TIER_ICON_COLORS = ["purple", "amber", "blue"] as const;

export default function DepositBonus({
  paymentMethod,
  depositAmount,
  binanceAmount,
  depositBonus,
  isBonusLoading,
}: DepositBonusProps) {
  const [bonusTiers, setBonusTiers] = useState<DepositBonusTier[]>([]);
  const [showAllTiers, setShowAllTiers] = useState(false);

  /**
   * Fetch bonus tiers once
   */
  useEffect(() => {
    const fetchBonusTiers = async () => {
      try {
        const res = await getDepositBonusTiersApi();

        if (!res.error) {
          setBonusTiers(res.data ?? []);
        }
      } catch (error) {
        console.error("Error fetching deposit bonus tiers:", error);
      }
    };

    fetchBonusTiers();
  }, []);

  /**
   * Current deposit amount
   */
  const currentAmount =
    paymentMethod === "binance" ? Number(binanceAmount) : Number(depositAmount);

  /**
   * Format tier range
   */
  const tierRange = (tier: DepositBonusTier) => {
    const min = Number(tier.min_amount);

    return tier.max_amount === null
      ? `$${min}+`
      : `$${min} - $${Number(tier.max_amount)}`;
  };

  /**
   * Format bonus label
   */
  const tierBonusLabel = (tier: DepositBonusTier) =>
    tier.bonus_type === "percentage"
      ? `${Number(tier.bonus_value)}% Bonus`
      : `$${Number(tier.bonus_value)} Bonus`;

  /**
   * Check whether current amount belongs to tier
   */
  const isTierActive = (tier: DepositBonusTier) => {
    if (!currentAmount || currentAmount <= 0) {
      return false;
    }

    const min = Number(tier.min_amount);

    const max =
      tier.max_amount === null ? null : Number(tier.max_amount);

    return (
      currentAmount >= min &&
      (max === null || currentAmount <= max)
    );
  };

  /**
   * Cosmetic tier tags
   */
  const tierTag = (
    tier: DepositBonusTier,
    index: number,
    all: DepositBonusTier[]
  ) => {
    if (
      all.length >= 3 &&
      index === Math.floor(all.length / 2)
    ) {
      return {
        label: "Most Popular",
        cls: "dl-bonus-tag--popular",
      };
    }

    const highestPct = [...all]
      .filter((t) => t.bonus_type === "percentage")
      .sort(
        (a, b) =>
          Number(b.bonus_value) - Number(a.bonus_value)
      )[0];

    if (highestPct && highestPct.id === tier.id) {
      return {
        label: "Best Value",
        cls: "dl-bonus-tag--best",
      };
    }

    return null;
  };

  return (
    <>
      {/* Deposit Limit */}
      <small className="dl-hint text-danger mb-2">
        Min: 5 USD &nbsp;•&nbsp; Max: 5,000 USD
      </small>

      {/* Bonus Card */}
      <div className="dl-bonus-card mb-3">
        <div className="dl-bonus-card-head">
          <span className="dl-bonus-card-title">
            <i className="fa-solid fa-gift" /> Deposit Bonus
          </span>

          <span className="dl-bonus-card-badge">
            Limited Time Offer
          </span>
        </div>

        {bonusTiers.length > 0 ? (
          <>
            {/* CSS grid, not Bootstrap row/col-md-6 — this responds to the
                actual width of whatever column this card sits inside,
                instead of the browser viewport width. */}
            <div className="dl-bonus-tier-list">
              {(showAllTiers
                ? bonusTiers
                : bonusTiers.slice(0, 2)
              ).map((tier, idx) => {
                const active = isTierActive(tier);

                const tag = tierTag(
                  tier,
                  idx,
                  bonusTiers
                );

                const color =
                  TIER_ICON_COLORS[
                    idx % TIER_ICON_COLORS.length
                  ];

                return (
                  <div
                    key={tier.id}
                    className={`dl-bonus-tier ${
                      active ? "dl-bonus-tier--active" : ""
                    }`}
                  >
                    {/* Icon */}
                    <span
                      className={`dl-bonus-tier-icon dl-bonus-tier-icon--${color}`}
                    >
                      <i className="fa-solid fa-gift" />
                    </span>

                    {/* Content */}
                    <div className="dl-bonus-tier-body">
                      <span className="dl-bonus-tier-range">
                        Deposit {tierRange(tier)}
                      </span>

                      <span className="dl-bonus-tier-value">
                        Get <strong>{tierBonusLabel(tier)}</strong>
                      </span>
                    </div>

                    {/* Tag */}
                    {active ? (
                      <span className="dl-bonus-tag dl-bonus-tag--active">
                        Your Tier
                      </span>
                    ) : tag ? (
                      <span className={`dl-bonus-tag ${tag.cls}`}>
                        {tag.label}
                      </span>
                    ) : null}
                  </div>
                );
              })}
            </div>

            {/* View All */}
            {bonusTiers.length > 2 && (
              <button
                type="button"
                className="dl-bonus-view-all"
                onClick={() =>
                  setShowAllTiers((value) => !value)
                }
              >
                <i className="fa-solid fa-gift" />

                {showAllTiers
                  ? "Show Less"
                  : "View All Bonuses"}
              </button>
            )}
          </>
        ) : (
          /* Empty State */
          <div className="dl-bonus-tier-list">
            <div className="dl-bonus-tier dl-bonus-tier--empty">
              <span className="dl-bonus-tier-icon dl-bonus-tier-icon--muted">
                <i className="fa-solid fa-gift" />
              </span>

              <div className="dl-bonus-tier-body">
                <span className="dl-bonus-tier-range">
                  No active offers right now
                </span>

                <span className="dl-bonus-tier-value">
                  Get <strong>0 Bonus</strong>
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Current amount line — always shows something, never disappears */}
        {/* {isBonusLoading ? (
          <small className="dl-hint text-secondary d-block mt-2">
            Checking bonus…
          </small>
        ) : (
          <div
            className={`dl-bonus-inline mt-2 ${
              depositBonus && depositBonus.bonus_amount > 0
                ? ""
                : "dl-bonus-inline--empty"
            }`}
          >
            <i className="fa-solid fa-gift" />
            {depositBonus && depositBonus.bonus_amount > 0 ? (
              <>
                +{depositBonus.bonus_amount} USDT bonus — you&apos;ll be
                credited {depositBonus.total_credit} USDT
              </>
            ) : (
              <>0 Bonus for this amount</>
            )}
          </div>
        )} */}
      </div>
    </>
  );
}