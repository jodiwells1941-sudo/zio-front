"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import RecentChampionsData from "@/public/data/recent-champions-data";

const RecentChampionTab = () => {
	const [activeTab, setActiveTab] = useState<string>("allWinners");
	const [isAnimating, setIsAnimating] = useState<boolean>(false);

	const handleTabClick = (id: string) => {
		if (id !== activeTab) {
			setIsAnimating(true);
			setTimeout(() => setIsAnimating(false), 500);
			setActiveTab(id);
		}
	};

	return (
		<>
			<div className="row justify-content-center">
				<div className="col-12">
					<div
						className="ch-list__btns mb-40"
						data-aos="fade-up"
						data-aos-duration="600"
						data-aos-delay="200"
					>
						<ul>
							{RecentChampionsData.map((tab) => (
								<li key={tab.id}>
									<button
										onClick={() => handleTabClick(tab.id)}
										className={`ch-tab-btn ${
											activeTab === tab.id ? "active" : ""
										}`}
									>
										<i className={`ti ${tab.icon}`}></i> {tab.category}
									</button>
								</li>
							))}
						</ul>
					</div>
				</div>
			</div>
			<div className="row">
				<div className="col-12">
					<div
						className="ch-list__inner"
						data-aos="fade-up"
						data-aos-duration="600"
						data-aos-delay="400"
					>
						{RecentChampionsData.map((tab) => (
							<div
								key={tab.id}
								className={`ch-list__single ${isAnimating ? "animating" : ""} ${
									activeTab === tab.id ? "active" : "d-none"
								}`}
								id={tab.id}
							>
								<div className="row gutter-40">
									{tab.sections.map((section, idx) => (
										<div key={idx} className="col-12 col-xl-6">
											<div className="win-t-wrapper">
												<div className="lottery-intro mb-30">
													<h6 className="title-animation fw-6 neutral-top">
														{section.title}
													</h6>
													<Link href="/lottery-result">See All</Link>
												</div>
												<div className="winning-table">
													<table>
														<thead>
															<tr>
																<th>
																	<div className="th-wrap">
																		User / Bet Id{" "}
																		<span>
																			<i className="fa-solid fa-caret-up"></i>
																			<i className="fa-solid fa-caret-down"></i>
																		</span>
																	</div>
																</th>
																<th>
																	<div className="th-wrap">
																		Game{" "}
																		<span>
																			<i className="fa-solid fa-caret-up"></i>
																			<i className="fa-solid fa-caret-down"></i>
																		</span>
																	</div>
																</th>
																<th>
																	<div className="th-wrap">
																		Amount{" "}
																		<span>
																			<i className="fa-solid fa-caret-up"></i>
																			<i className="fa-solid fa-caret-down"></i>
																		</span>
																	</div>
																</th>
																<th>
																	<div className="th-wrap">
																		Profit{" "}
																		<span>
																			<i className="fa-solid fa-caret-up"></i>
																			<i className="fa-solid fa-caret-down"></i>
																		</span>
																	</div>
																</th>
															</tr>
														</thead>
														<tbody>
															{section.entries.map((entry, entryIdx) => (
																<tr key={entryIdx}>
																	<td>
																		<div className="author__info">
																			<div className="thumb">
																				<Image
																					src={entry.image}
																					alt={entry.user}
																				/>
																			</div>
																			<div className="content">
																				<p className="fw-6">{entry.user}</p>
																			</div>
																		</div>
																	</td>
																	<td>{entry.game}</td>
																	<td>{entry.amount}</td>
																	<td>
																		<div className="author__info">
																			<div className="thumb">
																				<Image
																					src={entry.profitIcon}
																					alt="Profit"
																				/>
																			</div>
																			<div className="content">
																				<p className="fw-6">{entry.profit}</p>
																			</div>
																		</div>
																	</td>
																</tr>
															))}
														</tbody>
													</table>
												</div>
											</div>
										</div>
									))}
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</>
	);
};

export default RecentChampionTab;
