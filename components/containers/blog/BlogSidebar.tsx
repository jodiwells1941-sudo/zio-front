"use client";

import Link from "next/link";
import Image from "next/image";
import one from "@/public/images/blog/ph-one.png";
import two from "@/public/images/blog/ph-two.png";
import three from "@/public/images/blog/ph-three.png";
import four from "@/public/images/blog/ph-four.png";
import { searchProduct } from "@/actions/search-product";

const BlogSidebar = () => {
	return (
		<div className="col-12 col-lg-5 col-xl-4">
			<div className="blog__sidebar">
				<div
					className="blog__sidebar-widget"
					data-aos="fade-up"
					data-aos-duration="600"
				>
					<div className="blog__widget-intro">
						<h6 className="fw-6 neutral-top">Search</h6>
					</div>
					<hr className="divider mt-20 mb-25" />
					<form action={searchProduct}>
						<input
							type="text"
							name="search-products"
							id="searchProducts"
							placeholder="Search Here..."
							required
						/>
						<button type="submit">
							<i className="fa-solid fa-magnifying-glass"></i>
						</button>
					</form>
				</div>
				<div
					className="blog__sidebar-widget mt-25"
					data-aos="fade-up"
					data-aos-duration="600"
					data-aos-delay="200"
				>
					<div className="blog__widget-intro">
						<h6 className="fw-6 neutral-top">Latest News</h6>
					</div>
					<hr className="divider mt-20 mb-25" />
					<div className="single-post">
						<div className="thumb">
							<Link href="blog-details">
								<Image src={one} alt="Image" />
							</Link>
						</div>
						<div className="content">
							<p>
								<Link href="blog-details">
									5 Tips to Increase Your Lottery Winning Chances
								</Link>
							</p>
							<p className="mt-12">
								<Link href="blog-details">
									Read More<i className="ti ti-arrow-narrow-right"></i>
								</Link>
							</p>
						</div>
					</div>
					<hr className="divider mt-25 mb-25" />
					<div className="single-post">
						<div className="thumb">
							<Link href="blog-details">
								<Image src={two} alt="Image" />
							</Link>
						</div>
						<div className="content">
							<p>
								<Link href="blog-details">
									Top Online Lotteries You Should Try This Year
								</Link>
							</p>
							<p className="mt-12">
								<Link href="blog-details">
									Read More<i className="ti ti-arrow-narrow-right"></i>
								</Link>
							</p>
						</div>
					</div>
					<hr className="divider mt-25 mb-25" />
					<div className="single-post">
						<div className="thumb">
							<Link href="blog-details">
								<Image src={three} alt="Image" />
							</Link>
						</div>
						<div className="content">
							<p>
								<Link href="blog-details">
									The Benefits of Using Bitcoin for Lottery Tickets
								</Link>
							</p>
							<p className="mt-12">
								<Link href="blog-details">
									Read More<i className="ti ti-arrow-narrow-right"></i>
								</Link>
							</p>
						</div>
					</div>
					<hr className="divider mt-25 mb-25" />
					<div className="single-post">
						<div className="thumb">
							<Link href="blog-details">
								<Image src={four} alt="Image" />
							</Link>
						</div>
						<div className="content">
							<p>
								<Link href="blog-details">
									Biggest Lottery Wins in History
								</Link>
							</p>
							<p className="mt-12">
								<Link href="blog-details">
									Read More<i className="ti ti-arrow-narrow-right"></i>
								</Link>
							</p>
						</div>
					</div>
				</div>
				<div
					className="blog__sidebar-widget mt-25"
					data-aos="fade-up"
					data-aos-duration="600"
					data-aos-delay="200"
				>
					<div className="blog__widget-intro">
						<h6 className="fw-6 neutral-top">Follow Us</h6>
					</div>
					<hr className="divider mt-20 mb-25" />
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
	);
};

export default BlogSidebar;
