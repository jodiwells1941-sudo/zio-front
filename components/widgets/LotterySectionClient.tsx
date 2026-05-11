"use client";

import { useEffect, useState } from "react";
import Image, { StaticImageData } from "next/image";
import Link from "next/link";

type LotteryItem = {
	id: number;
	price: string;
	title: string;
	drawTime: string;
	delay: number;
	image: StaticImageData;
	alt: string;
};

type Props = {
	data: LotteryItem[];
};

type TimeLeft = {
	[key: number]: {
		days: number;
		hours: number;
		minutes: number;
		seconds: number;
	} | null;
};

const LotterySectionClient = ({ data }: Props) => {
	const [timeLeft, setTimeLeft] = useState<TimeLeft>({});

	const calculateTimeLeft = (targetDate: string) => {
		const difference = new Date(targetDate).getTime() - new Date().getTime();
		if (difference <= 0) return null;

		return {
			days: Math.floor(difference / (1000 * 60 * 60 * 24)),
			hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
			minutes: Math.floor((difference / (1000 * 60)) % 60),
			seconds: Math.floor((difference / 1000) % 60),
		};
	};

	useEffect(() => {
		const timer = setInterval(() => {
			const updated: TimeLeft = {};
			data.forEach((item) => {
				updated[item.id] = calculateTimeLeft(item.drawTime);
			});
			setTimeLeft(updated);
		}, 1000);

		return () => clearInterval(timer);
	}, [data]);

	return (
		<div className="row gutter-24">
			{data.map((item) => {
				const countdown = timeLeft[item.id];

				return (
					<div
						className="col-12 col-md-6 col-xl-4 col-xxl-3"
						data-aos="fade-up"
						data-aos-duration="600"
						data-aos-delay={item.delay}
						key={item.id}
					>
						<div className="lt-type__single text-center tilt">
							<span className="serial">#{item.id}</span>
							<span className="price">{item.price}</span>
							<div className="thumb">
								<Image src={item.image} alt={item.alt} />
							</div>
							<div className="content mt-20">
								<h6 className="fw-6">
									<Link href="lottery-details">{item.title}</Link>
								</h6>
								<div className="timer mt-20">
									<p>
										<i className="ti ti-clock-hour-3"></i> Next Draw:{" "}
										<span className="draw-timer">
											{countdown ? (
												<>
													{countdown.days}d {countdown.hours}h{" "}
													{countdown.minutes}m {countdown.seconds}s
												</>
											) : (
												<>EXPIRED</>
											)}
										</span>
									</p>
								</div>
							</div>
							<div className="cta mt-25">
								<Link
									href="lottery-details"
									className="btn--primary"
									title="view details"
								>
									Play Now <i className="ti ti-arrow-narrow-right"></i>
								</Link>
							</div>
						</div>
					</div>
				);
			})}
		</div>
	);
};

export default LotterySectionClient;
