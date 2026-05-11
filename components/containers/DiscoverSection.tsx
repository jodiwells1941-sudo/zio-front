import Link from "next/link";
import Image from "next/image";
import bg from "@/public/images/discover/discover-bg.png";
import thumb from "@/public/images/discover/thumb.png";
import one from "@/public/images/discover/one.png";
import two from "@/public/images/discover/two.png";
import three from "@/public/images/discover/three.png";
import four from "@/public/images/discover/four.png";
import vr from "@/public/images/discover/vr.png";
import square from "@/public/images/square.png";
import tower from "@/public/images/tower.png";
import chart from "@/public/images/chart.png";
import rightTh from "@/public/images/right-th.png";

const DiscoverSection = () => {
	return (
		<section
			className="discover pt-120 pb-190"
			style={{ backgroundImage: `url(${bg.src})` }}
		>
			<div className="container">
				<div className="row align-items-center rtl-header">
					<div className="col-12 col-lg-4 col-xl-5">
						<div className="discover__thumb">
							<div className="refer__thumb d-none d-lg-block">
								<div
									className="thumb text-start"
									data-aos="fade-right"
									data-aos-duration="600"
								>
									<Image src={thumb} alt="Discover Thumb" />
								</div>
								<div className="btc">
									<Image src={one} alt="BTC Icon" />
								</div>
								<div className="eth">
									<Image src={two} alt="ETH Icon" />
								</div>
								<div className="arrow">
									<Image src={three} alt="Arrow Icon" />
								</div>
								<div className="btc-alt">
									<Image src={four} alt="BTC Alt" />
								</div>
								<div className="eth-alt">
									<Image src={vr} alt="VR Icon" />
								</div>
							</div>
						</div>
					</div>
					<div className="col-12 col-lg-7 offset-lg-1 col-xl-6 offset-xl-1">
						<div
							className="discover__content"
							data-aos="fade-left"
							data-aos-duration="600"
							data-aos-delay="200"
						>
							<div className="section__content text-start">
								<span className="fw-6 secondary-text text-xl">
									<strong>Why</strong> Choose Us!
									Our commitment to providing an exceptional online lottery experience is supported by advanced technology and a transparent system designed to ensure fairness, security, and reliability for all participants.
								</span>
								<h2 className="title-animation fw-6 mt-25">
									Discover Why to Choose <span>Zio Lottery</span>  for Online Lottery
								</h2>
								<p className="mt-25">
									Our commitment to providing an exceptional online lottery experience is supported by reliable technology and a transparent system that ensures fairness and security for all participants.
								</p>
							</div>
							<div className="about__content-group mt-40">
								<div className="about__content-single">
									<div className="thumb">
										<i className="ti ti-device-gamepad-2"></i>
									</div>
									<div className="content">
										<h6 className="fw-6">Online Lottery Platform</h6>
										<p className="text-sm mt-8">
											We prioritize fairness in every game. With provably fair
											technology, you can trust that every outcome is
											transparent and unbiased.
										</p>
									</div>
								</div>
								<div className="about__content-single mt-30">
									<div className="thumb">
										<i className="ti ti-wallet"></i>
									</div>
									<div className="content">
										<h6 className="fw-6">Secure Withdrawals</h6>
										<p className="text-sm mt-8">
											We ensure that all deposits and withdrawals are processed quickly and securely, providing users with a smooth and reliable experience on the Zio Lottery platform.
										</p>
									</div>
								</div>
							</div>
							<div className="mt-40">
								<Link
									href="about-us"
									aria-label="Read More"
									title="Read More"
									className="btn--primary"
								>
									Read More <i className="ti ti-arrow-narrow-right"></i>
								</Link>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div className="left-thumb">
				<Image src={square} alt="Square Decor" />
			</div>
			<div className="right-thumb">
				<Image src={tower} alt="Tower Decor" />
			</div>
			<div className="chart">
				<Image src={chart} alt="Chart Decor" />
			</div>
			<div className="left-th">
				<Image src={rightTh} alt="Right Thumb" />
			</div>
		</section>
	);
};

export default DiscoverSection;
