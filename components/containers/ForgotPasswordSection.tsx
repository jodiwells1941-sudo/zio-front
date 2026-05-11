"use client";

import Image from "next/image";
import circle from "@/public/images/authentication/circle.png";
import thumb from "@/public/images/authentication/thumb.png";
import numbers from "@/public/images/authentication/numbers.png";
import Link from "next/link";
import { useState } from "react";

const ForgotPasswordSection = () => {
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = () => { //e
    // e.preventDefault();
    // TODO: Call your API to verify token + reset password
  };

  return (
    <section className="authentication py-4 pt-md-120 pb-md-120">
      <div className="container">
        <div className="row align-items-center h-screen">
          <div className="col-12 col-lg-6 col-xl-6 mx-auto">
            <div
              className="authentication__inner"
              data-aos="fade-right"
              data-aos-duration="600"
            >
              <div className="authentication__content mt-md-5 mt-0 text-center">
                <h4 className="title-animation neutral-top fw-6 mb-md-10">
                  Reset Your Password
                </h4>
                <p>
                  Enter and confirm your new password to complete your password reset.
                </p>
              </div>

              <div className="authentication__form mt-md-55">
                <form onSubmit={handleSubmit}>
                  {/* New Password */}
                  <div className="input-wrapper mt-30 password-group">
                    <label htmlFor="newPassword">New Password</label>
                    <div className="input-single">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        name="newPassword"
                        id="newPassword"
                        placeholder="Enter new password"
                        required
                        minLength={8}
                        autoComplete="new-password"
                      />
                      <i
                        className={`ti ${
                          showNewPassword ? "ti-eye" : "ti-eye-off"
                        } show-pass`}
                        onClick={() => setShowNewPassword((prev) => !prev)}
                        style={{ cursor: "pointer" }}
                        aria-label="Toggle new password visibility"
                        role="button"
                        tabIndex={0}
                      ></i>
                    </div>
                  </div>

                  {/* Confirm New Password */}
                  <div className="input-wrapper mt-30 password-group">
                    <label htmlFor="confirmPassword">Confirm New Password</label>
                    <div className="input-single">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        id="confirmPassword"
                        placeholder="Re-enter new password"
                        required
                        minLength={8}
                        autoComplete="new-password"
                      />
                      <i
                        className={`ti ${
                          showConfirmPassword ? "ti-eye" : "ti-eye-off"
                        } show-pass`}
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        style={{ cursor: "pointer" }}
                        aria-label="Toggle confirm password visibility"
                        role="button"
                        tabIndex={0}
                      ></i>
                    </div>
                  </div>

                  <div className="mt-20">
                    <button
                      type="submit"
                      aria-label="reset password"
                      title="reset password"
                      className="btn--primary w-100 d-flex justify-content-center"
                    >
                      Reset Password <i className="ti ti-arrow-narrow-right"></i>
                    </button>
                  </div>

                  <p className="create-msg mt-20 text-center">
                    Remember your password? <Link href="/sign-in">Sign In</Link>
                  </p>
                </form>
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-6 col-xl-5 offset-xl-1">
            <div
              className="authentication__thumb text-center d-none d-lg-block"
              style={{
                backgroundImage: "url(images/authentication/thumb-sm.png)",
              }}
            >
              <div className="circle-img">
                <Image src={circle} alt="Decoration" />
              </div>
              <div className="thumb">
                <Image
                  src={thumb}
                  alt="Authentication illustration"
                  data-aos="zoom-in"
                  data-aos-duration="600"
                />
              </div>
              <div className="number-img">
                <Image src={numbers} alt="Decoration" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ForgotPasswordSection;

