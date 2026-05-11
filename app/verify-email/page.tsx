"use client";

import Image from "next/image";
import circle from "@/public/images/authentication/circle.png";
import thumb from "@/public/images/authentication/thumb.png";
import numbers from "@/public/images/authentication/numbers.png";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { resendVerificationEmail, getResendStatus } from "../api/auth";

const COUNTDOWN_SECONDS = 60;

const EmailVerifySection = () => {
  const searchParams        = useSearchParams();
  const email               = searchParams.get("email") ?? "";
  const [resending,  setResending]  = useState(false);
  const [countdown,  setCountdown]  = useState(COUNTDOWN_SECONDS);
  const [canResend,  setCanResend]  = useState(false);
  const [mounted,    setMounted]    = useState(false);

  // ── Fetch real countdown from server on mount ─────────────────────
  useEffect(() => {
    const init = async () => {
      try {
        const res = await getResendStatus();
        const secondsLeft = res?.retry_after ?? 0;
        setCountdown(secondsLeft);
        setCanResend(secondsLeft === 0);
      } catch {
        setCountdown(0);
        setCanResend(true);
      } finally {
        setMounted(true);
      }
    };
    init();
  }, []);

  // ── Countdown tick — purely frontend after initial server sync ────
  useEffect(() => {
    if (!mounted) return;
    if (countdown <= 0) {
      setCanResend(true);
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, mounted]);

  // ── After resend, restart from server response ────────────────────
  const startCountdown = useCallback((seconds = COUNTDOWN_SECONDS) => {
    setCanResend(false);
    setCountdown(seconds);
  }, []);

  // ── Resend handler ────────────────────────────────────────────────
  const handleResend = async () => {
    if (!canResend || resending) return;
    setResending(true);
    try {
      const res = await resendVerificationEmail();
      if (res?.status) {
        toast.success(res?.message ?? "Verification email resent.");
        startCountdown(res?.retry_after ?? COUNTDOWN_SECONDS);
      } else {
        toast.error(res?.message ?? "Failed to resend.");
        if (res?.retry_after) startCountdown(res.retry_after);
      }
    } catch (err: any) {
      const retryAfter = err?.response?.data?.retry_after;
      const message    = err?.response?.data?.message ?? "Failed to resend.";
      toast.error(message);
      if (retryAfter) startCountdown(retryAfter);
    } finally {
      setResending(false);
    }
  };

  // ── SVG ring ──────────────────────────────────────────────────────
  const progress         = ((COUNTDOWN_SECONDS - countdown) / COUNTDOWN_SECONDS) * 100;
  const radius           = 20;
  const circumference    = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

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
                <p>We sent a verification link to your email address.</p>
              </div>

              <div className="authentication__form mt-md-55">

                {/* Email display */}
                {email && (
                  <div className="input-wrapper mt-30">
                    <label>Email Address</label>
                    <div className="input-single">
                      <input
                        type="email"
                        value={email}
                        readOnly
                        className="bg-transparent"
                      />
                      <i className="fa-solid fa-envelope" />
                    </div>
                  </div>
                )}

                {/* Info message */}
                <div className="mt-30 p-3 rounded border border-dark-light text-center">
                  <p className="mb-0 text-reset" style={{ fontSize: 14 }}>
                    Please check your inbox and click the verification link to
                    activate your account. Check your spam folder if you
                    don&apos;t see it.
                  </p>
                </div>

                {/* Loading state */}
                {!mounted && (
                  <div className="mt-20 text-center text-muted" style={{ fontSize: 13 }}>
                    <i className="fa-solid fa-spinner fa-spin me-2" />
                    Checking status…
                  </div>
                )}

                {/* Countdown ring */}
                {mounted && !canResend && (
                  <div className="mt-20 d-flex align-items-center justify-content-center gap-2">
                    <svg width="50" height="50" viewBox="0 0 50 50">
                      {/* Background track */}
                      <circle
                        cx="25" cy="25" r={radius}
                        fill="none"
                        stroke="currentColor"
                        strokeOpacity={0.15}
                        strokeWidth="3"
                      />
                      {/* Animated progress arc */}
                      <circle
                        cx="25" cy="25" r={radius}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        transform="rotate(-90 25 25)"
                        style={{ transition: "stroke-dashoffset 0.9s linear" }}
                        className="text-primary"
                      />
                      {/* Countdown number */}
                      <text
                        x="25" y="25"
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontSize="13"
                        fontWeight="600"
                        fill="currentColor"
                      >
                        {countdown}
                      </text>
                    </svg>
                    <span className="text-muted" style={{ fontSize: 13 }}>
                      Resend available in <strong>{countdown}s</strong>
                    </span>
                  </div>
                )}

                {/* Resend button */}
                <div className="mt-20">
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={!canResend || resending || !mounted}
                    aria-label="Resend verification email"
                    className="btn--primary w-100 d-flex justify-content-center align-items-center gap-2"
                    style={{
                      opacity: (canResend && mounted) ? 1 : 0.5,
                      cursor:  (canResend && mounted) ? "pointer" : "not-allowed",
                    }}
                  >
                    {resending ? (
                      <><i className="fa-solid fa-spinner fa-spin" /> Resending…</>
                    ) : (
                      <>Resend Verification Email <i className="ti ti-arrow-narrow-right" /></>
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
              <div className="circle-img">
                <Image src={circle} alt="Image" />
              </div>
              <div className="thumb">
                <Image src={thumb} alt="Image" data-aos="zoom-in" data-aos-duration="600" />
              </div>
              <div className="number-img">
                <Image src={numbers} alt="Image" />
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default EmailVerifySection;
