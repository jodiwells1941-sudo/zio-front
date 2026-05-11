'use client';

import { updatePassword, updateUserInfo, walletSettingsDataApi } from "@/app/api/auth";
import AccountPage from "@/components/dashboard/Account/AccountPage";
import { useAuth } from "@/hooks/useAuth";
import { getAccessToken, getUserInfo, setAuthData } from "@/utils/auth";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

export default function Page() {
  const { user } = useAuth();
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [walletSettings, setWalletSettings] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editUserForm, setEditUserForm] = useState({
    avatar: "",
    name: "",
    email: "",
    phone: "",
    old_password: "",
    password: "",
    confirm_password: "",
  });    

  // ── Fetch wallet + seed form from user ────────────────────────────────────
  useEffect(() => {
    setEditUserForm((prev) => ({
      ...prev,
      avatar: user?.avatar ?? "",
      name:   user?.name  ?? "",
      email:  user?.email ?? "",
      phone:  user?.phone ?? "",
    }));
  }, [user]);

  useEffect(() => {
    const fetchWalletSetting = async () => {
      try {
        const res = await walletSettingsDataApi();
        setWalletSettings(res?.data ?? null);
      } catch {
        // silently fall back to null → demo data shown in render
      }
    };
    fetchWalletSetting();
  }, []);

  // ── Password change ────────────────────────────────────────────────────────
  const handleChangePassword = async (payload: {
    oldPassword: string;
    password: string;
    confirmPassword: string;
    twoStepEnabled: boolean;
  }) => {
    if (payload.password !== payload.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      await updatePassword({
        old_password:          payload.oldPassword,
        password:              payload.password,
        password_confirmation: payload.confirmPassword,
      });
      toast.success("Password changed successfully");
      setEditUserForm((prev) => ({
        ...prev,
        old_password:     "",
        password:         "",
        confirm_password: "",
      }));
    } catch (error: any) {
      toast.error("Failed to change password: " + error.message);
    }
  };

  // ── Profile update ─────────────────────────────────────────────────────────
  const handleUpdateProfile = async (data: {
    name: string;
    email: string;
    countryCode: string;
    phone: string;
    emailVerified: boolean;
    phoneVerified: boolean;
  }) => {
    try {
      const formData = new FormData();
      formData.append("name",  data.name);
      formData.append("phone", data.phone);
      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }

      const response = await updateUserInfo(formData);

      const currentUser = getUserInfo();
      const updatedUser = {
        ...currentUser,
        name:   data.name,
        phone:  data.phone,
        avatar: response.data?.avatar || editUserForm.avatar,
      };

      const token = getAccessToken();
      if (!token) {
        toast.error("Session expired. Please log in again.");
        return;
      }
      setAuthData(token, updatedUser);

      window.dispatchEvent(
        new CustomEvent("authStateChanged", {
          detail: { isAuthenticated: true, user: updatedUser },
        })
      );

      toast.success("Profile updated successfully");
    } catch (error: any) {
      toast.error("Failed to update profile: " + error.message);
    }
  };

  // ── Avatar handlers ────────────────────────────────────────────────────────
  const onAvatarChange = () => {
    // Programmatically open the hidden file input
    fileInputRef.current?.click();
  };

  const onAvatarDelete = () => {
    setAvatarFile(null);
    setEditUserForm((prev) => ({ ...prev, avatar: "" }));
  };

  const onFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const previewUrl = URL.createObjectURL(file);
      setEditUserForm((prev) => ({ ...prev, avatar: previewUrl }));
    }
    // Reset so selecting the same file again still fires onChange
    e.target.value = "";
  };

  // ── Derived / fallback display values ─────────────────────────────────────
  const walletAmount = walletSettings?.wallet?.amount;
  const balanceTotal = walletAmount != null ? `$${walletAmount.toFixed(2)}` : "$0.00";

  const realMoney            = walletSettings?.wallet?.real_amount;
  const bonusMoney           = walletSettings?.wallet?.bonus_amount;
  const pendingWithdrawals   = walletSettings?.wallet?.pending_withdrawal;  

  return (
    <>
      {/* Hidden file input – wired to avatar edit button */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={onFileSelected}
      />

      <AccountPage
        title="Account"
        isVerified={user?.verify_status}
        profile={{
          user_id:   user?.uu_id ?? "N/A",
          username: user?.name  ?? "N/A",
          avatarSrc:  editUserForm.avatar || "/images/avatar/profile-img.png",
          totalWins:  "$0.00",   // extend once API provides these values
          winsDue:    "$0.00",
        }}
        balance={{
          total:               balanceTotal,
          real:                realMoney            != null ? `$${Number(realMoney).toFixed(2)}`          : "$0.00",
          bonus:               bonusMoney           != null ? `$${Number(bonusMoney).toFixed(2)}`         : "$0.00",
          pendingWithdrawals:  pendingWithdrawals   != null ? `$${Number(pendingWithdrawals).toFixed(2)}` : "$0.00",
        }}
        personalInfo={{
          name:          user?.name  ?? "",
          email:         user?.email ?? "",
          emailVerified: user?.email_verified ?? false,
          countryCode:   user?.country_code   ?? "+880",
          phone:         user?.phone ?? "",
          phoneVerified: user?.phone_verified ?? false,
        }}
        security={{
          lastChangeText: "Last Change: 12 Days Ago",
        }}
        onSavePersonalInfo={handleUpdateProfile}
        onSaveSecurity={handleChangePassword}
        onAvatarChange={onAvatarChange}
        onAvatarDelete={onAvatarDelete}
      />
    </>
  );
}