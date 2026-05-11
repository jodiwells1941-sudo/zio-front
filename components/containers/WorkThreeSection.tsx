"use client";

import Link from "next/link";
import Image from "next/image";
import one from "@/public/images/arrow.png";
import two from "@/public/images/spring.png";
import three from "@/public/images/left-th.png";

const WorkThreeSection = () => {
	return (
		<section className="work work-two work-alter pt-120 pb-120">
			<div className="container">
				<div className="row justify-content-center">
					<div className="col-12 col-xl-9">
						<div
							className="section__header text-center mb-55"
							data-aos="fade-up"
							data-aos-duration="600"
						>
							<span className="fw-6 secondary-text text-xl">
								<strong>Step,</strong> by Step Process
							</span>
							<h2 className="title-animation fw-6 mt-25">How It`s Works</h2>
							<p className="mt-16">
								We&apos;ve made it easier than ever to join the world of online lottery. With just a few clicks, you can easily purchase your lottery tickets online and participate in exciting lottery draws anytime.
							</p>
						</div>
					</div>
				</div>
				<div className="row gutter-60">
					<div className="col-12 col-md-6 col-lg-4">
						<div
							className="work__single text-center"
							data-aos="fade-up"
							data-aos-duration="600"
						>
							<div className="thumb">
								<i className="ti ti-user"></i>
							</div>
							<div className="content mt-30">
								<p className="text-lg fw-5">
									Step_<span className="secondary-text">01</span>
								</p>
								<h6 className="fw-6 mt-16">Sign Up Instantly</h6>
								<p className="text-sm mt-16">
									Create your Zio Lottery account in just a few minutes. Simply
									register
								</p>
							</div>
							<Image
								src={one}
								alt="Image"
								className="ar-img d-none d-xl-block"
							/>
						</div>
					</div>
					<div className="col-12 col-md-6 col-lg-4">
						<div
							className="work__single text-center"
							data-aos="fade-up"
							data-aos-duration="600"
							data-aos-delay="200"
						>
							<div className="thumb">
								<i className="ti ti-pig"></i>
							</div>
							<div className="content mt-30">
								<p className="text-lg fw-5">
									Step_<span className="secondary-text">02</span>
								</p>
								<h6 className="fw-6 mt-16">Deposit Securely</h6>
								<p className="text-sm mt-16">
									Add funds to your account using popular cryptocurrencies like
									Bitcoin.
								</p>
							</div>
							<Image
								src={one}
								alt="Image"
								className="ar-img d-none d-xl-block"
							/>
						</div>
					</div>
					<div className="col-12 col-md-6 col-lg-4">
						<div
							className="work__single text-center"
							data-aos="fade-up"
							data-aos-duration="600"
							data-aos-delay="400"
						>
							<div className="thumb">
								<i className="ti ti-trophy"></i>
							</div>
							<div className="content mt-30">
								<p className="text-lg fw-5">
									Step_<span className="secondary-text">03</span>
								</p>
								<h6 className="fw-6 mt-16">Win Real Crypto</h6>
								<p className="text-sm mt-16">
									Explore various lottery draws and opportunities available on the Zio Lottery platform, where users can easily purchase tickets and participate online.
								</p>
							</div>
						</div>
					</div>
				</div>
				<div className="row justify-content-center">
					<div className="col-12 col-xl-8">
						<div className="work-two__cta mt-60">
							<div className="work-two__cta-left">
								<p className="text-xl fw-5 secondary-text">
									<i className="ti ti-user"></i> Ready to play? Create your
									account now.
								</p>
							</div>
							<div className="work-two__cta-right">
								<Link
									href="sign-up"
									aria-label="Register Here"
									title="Register Here"
									className="btn--primary"
								>
									Register Here
								</Link>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div className="left-thumb">
				<Image src={two} alt="Image" />
			</div>
			<div className="right-thumb">
				<Image src={three} alt="Image" />
			</div>
		</section>
	);
};

export default WorkThreeSection;
