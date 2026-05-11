"use client";

import Image from "next/image";
import one from "@/public/images/spring.png";
import two from "@/public/images/left-th.png";

const WorkTwoSection = () => {
	return (
		<section className="work work-alternate pt-120 pb-120">
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
					<div className="col-12 col-md-6 col-xl-4">
						<div
							className="work__single text-center"
							data-aos="fade-up"
							data-aos-duration="600"
						>
							<div className="alternate-wrapper">
								<div className="thumb">
									<span className="step">1st Step</span>
								</div>
								<div className="content mt-25">
									<h6 className="fw-6">Sign Up Instantly</h6>
									<p className="text-sm mt-12">
										Create your Zio Lottery account in just a few minutes. Simply
										register
									</p>
								</div>
							</div>
							<div className="alternate-content">
								<div className="alt-thumb">
									<i className="ti ti-user"></i>
								</div>
							</div>
							<span className="bg-text">1</span>
						</div>
					</div>
					<div className="col-12 col-md-6 col-xl-4">
						<div
							className="work__single walt text-center"
							data-aos="fade-up"
							data-aos-duration="600"
							data-aos-delay="200"
						>
							<div className="alternate-content">
								<div className="alt-thumb">
									<i className="ti ti-pig"></i>
								</div>
							</div>
							<div className="alternate-wrapper">
								<div className="thumb">
									<span className="step">2nd Step</span>
								</div>
								<div className="content mt-25">
									<h6 className="fw-6">Deposit Crypto Securely</h6>
									<p className="text-sm mt-12">
										Add funds to your account using popular cryptocurrencies
										like Bitcoin.
									</p>
								</div>
							</div>
							<span className="bg-text">2</span>
						</div>
					</div>
					<div className="col-12 col-md-6 col-xl-4">
						<div
							className="work__single text-center"
							data-aos="fade-up"
							data-aos-duration="600"
							data-aos-delay="400"
						>
							<div className="alternate-wrapper">
								<div className="thumb">
									<span className="step">3rd Step</span>
								</div>
								<div className="content mt-25">
									<h6 className="fw-6">Play & Win Real Crypto</h6>
									<p className="text-sm mt-12">
										Explore various lottery draws and opportunities available on the Zio Lottery platform, where users can easily purchase tickets and participate online.
									</p>
								</div>
							</div>
							<div className="alternate-content">
								<div className="alt-thumb">
									<i className="ti ti-trophy"></i>
								</div>
							</div>
							<span className="bg-text">3</span>
						</div>
					</div>
				</div>
				<div className="row">
					<div className="col-12">
						<hr className="divide" />
					</div>
				</div>
			</div>
			<div className="left-thumb">
				<Image src={one} alt="Image" />
			</div>
			<div className="right-thumb">
				<Image src={two} alt="Image" />
			</div>
		</section>
	);
};

export default WorkTwoSection;
