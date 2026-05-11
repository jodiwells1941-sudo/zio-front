import Link from "next/link";
import Image from "next/image";
import bannerThreeBg from "@/public/images/banner/banner-three-bg.png";
import bannerThreeThumb from "@/public/images/banner/banner-three-thumb.png";
import bannerShape from "@/public/images/banner/shape.png";
import rocketXs from "@/public/images/rocket-xs.png";
import bannerThreeRight from "@/public/images/banner/banner-three-right.png";
import avatarSeven from "@/public/images/avatar/seven.png";
import avatarFive from "@/public/images/avatar/five.png";
import avatarFour from "@/public/images/avatar/four.png";
import avatarSix from "@/public/images/avatar/six.png";

const HeroSectionFour = () => {
	return (
		<section
			className="banner-three"
			style={{ backgroundImage: `url(${bannerThreeBg.src})` }}
		>
			<div className="container">
				<div className="row">
					<div className="col-12 col-lg-7 col-xl-7 col-xxl-6">
						<div className="banner-three__content">
							<span className="fw-6 secondary-text text-xl sub-title">
								<strong>Play,</strong> Win, and Earn crypto
							</span>
							<h1 className="title-animation fw-7 mt-20">
								The Power of Crypto{" "}
								<span className="primary-text">Lotteries</span>
							</h1>
							<div className="banner-three__group">
								<div className="left-content">
									<p className="fw-5">5M+ Active Player</p>
									<div className="join-users mt-16">
										<div className="single-user">
											<Image src={avatarSeven} alt="Avatar Seven" />
										</div>
										<div className="single-user">
											<Image src={avatarFive} alt="Avatar Five" />
										</div>
										<div className="single-user">
											<Image src={avatarFour} alt="Avatar Four" />
										</div>
										<div className="single-user">
											<Image src={avatarSix} alt="Avatar Six" />
										</div>
										<div className="single-user">
											<p className="fw-7 text-sm">25+</p>
										</div>
									</div>
								</div>
								<span className="divide d-none d-sm-block"></span>
								<div className="right-content">
									<p className="text-lg">
										Step into a world where gaming and blockchain meet, giving
										you access to the most thrilling crypto lotteries and gaming
										experiences.
									</p>
								</div>
							</div>
							<div className="banner-action mt-60">
								<Link href="games" className="btn--primary">
									Play Games <i className="ti ti-arrow-narrow-right"></i>
								</Link>
								<Link href="lottery" className="btn--secondary">
									Explore Lottery <i className="ti ti-arrow-narrow-right"></i>
								</Link>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div
				className="banner-thumb"
				data-aos="fade-left"
				data-aos-duration="600"
			>
				<Image src={bannerThreeThumb} alt="Banner Thumb" />
			</div>
			<div className="shape">
				<Image src={bannerShape} alt="Shape" />
			</div>
			<div className="rocket">
				<Image src={rocketXs} alt="Rocket" />
			</div>
			<div className="right-thumb">
				<Image src={bannerThreeRight} alt="Right Thumb" />
			</div>
		</section>
	);
};

export default HeroSectionFour;
