import dynamic from "next/dynamic";
import type { Metadata } from "next";
import HeaderThree from "@/components/layout/header/HeaderThree";
import AuthenticationSection from "@/components/containers/AuthenticationSection";
import FooterFour from "@/components/layout/footer/FooterFour";
import { all } from "axios";
const ClientWrapper = dynamic(
	() => import("@/components/widgets/ClientWrapper")
);

export const generateMetadata = async (): Promise<Metadata> => ({
	title: "Sign In | Zio Lottery – Online Lottery Platform",
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
		<div className="page-wrapper a-cursor authentication-bg" style={{ backgroundImage: "url(images/error-bg.jpg)" }}>
			<HeaderThree />
			<AuthenticationSection />
			<FooterFour />
			<ClientWrapper />
		</div>
	);
};

export default page;
