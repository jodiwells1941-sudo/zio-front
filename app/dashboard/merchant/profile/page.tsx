"use client";

import { getMerchantAccount, updateMerchantApplicationApi } from "@/app/api/merchant";
import MerchantProfile, {
  type MerchantApplication,
  type MerchantUpdatePayload,
} from "@/components/dashboard/merchant/MerchantProfile";
import { useCallback, useEffect, useState } from "react";

export default function Page() {
  const [application, setApplication] = useState<MerchantApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const handleUpdate = useCallback(
    async (payload: MerchantUpdatePayload) => {
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

  return (
    <MerchantProfile
      application={application}
      loading={loading}
      error={error}
      onRetry={fetchMerchantAccount}
      onUpdate={handleUpdate}
    />
  );
}