import Link from "next/link";
import Image from "next/image";
import one from "@/public/images/banner/cmn-banner-bg.png";
import two from "@/public/images/banner/cmn-banner-thumb.png";
import three from "@/public/images/banner/btc.png";
import four from "@/public/images/banner/coin-up.png";
import five from "@/public/images/banner/rocket.png";
import six from "@/public/images/banner/coin-down.png";
import seven from "@/public/images/banner/point.png";
import eight from "@/public/images/banner/bg-r.png";
import nine from "@/public/images/banner/bg-l.png";

interface BreadcrumbProps {
	title: string;
}

const Breadcrumb = ({ title }: BreadcrumbProps) => {
	return (
		<section className="common-banner">
			<div className="container">
				<div className="row">
					<div className="col-12">
						<div className="common-banner__content">
							<h2 className="title-animation neutral-top fw-6">{title}</h2>
							<nav aria-label="breadcrumb" className="mt-16">
								<ol className="breadcrumb">
									<li className="breadcrumb-item">
										<Link href="/">Home</Link>
									</li>
									<li className="breadcrumb-item active" aria-current="page">
										{title}
									</li>
								</ol>
							</nav>
						</div>
					</div>
				</div>
			</div>
			<div className="banner-bg">
				<Image src={one} alt="Image" />
			</div>
			<div className="thumb-wrapper">
				<div className="thumb">
					<Image src={two} alt="Image" />
				</div>
				<div className="btc d-none d-sm-block">
					<Image src={three} alt="Image" />
				</div>
				<div className="coin-up d-none d-sm-block">
					<Image src={four} alt="Image" />
				</div>
				<div className="rocket">
					<Image src={five} alt="Image" />
				</div>
			</div>
			<div className="coin-down">
				<Image src={six} alt="Image" />
			</div>
			<div className="point">
				<Image src={seven} alt="Image" />
			</div>
			<div className="bg-r">
				<Image src={eight} alt="Image" />
			</div>
			<div className="bg-l">
				<Image src={nine} alt="Image" />
			</div>
		</section>
	);
};

export default Breadcrumb;
