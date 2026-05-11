"use client";

import Image from "next/image";
import circle from "@/public/images/authentication/circle.png";
import thumb from "@/public/images/authentication/thumb.png";
import numbers from "@/public/images/authentication/numbers.png";
import Link from "next/link";

const EmailVerifySection = () => {

    return (
        <section className="authentication py-4 pt-md-120 pb-md-120">
            <div className="container">
                <div className="row align-items-center h-screen">

                    {/* Conditional Render */}
                    <div className="col-12 col-lg-6 col-xl-6 mx-auto">
                        <div className="authentication__inner" data-aos="fade-right" data-aos-duration="600">
                            <div className="authentication__content mt-md-5 mt-0 text-center">
                                <h4 className="title-animation neutral-top fw-6 mb-md-10">
                                    Let&apos;s Get Started!
                                </h4>
                                <p>Verify your email account & forgot your password</p>
                            </div>

                            <div className="authentication__form mt-md-55">
                                <form>
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

                                    <div className="mt-20">
                                        <button
                                            type="submit"
                                            aria-label="submit message"
                                            title="submit message"
                                            className="btn--primary  w-100 d-flex justify-content-center"
                                        >
                                            Verify Now<i className="ti ti-arrow-narrow-right"></i>
                                        </button>
                                    </div>
                                    <p className="create-msg mt-20 text-center">
                                        Have an account?  <Link href="/sign-in">Sign In</Link>
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
                                <Image src={circle} alt="Image" />
                            </div>
                            <div className="thumb">
                                <Image
                                    src={thumb}
                                    alt="Image"
                                    data-aos="zoom-in"
                                    data-aos-duration="600"
                                />
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
