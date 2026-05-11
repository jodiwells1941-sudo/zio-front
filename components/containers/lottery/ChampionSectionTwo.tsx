import Link from "next/link";
import Image from "next/image";
import ChampionData from "@/public/data/champions-data";
import one from "@/public/images/right-wheel.png";
import two from "@/public/images/left-th.png";

const ChampionSectionTwo = () => {
	return (
		<section
			className="champion pt-120 pb-120"
			style={{ backgroundImage: "url(images/lottery-details.png)" }}
		>
			<div className="container">
				<div
					className="row gutter-20 align-items-center mb-55 rtl-header"
					data-aos="fade-up"
					data-aos-duration="600"
				>
					<div className="col-12 col-lg-7 col-xl-8 col-xxl-6">
						<div className="section__content">
							<span className="fw-6 secondary-text text-xl">
								<strong>Recent,</strong> Lottery Winners
							</span>
							<h2 className="title-animation fw-6 mt-25">
								Meet Our Latest Champions
							</h2>
						</div>
					</div>
					<div className="col-12 col-lg-5 col-xl-4 col-xxl-4 offset-xxl-2">
						<div className="section__content-right">
							<p>
								Welcome to our FAQs section! Here, we&apos;ve compiled answers
								to some of the most common questions our users ask.
							</p>
							<div className="mt-25">
								<Link
									href="lottery"
									aria-label="Explore all"
									title="Explore all"
									className="btn--secondary"
								>
									Explore All
									<i className="ti ti-arrow-narrow-right"></i>
								</Link>
							</div>
						</div>
					</div>
				</div>

				<div className="row gutter-24">
					{ChampionData.map((champion) => (
						<div
							className="col-12 col-md-6 col-xl-4 col-xxl-3"
							data-aos="fade-up"
							data-aos-duration="600"
							data-aos-delay={champion.delay}
							key={champion.id}
						>
							<div className="lt-type__single champion__single text-center tilt">
								<span className="serial">#{champion.id}</span>
								<div className="thumb">
									<Image src={champion.image} alt={champion.name} />
								</div>
								<div className="content mt-20">
									<h6 className="fw-6">{champion.name}</h6>
									<p className="text-sm mt-4 primary-text">{champion.time}</p>
								</div>
								<div className="cta mt-25">
									<ul className="champion">
										{champion.numbers.map((num, idx) => (
											<li
												key={idx}
												className={idx === champion.activeIndex ? "active" : ""}
											>
												{num}
											</li>
										))}
									</ul>
								</div>
								<div className="timer mt-30">
									<p>
										Draw held on : <span>{champion.date}</span>
									</p>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>

			<div className="left-thumb">
				<Image src={one} alt="Image" />
			</div>
			<div className="left-thumb-th">
				<Image src={two} alt="Image" />
			</div>
		</section>
	);
};

export default ChampionSectionTwo;
