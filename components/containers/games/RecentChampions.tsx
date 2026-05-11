"use client";

import Image from "next/image";
import one from "@/public/images/chart.png";
import two from "@/public/images/btc-two.png";
import three from "@/public/images/rocket.png";
import four from "@/public/images/left-th.png";
import BettingWinners from "../lottery/BettingWinners";
import LotteryTypeSlider from "../lottery/LotteryTypeSlider";
import { useEffect, useState } from "react";
import { getLotteryLatestRounds, getLotteryWinners } from "@/app/api/lottery";
import LotterySkeleton from "@/components/dashboard/LotterySkeleton";

const RecentChampions = () => {

	const [winners, setWinners] = useState<any[]>([]);
	const [latestWinners, setLatestWinners] = useState<any[]>([]);
	const [loading, setLoading] = useState(false);	

	const getWinners = async () => {
		setLoading(true);
		const res = await getLotteryWinners();		
		setWinners(res?.data || []);
		setLoading(false);
	};

	const getLatestWinners = async () => {
		setLoading(true);
		const res = await getLotteryLatestRounds();		
		setLatestWinners(res?.data?.data || []);
		setLoading(false);
	};

	useEffect(() => {
		getWinners();
		getLatestWinners();
	}, []);

	if (loading) return <LotterySkeleton />;

	return (
		<section
			className="ch-list ch-list-alternate ch-fcq pt-120 pb-120"
			style={{ backgroundImage: "url(images/game-bg.png)" }}
		>
			<div className="container">
				<div className="row justify-content-center">
					<div className="col-12 col-xl-10">
						<div
							className="section__header text-center mb-55"
							data-aos="fade-up"
							data-aos-duration="600"
						>
							<span className="fw-6 secondary-text text-xl">
								<strong>Latest,</strong> Betting Winners
							</span>
							<h2 className="title-animation fw-6 mt-25">
								Recent Champions in Action
							</h2>
							<p className="mt-25">
								We celebrate every win, no matter how big or small. Our platform is full of excitement as participants win jackpots and receive amazing lottery prizes every day.
							</p>
						</div>
					</div>
				</div>
				<LotteryTypeSlider winners={latestWinners} />
				<BettingWinners winners={winners} />
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
				<Image src={four} alt="Thumb" />
			</div>
		</section>
	);
};

export default RecentChampions;
