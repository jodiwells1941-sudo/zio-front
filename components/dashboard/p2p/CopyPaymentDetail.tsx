"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

export default function CopyPaymentDetail({ value, label, className }: {
  value: string;
  label: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success(`${label} copied.`);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Could not copy. Please select and copy the number manually.");
    }
  };

  return (
    <button type="button" className={className} onClick={() => void copy()}
      disabled={!value.trim()} aria-label={copied ? `${label} copied` : `Copy ${label}`}
      title={copied ? "Copied" : `Copy ${label}`}>
      <i className={`fa-regular ${copied ? "fa-circle-check" : "fa-copy"}`} aria-hidden="true" />
    </button>
  );
}
