"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import GameItemData from "@/public/data/game-items-data";
import one from "@/public/images/chart.png";
import two from "@/public/images/btc-two.png";
import three from "@/public/images/rocket.png";

const GameSectionClient = dynamic(
	() => import("@/components/widgets/GameSectionClient")
);

const GameSection = () => {
	return (
		<section className="game pt-120 pb-120">
			<div className="container">
				<GameSectionClient gameItems={GameItemData} />

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
									<Link href="games">1</Link>
								</li>
								<li>
									<Link href="games" className="active">
										2
									</Link>
								</li>
								<li>
									<Link href="games">3</Link>
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
				<Image src={one} alt="Image" />
			</div>
			<div className="btc">
				<Image src={two} alt="Image" />
			</div>
			<div className="rocket">
				<Image src={three} alt="Image" />
			</div>
		</section>
	);
};

export default GameSection;
