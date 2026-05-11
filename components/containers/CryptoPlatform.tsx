"use client";

import Link from "next/link";
import Image from "next/image";
import CryptoPlatformData from "@/public/data/crypto-platform-data";
import one from "@/public/images/square.png";
import two from "@/public/images/left-th.png";
import three from "@/public/images/vr.png";

const CryptoPlatform = () => {
	const kingCard = CryptoPlatformData.find((game) => game.isKingCard);
	const otherGames = CryptoPlatformData.filter((game) => !game.isKingCard);

	return (
		<section
			className="cr-platform pt-120 pb-120"
			style={{ backgroundImage: "url(images/cr-bg.png)" }}
		>
			<div className="container">
				<div
					className="row gutter-20 align-items-center mb-55 rtl-header"
					data-aos="fade-up"
					data-aos-duration="600"
				>
					<div className="col-12 col-lg-7 col-xl-8 col-xxl-6">
						<div className="section__content">
							<span className="fw-6 secondary-text text-xl">
								<strong>Trending,</strong> Popular Games
							</span>
							<h2 className="title-animation fw-6 mt-25">
								Official Zio Lottery – Secure Online Lottery Platform
							</h2>
						</div>
					</div>
					<div className="col-12 col-lg-5 col-xl-4 col-xxl-4 offset-xxl-2">
						<div className="section__content-right">
							<p>
								Explore the featured lottery draws at Zio Lottery, where every ticket brings you closer to exciting rewards and opportunities.
							</p>
							<div className="mt-25">
								<Link
									href="games"
									aria-label="explore all games"
									title="explore all games"
									className="btn--secondary"
								>
									Explore All Games <i className="ti ti-arrow-narrow-right"></i>
								</Link>
							</div>
						</div>
					</div>
				</div>

				<div className="row gutter-24">
					{kingCard && (
						<div className="col-12 col-xl-5 col-xxl-6">
							<div
								className="king-card"
								data-aos="fade-right"
								data-aos-duration="600"
							>
								<div className="thumb">
									<Image src={kingCard.image} alt={kingCard.title} />
								</div>
								<div className="content-wrapper">
									<div className="content text-center">
										<span className="text-uppercase fw-6 secondary-text">
											{kingCard.category}
										</span>
										<h6 className="fw-6 mt-8">
											<Link href={kingCard.href}>{kingCard.title}</Link>
										</h6>
										<ul className="platform justify-content-center mt-12">
											{kingCard.platforms.map((platform, i) => (
												<li key={i}>
													{platform}
													{i < kingCard.platforms.length - 1 && <span> </span>}
												</li>
											))}
										</ul>
									</div>
									<div className="cta mt-25 text-center">
										<Link
											href={kingCard.href}
											aria-label="view details"
											title="view details"
											className="btn--primary"
										>
											Play Now <i className="ti ti-arrow-narrow-right"></i>
										</Link>
									</div>
								</div>
							</div>
						</div>
					)}

					<div className="col-12 col-xl-7 col-xxl-6">
						<div className="row gutter-24">
							{otherGames.map((game, index) => (
								<div
									key={game.id}
									className="col-12 col-md-6 col-xl-6"
									data-aos="fade-left"
									data-aos-duration="600"
									data-aos-delay={index % 2 === 1 ? "200" : "0"}
								>
									<div className="lt-type__single text-center tilt">
										<span className="serial">Featured</span>
										<span className="price">
											<i className="fa-solid fa-star"></i> 5
										</span>
										<div className="thumb">
											<Image src={game.image} alt={game.title} />
										</div>
										<div className="content mt-25">
											<span className="text-uppercase fw-6 secondary-text">
												{game.category}
											</span>
											<h6 className="fw-6 mt-8">
												<Link href={game.href}>{game.title}</Link>
											</h6>
											<ul className="platform justify-content-center mt-12">
												{game.platforms.map((platform, i) => (
													<li key={i}>
														{platform}
														{i < game.platforms.length - 1 && <span> </span>}
													</li>
												))}
											</ul>
										</div>
										<div className="cta mt-25">
											<Link
												href={game.href}
												aria-label="view details"
												title="view details"
												className="btn--primary"
											>
												Play Now <i className="ti ti-arrow-narrow-right"></i>
											</Link>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
			<div className="left-thumb">
				<Image src={one} alt="Left Thumb" />
			</div>
			<div className="right-thumb">
				<Image src={two} alt="Right Thumb" />
			</div>
			<div className="vr-img">
				<Image src={three} alt="VR" />
			</div>
		</section>
	);
};

export default CryptoPlatform;
