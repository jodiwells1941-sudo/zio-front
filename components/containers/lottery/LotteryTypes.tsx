import Image from "next/image";
import Link from "next/link";
import leftThumb from "@/public/images/left-th.png";
import chart from "@/public/images/chart.png";
import LotterySection from "./LotterySection";

const LotteryTypesServer = () => {
	return (
		<section
			className="lt-type pt-120 pb-120"
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
								<strong>Top,</strong> Lottery Picks
							</span>
							<h2 className="title-animation fw-6 mt-25">
								Trending Lotteries with Big Payout
							</h2>
						</div>
					</div>
					<div className="col-12 col-lg-5 col-xl-4 col-xxl-4 offset-xxl-2">
						<div className="section__content-right">
							<p>
								Experience the excitement of playing the most popular lotteries
								worldwide, all in one place.
							</p>
							<div className="mt-25">
								<Link href="lottery" className="btn--secondary">
									Explore All <i className="ti ti-arrow-narrow-right"></i>
								</Link>
							</div>
						</div>
					</div>
				</div>
				
				<LotterySection roundShow={4} />
			</div>

			<div className="left-thumb-th">
				<Image src={leftThumb} alt="Image" />
			</div>
			<div className="chart">
				<Image src={chart} alt="Image" />
			</div>
		</section>
	);
};

export default LotteryTypesServer;
