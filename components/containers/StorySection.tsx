"use client";

import Image from "next/image";
import StoryData from "@/public/data/story-data";
import one from "@/public/images/chart.png";
import two from "@/public/images/btc-two.png";
import three from "@/public/images/rocket.png";

interface StoryProps {
	layout?: "one" | "two";
}

const StorySection = ({ layout = "one" }: StoryProps) => {
	return (
		<section className={`story pt-120${layout === "two" ? " pb-120" : ""}`}>
			<div className="container">
				<div className="row justify-content-center">
					<div className="col-12 col-xl-9">
						<div
							className="section__header text-center mb-55"
							data-aos="fade-up"
							data-aos-duration="600"
						>
							<span className="fw-6 secondary-text text-xl">
								<strong>What,</strong> Our Players Say
							</span>
							<h2 className="title-animation fw-6 mt-25">
								Success in the Digital Currency Realm
							</h2>
							<p className="mt-25">
								We believe that the best way to showcase our success is through
								the voices of our players. We take pride in providing an
								exceptional
							</p>
						</div>
					</div>
				</div>
				<div className="row gutter-24">
					<div className="col-12 col-xl-4">
						<div className="story__inner">
							<div className="story__wrapper story__left-wrapper">
								{StoryData.map((item) => {
									return (
										<div className="story__single" key={item.id}>
											<i className="ti ti-quote"></i>
											<div className="review">
												{Array.from({ length: item.stars }).map((_, i) => (
													<i key={i} className="fa-solid fa-star"></i>
												))}
											</div>
											<div className="story__meta mt-16">
												<p>{item.authorHandle}</p>
												<p>{item.date}</p>
											</div>
											<div className="story__content mt-25">
												<blockquote>
													<q className="text-lg">{item.quote}</q>
												</blockquote>
											</div>
											<div className="author__info mt-35">
												<div className="thumb">
													<Image src={item.image} alt={item.alt} />
												</div>
												<div className="content">
													<p className="text-xl fw-6">{item.authorName}</p>
													<p>{item.authorRole}</p>
												</div>
											</div>
										</div>
									);
								})}
							</div>
						</div>
					</div>
					<div className="col-12 col-xl-4">
						<div className="story__inner story__inner-center">
							<div className="story__wrapper story__wrapper-center">
								{[...StoryData].reverse().map((item) => {
									return (
										<div className="story__single" key={item.id}>
											<i className="ti ti-quote"></i>
											<div className="review">
												{Array.from({ length: item.stars }).map((_, i) => (
													<i key={i} className="fa-solid fa-star"></i>
												))}
											</div>
											<div className="story__meta mt-16">
												<p>{item.authorHandle}</p>
												<p>{item.date}</p>
											</div>
											<div className="story__content mt-25">
												<blockquote>
													<q className="text-lg">{item.quote}</q>
												</blockquote>
											</div>
											<div className="author__info mt-35">
												<div className="thumb">
													<Image src={item.image} alt={item.alt} />
												</div>
												<div className="content">
													<p className="text-xl fw-6">{item.authorName}</p>
													<p>{item.authorRole}</p>
												</div>
											</div>
										</div>
									);
								})}
							</div>
						</div>
					</div>
					<div className="col-12 col-xl-4">
						<div className="story__inner">
							<div className="story__wrapper story__right-wrapper">
								{StoryData.map((item) => {
									return (
										<div className="story__single" key={item.id}>
											<i className="ti ti-quote"></i>
											<div className="review">
												{Array.from({ length: item.stars }).map((_, i) => (
													<i key={i} className="fa-solid fa-star"></i>
												))}
											</div>
											<div className="story__meta mt-16">
												<p>{item.authorHandle}</p>
												<p>{item.date}</p>
											</div>
											<div className="story__content mt-25">
												<blockquote>
													<q className="text-lg">{item.quote}</q>
												</blockquote>
											</div>
											<div className="author__info mt-35">
												<div className="thumb">
													<Image src={item.image} alt={item.alt} />
												</div>
												<div className="content">
													<p className="text-xl fw-6">{item.authorName}</p>
													<p>{item.authorRole}</p>
												</div>
											</div>
										</div>
									);
								})}
							</div>
						</div>
					</div>
				</div>
			</div>
			<div className="chart">
				<Image src={one} alt="Image" />
			</div>
			<div className="btc">
				<Image src={two} alt="Image" />
			</div>
			<div className="rocket">
				<Image src={three} alt="Image" />
			</div>
		</section>
	);
};

export default StorySection;
