"use client";

import Link from "next/link";
import Image from "next/image";
import FantasyData from "@/public/data/fantasy-data";
import bottomThumb from "@/public/images/fantasy/bottom-thumb.png";
import rightThumb from "@/public/images/fantasy/right-thumb.png";
import btc from "@/public/images/fantasy/btc.png";

const FantastySectionTwo = () => {
	return (
		<section
			className="fantasy pt-120 pb-120"
			style={{ backgroundImage: "url(/images/lottery-details-bg.png)" }}
		>
			<div className="container">
				<div
					className="row gutter-20 align-items-center mb-55 rtl-header"
					data-aos="fade-up"
					data-aos-duration="600"
				>
					<div className="col-12 col-lg-7 col-xl-8">
						<div className="section__content">
							<span className="fw-6 secondary-text text-xl">
								<strong>Meet,</strong> Our Recent Contests
							</span>
							<h2 className="title-animation fw-6 mt-20">
								Online Lottery Draws
							</h2>
						</div>
					</div>
					<div className="col-12 col-lg-5 col-xl-4">
						<div className="section__content-right">
							<p className="text-lg">
								Dive into a world where traditional gaming meets modern
								blockchain technology.
							</p>
							<div className="mt-25">
								<Link
									href="games"
									aria-label="view all"
									title="view all"
									className="btn--secondary"
								>
									All Categories <i className="ti ti-arrow-narrow-right"></i>
								</Link>
							</div>
						</div>
					</div>
				</div>

				<div className="row gutter-24">
					{FantasyData.map((item, index) => {
						const classes = [
							"fantasy__single",
							index % 2 !== 0 ? "fantasy__single-alt" : "",
							index === 1 ? "single-two" : "",
							index === 3 ? "single-three" : "",
							index === 5 ? "single-four" : "",
							"tilt",
						].join(" ");

						return (
							<div
								className="col-12 col-md-6 col-xl-4"
								data-aos="fade-up"
								data-aos-duration="600"
								data-aos-delay={item.delay}
								key={item.id}
							>
								<div className={classes}>
									<div className="intro">
										<h5 className="neutral-top fw-6 text-uppercase">
											<Image
												src={item.icon}
												alt={item.alt}
												width={28}
												height={28}
											/>
											{item.title}
										</h5>
									</div>
									<div className="content mt-120">
										<p className="mb-15">
											{item.customText ||
												"Dive into our in-house games, live casino and slots"}
										</p>
										<Link
											href="game-details"
											aria-label="play now"
											title="play now"
										>
											Play Now <i className="ti ti-arrow-narrow-right"></i>
										</Link>
									</div>
									<div className="thumb">
										<Image src={item.thumb} alt={item.alt} />
									</div>
								</div>
							</div>
						);
					})}
				</div>
			</div>

			<div className="left-thumb">
				<Image src={bottomThumb} alt="Left Thumb" />
			</div>
			<div className="rocket">
				<Image src={rightThumb} alt="Rocket Thumb" />
			</div>
			<div className="right-thumb">
				<Image src={btc} alt="Bitcoin Image" />
			</div>
		</section>
	);
};

export default FantastySectionTwo;
