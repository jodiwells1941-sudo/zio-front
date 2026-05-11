"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import circle from "@/public/images/authentication/circle.png";
import thumb from "@/public/images/authentication/thumb.png";
import numbers from "@/public/images/authentication/numbers.png";
import RegisterForm from "../widgets/RegisterForm";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useSearchParams } from "next/navigation";

const AuthenticationForm = dynamic(
	() => import("../widgets/AuthenticationForm")
);

type TabKey = "signin" | "signup";

const AuthenticationSection = () => {

	const [tab, setTab] = useState<TabKey>("signin");
  	const isSignIn = useMemo(() => tab === "signin", [tab]);
	const searchParams = useSearchParams();
	
	useEffect(() => {
		if (searchParams.get("verified") === "1") {
		toast.success("Email verified successfully! You can now sign in.");
		}
	}, []);

	return (
		<section className="authentication py-4 pt-md-120 pb-md-120">
			<div className="container">
				<div className="row align-items-center">

					{/* Conditional Render */}
						<div className="col-12 col-lg-6 col-xl-6 mx-auto">
								<div className="authentication__inner" data-aos="fade-right" data-aos-duration="600">
									<div className="authentication__content mt-md-5 mt-0 text-center">
										<h4 className="title-animation neutral-top fw-6 mb-md-10">
											Let&apos;s Get Started!
										</h4>
										<p>{isSignIn ? 'Sign in' : 'Sign up'} to your account and join us</p>
									</div>

									{/* tab button */}
									<div className="d-flex justify-content-center pb-5 pt-4">
										<div className="d-flex gap-5 border-bottom border-dark-light w-100">
											<button
												type="button"
												onClick={() => setTab("signin")}
												className={[
												"bg-transparent border-0 py-3 px-2 fw-semibold text-xxl w-100 d-flex justify-content-center",
												isSignIn ? "text-warning border-bottom border-2 border-warning" : "text-white",
												].join(" ")}
											>
												Sign In
											</button>

											<button
												type="button"
												onClick={() => setTab("signup")}
												className={[
												"bg-transparent border-0 py-3 px-2 fw-semibold text-xxl w-100 d-flex justify-content-center",
												!isSignIn ? "text-warning border-bottom border-2 border-warning" : "text-white",
												].join(" ")}
											>
												Sign Up
											</button>
										</div>
									</div>

									<div className="authentication__form mt-md-55">
										{isSignIn ? (
											<AuthenticationForm />
										) : (
											<RegisterForm />
										)}
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

export default AuthenticationSection;
