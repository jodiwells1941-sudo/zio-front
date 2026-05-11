"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image, { StaticImageData } from "next/image";
import { handleSearch } from "@/actions/search-games";

type GameItem = {
	id: number;
	categories: string[];
	tag?: string;
	rating: number;
	image: StaticImageData;
	alt: string;
	typeText: string;
	title: string;
	href?: string;
	platforms: string[];
};

type Props = {
	gameData: GameItem[];
};

const GameSectionTwoClient = ({ gameData }: Props) => {
	const iso = useRef<Isotope | null>(null);
	const [filterKey, setFilterKey] = useState<string>("*");

	const filters = [
		"*",
		...Array.from(new Set(gameData.flatMap((item) => item.categories))),
	];

	const categoryIcons: Record<string, string> = {
		slot: "ti ti-gavel",
		casino: "ti ti-poker-chip",
		jackpot: "ti ti-dice-5",
		lottery: "ti ti-dice-5",
	};

	const [isIsotopeReady, setIsotopeReady] = useState<boolean>(false);

	useEffect(() => {
		const initIsotope = async () => {
			if (typeof window !== "undefined") {
				const IsotopeModule = await import("isotope-layout");
				iso.current = new IsotopeModule.default(".filter-wrapper", {
					itemSelector: ".filter-item",
					layoutMode: "fitRows",
					transitionDuration: "0.6s",
				});
				setIsotopeReady(true);
			}
		};

		initIsotope();

		return () => {
			if (iso.current) {
				iso.current.destroy();
				iso.current = null;
			}
		};
	}, []);

	useEffect(() => {
		if (!isIsotopeReady || !iso.current) return;

		iso.current.arrange({
			filter: (elem: Element) => {
				const categories = (elem as HTMLElement).dataset.cat?.split(" ") || [];
				const byCategory = filterKey === "*" || categories.includes(filterKey);
				return byCategory;
			},
		});
	}, [filterKey, isIsotopeReady]);

	return (
		<>
			<div className="row gutter-24">
				<div className="col-12 col-xl-4">
					<div className="lottery-sidebar">
						<div className="lottery__result-form">
							<form action={handleSearch}>
								<div className="group-pst">
									<input
										type="text"
										name="search-term"
										placeholder="Search Here..."
										aria-label="Search games"
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

				<div className="col-12 col-xl-8">
					<div className="result__tab-btns text-start text-xl-end">
						<ul>
							{filters.map((key) => (
								<li key={key}>
									<button
										data-filter={key}
										className={filterKey === key ? "active" : ""}
										onClick={() => setFilterKey(key)}
									>
										<i
											className={
												categoryIcons[key as keyof typeof categoryIcons] ||
												"ti ti-layout-grid"
											}
										></i>
										{key === "*"
											? "All Categories"
											: key.charAt(0).toUpperCase() + key.slice(1)}
									</button>
								</li>
							))}
						</ul>
					</div>
				</div>
			</div>
			<div
				className="row gutter-24 mt-40 filter-wrapper"
				data-aos="fade-up"
				data-aos-duration="800"
			>
				{gameData.map((item) => {
					const categories = item.categories.join(" ");
					return (
						<div
							className={`col-12 col-md-6 col-xl-4 col-xxl-3 filter-item ${categories}`}
							key={item.id}
							data-cat={categories}
						>
							<div className="lt-type__single text-center tilt">
								{item.tag && <span className="serial">{item.tag}</span>}
								<span className="price">
									<i className="fa-solid fa-star"></i> {item.rating}
								</span>
								<div className="thumb">
									<Image src={item.image} alt={item.alt} />
								</div>
								<div className="content mt-25">
									<span className="text-uppercase fw-6 secondary-text">
										{item.typeText}
									</span>
									<h6 className="fw-6 mt-8">
										<Link href={item.href || "#"}>{item.title}</Link>
									</h6>
									<ul className="platform justify-content-center mt-12">
										{item.platforms.map((platform, idx) => (
											<li key={idx}>{platform}</li>
										))}
									</ul>
								</div>
								<div className="cta mt-25">
									<Link
										href={item.href || "#"}
										aria-label="view details"
										title="view details"
										className="btn--primary"
									>
										Play Now <i className="ti ti-arrow-narrow-right"></i>
									</Link>
								</div>
							</div>
						</div>
					);
				})}
			</div>
		</>
	);
};

export default GameSectionTwoClient;
