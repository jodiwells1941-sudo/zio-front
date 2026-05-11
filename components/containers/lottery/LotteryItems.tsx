import dynamic from "next/dynamic";
import Image from "next/image";
import one from "@/public/images/square.png";
import two from "@/public/images/left-th.png";
import three from "@/public/images/vr.png";
import LotteryItemData from "@/public/data/lottery-item";

const LotteryItemsClient = dynamic(
	() => import("@/components/widgets/LotteryItemsClient")
);

interface LotteryItemsProps {
	layout?: "one" | "two";
	showLotteryItems?: boolean;
}

const LotteryItemsServer = ({
	layout = "one",
	showLotteryItems = true,
}: LotteryItemsProps) => {
	return (
		<section
			className="lottery-contest lottery pt-120 pb-120"
			style={{ backgroundImage: `url(/images/lottery-result.png)` }}
		>
			<div className="container">
				<LotteryItemsClient
					layout={layout}
					showLotteryItems={showLotteryItems}
					items={LotteryItemData}
				/>
			</div>

			<div className="bottom-th">
				<Image src={one} alt="Image" />
			</div>
			<div className="right-th">
				<Image src={two} alt="Image" />
			</div>
			<div className="vr-img">
				<Image src={three} alt="Image" />
			</div>
		</section>
	);
};

export default LotteryItemsServer;
