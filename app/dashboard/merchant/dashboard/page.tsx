"use client";

import React, { useEffect } from "react";
import BecomeMerchant from "@/components/dashboard/merchant/BecomeMerchant";
import MerchantDashboard from "@/components/dashboard/merchant/MerchantDashboard";
import { getMerchantAccount } from "@/app/api/merchant";

type MerchantStatus = "approved" | "pending" | "rejected" | string;

type MerchantAccount = {
  status?: MerchantStatus;
};

export default function MerchantPage() {
  const [merchantAccount, setMerchantAccount] = React.useState<MerchantAccount>({});

  useEffect(() => {
    const fetchDepositInfo = async () => {
      try {
        const merchantAccount = await getMerchantAccount();
        setMerchantAccount(merchantAccount?.data?.application ?? {});
      } catch (err) {
        console.error("Error fetching merchant account:", err);
      }
    };

    fetchDepositInfo();
  }, []);

  return (
    <div className="merchant-page">
      {merchantAccount?.status === "approved" && <MerchantDashboard />}

      {merchantAccount?.status === "pending" && (
        <section className="pending-approval-card">
          <div className="pending-approval-glow" />

          <div className="pending-approval-content">
            <div className="pending-approval-icon">
              <i className="fa-solid fa-hourglass-half" />
            </div>

            <div className="pending-approval-info">
              <div className="pending-approval-badge">
                <span className="pending-status-dot" />
                Application Pending
              </div>

              <h2>Your merchant application is pending approval</h2>

              <p>
                Your application has been successfully submitted and is currently
                being reviewed by our team. Please wait while we complete the
                verification process.
              </p>

              <div className="pending-approval-note">
                <i className="fa-solid fa-circle-info" />
                <span>
                  You will be notified by email and your dashboard once your
                  application has been reviewed.
                </span>
              </div>
            </div>
          </div>

          <div className="pending-approval-progress">
            <div className="pending-progress-header">
              <span>Application Review</span>
              <strong>In Progress</strong>
            </div>

            <div className="pending-progress-track">
              <div className="pending-progress-fill" />
            </div>

            <div className="pending-progress-steps">
              <span className="active">
                <i className="fa-solid fa-check" />
                Application Submitted
              </span>

              <span className="active">
                <i className="fa-solid fa-clock" />
                Under Review
              </span>

              <span>
                <i className="fa-solid fa-circle" />
                Approval
              </span>
            </div>
          </div>
        </section>
      )}

      {(!merchantAccount?.status || merchantAccount?.status === "rejected") && (
        <BecomeMerchant />
      )}
    </div>
  );
}