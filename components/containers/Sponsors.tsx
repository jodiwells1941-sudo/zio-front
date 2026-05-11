"use client";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/swiper-bundle.css";
import { useEffect, useState } from "react";
import { getAllActiveRounds } from "@/app/api/lottery";

const Sponsors = () => {

	const [allRounds, setAllRounds] = useState([]);
	
	  const getRounds = async () => {
		const res = await getAllActiveRounds();
		setAllRounds(res?.data || []);
	  };
	
	  useEffect(() => {
		getRounds();
	  }, []);
	  
	return (
		<div className="sponsor pt-md-80 pt-5 pb-3 pb-md-5 tertiary-bg">
			<div className="container">
				<div className="row">
					<div className="col-12">
						<div className="sponsor__inner text-center">
							<h6 className="neutral-top fw-6">
								Trusted By Over <span className="secondary-text">
									12,500
								</span>
								Best Partner
							</h6>
							<div className="sponsor__slider pt-4 pt-md-5">
								<Swiper
									loop={true}
									speed={1000}
									slidesPerView={1}
									slidesPerGroup={1}
									spaceBetween={24}
									freeMode={true}
									centeredSlides={true}
									modules={[Autoplay]}
									autoplay={{
										delay: 2000,
										disableOnInteraction: false,
										pauseOnMouseEnter: true,
									}}
									breakpoints={{
										420: {
											slidesPerView: 2,
										},
										576: {
											slidesPerView: 3,
										},
										992: {
											slidesPerView: 5,
										},
										1400: {
											slidesPerView: 7,
										},
									}}
								>
									{allRounds?.map((item: { id: React.Key | null | undefined; img: string;  }) => {
										return (
											<SwiperSlide key={item.id}>
												<div className="sponsor__slider-single text-center">
													<Image
														className="w-md-100"
														width={200}
														height={200}
														style={{ width: '150px', height: '150px', objectFit: 'cover' }}
														src={item.img || "/images/new/lucky-day.png"}
														alt="Img"
													/>
													</div>
											</SwiperSlide>
										);
									})}
								</Swiper>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Sponsors;
