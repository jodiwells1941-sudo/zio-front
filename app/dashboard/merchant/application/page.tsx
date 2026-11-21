"use client";

import MerchantApplication from "@/components/dashboard/merchant/MerchantApplication";
import { getMerchantAccount } from "@/app/api/merchant";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function MerchantApplicationPage() {
  const router = useRouter();
  const [checkingApplication, setCheckingApplication] = useState(true);

  useEffect(() => {
    let active = true;

    const checkExistingApplication = async () => {
      let redirecting = false;

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
        // If the account endpoint has no application (or is temporarily
        // unavailable), keep the form accessible rather than trapping users.
      } finally {
        if (active && !redirecting) setCheckingApplication(false);
      }
    };

    void checkExistingApplication();

    return () => {
      active = false;
    };
  }, [router]);

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

  return <MerchantApplication />;
}
