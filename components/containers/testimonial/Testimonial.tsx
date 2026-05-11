import dynamic from "next/dynamic";
import Image from "next/image";
import one from "@/public/images/testimonial/top.png";
import two from "@/public/images/testimonial/right.png";
import three from "@/public/images/testimonial/bottom.png";
import four from "@/public/images/testimonial/card.png";
import five from "@/public/images/art.png";
import six from "@/public/images/square.png";
import seven from "@/public/images/right-th.png";
import eight from "@/public/images/left-th.png";
import nine from "@/public/images/chart.png";

const TestimonialSliderTwo = dynamic(
	() => import("@/components/widgets/TestimonialSliderTwo")
);

interface TestimonialProps {
	showThumbs?: boolean;
}

const Testimonial = ({ showThumbs = true }: TestimonialProps) => {
	return (
		<section className="testimonial pt-120 pb-120">
			<div className="container">
				<div className="row align-items-center">
					<div className="col-12 col-lg-5 col-xl-5">
						<div className="testimonial__thumb d-none d-lg-block">
							<div className="right-thumb text-end">
								<div className="right__thumb__inner">
									<Image
										src={one}
										alt="Image"
										data-aos="zoom-in"
										data-aos-duration="600"
									/>
									<div className="quote">
										<i className="ti ti-quote"></i>
									</div>
								</div>
							</div>
							<div className="left-thumb">
								<Image
									src={two}
									alt="Image"
									data-aos="zoom-in"
									data-aos-duration="600"
									data-aos-delay="100"
								/>
							</div>
							<div className="bottom-thumb">
								<Image
									src={three}
									alt="Image"
									data-aos="zoom-in"
									data-aos-duration="600"
									data-aos-delay="200"
								/>
							</div>
							<div className="bottom-left-thumb">
								<Image src={four} alt="Image" />
							</div>
						</div>
					</div>
					<div className="col-12 col-lg-7 col-xl-6 offset-xl-1">
						<div className="testimonial__content">
							<div className="section__content text-start mb-40">
								<span className="fw-6 secondary-text text-xl">
									<strong>What,</strong> Our Players Say
								</span>
								<h2 className="title-animation fw-6 mt-25">
									Success Stories from Our <span>Winning</span> Players
								</h2>
							</div>
							<TestimonialSliderTwo />
						</div>
					</div>
				</div>
			</div>

			{showThumbs && (
				<div
					className="left-bottom"
					data-aos="fade-right"
					data-aos-duration="600"
				>
					<Image src={five} alt="Image" />
				</div>
			)}

			{showThumbs && (
				<div
					className="right-bottom"
					data-aos="fade-left"
					data-aos-duration="600"
					data-aos-delay="300"
				>
					<Image src={six} alt="Image" />
				</div>
			)}
			<div className="right-thumb-th">
				<Image src={seven} alt="Image" />
			</div>
			<div className="left-thumb-th">
				<Image src={eight} alt="Image" />
			</div>
			<div className="chart-thumb">
				<Image src={nine} alt="Image" />
			</div>
		</section>
	);
};

export default Testimonial;
