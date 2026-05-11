"use client";
import Link from "next/link";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, FreeMode } from "swiper/modules";
import "swiper/swiper-bundle.css";
import BlogTwoData from "@/public/data/blog-two-data";

const BlogSliderTwo = () => {
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
					{BlogTwoData.map((item) => (
						<SwiperSlide key={item.id}>
							<div className="blog__grid">
								<div className="thumb">
									<Link href={item.href}>
										<Image src={item.image} alt={item.title} />
									</Link>
									<span className="time text-lg">{item.date}</span>
								</div>
								<div className="content-wrapper">
									<div className="content">
										<div className="content__inner">
											<div className="author-thumb">
												<Image src={item.avatar} alt={item.author} />
											</div>
											<p className="mt-8 fw-5">By {item.author}</p>
											<h6 className="mt-12">
												<Link href={item.href}>{item.title}</Link>
											</h6>
										</div>
										<div className="content__cta mt-25">
											<Link
												href={item.href}
												aria-label="view comments"
												title="view comments"
											>
												<i className="ti ti-message-2"></i>{" "}
												{item.comments.toString().padStart(2, "0")} Comments
											</Link>
											<Link
												href={item.href}
												aria-label="view details"
												title="view details"
												className="btn--primary"
											>
												Read More <i className="ti ti-arrow-narrow-right"></i>
											</Link>
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

export default BlogSliderTwo;
