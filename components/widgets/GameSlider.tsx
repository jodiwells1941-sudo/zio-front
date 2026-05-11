"use client";
import Link from "next/link";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/swiper-bundle.css";
import GameItemData from "@/public/data/game-items-data";

const GameSlider = () => {
	return (
		<div className="game__slider-inner">
			<Swiper
				className="game-slider"
				modules={[Autoplay, Pagination]}
				loop={true}
				speed={1000}
				slidesPerView={1}
				slidesPerGroup={1}
				spaceBetween={24}
				freeMode={true}
				autoplay={{
					delay: 2000,
					disableOnInteraction: false,
					pauseOnMouseEnter: true,
				}}
				pagination={{
					el: ".game-pagination",
					clickable: true,
				}}
				breakpoints={{
					992: { slidesPerView: 2 },
					1400: { slidesPerView: 3 },
				}}
			>
				{GameItemData.map((item) => (
					<SwiperSlide key={item.id}>
						<div className="result__single">
							<div className="contest__intro">
								{item.exclusive && <span>Exclusive</span>}
								<button aria-label="save" title="save">
									<i className="ti ti-heart"></i>
								</button>
							</div>

							<div className="thumb mt-20">
								<Link href="game-details">
									<Image src={item.image} alt={item.alt} />
								</Link>
							</div>

							<div className="content">
								{item.featured && (
									<div className="contest-number">
										<p className="text-sm fw-6">Featured</p>
									</div>
								)}

								<h5 className="fw-6 neutral-top">
									<Link href="game-details">{item.title}</Link>
								</h5>

								<ul className="platform mt-12">
									{item.platforms.map((platform, index) => (
										<li key={platform}>
											{platform}
											{index < item.platforms.length - 1 && <span></span>}
										</li>
									))}
								</ul>

								<div className="game__single-meta mt-25">
									<div className="rate-left">
										<div className="thumb-ic">
											<p className="text-lg fw-6">{item.rating}</p>
										</div>
										<div className="content-ic">
											<div className="review">
												{[...Array(4)].map((_, i) => (
													<i className="fa-solid fa-star" key={i}></i>
												))}
												<i className="fa-solid fa-star-half-stroke"></i>
											</div>
											<p className="text-xs mt-6">{item.ratingsCount}</p>
										</div>
									</div>
									<span className="divide d-none d-xxl-block"></span>
									<div className="rate-right">
										<div className="thumb-ic">
											<i className="fa-solid fa-share-nodes"></i>
										</div>
										<div className="content-ic">
											<p className="text-sm">Share & Earn</p>
											<p className="text-xs">Per share {item.sharePerEarn}</p>
										</div>
									</div>
								</div>

								<div className="cta mt-35">
									<Link
										href="game-details"
										aria-label="view details"
										title="view details"
										className="btn--primary"
									>
										View Details <i className="ti ti-arrow-narrow-right"></i>
									</Link>
								</div>
							</div>
						</div>
					</SwiperSlide>
				))}
			</Swiper>

			<div className="game-pagination slider-pagination mt-40"></div>
		</div>
	);
};

export default GameSlider;
