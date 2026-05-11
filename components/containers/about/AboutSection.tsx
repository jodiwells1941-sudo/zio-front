import Link from "next/link";
import Image from "next/image";
import one from "@/public/images/authentication/circle.png";
import two from "@/public/images/authentication/thumb.png";
import three from "@/public/images/authentication/numbers.png";
import four from "@/public/images/spring.png";
import five from "@/public/images/rocket-sm.png";

const AboutSection = () => {
	return (
		<section className="about about-alternate pt-120 pb-120">
			<div className="container">
				<div className="row align-items-center">
					<div className="col-12 col-lg-6 col-xl-6">
						<div
							className="about__content"
							data-aos="fade-right"
							data-aos-duration="600"
						>
							<div className="section__content text-start">
								<span className="fw-6 secondary-text text-xl">
									<strong>Trusted,</strong> by Thousands of Winners
								</span>
								<h2 className="title-animation fw-6 mt-25">
									Join the Top-Rated Lottery, <span>Play Here</span>
								</h2>
								<p className="mt-25">
									We go beyond simply offering lottery games; we provide a
									trusted, secure environment where millions of players come to
									enjoy.
								</p>
							</div>
							<hr className="divider mt-35 mb-40" />
							<div className="about__content-group">
								<div className="about__content-single">
									<div className="thumb">
										<i className="ti ti-device-gamepad-2"></i>
									</div>
									<div className="content">
										<h6 className="fw-6">Guaranteed Fair Play</h6>
										<p className="text-sm mt-8">
											We prioritize fair gameplay with verified lottery draws
											processes
										</p>
									</div>
								</div>
								<span className="divideer d-none d-xxl-block"></span>
								<div className="about__content-single">
									<div className="thumb">
										<i className="ti ti-wallet"></i>
									</div>
									<div className="content">
										<h6 className="fw-6">Instant Secure Payouts</h6>
										<p className="text-sm mt-8">
											Enjoy seamless and quick payouts with the highest place.
										</p>
									</div>
								</div>
							</div>
							<ul className="list-group-row mt-40">
								<li>
									<i className="ti ti-check"></i>Risk Management Consulting
								</li>
								<li>
									<i className="ti ti-check"></i>Customer Relationship
								</li>
								<li>
									<i className="ti ti-check"></i>Leadership Development
								</li>
								<li>
									<i className="ti ti-check"></i>Supply Chain Optimization
								</li>
							</ul>
							<div className="mt-40">
								<Link
									href="lottery"
									aria-label="Play Lottery"
									title="Play Lottery"
									className="btn--primary"
								>
									Play Lottery <i className="ti ti-arrow-narrow-right"></i>
								</Link>
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
								<Image src={one} alt="Image" />
							</div>
							<div className="thumb">
								<Image
									src={two}
									alt="Image"
									data-aos="zoom-in"
									data-aos-duration="600"
									data-aos-delay="200"
								/>
							</div>
							<div className="number-img">
								<Image src={three} alt="Image" />
							</div>
						</div>
					</div>
				</div>
			</div>
			<div className="left-thumb">
				<Image src={four} alt="Image" />
			</div>
			<div className="rocket">
				<Image src={five} alt="Image" />
			</div>
		</section>
	);
};

export default AboutSection;
