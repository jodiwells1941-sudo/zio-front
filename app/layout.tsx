import type { Metadata } from "next";
import { Chakra_Petch } from "next/font/google";
import "bootstrap/dist/css/bootstrap.min.css";
import "@/public/icons/css/all.min.css";
import "@/public/icons/css/tabler-icons.min.css";
import "@/public/scss/app.scss";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Script from "next/script";
import 'sweetalert2/src/sweetalert2.scss'
import 'react-toastify/dist/ReactToastify.css';
import ToastProvider from "@/components/containers/ToastProvider";

const chakraPetch = Chakra_Petch({
	variable: "--chakra",
	subsets: ["latin"],
	weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
	metadataBase: new URL("https://ziolottery.com/"),

	title: {
		default: "Official Zio Lottery – Secure Online Lottery Platform",
		template: "%s | Zio Lottery",
	},

	description:
		"Official Zio Lottery – Secure Online Lottery Platform",
	keywords: ["crypto", "game", "casino", "betting", "lottery", "lotto", "zio", "jio", "gio", "ziolottery", "jiolottery", "giolottery", "affiliate"],

	authors: [
		{
			name: "wowtheme7",
			url: "https://ziolottery.com/",
		},
	],

	icons: { icon: "/favicon.ico" },

	alternates: { canonical: "https://ziolottery.com/" },

	openGraph: {
		url: "https://ziolottery.com/",
		siteName: "Zio Lottery",
		images: [
			{
				url: "/images/og-image.png",
				width: 1200,
				height: 630,
				alt: "Zio Lottery",
			},
		],
		type: "website",
	},

	twitter: {
		card: "summary_large_image",
	},
};

export default function RootLayout({ 
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<link rel="stylesheet" href="/css/main.css" />
				<link rel="stylesheet" href="/css/responsive.css" />
				<link rel="stylesheet" href="/css/rtl-version.css" />
				<link rel="stylesheet" href="/css/template-settings.css" />
				<link rel="stylesheet" href="/css/p2p-order.css" />
				<link rel="stylesheet" href="/css/ads.css" />
				<link rel="stylesheet" href="/css/chat.css" />
				<link rel="stylesheet" href="/css/p2p-profile.css" />
			</head>
			<body className={`${chakraPetch.variable}`}>
				
				{/* {children} */}
				{children}

				<ToastProvider />
				
				<Script src="/js/jquery-3.7.1.min.js" strategy="afterInteractive" />
				{/* <!-- bootstrap five js --> */}
				<Script src="/js/bootstrap.bundle.min.js" strategy="afterInteractive" />
				{/* <!-- nice select js --> */}
				{/* <Script src="/js/jquery.nice-select.min.js" strategy="afterInteractive" /> */}
				{/* <!-- magnific popup js --> */}
				<Script src="/js/jquery.magnific-popup.min.js" strategy="afterInteractive" />
				{/* <!-- swiper slider js --> */}
				<Script src="/js/swiper-bundle.min.js" strategy="afterInteractive" />
				{/* <!-- viewport js --> */}
				<Script src="/js/viewport.jquery.js" strategy="afterInteractive" />
				{/* <!-- odometer js --> */}
				<Script src="/js/odometer.min.js" strategy="afterInteractive" />
				{/* <!-- vanilla tilt js --> */}
				<Script src="/js/vanilla-tilt.min.js" strategy="afterInteractive" />
				{/* <!-- aos js --> */}
				<Script src="/js/aos.js" strategy="afterInteractive" />
				{/* <Script src="/js/aos.js" strategy="afterInteractive" id="aos-js" /> */}
				{/* <!-- isotope js --> */}
				<Script src="/js/isotope.pkgd.min.js" strategy="afterInteractive" />
				{/* <!-- splittext js --> */}
				<Script src="/js/SplitText.min.js" strategy="afterInteractive" />
				{/* <!-- scrollto js --> */}
				<Script src="/js/ScrollToPlugin.min.js" strategy="afterInteractive" />
				{/* <!-- scrolltrigger js --> */}
				<Script src="/js/ScrollTrigger.min.js" strategy="afterInteractive" />
				{/* <!-- gsap js --> */}
				<Script src="/js/gsap.min.js" strategy="afterInteractive" />
				{/* <!-- ==== / js dependencies end ==== --> */}
				{/* <!-- main js --> */}
				{/* <Script src="/js/custom.js" strategy="afterInteractive" /> */}
				<Script src="/js/custom.js" strategy="afterInteractive" id="custom-js" />
			</body>
		</html>
	);
}
