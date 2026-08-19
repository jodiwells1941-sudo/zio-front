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
        <div className="pending-approval">
          <h2>Your merchant application is pending approval.</h2>
          <p>Please wait for the approval process to complete.</p>
        </div>
      )}

      {(!merchantAccount?.status || merchantAccount?.status === "rejected") && (
        <BecomeMerchant />
      )}
    </div>
  );
}