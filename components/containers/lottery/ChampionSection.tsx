import Link from "next/link";
import Image from "next/image";
import ChampionData from "@/public/data/champions-data";
import one from "@/public/images/right-wheel.png";
import two from "@/public/images/left-th.png";

const ChampionSection = () => {
	return (
		<section
			className="champion pt-120 pb-120"
			style={{ backgroundImage: "url(images/lottery-details.png)" }}
		>
			<div className="container">
				<div className="row justify-content-center">
					<div className="col-12 col-xl-9">
						<div
							className="section__header text-center mb-55"
							data-aos="fade-up"
							data-aos-duration="600"
						>
							<span className="fw-6 secondary-text text-xl">
								<strong>Recent,</strong> Lottery Winners
							</span>
							<h2 className="title-animation fw-6 mt-25">
								Meet Our Latest Champions
							</h2>
							<p className="mt-25">
								Welcome to our FAQs section! Here, we&apos;ve compiled answers
								to some of the most common questions our users ask.
							</p>
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
									<Link href="lottery">1</Link>
								</li>
								<li>
									<Link href="lottery" className="active">
										2
									</Link>
								</li>
								<li>
									<Link href="lottery">3</Link>
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

			<div className="left-thumb">
				<Image src={one} alt="Image" />
			</div>
			<div className="left-thumb-th">
				<Image src={two} alt="Image" />
			</div>
		</section>
	);
};

export default ChampionSection;
