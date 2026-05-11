"use client";

import { updateUserInfo } from "@/app/api/auth";
import { getAccessToken, getUserInfo, setAuthData } from "@/utils/auth";
import { useState, useRef } from "react";
import { toast } from "react-toastify";

export function EditableName({ user }: { user: any }) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleEdit = () => {
    setIsEditing(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      await updateUserInfo(formData);

      const currentUser = getUserInfo();
        const updatedUser = {
            ...currentUser,
            name:   name,
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

      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update name", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setName(user?.name || "");
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") handleCancel();
  };

  return (
    <div className="vp-username d-flex align-items-center gap-2">
      {isEditing ? (
        <>
          <input
            ref={inputRef}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            style={{
              maxWidth: 200,
              background: "#1a1f2e",
              borderRadius: 6,
              color: "#e2e8f0",
              padding: "3px 10px",
              fontSize: 14,
              outline: "none",
              boxShadow: "0 0 0 2px rgba(99,179,237,0.15)",
            }}
          />
          {/* Save */}
          <button
            onClick={handleSave}
            disabled={loading}
            title="Save"
            style={{
              background: "#1a6640",
              border: "none",
              borderRadius: 6,
              color: "#fff",
              width: 28,
              height: 28,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              flexShrink: 0,
            }}
          >
            {loading ? (
              <span
                style={{
                  width: 12,
                  height: 12,
                  border: "2px solid #fff",
                  borderTopColor: "transparent",
                  borderRadius: "50%",
                  display: "inline-block",
                  animation: "spin 0.7s linear infinite",
                }}
              />
            ) : (
              <i className="ti ti-check" style={{ fontSize: 14 }} />
            )}
          </button>
          {/* Cancel */}
          <button
            onClick={handleCancel}
            disabled={loading}
            title="Cancel"
            style={{
              background: "#2d3748",
              border: "none",
              borderRadius: 6,
              color: "#a0aec0",
              width: 28,
              height: 28,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: loading ? "not-allowed" : "pointer",
              flexShrink: 0,
            }}
          >
            <i className="ti ti-x" style={{ fontSize: 14 }} />
          </button>

          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </>
      ) : (
        <>
          <span>{name || "—"}</span>
          <button
            onClick={handleEdit}
            title="Edit name"
            style={{
              background: "transparent",
              border: "1px solid #2e3650",
              borderRadius: 6,
              color: "#63b3ed",
              width: 26,
              height: 26,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              flexShrink: 0,
              transition: "background 0.2s, border-color 0.2s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "#1a2540";
              (e.currentTarget as HTMLButtonElement).style.borderColor = "#63b3ed";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "transparent";
              (e.currentTarget as HTMLButtonElement).style.borderColor = "#2e3650";
            }}
          >
            <i className="ti ti-pencil" style={{ fontSize: 13 }} />
          </button>
        </>
      )}
    </div>
  );
}