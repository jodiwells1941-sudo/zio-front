"use client";
import { useState } from "react";
import AnimateHeight from "react-animate-height";
import FaqData from "@/public/data/faq-data";

const FaqTab = () => {
	const [activeTab, setActiveTab] = useState<string>("allfaq");
	const [openIndex, setOpenIndex] = useState<number | null>(0);
	const [isAnimating, setIsAnimating] = useState<boolean>(false);

	const handleTabClick = (id: string) => {
		if (id !== activeTab) {
			setIsAnimating(true);
			setTimeout(() => setIsAnimating(false), 500);
			setActiveTab(id);
			setOpenIndex(0);
		}
	};

	const toggleAccordion = (index: number) => {
		setOpenIndex((prevIndex) => (prevIndex === index ? null : index));
	};

	const currentCategory = FaqData.find((cat) => cat.id === activeTab);

	return (
		<>
			<div className="row justify-content-center">
				<div className="col-12 col-xl-7">
					<div
						className="faq__tab-btns text-center mb-40"
						data-aos="fade-up"
						data-aos-duration="600"
						data-aos-delay="200"
					>
						<ul>
							{FaqData.map((tab) => (
								<li key={tab.id}>
									<button
										className={`faq-tab-btn ${
											activeTab === tab.id ? "active" : ""
										}`}
										onClick={() => handleTabClick(tab.id)}
										data-target={`#${tab.id}`}
									>
										<i className={`ti ${tab.icon}`}></i> {tab.category}
									</button>
								</li>
							))}
						</ul>
					</div>
				</div>
			</div>

			<div className="row">
				<div className="col-12">
					<div
						className="faq__tab"
						data-aos="fade-up"
						data-aos-duration="600"
						data-aos-delay="400"
					>
						<div
							className={`faq__tab-single ${isAnimating ? "animating" : ""} ${
								activeTab ? "active" : ""
							}`}
							id={activeTab}
						>
							<div className="faq__content-inner">
								<div className="accordion">
									<div className="row gutter-24">
										<div className="col-12 col-lg-6">
											{currentCategory?.questions
												.filter((_, i) => i % 2 === 0)
												.map((item, i) => {
													const index = i * 2;
													return (
														<div className="accordion-item" key={index}>
															<p className="accordion-header">
																<button
																	className={`accordion-button ${
																		openIndex === index ? "" : "collapsed"
																	}`}
																	type="button"
																	onClick={() => toggleAccordion(index)}
																>
																	{item.question}
																</button>
															</p>
															<AnimateHeight
																duration={400}
																height={openIndex === index ? "auto" : 0}
															>
																<div className="accordion-body">
																	<p>{item.answer}</p>
																</div>
															</AnimateHeight>
														</div>
													);
												})}
										</div>

										<div className="col-12 col-lg-6">
											{currentCategory?.questions
												.filter((_, i) => i % 2 !== 0)
												.map((item, i) => {
													const index = i * 2 + 1;
													return (
														<div className="accordion-item" key={index}>
															<p className="accordion-header">
																<button
																	className={`accordion-button ${
																		openIndex === index ? "" : "collapsed"
																	}`}
																	type="button"
																	onClick={() => toggleAccordion(index)}
																>
																	{item.question}
																</button>
															</p>
															<AnimateHeight
																duration={400}
																height={openIndex === index ? "auto" : 0}
															>
																<div className="accordion-body">
																	<p>{item.answer}</p>
																</div>
															</AnimateHeight>
														</div>
													);
												})}
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default FaqTab;
