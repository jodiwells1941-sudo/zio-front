import Link from "next/link";
import Image from "next/image";
import one from "@/public/images/authentication/circle.png";
import two from "@/public/images/about-thumb.png";
import three from "@/public/images/authentication/numbers.png";
import four from "@/public/images/spring-two.png";
import five from "@/public/images/rocket-xs.png";

const AboutTwoSection = () => {
	return (
		<section className="about about-three about-alternate pt-120 pb-120">
			<div className="container">
				<div className="row align-items-center">
					<div className="col-12 col-lg-5 col-xl-5">
						<div className="about-three__wrapper">
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
					<div className="col-12 col-lg-7 col-xl-6 offset-xl-1">
						<div
							className="about__content"
							data-aos="fade-right"
							data-aos-duration="600"
						>
							<div className="section__content text-start">
								<span className="fw-6 secondary-text text-xl">
									<strong>Join</strong> Smart. Win Amazing Prizes.
								</span>

								<h2 className="title-animation fw-6 mt-25">
								Trusted by Participants, Powered by Secure Technology
								</h2>
								<p className="mt-25">
									We blend cutting-edge blockchain technology with the thrill of
									lottery gaming to deliver an experience that&apos;s secure,
									transparent.
								</p>
							</div>
							<div className="list-group-items mt-40">
								<div className="list-group__single">
									<div className="thumb">
										<i className="ti ti-check"></i>
									</div>
									<div className="content">
										<h6 className="fw-6">Fair Draws</h6>
										<p className="text-sm mt-10">
											All lottery draws on Zio Lottery are powered by blockchain
											algorithms.
										</p>
									</div>
								</div>
								<div className="list-group__single">
									<div className="thumb">
										<i className="ti ti-check"></i>
									</div>
									<div className="content">
										<h6 className="fw-6">Instant Payouts</h6>
										<p className="text-sm mt-10">
											No waiting, no delays — winners receive their lottery prizes quickly and securely.
										</p>
									</div>
								</div>
								<div className="list-group__single">
									<div className="thumb">
										<i className="ti ti-check"></i>
									</div>
									<div className="content">
										<h6 className="fw-6">Secure Data</h6>
										<p className="text-sm mt-10">
											Your data and funds are protected by top-tier blockchain
											protocols.
										</p>
									</div>
								</div>
								<div className="list-group__single">
									<div className="thumb">
										<i className="ti ti-check"></i>
									</div>
									<div className="content">
										<h6 className="fw-6">Accessibility</h6>
										<p className="text-sm mt-10">
											Zio Lottery is borderless. No matter where you are, you can
											join, play.
										</p>
									</div>
								</div>
							</div>
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

export default AboutTwoSection;
