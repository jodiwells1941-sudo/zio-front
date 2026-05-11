"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import leftTh from "@/public/images/left-th.png";
import rightTh from "@/public/images/right-th.png";
import rocket from "@/public/images/rocket.png";

const BlogSlider = dynamic(() => import("@/components/widgets/BlogSlider"));

const BlogSectionThree = () => {
	return (
		<section className="blog blog-alternate pt-120 pb-120">
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

				<div className="row">
					<div className="col-12">
						<BlogSlider />
					</div>
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

export default BlogSectionThree;
