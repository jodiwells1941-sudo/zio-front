"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image, { StaticImageData } from "next/image";
import { handleLotterySearch } from "@/actions/search-lottery";

type Item = {
	id: number;
	categories: string[];
	title: string;
	image: StaticImageData;
	alt: string;
	price: string;
};

interface LotteryItemsClientProps {
	layout: "one" | "two";
	showLotteryItems: boolean;
	items: Item[];
}

const LotteryItemsClient = ({
	layout,
	showLotteryItems,
	items,
}: LotteryItemsClientProps) => {
	const isotope = useRef<Isotope | null>(null);
	const [filterKey, setFilterKey] = useState("*");

	useEffect(() => {
		const initIsotope = async () => {
			const IsotopeModule = await import("isotope-layout");
			isotope.current = new IsotopeModule.default(".filter-wrapper", {
				itemSelector: ".filter-item",
				layoutMode: "fitRows",
				transitionDuration: "1200ms",
			});
		};

		if (typeof window !== "undefined") {
			initIsotope();
		}

		return () => {
			if (isotope.current) {
				isotope.current.destroy();
			}
		};
	}, []);

	useEffect(() => {
		if (isotope.current) {
			isotope.current.arrange({
				filter: filterKey === "*" ? "*" : `.${filterKey}`,
			});
		}
	}, [filterKey]);

	const categoryIcons: Record<string, string> = {
		car: "ti ti-car",
		bike: "ti ti-bike",
		laptop: "ti ti-device-laptop",
		watch: "ti ti-device-watch",
		cycle: "ti ti-motorbike",
	};

	const filters = [
		"*",
		...Array.from(new Set(items.flatMap((item) => item.categories))),
	];

	return (
		<>
			{!showLotteryItems && (
				<div className="row justify-content-center">
					<div className="col-12 col-xl-8">
						<div
							className="section__header text-center mb-55"
							data-aos="fade-up"
							data-aos-duration="600"
						>
							<span className="fw-6 secondary-text text-xl">
								<strong>Try,</strong> your chance at winning
							</span>
							<h2 className="title-animation fw-6 mt-25">Recent Contests</h2>
							<p className="mt-25">
								We celebrate every win, no matter how big or small. Our platform is filled with excitement as participants hit jackpots and receive amazing lottery prizes every day.
							</p>
						</div>
					</div>
				</div>
			)}

			<div
				className={`row gutter-24 ${
					layout === "two" ? " justify-content-center" : ""
				}`}
			>
				<div className="col-12 col-xl-8">
					<div
						className={`result__tab-btns ${
							layout === "two" ? " text-center" : " text-start"
						}`}
					>
						<ul
							className={`${layout === "two" ? " justify-content-center" : ""}`}
						>
							{filters.map((key, idx) => (
								<li key={idx}>
									<button
										className={filterKey === key ? "active" : ""}
										data-filter={key}
										onClick={() => setFilterKey(key)}
									>
										{key === "*" ? (
											"All Categories"
										) : (
											<>
												<i className={categoryIcons[key]}></i>{" "}
												{key.charAt(0).toUpperCase() + key.slice(1)}
											</>
										)}
									</button>
								</li>
							))}
						</ul>
					</div>
				</div>

				{showLotteryItems && (
					<div className="col-12 col-xl-4">
						<div className="lottery-sidebar">
							<div className="lottery__result-form">
								<form action={handleLotterySearch}>
									<div className="group-pst">
										<input
											type="text"
											name="lottery-search"
											placeholder="Search Here..."
											required
										/>
										<button type="submit">
											<i className="fa-solid fa-magnifying-glass"></i>
										</button>
									</div>
								</form>
							</div>
						</div>
					</div>
				)}
			</div>

			<div
				className="row filter-wrapper mt-40"
				data-aos="fade-up"
				data-aos-duration="800"
			>
				{items.map((item) => (
					<div
						key={item.id}
						className={`col-12 col-lg-6 col-xl-4 filter-item ${item.categories.join(
							" "
						)}`}
					>
						<div className="result__single tilt">
							<div className="contest__intro">
								<span>Exclusive</span>
								<button aria-label="save" title="save">
									<i className="ti ti-heart"></i>
								</button>
							</div>
							<div className="thumb mt-20">
								<Link href="/lottery-details">
									<Image src={item.image} alt={item.alt} />
								</Link>
							</div>
							<div className="content">
								<div className="contest-number">
									<p className="text-sm fw-5">Contest</p>
									<p className="text-lg fw-6 mt-8">9T2</p>
								</div>
								<h5 className="fw-6 neutral-top">
									<Link href="/lottery-details">{item.title}</Link>
								</h5>
								<div className="result__info mt-16">
									<p className="time">Ticket Price</p>
									<p className="held text-xl">{item.price}</p>
								</div>
								<div className="result__info mt-16">
									<p>
										<i className="ti ti-ticket"></i>95K+ Remaining
									</p>
									<p className="time">
										<i className="ti ti-clock-hour-4"></i> 5 Days
									</p>
								</div>
								<div className="cta mt-35">
									<Link href="/lottery-details" className="btn--primary">
										View Details <i className="ti ti-arrow-narrow-right"></i>
									</Link>
								</div>
							</div>
						</div>
					</div>
				))}
			</div>

			{showLotteryItems ? (
				<div className="row">
					<div className="col-12">
						<div
							className="pagination-wrapper mt-40"
							data-aos="fade-up"
							data-aos-duration="600"
							data-aos-delay="100"
						>
							<ul className="pagination">
								<li>
									<button>
										<i className="ti ti-chevron-left"></i>
									</button>
								</li>
								<li>
									<Link href="lottery-contest">1</Link>
								</li>
								<li>
									<Link href="lottery-contest" className="active">
										2
									</Link>
								</li>
								<li>
									<Link href="lottery-contest">3</Link>
								</li>
								<li>
									<button>
										<i className="ti ti-chevron-right"></i>
									</button>
								</li>
							</ul>
						</div>
					</div>
				</div>
			) : (
				<div className="row">
					<div className="col-12">
						<div
							className="mt-40 text-center"
							data-aos="fade-up"
							data-aos-duration="600"
						>
							<Link
								href="lottery"
								aria-label="Play Lottery"
								title="Play Lottery"
								className="btn--secondary"
							>
								View All Contests <i className="ti ti-arrow-narrow-right"></i>
							</Link>
						</div>
					</div>
				</div>
			)}
		</>
	);
};

export default LotteryItemsClient;
