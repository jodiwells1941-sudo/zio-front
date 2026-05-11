"use client";
import Link from "next/link";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, FreeMode } from "swiper/modules";
import "swiper/swiper-bundle.css";
import BlogThreeData from "@/public/data/blog-three-data";

const BlogSlider = () => {
	return (
		<div className="blog__inner">
			<div className="blog-two__slider swiper">
				<Swiper
					modules={[Autoplay, Pagination, FreeMode]}
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
						el: ".blog-two-pagination",
						clickable: true,
					}}
					breakpoints={{
						992: { slidesPerView: 2 },
						1400: { slidesPerView: 3 },
					}}
				>
					{BlogThreeData.map((item) => (
						<SwiperSlide key={item.id}>
							<div className="blog__grid">
								<div className="thumb">
									<Link href={item.href}>
										<Image src={item.image} alt="Blog Thumbnail" />
									</Link>
									<span className="time text-lg">{item.tag}</span>
								</div>
								<div className="content-wrapper">
									<div className="content">
										<div className="content__inner">
											<h6 className="mt-12">
												<Link href={item.href}>{item.title}</Link>
											</h6>
										</div>
										<div className="content__cta mt-25">
											<span>
												<i className="ti ti-user"></i> {item.author}
											</span>
											<span className="divi"></span>
											<span>
												<i className="ti ti-calendar-check"></i> {item.date}
											</span>
										</div>
									</div>
								</div>
							</div>
						</SwiperSlide>
					))}
				</Swiper>
			</div>
			<div className="blog-two-pagination slider-pagination mt-40"></div>
		</div>
	);
};

export default BlogSlider;
