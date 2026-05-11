"use client";

import Link from "next/link";
import Image from "next/image";
import BlogData from "@/public/data/blog-data";
import one from "@/public/images/left-th.png";
import two from "@/public/images/right-th.png";
import three from "@/public/images/rocket.png";

const BlogSection = () => {
	return (
		<section className="blog blog-two pt-120 pb-120">
			<div className="container">
				<div className="row justify-content-center">
					<div className="col-12 col-xl-8">
						<div
							className="section__header text-center mb-55"
							data-aos="fade-up"
							data-aos-duration="600"
						>
							<span className="fw-6 secondary-text text-xl">
								<strong>Latest,</strong> Lottery News
							</span>
							<h2 className="title-animation fw-6 mt-25">
								Innovative Ways to Play
							</h2>
							<p className="mt-25">
								Explore our blog for the latest in lottery insights, tips, and
								success stories. Whether you&apos;re a seasoned player or just
								starting out
							</p>
						</div>
					</div>
				</div>

				<div className="row gutter-24">
					{BlogData.map((blog, idx) => (
						<div
							key={blog.id}
							className="col-12 col-md-6 col-xxl-4"
							data-aos="fade-up"
							data-aos-duration="600"
							data-aos-delay={idx * 200}
						>
							<div className="blog__single-wrapper">
								<div className="blog__single tilt">
									<div className="thumb">
										<Link href={blog.href}>
											<Image src={blog.image} alt="Image" />
										</Link>
										<span className="tag text-lg">{blog.tag}</span>
									</div>
									<div className="content">
										<div className="content__inner">
											<h6 className="mt-20">
												<Link href={blog.href}>{blog.title}</Link>
											</h6>
										</div>
										<div className="content__cta mt-30">
											<Link
												href={blog.href}
												aria-label="view comments"
												title="view comments"
											>
												<i className="ti ti-message-2"></i> {blog.comments}{" "}
												Comments
											</Link>
											<span></span>
											<Link
												href={blog.href}
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
						</div>
					))}
				</div>

				<div className="row">
					<div className="col-12">
						<div
							className="mt-40 text-center"
							data-aos="fade-up"
							data-aos-duration="600"
						>
							<Link
								href="blog-grid"
								aria-label="Play Lottery"
								title="Play Lottery"
								className="btn--secondary"
							>
								View All <i className="ti ti-arrow-narrow-right"></i>
							</Link>
						</div>
					</div>
				</div>
			</div>

			<div className="left-th">
				<Image src={one} alt="Image" />
			</div>
			<div className="right-th">
				<Image src={two} alt="Image" />
			</div>
			<div className="rc">
				<Image src={three} alt="Image" />
			</div>
		</section>
	);
};

export default BlogSection;
