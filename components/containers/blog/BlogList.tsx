"use client";

import Link from "next/link";
import Image from "next/image";
import blogListData from "@/public/data/blog-list-data";
import BlogSidebar from "./BlogSidebar";
import leftTh from "@/public/images/left-th.png";
import rightTh from "@/public/images/right-th.png";
import rocket from "@/public/images/rocket.png";

const BlogList = () => {
	return (
		<section className="blog-list blog-three pt-120 pb-120">
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

				<div className="row gutter-40">
					<div className="col-12 col-lg-7 col-xl-8">
						<div className="blog-three__inner">
							{blogListData.map((post, index) => (
								<div
									key={post.id}
									className={`blog-three__single ${index !== 0 ? "mt-40" : ""}`}
									data-aos="fade-up"
									data-aos-duration="600"
									data-aos-delay={index * 200}
								>
									<div className="thumb">
										<Link href={post.href}>
											<Image src={post.image} alt="Blog Post Image" />
										</Link>
									</div>
									<div
										className="content"
										data-aos="fade-right"
										data-aos-duration="600"
										data-aos-delay="200"
									>
										<p className="time">
											<i className="ti ti-calendar-check"></i>{" "}
											<span>{post.date}</span>
										</p>
										<h5 className="mt-16">
											<Link href={post.href}>{post.title}</Link>
										</h5>
										<div className="mt-40 cta">
											<Link href={post.href}>
												<i className="ti ti-arrow-up-right"></i>
											</Link>
										</div>
									</div>
								</div>
							))}
						</div>

						<div
							className="pagination-wrapper mt-60"
							data-aos="fade-up"
							data-aos-duration="600"
							data-aos-delay="100"
						>
							<ul className="pagination">
								<li>
									<button>
										<i className="ti ti-chevron-left"></i>
									</button>
								</li>
								<li>
									<Link href="blog">1</Link>
								</li>
								<li>
									<Link href="blog" className="active">
										2
									</Link>
								</li>
								<li>
									<Link href="blog">3</Link>
								</li>
								<li>
									<button>
										<i className="ti ti-chevron-right"></i>
									</button>
								</li>
							</ul>
						</div>
					</div>
					<BlogSidebar />
				</div>
			</div>

			<div className="left-th">
				<Image src={leftTh} alt="Left Decoration" />
			</div>
			<div className="right-th">
				<Image src={rightTh} alt="Right Decoration" />
			</div>
			<div className="rc">
				<Image src={rocket} alt="Rocket Decoration" />
			</div>
		</section>
	);
};

export default BlogList;
