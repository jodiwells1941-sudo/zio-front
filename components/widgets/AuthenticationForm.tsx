"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { loginAPI } from "@/app/api/auth";
import { login } from "@/utils/auth";
import { useSearchParams } from "next/navigation";
import { toast } from "react-toastify";

type LoginUser = Parameters<typeof login>[1];

type LoginResponse = {
  data?: {
    access_token?: string;
    user?: LoginUser;
  };
};

const AuthenticationForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");  

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Handle login form submission
  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("auth-email");
    const password = formData.get("auth-password");

    if (typeof email !== "string" || typeof password !== "string") {
      setError("Please enter a valid email and password.");
      setIsLoading(false);
      return;
    }

    try {
      const data = (await loginAPI(email, password)) as LoginResponse;
      const responseData = data?.data;

      if (responseData?.access_token && responseData?.user) {
        await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: responseData.access_token }),
        });

        login(responseData.access_token, responseData.user);

        toast.success("Login successful...");
        window.location.href = redirect || "/dashboard";
        return;
      } else {
        setError("Invalid login response. Please try again.");
        toast.error("Invalid login response. Please try again.");
      }
    } catch (err: unknown) {
      // ✅ Extract backend error message
      let message = "Login failed. Please try again.";

      if (err && typeof err === "object" && "response" in err) {
        const axiosErr = err as { response?: { status?: number; data?: { message?: string } } };
        const backendMessage = axiosErr.response?.data?.message;
        const status = axiosErr.response?.status;

        if (backendMessage) {
          message = backendMessage;
        }

        // ✅ Redirect to verify page if email not verified
        if (status === 403) {
          toast.error(message);
          setError(message);
          window.location.href = `/verify-email?email=${encodeURIComponent(email)}`;
          return;
        }
      }

      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <div className="input-wrapper mt-30">
        <label htmlFor="authEmail">Your Email</label>
        <div className="input-single">
          <input
            type="email"
            name="auth-email"
            id="authEmail"
            placeholder="Enter Email"
            required
          />
          <i className="fa-solid fa-envelope"></i>
        </div>
      </div>

      <div className="input-wrapper mt-30 password-group">
        <label htmlFor="authPassword">Your Password</label>
        <div className="input-single">
          <input
            type={showPassword ? "text" : "password"}
            name="auth-password"
            id="authPassword"
            placeholder="Enter password"
            required
          />
          <i
            className={`ti ${showPassword ? "ti-eye" : "ti-eye-off"} show-pass`}
            onClick={togglePasswordVisibility}
            style={{ cursor: "pointer" }}
            aria-label="Toggle password visibility"
          />
        </div>
      </div>

      <div className="mt-20">
        <button
          type="submit"
          aria-label="submit message"
          title="submit message"
          className="btn--primary w-100 d-flex justify-content-center"
          disabled={isLoading}
        >
          {isLoading ? "Signing In..." : <>Sign In <i className="ti ti-arrow-narrow-right"></i></>}
        </button>
      </div>

      <p className="text-end mt-16 forget-pass text-center">
        <Link href="/verify-email">Forget Password ?</Link>
      </p>
      <p className="create-msg mt-20 text-center">
        Don&apos;t have an account? <Link href="/sign-up">Sign Up</Link>
      </p>

      <button
        type="button"
        className="btn--secondary w-100 d-flex justify-content-center align-items-center gap-2 mt-20"
        // onClick={() => signIn("google")}
      >
        <i className="fa-brands fa-google"></i>
        Continue with Google
      </button>
    </form>
  );
};

export default AuthenticationForm;