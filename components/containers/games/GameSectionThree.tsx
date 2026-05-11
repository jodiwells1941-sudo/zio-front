import dynamic from "next/dynamic";
import Image from "next/image";
import one from "@/public/images/vr.png";
import two from "@/public/images/btc-two.png";
import three from "@/public/images/rocket.png";

const GameSlider = dynamic(() => import("@/components/widgets/GameSlider"));

const GameSectionThree = () => {
	return (
		<section className="game pt-120 pb-120">
			<div className="container">
				<div className="row justify-content-center">
					<div className="col-12 col-xl-9">
						<div
							className="section__header text-center mb-55"
							data-aos="fade-up"
							data-aos-duration="600"
						>
							<span className="fw-6 secondary-text text-xl">
								<strong>Quick</strong> and Easy Lottery Tickets
							</span>
							<h2 className="title-animation fw-6 mt-25">
								Start Your Lottery Journey
							</h2>
							<p className="mt-25">
								We&apos;ve made it easier than ever to join the world of online lottery. With just a few clicks, you can easily purchase your lottery tickets online and participate in exciting lottery draws anytime.
							</p>
						</div>
					</div>
				</div>

				<div className="row">
					<div className="col-12">
						<GameSlider />
					</div>
				</div>
			</div>
			<div className="chart">
				<Image src={one} alt="VR" />
			</div>
			<div className="btc">
				<Image src={two} alt="Bitcoin" />
			</div>
			<div className="rocket">
				<Image src={three} alt="Rocket" />
			</div>
		</section>
	);
};

export default GameSectionThree;
