"use client";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, EffectFade } from "swiper/modules";
import "swiper/swiper-bundle.css";
import TestimonialData from "@/public/data/testimonial-data";

const TestimonialSlider = () => {
	return (
		<>
			<div className="testimonial__slider swiper">
				<Swiper
					loop={true}
					speed={2000}
					slidesPerView={1}
					slidesPerGroup={1}
					spaceBetween={30}
					modules={[Autoplay, Navigation, EffectFade]}
					effect={"fade"}
					autoplay={{
						delay: 6000,
						disableOnInteraction: false,
						pauseOnMouseEnter: true,
					}}
					navigation={{
						nextEl: ".next-testimonial",
						prevEl: ".prev-testimonial",
					}}
				>
					{TestimonialData.map((item) => {
						return (
							<SwiperSlide key={item.id}>
								<div className="testimonial__slider-single">
									<div className="review mb-20">
										<i className="fa-solid fa-star"></i>
										<i className="fa-solid fa-star"></i>
										<i className="fa-solid fa-star"></i>
										<i className="fa-solid fa-star"></i>
										<i className="fa-solid fa-star"></i>
									</div>
									<blockquote className="text-xxl">
										<q>{item.content}</q>
									</blockquote>
									<div className="author__info mt-35">
										<div className="thumb">
											<Image src={item.image} alt={item.name} />
										</div>
										<div className="content">
											<p className="text-xl fw-6">{item.name}</p>
											<p>{item.role}</p>
										</div>
									</div>
								</div>
							</SwiperSlide>
						);
					})}
				</Swiper>
			</div>
			<div className="slider-navigation">
				<button
					type="button"
					aria-label="prev slide"
					title="prev slide"
					className="prev-testimonial slider-btn"
				>
					<i className="fa-solid fa-angle-left"></i>
				</button>
				<button
					type="button"
					aria-label="next slide"
					title="next slide"
					className="next-testimonial slider-btn"
				>
					<i className="fa-solid fa-angle-right"></i>
				</button>
			</div>
		</>
	);
};

export default TestimonialSlider;
