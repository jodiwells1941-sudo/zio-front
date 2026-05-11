import dynamic from "next/dynamic";
import type { Metadata } from "next";
import Header from "@/components/layout/header/Header";
import Breadcrumb from "@/components/layout/banner/Breadcrumb";
import AboutSection from "@/components/containers/about/AboutSection";
import ChooseSection from "@/components/containers/ChooseSection";
import CounterSection from "@/components/containers/CounterSection";
import Testimonial from "@/components/containers/testimonial/Testimonial";
import ReferTwoSection from "@/components/containers/ReferTwoSection";
import FooterTwo from "@/components/layout/footer/FooterTwo";


const ClientWrapper = dynamic(
	() => import("@/components/widgets/ClientWrapper")
);

export const generateMetadata = async (): Promise<Metadata> => ({
	title: "About | Zio Lottery – Online Lottery Platform",
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
			<Breadcrumb title="About Us" />
			<AboutSection />
			<ChooseSection />
			<CounterSection />
			<Testimonial />
			<ReferTwoSection />
			<FooterTwo />
			<ClientWrapper />
		</div>
	);
};

export default page;
