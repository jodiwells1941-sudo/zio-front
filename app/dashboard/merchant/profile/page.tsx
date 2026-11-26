"use client";

import { getMerchantAccount, updateMerchantApplicationApi, updateMerchantAvatarApi } from "@/app/api/merchant";
import MerchantProfile, {
  type MerchantProfileUpdatePayload,
  type MerchantApplication,
} from "@/components/dashboard/merchant/MerchantProfile";
import apiClient from "@/utils/apiClient";
import { useCallback, useEffect, useState } from "react";
import type { MerchantTier } from "@/components/dashboard/merchant/MerchantProfile";

export default function Page() {
  const [application, setApplication] = useState<MerchantApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTier, setActiveTier] = useState<MerchantTier | null>(null);
  const [tierLoading, setTierLoading] = useState(false);

  const fetchMerchantAccount = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await getMerchantAccount();
      setApplication(res?.data?.application ?? null);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Unable to load your merchant profile. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMerchantAccount();
  }, [fetchMerchantAccount]);

  useEffect(() => {
    const tierId = application?.active_tier_id;
    if (!tierId) {
      setActiveTier(null);
      setTierLoading(false);
      return;
    }
    let cancelled = false;
    setTierLoading(true);
    apiClient.get("/user/merchant-level-tiers")
      .then(response => {
        if (!cancelled) {
          const tiers: MerchantTier[] = Array.isArray(response.data?.data) ? response.data.data : [];
          setActiveTier(tiers.find(tier => tier.id === tierId) ?? null);
        }
      })
      .catch(() => { if (!cancelled) setActiveTier(null); })
      .finally(() => { if (!cancelled) setTierLoading(false); });
    return () => { cancelled = true; };
  }, [application?.active_tier_id]);

  const handleUpdate = useCallback(
    async (
      section: "profile" | "business",
      data: Record<string, any>
    ) => {
      const payload = {
        [section]: data,
      } as MerchantProfileUpdatePayload;

      const res = await updateMerchantApplicationApi(payload);
      // Prefer the fresh record the API returns; fall back to a full
      // refetch if the update endpoint doesn't echo it back.
      if (res?.data?.application) {
        setApplication(res.data.application);
      } else {
        await fetchMerchantAccount();
      }
    },
    [fetchMerchantAccount]
  );

  const handleAvatarUpload = useCallback(async (file: File) => {
    const res = await updateMerchantAvatarApi(file);

    if (res?.data?.application) {
      setApplication(res.data.application);
    } else {
      await fetchMerchantAccount();
    }
  }, [fetchMerchantAccount]);

  return (
    <MerchantProfile
      application={application}
      activeTier={activeTier}
      tierLoading={tierLoading}
      loading={loading}
      error={error}
      onRetry={fetchMerchantAccount}
      onUpdate={handleUpdate}
      onAvatarUpload={handleAvatarUpload}
    />
  );
}
