import Link from "next/link";
import Image from "next/image";
import RecentWinnersData from "@/public/data/recent-winners-data";
import { handleLotteryCheck } from "@/actions/filter-lottery";

interface RecentWinnersProps {
	showWinners?: boolean;
}

const RecentWinners = ({ showWinners = true }: RecentWinnersProps) => {
	return (
		<section
			className="lottery-result lottery-alternate-result lottery pt-120 pb-120"
			style={{ backgroundImage: "url(images/lottery-result.png)" }}
		>
			<div className="container">
				<div className="row justify-content-center">
					<div className="col-12 col-xl-9">
						<div
							className="section__header text-center mb-55"
							data-aos="fade-up"
							data-aos-duration="600"
						>
							<span className="fw-6 secondary-text text-xl">
								<strong>Meet,</strong> our Latest Winners
							</span>
							<h2 className="title-animation fw-6 mt-20">Recent Winners</h2>
							<p className="mt-16">
								We celebrate every win, no matter how big or small. Our platform is full of excitement as participants win jackpots and receive amazing lottery prizes every day. 
							</p>
						</div>
					</div>
				</div>
				<div className="row">
					<div className="col-12">
						<div
							className="lottery-sidebar"
							data-aos="fade-up"
							data-aos-duration="600"
						>
							<div className="lottery-card">
								<form action={handleLotteryCheck}>
									<div className="contest-group">
										<p className="text-lg fw-5 neutral-top">Contest Number</p>
										<div className="group-pst mt-12">
											<input
												type="number"
												name="contest-number"
												id="contestNumber"
												placeholder="Enter Number..."
												required
											/>
										</div>
									</div>

									<div className="contest-group">
										<p className="text-lg fw-5 neutral-top">Draw Date</p>
										<div className="group-pst mt-12">
											<input
												type="text"
												name="contest-date"
												id="contestDate"
												placeholder="25/12/24"
												required
											/>
											<i className="ti ti-calendar-check"></i>
										</div>
									</div>

									<div className="contest-group">
										<p className="text-lg fw-5 neutral-top">
											Enter lottery Number
										</p>
										<ul className="mt-12 btrc">
											{[1, 2, 3, 4, 5].map((i) => (
												<li key={i}>
													<input
														type="text"
														name={`lottery-number-${i}`}
														placeholder="00"
														maxLength={2}
														required
													/>
												</li>
											))}
										</ul>
									</div>

									<div className="cta">
										<p className="text-lg fw-5 neutral-top">Check My Number</p>
										<button
											type="submit"
											aria-label="check number"
											title="check number"
											className="btn--primary mt-12"
										>
											Check My Number
											<i className="ti ti-arrow-narrow-right m-0"></i>
										</button>
									</div>
								</form>
							</div>
						</div>
					</div>
				</div>
				<div className="row gutter-24 mt-25">
					{RecentWinnersData.map((winner) => (
						<div
							key={winner.id}
							className="col-12 col-lg-6 col-xl-4"
							data-aos="fade-up"
							data-aos-duration="600"
							data-aos-delay={winner.delay}
						>
							<div className="result__single tilt">
								<div className="result__number">
									<p className="text-lg fw-6 primary-text">#{winner.id}</p>
								</div>
								<div className="thumb">
									<Image src={winner.image} alt="Winner" />
								</div>
								<div className="content">
									<div className="contest-number">
										<p className="text-sm fw-5">Contest</p>
										<p className="text-lg fw-6 mt-8">{winner.contestId}</p>
									</div>
									<h5 className="fw-6 neutral-top">{winner.title}</h5>
									<div className="result__info mt-12">
										<p className="held">
											<i className="ti ti-hourglass-empty"></i>Draw held on :{" "}
											{winner.date}
										</p>
										<p className="time">
											<i className="ti ti-clock-hour-4"></i>
											{winner.time}
										</p>
									</div>
									<div className="winning-list mt-35">
										<p className="fw-5">Winning No :</p>
										<ul className="champion">
											{winner.numbers.map((num, idx) => (
												<li
													key={idx}
													className={idx === winner.activeIndex ? "active" : ""}
												>
													{num}
												</li>
											))}
										</ul>
									</div>
								</div>
							</div>
						</div>
					))}
				</div>

				{showWinners ? (
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
										<Link href="lottery-result">1</Link>
									</li>
									<li>
										<Link href="lottery-result" className="active">
											2
										</Link>
									</li>
									<li>
										<Link href="lottery-result">3</Link>
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
							<div className="mt-40 text-center">
								<Link
									href="lottery-result"
									aria-label="view all"
									title="view all"
									className="btn--primary"
								>
									View All
									<i className="ti ti-arrow-narrow-right"></i>
								</Link>
							</div>
						</div>
					</div>
				)}
			</div>
		</section>
	);
};

export default RecentWinners;
