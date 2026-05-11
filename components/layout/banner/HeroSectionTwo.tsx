import Link from "next/link";
import Image from "next/image";
import heroBg from "@/public/images/banner/hero.png";
import bannerThumb from "@/public/images/banner/banner-thumb.png";
import rocket from "@/public/images/banner/b-rocket.png";
import btc from "@/public/images/banner/btc.png";
import coinUp from "@/public/images/banner/b-coin-up.png";
import coinDown from "@/public/images/banner/b-coin-down.png";
import point from "@/public/images/banner/b-point.png";
import lottery from "@/public/images/banner/lottery.png";
import rightTh from "@/public/images/right-th.png";

const HeroSectionTwo = () => {
	return (
		<section
			className="banner"
			style={{
				backgroundImage: `url(${heroBg.src})`,
			}}
		>
			<div className="container">
				<div className="row align-items-center">
					<div className="col-12 col-lg-7 col-xl-7">
						<div className="banner-three__content">
							<span className="fw-6 secondary-text text-xl sub-title">
							<strong>Join,</strong> Participate, and Win Amazing Prizes
							</span>

							<h1 className="fw-7 mt-25">
							The Excitement of <span className="primary-text">Online Lottery</span>
							</h1>

							<p className="text-xl mt-30">
							Welcome to Zio Lottery, a trusted online lottery platform where every ticket you purchase brings you closer to winning exciting prizes.
							</p>
							<div className="banner-action mt-40">
								<Link
									href="games"
									aria-label="play games"
									title="play games"
									className="btn--primary"
								>
									Play Games
									<i className="ti ti-arrow-narrow-right"></i>
								</Link>
								<Link
									href="lottery"
									aria-label="explore lottery"
									title="explore lottery"
									className="btn--secondary"
								>
									Explore Lottery <i className="ti ti-arrow-narrow-right"></i>
								</Link>
							</div>
						</div>
					</div>

					<div className="col-12 col-lg-5 col-xl-5">
						<div className="banner__thumb">
							<div className="thumb-wrapper">
								<div className="thumb">
									<Image src={bannerThumb} alt="Banner Thumb" />
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div className="rocket">
				<Image src={rocket} alt="Rocket" />
			</div>
			<div className="btc d-none d-sm-block">
				<Image src={btc} alt="Bitcoin Icon" />
			</div>
			<div className="coin-up">
				<Image src={coinUp} alt="Coin Up" />
			</div>
			<div className="coin-down">
				<Image src={coinDown} alt="Coin Down" />
			</div>
			<div className="point d-none d-sm-block">
				<Image src={point} alt="Point" />
			</div>
			<div className="lottery d-none d-lg-block">
				<Image src={lottery} alt="Lottery Icon" />
			</div>
			<div className="right-th">
				<Image src={rightTh} alt="Right Thumbnail" />
			</div>
		</section>
	);
};

export default HeroSectionTwo;
