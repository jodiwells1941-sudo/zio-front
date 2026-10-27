"use client";

import Image from "next/image";
import { useState } from "react";
import styles from "./PaymentMethodIcon.module.css";

type Props = {
  methodName?: string | null;
  iconImage?: string | null;
  size?: number;
  className?: string;
  fallbackMode?: "initial" | "brand" | "card";
};

const getFallback = (methodName: string, fallbackMode: Props["fallbackMode"]) => {
  const name = methodName.toLowerCase();
  if (name.includes("bkash")) return { glyph: "b", color: "#e2136e" };
  if (name.includes("nagad")) return { glyph: "N", color: "#f26522" };
  if (name.includes("rocket")) return { glyph: "R", color: "#8c3494" };
  if (name.includes("bank")) return { glyph: "⌂", color: "#1d6fe0" };
  if (fallbackMode === "brand") return { glyph: "…", color: "#4b5563" };
  return { glyph: methodName.trim().charAt(0).toUpperCase() || "?", color: "#3b82f6" };
};

const getImageUrl = (image?: string | null): string => {
  const path = image?.trim();
  if (!path) return "";
  if (/^(https?:)?\/\//i.test(path) || path.startsWith("data:")) return path;

  const backendUrl = (
    process.env.NEXT_PUBLIC_BACKEND_URL ??
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, "")
  )?.replace(/\/$/, "");

  const normalizedPath = path.replace(/^\/+/, "");
  if (normalizedPath.startsWith("storage/")) {
    return `${backendUrl ? `${backendUrl}/` : "/"}${normalizedPath}`;
  }
  if (path.startsWith("/")) return `${backendUrl ?? ""}${path}`;
  return `${backendUrl ? `${backendUrl}/storage/` : "/storage/"}${path}`;
};

export default function PaymentMethodIcon({
  methodName = "",
  iconImage,
  size = 34,
  className,
  fallbackMode = "initial",
}: Props) {
  const imageUrl = getImageUrl(iconImage);
  const [failedImageUrl, setFailedImageUrl] = useState("");
  const fallback = getFallback(methodName ?? "", fallbackMode);
  const showImage = Boolean(imageUrl) && failedImageUrl !== imageUrl;

  return (
    <span
      className={`${styles.icon} ${className ?? ""}`}
      style={{
        width: size,
        height: size,
        flexBasis: size,
        backgroundColor: showImage ? "#fff" : fallbackMode === "card" ? undefined : fallback.color,
      }}
      aria-hidden="true"
    >
      {showImage ? (
        <Image
          src={imageUrl}
          alt=""
          width={size}
          height={size}
          unoptimized
          onError={() => setFailedImageUrl(imageUrl)}
        />
      ) : fallbackMode === "card" ? (
        <i className="fa-solid fa-credit-card" />
      ) : (
        fallback.glyph
      )}
    </span>
  );
}
