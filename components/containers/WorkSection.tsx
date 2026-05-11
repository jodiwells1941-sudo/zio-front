"use client";

import Image from "next/image";
import one from "@/public/images/left-arrow.png";
import two from "@/public/images/right-arrow.png";
import three from "@/public/images/spring.png";
import four from "@/public/images/left-th.png";
import five from "@/public/images/line.png";

const WorkSection = () => {
	return (
		<section className="work work-alter pt-120 pb-120">
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
							<div className="thumb">
								<i className="ti ti-user"></i>
								<span>01</span>
								<Image
									src={one}
									alt="Image"
									className="lg-arrow d-none d-xl-block"
								/>
							</div>
							<div className="content mt-25">
								<h6 className="fw-6">Sign Up Instantly</h6>
								<p className="text-sm mt-12">
									Create your Zio Lottery account in just a few minutes. Simply
									register with your email or connect. No long forms or complex
									verifications
								</p>
							</div>
						</div>
					</div>
					<div className="col-12 col-md-6 col-xl-4">
						<div
							className="work__single work__single-alt text-center"
							data-aos="fade-up"
							data-aos-duration="600"
							data-aos-delay="200"
						>
							<div className="thumb">
								<i className="ti ti-pig"></i>
								<span>02</span>
								<Image
									src={two}
									alt="Image"
									className="lg-arrow lg-r-arrow d-none d-xl-block"
								/>
							</div>
							<div className="content mt-25">
								<h6 className="fw-6">Deposit Securely</h6>
								<p className="text-sm mt-12">
									Add funds to your account easily and securely. Our platform ensures fast and reliable transactions so you can quickly purchase lottery tickets and participate in lottery draws without any hassle.
								</p>
							</div>
						</div>
					</div>
					<div className="col-12 col-md-6 col-xl-4">
						<div
							className="work__single  text-center"
							data-aos="fade-up"
							data-aos-duration="600"
							data-aos-delay="400"
						>
							<div className="thumb">
								<i className="ti ti-trophy"></i>
								<span>03</span>
							</div>
							<div className="content mt-25">
								<h6 className="fw-6">Buy Tickets & Win Real Prizes</h6>
								<p className="text-sm mt-12">
Choose your lucky tickets and participate in exciting lottery draws. With fast transactions and a trusted system, you can enjoy the thrill of playing and winning real rewards.								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div className="left-thumb">
				<Image src={three} alt="Image" />
			</div>
			<div className="right-thumb">
				<Image src={four} alt="Image" />
			</div>
			<div className="line">
				<Image src={five} alt="Image" />
			</div>
		</section>
	);
};

export default WorkSection;
