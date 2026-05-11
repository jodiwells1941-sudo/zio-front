'use client';

import dynamic from "next/dynamic";
// import type { Metadata } from "next";
import Header from "@/components/layout/header/Header";
import Breadcrumb from "@/components/layout/banner/Breadcrumb";
import FooterTwo from "@/components/layout/footer/FooterTwo";
import LotteryWinner from "@/components/containers/lottery-winners/LotteryWinner";
import Testimonial from "@/components/containers/testimonial/Testimonial";
import BettingWinners from "@/components/containers/lottery/BettingWinners";
import ReferSection from "@/components/containers/ReferSection";
import AboutSection from "@/components/containers/about/AboutSection";
import { getLotteryLatestRounds } from "../api/lottery";
import { useEffect, useState } from "react";

const ClientWrapper = dynamic(
	() => import("@/components/widgets/ClientWrapper")
);

// export const generateMetadata = async (): Promise<Metadata> => ({
// 	title: "Contact Us | Zio Lottery – Online Lottery Platform",
// 	description:
// 		"Welcome to Zio Lottery – the ultimate online lottery experience.",
// 	keywords: ["crypto gaming", "lottery", "lotto", "zio", "jio", "gio", "ziolottery", "jiolottery", "giolottery", "Zio Lottery", "casino", "blockchain"],
// 	openGraph: {
// 		title: "Official Zio Lottery – Secure Online Lottery Platform",
// 		description: "Experience seamless blockchain - based gaming and lotteries.",
// 		url: "https://ziolottery.com/",
// 		siteName: "Zio Lottery",
// 		images: [
// 			{
// 				url: "/images/og-image.png",
// 				width: 1200,
// 				height: 630,
// 				alt: "Lottery img",
// 			},
// 		],
// 		type: "website",
// 	},
// 	twitter: { card: "summary_large_image" },
// });

const page = () => {

	const [winners, setWinners] = useState<any[]>([]);
	const [winnersPaginate, setWinnersPaginate] = useState({} as any);
	const [isLoading, setIsLoading] = useState(false);

	const getWinners = async () => {
	const res = await getLotteryLatestRounds();
	setWinners(res?.data?.data || []);
	setWinnersPaginate(res?.data || {});
	};

	useEffect(() => {
		getWinners();
	}, []);


	return (
		<div className="page-wrapper a-cursor">
			<Header />
			<Breadcrumb title="Lottery Winners" />
			<div className="pt-5 mt-md-5 px-0 px-md-2">
				<div className="container"><BettingWinners winners={winners} /></div>
			</div>
			<LotteryWinner />
			<AboutSection />
			<Testimonial />
			<ReferSection />
			<FooterTwo />
			<ClientWrapper />
		</div>
	);
};

export default page;
