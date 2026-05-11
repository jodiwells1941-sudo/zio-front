import Link from "next/link";
import Image from "next/image";
import one from "@/public/images/faq/faq-thumb.png";
import two from "@/public/images/faq/circle.png";
import three from "@/public/images/faq/btc.png";
import four from "@/public/images/faq/eth.png";
import five from "@/public/images/faq/arrow.png";
import six from "@/public/images/faq/btc.png";
import seven from "@/public/images/faq/eth.png";
import eight from "@/public/images/faq/btc.png";
import nine from "@/public/images/faq/arrow.png";
import ten from "@/public/images/faq/left-thumb.png";

const ReferTwoSection = () => {
	return (
		<section className="refer refer-alter pt-120 pb-120">
			<div className="container">
				<div className="row align-items-center rtl-header">
					<div className="col-12 col-lg-6 col-xl-6">
						<div
							className="refer__content"
							data-aos="fade-right"
							data-aos-duration="600"
						>
							<div className="section__content text-start">
								<span className="fw-6 secondary-text text-xl">
									<strong>Refer,</strong> And Earn
								</span>
								<h2 className="title-animation fw-6 mt-25">
									Maximize Your Earnings with
									<span>Referrals</span>
								</h2>
								<p className="mt-16">
									Your gaming doesn&apos;t stop at just playing—you can earn big
									by referring friends too! Our Refer & Earn program is designed
									to reward you.
								</p>
							</div>
							<div className="refer__content-group mt-35">
								<div className="refer__content-single">
									<p className="text-xl fw-5">
										<i className="fa-solid fa-circle-arrow-right"></i> Unlimited
										Earnings Potential
									</p>
									<p className="text-sm mt-8">
										There&apos;s no cap on how much you can earn with referrals.
										The more friends you invite.
									</p>
								</div>
								<div className="divider d-none d-xl-block"></div>
								<div className="refer__content-single">
									<p className="text-xl fw-5">
										<i className="fa-solid fa-circle-arrow-right"></i> Instant
										Crypto Payouts
									</p>
									<p className="text-sm mt-8">
										For each successful referral, you&apos;ll receive instant
										crypto rewards.
									</p>
								</div>
							</div>
							<div className="mt-40">
								<Link
									href="sign-up"
									aria-label="join now"
									title="join now"
									className="btn--primary"
								>
									Join Now <i className="ti ti-arrow-narrow-right"></i>
								</Link>
							</div>
						</div>
					</div>
					<div className="col-12 col-lg-6 col-xl-5 offset-xl-1">
						<div className="refer__thumb d-none d-lg-block">
							<div
								className="thumb"
								data-aos="zoom-in"
								data-aos-duration="600"
								data-aos-delay="200"
							>
								<Image src={one} alt="Image" />
							</div>
							<div className="circle">
								<Image src={two} alt="Image" />
							</div>
							<div className="btc">
								<Image src={three} alt="Image" />
							</div>
							<div className="eth">
								<Image src={four} alt="Image" />
							</div>
							<div className="arrow">
								<Image src={five} alt="Image" />
							</div>
							<div className="btc-alt">
								<Image src={six} alt="Image" />
							</div>
							<div className="eth-alt">
								<Image src={seven} alt="Image" />
							</div>
						</div>
					</div>
				</div>
			</div>
			<div className="btc-out">
				<Image src={eight} alt="Image" />
			</div>
			<div className="arrow-out">
				<Image src={nine} alt="Image" />
			</div>
			<div className="left-thumb">
				<Image src={ten} alt="Image" />
			</div>
		</section>
	);
};

export default ReferTwoSection;
