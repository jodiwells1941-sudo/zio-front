import dynamic from "next/dynamic";
import type { Metadata } from "next";
import Header from "@/components/layout/header/Header";
import HeroSectionThree from "@/components/layout/banner/HeroSectionThree";
import LotteryTypes from "@/components/containers/lottery/LotteryTypes";
import AboutSection from "@/components/containers/about/AboutSection";
import SelectLottery from "@/components/containers/lottery/SelectLottery";
import FooterTwo from "@/components/layout/footer/FooterTwo";
import Discover from "@/components/containers/discover/Discover";
import CounterSection from "@/components/containers/CounterSection";
import WorkSection from "@/components/containers/WorkSection";
import RecentChampions from "@/components/containers/games/RecentChampions";
import AboutTwoSection from "@/components/containers/about/AboutTwoSection";
import StorySection from "@/components/containers/StorySection";
import ReferSection from "@/components/containers/ReferSection";
import ChooseSection from "@/components/containers/ChooseSection";
import TestimonialTwo from "@/components/containers/testimonial/TestimonialTwo";
import LotteryWinner from "@/components/containers/lottery-winners/LotteryWinner";
import InvestmentSection from "@/components/dashboard/Investment/InvestmentSection";
import Image from "next/image";
import one from "@/public/images/chart.png";
import two from "@/public/images/btc-two.png";
import three from "@/public/images/rocket.png";
import four from "@/public/images/left-th.png";

const Sponsors = dynamic(() => import("@/components/containers/Sponsors"));

const ClientWrapper = dynamic(
	() => import("@/components/widgets/ClientWrapper")
);

const baseDescription = "Earn up to 40% annual interest on your USD. At maturity,\n the USD & interest will be credited back to your account automatically.";

export const generateMetadata = async (): Promise<Metadata> => ({
	title: "Home | Zio Lottery – Online Lottery Platform",
	description:
		"Welcome to Zio Lottery – the ultimate online lottery experience.",
	keywords: ["crypto gaming", "lottery", "lotto", "zio", "jio", "gio", "ziolottery", "jiolottery", "giolottery", "Zio Lottery", "casino", "blockchain"],
	openGraph: {
		title: "Official Zio Lottery – Secure Online Lottery Platform",
		description: "Experience seamless blockchain - based gaming and lotteries.",
		url: "https://ziolottery.com/",
		siteName: "Zio Lottery",
		images: [
			{
				url: "/images/og-image.png",
				width: 1200,
				height: 630,
				alt: "Lottery img",
			},
		],
		type: "website",
	},
	twitter: { card: "summary_large_image" },
});

const page = () => {
	return (
		<div className="page-wrapper a-cursor">
			<Header showTopGames={false} />
			<HeroSectionThree />
			<Sponsors />
			<LotteryTypes />
			<AboutSection />
			<RecentChampions />
			<Discover />
			<CounterSection />
			<WorkSection />
			<SelectLottery /> 
			<AboutTwoSection />

			<section
				className="ch-list ch-list-alternate ch-fcq pb-120"
				style={{ backgroundImage: "url(images/game-bg.png)" }}
			>
				
				<div className="container">
					<InvestmentSection
						title="Secure Investment Platform"
						description={baseDescription}
						// items={history}
						wrapperClassName="investment-history-area mt-100 investment-area"
					/>
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

			<StorySection />
			<ReferSection />
			<LotteryWinner />
			<ChooseSection />
			<CounterSection />
			<TestimonialTwo />
			<FooterTwo />
			<ClientWrapper />
		</div>
	);
};

export default page;
