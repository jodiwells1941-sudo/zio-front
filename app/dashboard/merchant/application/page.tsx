"use client";

import MerchantApplication from "@/components/dashboard/merchant/MerchantApplication";
import { getMerchantAccount } from "@/app/api/merchant";
import { fetchUserInfoAPI } from "@/app/api/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function MerchantApplicationPage() {
  const router = useRouter();
  const [checkingApplication, setCheckingApplication] = useState(true);
  const [verificationCheckFailed, setVerificationCheckFailed] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let active = true;

    const checkExistingApplication = async () => {
      let redirecting = false;
      setCheckingApplication(true);
      setVerificationCheckFailed(false);

      try {
        const userResponse = await fetchUserInfoAPI();
        const profile = userResponse?.data ?? userResponse;

        if (Number(profile?.verify_status) !== 1) {
          redirecting = true;
          router.replace("/dashboard/verify-profile");
          return;
        }

        try {
          const response = await getMerchantAccount();
          const application = response?.data?.application;

          // A submitted application must be managed from Merchant Center.
          // Do not allow a second form to be opened for the same account.
          if (application?.id || application?.status) {
            redirecting = true;
            router.replace("/dashboard/merchant/");
            return;
          }
        } catch {
          // A verified user can still open the form if merchant lookup fails.
        }
      } catch {
        // Fail closed: don't render the application form without confirming
        // that profile verification has been approved.
        if (active) setVerificationCheckFailed(true);
      } finally {
        if (active && !redirecting) setCheckingApplication(false);
      }
    };

    void checkExistingApplication();

    return () => {
      active = false;
    };
  }, [router, retryCount]);

  if (checkingApplication) {
    return (
      <section className="merchant-application-route-loading" aria-live="polite">
        <div>
          <i className="fa-solid fa-circle-notch fa-spin" aria-hidden="true" />
          <strong>Checking merchant application</strong>
          <span>Please wait a moment…</span>
        </div>
      </section>
    );
  }

  if (verificationCheckFailed) {
    return (
      <section className="merchant-application-route-loading" role="alert">
        <div>
          <i className="fa-solid fa-shield-halved" aria-hidden="true" />
          <strong>Profile verification required</strong>
          <span>We couldn&apos;t confirm your verification status, so the merchant application is unavailable.</span>
          <div className="merchant-application-guard-actions">
            <button className="merchant-primary-btn" type="button" onClick={() => setRetryCount(count => count + 1)}>Check again</button>
            <button className="merchant-application-verify-link" type="button" onClick={() => router.push("/dashboard/verify-profile")}>
              Complete profile verification
            </button>
          </div>
        </div>
      </section>
    );
  }

  return <MerchantApplication />;
}
