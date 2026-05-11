import type { Metadata } from "next";
import LotterySectionTwo from "@/components/dashboard/LotterySectionTwo";
import BreadcrumbTwo from "@/components/layout/banner/BreadcrumbTwo";

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
		<div>
			<BreadcrumbTwo title="Lottery Result" />
			<div className="pt-5 mt-md-5">
				<LotterySectionTwo roundShow={4} />
			</div>
		</div>
	);
};

export default page;
