import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import bannerBg from "@/public/images/banner/banner-two-bg.png";
import bannerThumb from "@/public/images/banner/banner-two-thumb.png";
import bannerLeft from "@/public/images/banner/banner-two-left.png";
import bannerRight from "@/public/images/banner/banner-two-right.png";
import rocket from "@/public/images/rocket.png";
import avatarSeven from "@/public/images/avatar/seven.png";
import avatarFive from "@/public/images/avatar/five.png";
import avatarFour from "@/public/images/avatar/four.png";
import avatarSix from "@/public/images/avatar/six.png";

const Counter = dynamic(
	() => import("@/components/widgets/Counter")
);

const HeroSectionThree = () => {
	return (
		<section
			className="banner-two"
			style={{ backgroundImage: `url(${bannerBg.src})` }}
		>
			<div className="container">
				<div className="row justify-content-center">
					<div className="col-12 col-xl-10">
						<div className="banner-three__content text-center mb-60">
							<span className="fw-6 secondary-text text-xl sub-title">
								<strong>Secure,</strong> trusted, and fast lottery experience.
							</span>
							<h1 className="title-animation fw-7 mt-20">
								Join Zio Lottery And Be Among Millions{" "}
								<span className="primary-text">Winning</span> Every Day
							</h1>
						</div>
					</div>
				</div>
				<div className="row align-items-center gutter-24">
					<div className="col-12 col-lg-4 col-xl-3">
						<div className="banner-two__content text-center text-lg-end">
							<div className="testimonial__thumb-content">
								<i className="ti ti-rocket"></i>
								<h4 className="fw-7 mt-4 mb-8">
									<Counter value={15} />M<span className="prefix">+</span>
								</h4>
								<p className="text-sm fw-5 neutral-top">Total Players</p>
							</div>
							<p className="mt-25">
								Join 5M+ members in thrilling, secure, and rewarding lottery
								gaming.
							</p>
							<div className="join-users justify-content-center justify-content-lg-end mt-25">
								<div className="single-user">
									<Image src={avatarSeven} alt="User Avatar" />
								</div>
								<div className="single-user">
									<Image src={avatarFive} alt="User Avatar" />
								</div>
								<div className="single-user">
									<Image src={avatarFour} alt="User Avatar" />
								</div>
								<div className="single-user">
									<Image src={avatarSix} alt="User Avatar" />
								</div>
								<div className="single-user">
									<p className="fw-7 text-sm">25+</p>
								</div>
							</div>
						</div>
					</div>
					<div className="col-12 col-lg-4 col-xl-3 offset-lg-4 offset-xl-6">
						<div className="banner-two__content text-center text-lg-start">
							<p>
								Welcome to the ultimate lottery experience, where every ticket
								is a chance to change your life.
							</p>
							<div className="mt-25">
								<Link
									href="lottery"
									aria-label="play online lottery"
									title="play online lottery"
									className="btn--secondary"
								>
									Join Lottery <i className="ti ti-arrow-narrow-right"></i>
								</Link>
							</div>
							<div className="banner-three__group flex-row justify-content-center justify-content-lg-start">
								<div className="left-content">
									<h4 className="fw-6 mt-4 mb-8 primary-text">
										<Counter value={20} />M
										<span className="prefix secondary-text">+</span>
									</h4>
									<p className="fw-5">Total Winners</p>
								</div>
								<span className="divide d-none d-sm-block"></span>
								<div className="left-content">
									<h4 className="fw-6 mt-4 mb-8 primary-text">
										<Counter value={5.2} />K
										<span className="prefix secondary-text">+</span>
									</h4>
									<p className="fw-5">Total Payouts</p>
								</div>
							</div>
						</div>
					</div>
					<div className="col-12 col-xl-6">
						<div className="banner-two__thumb">
							<Image src={bannerThumb} alt="Banner Thumb" />
						</div>
					</div>
				</div>
			</div>
			<div className="left-thumb">
				<Image src={bannerLeft} alt="Left Decoration" />
			</div>
			<div className="right-thumb">
				<Image src={bannerRight} alt="Right Decoration" />
			</div>
			<div className="rocket">
				<Image src={rocket} alt="Rocket" />
			</div>
		</section>
	);
};

export default HeroSectionThree;
