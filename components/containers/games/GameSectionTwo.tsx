"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import one from "@/public/images/chart.png";
import two from "@/public/images/btc-two.png";
import three from "@/public/images/rocket.png";
import four from "@/public/images/left-th.png";
import GameTwoData from "@/public/data/game-two-items-data";

const GameSectionTwoClient = dynamic(
	() => import("@/components/widgets/GameSectionTwoClient")
);

const GameSectionTwo = () => {
	return (
		<section className="game-two game-two-alternate pt-120 pb-120">
			<div className="container">
				<GameSectionTwoClient gameData={GameTwoData} />
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
									<Link href="games-two">1</Link>
								</li>
								<li>
									<Link href="games-two" className="active">
										2
									</Link>
								</li>
								<li>
									<Link href="games-two">3</Link>
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

			<div className="chart">
				<Image src={one} alt="Chart" />
			</div>
			<div className="btc">
				<Image src={two} alt="BTC" />
			</div>
			<div className="rocket">
				<Image src={three} alt="Rocket" />
			</div>
			<div className="left-thumb">
				<Image src={four} alt="Left Thumb" />
			</div>
		</section>
	);
};

export default GameSectionTwo;
