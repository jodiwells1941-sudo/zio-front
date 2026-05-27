"use client";

import { FormEvent, use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Select from "react-select";
import countryList from "react-select-country-list";
import { registerAPI } from "@/app/api/auth";
import { login } from "@/utils/auth";
import { toast } from "react-toastify";
import { useSearchParams } from "next/navigation";

type Option = { label: string; value: string };
type LoginUser = Parameters<typeof login>[1];
type LoginResponse = {
  data?: {
    access_token?: string;
    user?: LoginUser;
  };
};

// ─── Validation helpers ───────────────────────────────────────────────────────

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,15}$/;

function validateFields(fields: {
  name: string;
  country: string;
  email: string;
  password: string;
  ref?: string;
}): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!fields.name.trim()) {
    errors.name = "Full name is required.";
  } else if (fields.name.trim().length < 2) {
    errors.name = "Name must be at least 2 characters.";
  }

  if (!fields.country) {
    errors.country = "Please select your country.";
  }

  if (!fields.email.trim()) {
    errors.email = "Email address is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) {
    errors.email = "Please enter a valid email address.";
  }

  if (!fields.password) {
    errors.password = "Password is required.";
  } else if (!PASSWORD_REGEX.test(fields.password)) {
    if (fields.password.length < 8 || fields.password.length > 15) {
      errors.password = "Password must be between 8 and 15 characters.";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])/.test(fields.password)) {
      errors.password = "Password must include both upper and lower case letters.";
    } else if (!/\d/.test(fields.password)) {
      errors.password = "Password must include at least one number.";
    } else {
      errors.password = "Password must include at least one special character.";
    }
  }

  return errors;
}

// ─── FieldError component ─────────────────────────────────────────────────────

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="field-error" role="alert" aria-live="polite">
      <i className="fa-solid fa-circle-exclamation" style={{ marginRight: 5 }} />
      {message}
    </p>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

const RegisterForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [open, setOpen] = useState(false);
  const [country, setCountry] = useState<Option | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [partnerCode, setPartnerCode] = useState("");

  const options = useMemo(() => countryList().getData() as Option[], []);
  const searchParams = useSearchParams();
  // const redirect = searchParams.get("redirect");

  const ref = searchParams.get('ref');

  useEffect(() => {
    if (ref) {
      setPartnerCode(ref);
      setOpen(true);
    }
  }, [ref]);


  // useEffect(() => {
  //   if (searchParams.get("verified") === "1") {
  //     toast.success("Email verified successfully! You can now sign in.");
  //   }
  // }, []);

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  // Clear a single field's error as the user types / changes it
  const clearError = (field: string) =>
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });

  const registerUser = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const name     = (formData.get("name")     as string) ?? "";
    const email    = (formData.get("email")    as string) ?? "";
    const password = (formData.get("password") as string) ?? "";
    const countryValue = country?.label ?? "";
    const ref = partnerCode.trim() || undefined;

    // ── Client-side validation ────────────────────────────────────────────
    const fieldErrors = validateFields({ name, country: countryValue, email, password, ref});

    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      setIsLoading(false);
      return;
    }

    setErrors({});

    // ── API call ──────────────────────────────────────────────────────────
    try {
      const data = (await registerAPI({ name, country: countryValue, email, password, ref })) as LoginResponse;
      const responseData = data?.data;

      if (responseData?.access_token && responseData?.user) {
        await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: responseData.access_token }),
        });

        login(responseData.access_token, responseData.user);
        toast.success("Registration successful!");
        window.location.href = `/verify-email?email=${encodeURIComponent(email)}`;

        // window.location.href = redirect || "/dashboard";
      } else {
        toast.error("Invalid registration response. Please try again.");
      }
    } catch (err: any) {
      // ── Map API validation errors onto fields if backend returns them ──
      const apiErrors = err?.response?.data?.errors as Record<string, string[]> | undefined;
      if (apiErrors) {
        const mapped: Record<string, string> = {};
        Object.entries(apiErrors).forEach(([field, messages]) => {
          mapped[field] = messages[0]; // show first message per field
        });
        setErrors(mapped);
      } else {
        toast.error(err?.response?.data?.message ?? "Registration failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={registerUser} noValidate>

      {/* ── Full Name ── */}
      <div className="input-group-wrapper">
        <div className={`input-wrapper ${errors.name ? "has-error" : ""}`}>
          <label htmlFor="authName">Full Name</label>
          <div className="input-single">
            <input
              type="text"
              name="name"
              id="authName"
              placeholder="Devon Lane"
              onChange={() => clearError("name")}
            />
            <i className="fa-solid fa-user" />
          </div>
          <FieldError message={errors.name} />
        </div>
      </div>

      {/* ── Country ── */}
      <div className={`input-wrapper mt-30 ${errors.country ? "has-error" : ""}`}>
        <label>Country</label>
        <input type="hidden" name="auth-country" value={country?.label ?? ""} />
        <div className="input-single">
          <Select
            instanceId="authCountry"
            options={options}
            value={country}
            onChange={(v) => {
              setCountry(v as Option);
              clearError("country");
            }}
            placeholder="Select Country"
            isSearchable
            className="w-100 fs-6"
            classNamePrefix="rs"
          />
          <i className="fa-solid fa-globe" />
        </div>
        <FieldError message={errors.country} />
      </div>

      {/* ── Email ── */}
      <div className={`input-wrapper mt-30 ${errors.email ? "has-error" : ""}`}>
        <label htmlFor="authEmail">Your Email</label>
        <div className="input-single">
          <input
            type="email"
            name="email"
            id="authEmail"
            placeholder="Enter Email"
            onChange={() => clearError("email")}
          />
          <i className="fa-solid fa-envelope" />
        </div>
        <FieldError message={errors.email} />
      </div>

      {/* ── Password ── */}
      <div className={`input-wrapper mt-30 password-group ${errors.password ? "has-error" : ""}`}>
        <label htmlFor="authPassword">Your Password</label>
        <div className="input-single">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            id="authPassword"
            placeholder="Enter password"
            onChange={() => clearError("password")}
          />
          <i
            className={`ti ${showPassword ? "ti-eye" : "ti-eye-off"} show-pass`}
            onClick={togglePasswordVisibility}
            style={{ cursor: "pointer" }}
            aria-label="Toggle password visibility"
          />
        </div>
        <FieldError message={errors.password} />
        <ul className="ps-3 pt-2" style={{ listStyleType: "disc" }}>
          <li>Between 8-15 characters</li>
          <li>At least one upper and one lower case letter</li>
          <li>At least one number</li>
          <li>At least one special character</li>
        </ul>
      </div>

      {/* ── Referral code (optional) ── */}
      <div className="input-wrapper mt-30">
        <button
          type="button"
          className="d-flex align-items-center justify-content-between w-100 bg-transparent border-0 p-0"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="partnerCodeBox"
        >
          <span className="fw-6">Referral code (optional)</span>
          <i className={`fa-solid ${open ? "fa-chevron-up" : "fa-chevron-down"}`} />
        </button>
        {open && (
          <div className="input-single mt-2" id="partnerCodeBox">
            <input
              type="text"
              name="partner_code"
              value={partnerCode}
              onChange={(e) => setPartnerCode(e.target.value)}
              id="partnerCode"
              placeholder="Enter Code"
            />
            <i className="fa-solid fa-ticket" />
          </div>
        )}
      </div>

      {/* ── Terms ── */}
      <div className="input-wrapper mt-30">
        <div className="d-flex align-items-center gap-2">
          <input className="check_box" type="checkbox" id="agreed" name="agreed" required />
          <label htmlFor="agreed" className="mb-0 pt-2">
            I agree to the Terms &amp; Conditions
          </label>
        </div>
      </div>

      {/* ── Submit ── */}
      <div className="mt-20 border-top pt-3 border-secondary border-opacity-25">
        <button
          type="submit"
          disabled={isLoading}
          aria-label="submit message"
          className="btn--primary w-100 d-flex justify-content-center"
        >
          {isLoading
            ? <><i className="fa-solid fa-spinner fa-spin" style={{ marginRight: 8 }} />Signing Up…</>
            : <>Sign Up <i className="ti ti-arrow-narrow-right" /></>
          }
        </button>
      </div>

      <p className="create-msg mt-20 text-center">
        Have an account? <Link href="/sign-in">Sign In</Link>
      </p>

      <button
        type="button"
        className="btn--secondary w-100 d-flex justify-content-center align-items-center gap-2 mt-20"
      >
        <i className="fa-brands fa-google" />
        Continue with Google
      </button>

    </form>
  );
};

export default RegisterForm;