"use client";

// import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import BlogSidebar from "./BlogSidebar";
import BlogComments from "./BlogComments";
import CommentForm from "./CommentForm";
import thumb from "@/public/images/blog/poster.png";
import one from "@/public/images/blog/poster-one.png";
import two from "@/public/images/blog/poster-two.png";

const BlogDetails = () => {
	return (
		<>
			<section className="blog-details pt-120 pb-120">
				<div className="container">
					<div className="row gutter-40">
						<div className="col-12 col-xl-8">
							<div className="blog__details-card">
								<div
									className="details__poster"
									data-aos="fade-up"
									data-aos-duration="600"
								>
									<Image src={thumb} alt="Image" />
								</div>
								<div className="details__content mt-40">
									<div className="details__meta neutral-top">
										<p>
											<i className="ti ti-user"></i> Author
										</p>
										<span></span>
										<p>
											<i className="ti ti-calendar-star"></i>24/09/24
										</p>
										<span></span>
										<p>
											<i className="ti ti-clock-record"></i> 10:21 AM
										</p>
									</div>
								</div>
								<div
									className="details__content mt-55"
									data-aos="fade-up"
									data-aos-duration="600"
								>
									<h4 className="title-animation neutral-top fw-6">
										How Blockchain is Transforming the Gaming Industry
									</h4>
									<p className="mt-20">
										It is a long established fact that a reader will be
										distracted by the readable content of a page when looking at
										its layout. The point of using Lorem Ipsum is that it has a
										more-or-less normal distribution of letters, as opposed to
										using Content here, content here, making it look like
										readable English.
									</p>
									<p className="mt-20">
										Many desktop publishing packages and web page editors now
										use Lorem Ipsum as their default model text, and a search
										for lorem ipsum will uncover many web sites still in their
										infancy. Various versions have evolved over the years,
										sometimes by accident, sometimes on purpose (injected humour
										and the like).
									</p>
								</div>
								<div
									className="details__content mt-55"
									data-aos="fade-up"
									data-aos-duration="600"
								>
									<h5 className="title-animation neutral-top fw-6">
										Ownership of In-Game Assets
									</h5>
									<p className="mt-16">
										It is a long established fact that a reader will be
										distracted by the readable content of a page when looking at
										its layout. The point of using Lorem Ipsum is that it has a
										more-or-less normal distribution of letters, as opposed to
										using Content here, content here, making it look like
										readable English. Many desktop publishing packages and web
										page editors now use Lorem Ipsum as their default model
										text, and a search for lorem ipsum will uncover many web
										sites still in their infancy. Various versions have evolved
										over the years, sometimes by accident, sometimes on purpose
										(injected humour and the like).
									</p>
								</div>
								<div
									className="details__content mt-55"
									data-aos="fade-up"
									data-aos-duration="600"
								>
									<h6 className="title-animation neutral-top fw-6">
										Transparent and Fair Gameplay
									</h6>
									<p className="mt-16">
										It is a long established fact that a reader will be
										distracted by the readable content of a page when looking at
										its layout. The point of using Lorem Ipsum is that it has a
										more-or-less normal distribution of letters, as opposed to
										using Content here, content here, making it look like
										readable English. Many desktop publishing packages and web
										page editors now use Lorem Ipsum as their default model
										text, and a search for lorem ipsum will uncover many web
										sites still in their infancy. Various versions have evolved
										over the years, sometimes by accident, sometimes on purpose
										(injected humour and the like).
									</p>
								</div>
								<div className="details__content details__group mt-55">
									<div
										className="thumb"
										data-aos="fade-up"
										data-aos-duration="600"
									>
										<Image src={one} alt="Image" />
									</div>
									<div
										className="thumb"
										data-aos="fade-up"
										data-aos-duration="600"
										data-aos-delay="200"
									>
										<Image src={two} alt="Image" />
									</div>
								</div>
								<div
									className="details__content mt-60"
									data-aos="fade-up"
									data-aos-duration="600"
								>
									<h6 className="title-animation neutral-top fw-6">
										Decentralized Economies
									</h6>
									<p className="mt-20">
										It is a long established fact that a reader will be
										distracted by the readable content of a page when looking at
										its layout. The point of using Lorem Ipsum is that it has a
										more-or-less normal distribution of letters, as opposed to
										using Content here, content here, making it look like
										readable English.
									</p>
									<p className="mt-20">
										Many desktop publishing packages and web page editors now
										use Lorem Ipsum as their default model text, and a search
										for lorem ipsum will uncover many web sites still in their
										infancy. Various versions have evolved over the years,
										sometimes by accident, sometimes on purpose (injected humour
										and the like).
									</p>
								</div>
								<div
									className="details__content mt-55"
									data-aos="fade-up"
									data-aos-duration="600"
								>
									<h6 className="title-animation neutral-top fw-6">
										Play-to-Earn Models
									</h6>
									<p className="mt-20">
										It is a long established fact that a reader will be
										distracted by the readable content of a page when looking at
										its layout. The point of using Lorem Ipsum is that it has a
										more-or-less normal distribution of letters, as opposed to
										using Content here, content here, making it look like
										readable English.
									</p>
								</div>
								<div className="details__content mt-40 mb-40">
									<hr className="divider" />
								</div>
								<div className="details__content details__footer">
									<div className="details-tag">
										<div className="tag-header">
											<p>
												Popular Tags <i className="ti ti-arrow-move-right"></i>
											</p>
										</div>
										<div className="tag-wrapper">
											<Link href="blog">Crypto</Link>
											<Link href="blog">Casino</Link>
										</div>
									</div>
									<div className="details-tag">
										<div className="tag-header">
											<p>
												Follow <i className="ti ti-arrow-move-right"></i>
											</p>
										</div>
										<div className="social">
											<Link
												href="https://www.facebook.com/"
												target="_blank"
												aria-label="share us on facebook"
												title="facebook"
											>
												<i className="fa-brands fa-facebook-f"></i>
											</Link>
											<Link
												href="https://instagram.com/"
												target="_blank"
												aria-label="share us on instagram"
												title="instagram"
											>
												<i className="fa-brands fa-instagram"></i>
											</Link>
											<Link
												href="https://x.com/"
												target="_blank"
												aria-label="share us on twitter"
												title="twitter"
											>
												<i className="fa-brands fa-twitter"></i>
											</Link>
											<Link
												href="https://www.linkedin.com/"
												target="_blank"
												aria-label="share us on linkedin"
												title="linkedin"
											>
												<i className="fa-brands fa-linkedin-in"></i>
											</Link>
										</div>
									</div>
								</div>
							</div>
							<BlogComments />
							<CommentForm />
						</div>
						<BlogSidebar />
					</div>
				</div>
			</section>
			
		</>
	);
};

export default BlogDetails;
