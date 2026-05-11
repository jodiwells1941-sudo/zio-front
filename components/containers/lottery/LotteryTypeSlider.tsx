"use client";
import Link from "next/link";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay, FreeMode } from "swiper/modules";
import "swiper/swiper-bundle.css";

type Winner = {
	id: number;
	position: number;
	img: string;
	prize: number;
	winner_amount: number;
	lottery_name: string;
	slug: string;
	lottery_round_prizes: {
		position: number;
		prize: number;
	}[];
};

const LotteryTypeSlider = ({ winners }: { winners: any }) => {	

	return (
		<div className="row">
			<div className="col-12">
				<div className="lottery__type-wrapper mb-25">
					<div className="lottery__type-slider swiper">
						<Swiper
							modules={[Navigation, Autoplay, FreeMode]}
							loop={true}
							speed={1000}
							slidesPerView={1}
							slidesPerGroup={1}
							spaceBetween={24}
							freeMode={true}
							centeredSlides={true}
							autoplay={{
								delay: 2000,
								disableOnInteraction: false,
								pauseOnMouseEnter: true,
							}}
							navigation={{
								nextEl: ".next-lottery",
								prevEl: ".prev-lottery",
							}}
							breakpoints={{
								576: {
									slidesPerView: 2,
								},
								992: {
									slidesPerView: 3,
								},
							}}
						>
							{winners?.map((winner: any) => (
								<SwiperSlide key={winner.id}>
									<div className="lottery__type lt-type-two text-center">
										<div className="thumb text-center w-100">
											<Image
												width={150}
												height={150}
												src={winner?.lottery?.feature_img_url || "/images/new/lucky-day.png"}
												alt={"Img"}
											/>
										</div>
										<div className="content">
											<h6 className="fw-8 title">
												<Link
													href={`/lottery-details/${winner?.slug ?? ""}`}
												>
													{winner.name || "Lottery Name"}
												</Link>
											</h6>

											<div className="mt-16 d-flex align-items-center justify-content-center gap-1 ps-1">
												<Image
													width={20}
													height={20}
													src={"/images/new/rank-cap.png"}
													alt="rank"
												/>
												<span className="text-xl">
													<b>1st Prize</b>
												</span>
											</div>

											<h4 className="pl-3 d-none d-md-block">
												<b>${winner?.lottery_round_prizes[0].winner_amount}</b>
											</h4>
											<h2 className="pl-3 d-md-none">
												<b>${winner?.lottery_round_prizes[0].winner_amount}</b>
											</h2>
										</div>
									</div>
								</SwiperSlide>
							))}
						</Swiper>
					</div>
					<div className="slider-navigation">
						<button
							type="button"
							aria-label="prev slide"
							title="prev slide"
							className="prev-lottery slider-btn"
						>
							<i className="fa-solid fa-angle-left"></i>
						</button>
						<button
							type="button"
							aria-label="next slide"
							title="next slide"
							className="next-lottery slider-btn"
						>
							<i className="fa-solid fa-angle-right"></i>
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default LotteryTypeSlider;
