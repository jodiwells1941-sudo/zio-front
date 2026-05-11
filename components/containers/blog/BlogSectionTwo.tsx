"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import one from "@/public/images/left-th.png";
import two from "@/public/images/right-th.png";
import three from "@/public/images/rocket.png";

const BlogSliderTwo = dynamic(
	() => import("@/components/widgets/BlogSliderTwo")
);

const BlogSectionTwo = () => {
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
				<div className="row">
					<div className="col-12">
						<BlogSliderTwo />
					</div>
				</div>
			</div>
			<div className="left-th">
				<Image src={one} alt="Decoration Left" />
			</div>
			<div className="right-th">
				<Image src={two} alt="Decoration Right" />
			</div>
			<div className="rc">
				<Image src={three} alt="Rocket" />
			</div>
		</section>
	);
};

export default BlogSectionTwo;
