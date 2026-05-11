"use client";

import Link from "next/link";
import Image from "next/image";
import BlogGridData from "@/public/data/blog-grid-data";

const BlogGrid = () => {
	return (
		<section className="blog pt-120 pb-120">
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

				<div className="row gutter-30">
					{BlogGridData.map((item, index) => (
						<div key={item.id} className="col-12 col-lg-6 col-xxl-4">
							<div
								className="blog__grid"
								data-aos="fade-up"
								data-aos-duration="600"
								data-aos-delay={
									index % 3 === 0 ? 0 : index % 3 === 1 ? 200 : 400
								}
							>
								<div className="thumb">
									<Link href={item.href}>
										<Image src={item.image} alt="Blog image" />
									</Link>
									<span className="time text-lg">{item.date}</span>
								</div>
								<div className="content-wrapper">
									<div className="content">
										<div className="content__inner">
											<div className="author-thumb">
												<Image src={item.authorImage} alt="Author" />
											</div>
											<p className="mt-8 fw-5">By {item.author}</p>
											<h6 className="mt-12">
												<Link href={item.href}>{item.title}</Link>
											</h6>
										</div>
										<div className="content__cta mt-25">
											<Link href={item.href}>
												<i className="ti ti-message-2"></i>{" "}
												{item.comments < 10
													? `0${item.comments}`
													: item.comments}{" "}
												Comments
											</Link>
											<Link href={item.href} className="btn--primary">
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
							className="pagination-wrapper mt-40"
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
				</div>
			</div>
		</section>
	);
};

export default BlogGrid;
