"use client";

import dynamic from "next/dynamic";

const FaqTab = dynamic(() => import("../widgets/FaqTab"));

const FaqSection = () => {
	return (
		<section className="faq pt-120 pb-120">
			<div className="container">
				<div className="row justify-content-center">
					<div className="col-12 col-xl-9">
						<div
							className="section__header text-center mb-55"
							data-aos="fade-up"
							data-aos-duration="600"
						>
							<span className="fw-6 secondary-text text-xl">
								<strong>Answers,</strong> to Common Inquiries
							</span>
							<h2 className="title-animation fw-6 mt-25">
								Find Answers to Your Questions
							</h2>
							<p className="mt-25">
								Welcome to our FAQs section! Here, we&apos;ve compiled answers
								to some of the most common questions our users ask.
							</p>
						</div>
					</div>
				</div>

				<FaqTab />
			</div>
		</section>
	);
};

export default FaqSection;
