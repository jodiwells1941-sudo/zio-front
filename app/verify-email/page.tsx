"use client";

import Image from "next/image";
import circle  from "@/public/images/authentication/circle.png";
import thumb   from "@/public/images/authentication/thumb.png";
import numbers from "@/public/images/authentication/numbers.png";
import Link from "next/link";
import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { resendVerificationEmail, getResendStatus, verifyOtp } from "../api/auth";

const RESEND_COOLDOWN = 60; // seconds — must match backend
const OTP_LENGTH      = 4;

const EmailVerifySection = () => {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const email        = searchParams.get("email") ?? "";

  // ── OTP input state ────────────────────────────────────────────────
  const [otp,       setOtp]       = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [verifying, setVerifying] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // ── Resend state ───────────────────────────────────────────────────
  const [resending,  setResending]  = useState(false);
  const [mounted,    setMounted]    = useState(false);

  /**
   * `secondsLeft` is the single source of truth.
   * - > 0  → countdown running, resend disabled
   * - === 0 → resend enabled
   */
  const [secondsLeft, setSecondsLeft] = useState<number>(RESEND_COOLDOWN);

  // ── Interval ref — one timer, replaced on each resend ─────────────
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = () => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  /** Start (or restart) the 1-second countdown from `from` seconds. */
  const startCountdown = useCallback((from: number) => {
    clearTimer();
    setSecondsLeft(from);

    if (from <= 0) return; // already allowed to resend

    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearTimer();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // ── Fetch real seconds-left from server on first mount only ───────
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        const res = await getResendStatus();
        if (!cancelled) startCountdown(res?.retry_after ?? 0);
      } catch {
        if (!cancelled) startCountdown(0);
      } finally {
        if (!cancelled) setMounted(true);
      }
    };

    init();

    return () => {
      cancelled = true;
      clearTimer(); // clean up on unmount
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // ← empty deps: runs ONCE on mount, never on reload

  const canResend = mounted && secondsLeft === 0;

  // ── OTP input handlers ─────────────────────────────────────────────
  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next  = [...otp];
    next[index] = digit;
    setOtp(next);
    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;
    const next = [...otp];
    pasted.split("").forEach((ch, i) => { next[i] = ch; });
    setOtp(next);
    const lastIdx = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[lastIdx]?.focus();
  };

  const resetOtpInputs = () => {
    setOtp(Array(OTP_LENGTH).fill(""));
    setTimeout(() => inputRefs.current[0]?.focus(), 0);
  };

  // ── Verify OTP ─────────────────────────────────────────────────────
  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length < OTP_LENGTH) {
      toast.error("Please enter the complete 4-digit code.");
      return;
    }
    setVerifying(true);
    try {
      const res = await verifyOtp(code);
      if (res?.status) {
        toast.success(res?.message ?? "Email verified!");
        router.push("/sign-in?verified=1");
      } else {
        toast.error(res?.message ?? "Invalid or expired code.");
        resetOtpInputs();
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Verification failed.");
      resetOtpInputs();
    } finally {
      setVerifying(false);
    }
  };

  // ── Resend OTP ─────────────────────────────────────────────────────
  const handleResend = async () => {
    if (!canResend || resending) return;
    setResending(true);
    try {
      const res = await resendVerificationEmail();
      if (res?.status) {
        toast.success(res?.message ?? "Code resent.");
        // Start fresh countdown from whatever the server says (default 60s)
        startCountdown(res?.retry_after ?? RESEND_COOLDOWN);
        resetOtpInputs();
      } else {
        toast.error(res?.message ?? "Failed to resend.");
        // Server may return a retry_after even on error (rate-limit race)
        if (res?.retry_after) startCountdown(res.retry_after);
      }
    } catch (err: any) {
      const retryAfter = err?.response?.data?.retry_after;
      toast.error(err?.response?.data?.message ?? "Failed to resend.");
      if (retryAfter) startCountdown(retryAfter);
    } finally {
      setResending(false);
    }
  };

  // ── SVG progress ring (based on secondsLeft) ───────────────────────
  const progress         = ((RESEND_COOLDOWN - secondsLeft) / RESEND_COOLDOWN) * 100;
  const radius           = 20;
  const circumference    = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const otpComplete = otp.every(Boolean);

  // ── Render ─────────────────────────────────────────────────────────
  return (
    <section className="authentication py-4 pt-md-120 pb-md-120">
      <div className="container">
        <div className="row align-items-center h-screen">

          {/* ── Form Side ── */}
          <div className="col-12 col-lg-6 col-xl-6 mx-auto">
            <div className="authentication__inner" data-aos="fade-right" data-aos-duration="600">

              <div className="authentication__content mt-md-5 mt-0 text-center">
                <i className="fa-solid fa-envelope-circle-check fa-3x text-primary mb-3" />
                <h4 className="title-animation neutral-top fw-6 mb-md-10">
                  Verify Your Email
                </h4>
                <p>
                  We sent a 4-digit code to{" "}
                  {email ? <strong>{email}</strong> : "your email address"}.
                </p>
              </div>

              <div className="authentication__form mt-md-55">

                {/* ── OTP Boxes ── */}
                <div className="mt-30">
                  <label className="d-block mb-2 text-center">Enter Verification Code</label>
                  <div className="d-flex justify-content-center gap-3">
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        ref={(el) => { inputRefs.current[i] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        onPaste={i === 0 ? handleOtpPaste : undefined}
                        className="text-center fw-bold"
                        style={{
                          width: 56, height: 64,
                          fontSize: 28,
                          border: "2px solid",
                          borderColor: digit ? "var(--primary-color, #0d6efd)" : "#ced4da",
                          borderRadius: 10,
                          background: "transparent",
                          outline: "none",
                          transition: "border-color .2s",
                        }}
                        aria-label={`Digit ${i + 1}`}
                        autoFocus={i === 0}
                      />
                    ))}
                  </div>
                </div>

                {/* Info */}
                <div className="mt-20 p-3 rounded border border-dark-light text-center">
                  <p className="mb-0 text-reset" style={{ fontSize: 14 }}>
                    Enter the 4-digit code from your email. It expires in{" "}
                    <strong>1 minute</strong>. Check your spam folder if you
                    don&apos;t see it.
                  </p>
                </div>

                {/* Verify button */}
                <div className="mt-20">
                  <button
                    type="button"
                    onClick={handleVerify}
                    disabled={!otpComplete || verifying}
                    className="btn--primary w-100 d-flex justify-content-center align-items-center gap-2"
                    style={{
                      opacity: otpComplete && !verifying ? 1 : 0.5,
                      cursor:  otpComplete && !verifying ? "pointer" : "not-allowed",
                    }}
                  >
                    {verifying ? (
                      <><i className="fa-solid fa-spinner fa-spin" /> Verifying…</>
                    ) : (
                      <>Verify Email <i className="ti ti-arrow-narrow-right" /></>
                    )}
                  </button>
                </div>

                {/* Loading state (before mount) */}
                {!mounted && (
                  <div className="mt-20 text-center text-muted" style={{ fontSize: 13 }}>
                    <i className="fa-solid fa-spinner fa-spin me-2" />
                    Checking status…
                  </div>
                )}

                {/* Countdown ring — only while timer is running */}
                {mounted && secondsLeft > 0 && (
                  <div className="mt-20 d-flex align-items-center justify-content-center gap-2">
                    <svg width="50" height="50" viewBox="0 0 50 50">
                      {/* Track */}
                      <circle
                        cx="25" cy="25" r={radius}
                        fill="none" stroke="currentColor"
                        strokeOpacity={0.15} strokeWidth="3"
                      />
                      {/* Progress arc */}
                      <circle
                        cx="25" cy="25" r={radius}
                        fill="none" stroke="currentColor"
                        strokeWidth="3" strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        transform="rotate(-90 25 25)"
                        style={{ transition: "stroke-dashoffset 0.9s linear" }}
                        className="text-primary"
                      />
                      {/* Number */}
                      <text
                        x="25" y="25"
                        textAnchor="middle" dominantBaseline="central"
                        fontSize="13" fontWeight="600" fill="currentColor"
                      >
                        {secondsLeft}
                      </text>
                    </svg>
                    <span className="text-muted text-reset" style={{ fontSize: 13 }}>
                      Resend available in <strong>{secondsLeft}s</strong>
                    </span>
                  </div>
                )}

                {/* Resend button */}
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={!canResend || resending}
                    className="btn--secondary w-100 d-flex justify-content-center align-items-center gap-2"
                    style={{
                      opacity: canResend ? 1 : 0.5,
                      cursor:  canResend ? "pointer" : "not-allowed",
                    }}
                    aria-label="Resend verification code"
                  >
                    {resending ? (
                      <><i className="fa-solid fa-spinner fa-spin" /> Resending…</>
                    ) : (
                      <>Resend Code <i className="ti ti-refresh" /></>
                    )}
                  </button>
                </div>

                <p className="create-msg mt-20 text-center">
                  Already verified? <Link href="/sign-in">Sign In</Link>
                </p>

              </div>
            </div>
          </div>

          {/* ── Thumb Side ── */}
          <div className="col-12 col-lg-6 col-xl-5 offset-xl-1">
            <div
              className="authentication__thumb text-center d-none d-lg-block"
              style={{ backgroundImage: "url(images/authentication/thumb-sm.png)" }}
            >
              <div className="circle-img"><Image src={circle} alt="" /></div>
              <div className="thumb">
                <Image src={thumb} alt="" data-aos="zoom-in" data-aos-duration="600" />
              </div>
              <div className="number-img"><Image src={numbers} alt="" /></div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default EmailVerifySection;