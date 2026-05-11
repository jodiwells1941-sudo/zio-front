import dynamic from "next/dynamic";
import type { Metadata } from "next";
import Header from "@/components/layout/header/Header";
import Breadcrumb from "@/components/layout/banner/Breadcrumb";
import FooterTwo from "@/components/layout/footer/FooterTwo";
import Testimonial from "@/components/containers/testimonial/Testimonial";
import LotteryWinnerCards from "@/components/containers/lottery/LotteryWinnerCards";
import LotteryWinner from "@/components/containers/lottery-winners/LotteryWinner";
import AboutSection from "@/components/containers/about/AboutSection";
import ReferSection from "@/components/containers/ReferSection";

const ClientWrapper = dynamic(
	() => import("@/components/widgets/ClientWrapper")
);

export const generateMetadata = async (): Promise<Metadata> => ({
	title: "Contact Us | Zio Lottery – Online Lottery Platform",
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
			<Header />
			<Breadcrumb title="Lottery Results" />
			<div className="pt-5 mt-md-5 px-0 px-md-2">
				<div className="container"><LotteryWinnerCards /></div>
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
