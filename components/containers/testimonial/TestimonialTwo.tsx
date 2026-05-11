import Image from "next/image";
import TestimonialSlider from "@/components/widgets/TestimonialSlider";
import one from "@/public/images/testimonial/top-two.png";
import two from "@/public/images/testimonial/right-two.png";
import three from "@/public/images/testimonial/bottom-two.png";
import four from "@/public/images/testimonial/card-two.png";
import seven from "@/public/images/right-th.png";
import eight from "@/public/images/left-th.png";
import nine from "@/public/images/chart.png";

const TestimonialTwo = () => {
	return (
		<section
			className="testimonial testimonial-alt pt-120 pb-120"
			style={{ backgroundImage: "url(images/testimonial-bg.png)" }}
		>
			<div className="container">
				<div className="row align-items-center">
					<div className="col-12 col-lg-7 col-xl-6">
						<div className="testimonial__content">
							<div className="section__content text-start mb-40">
								<span className="fw-6 secondary-text text-xl">
									<strong>What,</strong> Our Players Say
								</span>
								<h2 className="title-animation fw-6 mt-25">
									Success Stories from Our <span>Winning</span> Players
								</h2>
							</div>
							<TestimonialSlider />
						</div>
					</div>
					<div className="col-12 col-lg-5 col-xl-5 offset-xl-1">
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
				</div>
			</div>
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

export default TestimonialTwo;
