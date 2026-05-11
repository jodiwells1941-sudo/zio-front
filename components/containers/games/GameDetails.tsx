"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import GameSidebar from "./GameSidebar";
import GameReviews from "./GameReviews";
import thumb from "@/public/images/lottery/jackpot.png";

const LeaveReviewForm = dynamic(() => import("./LeaveReviewForm"));

const GameDetails = () => {
	return (
		<>
			<section className="game-details pt-120 pb-120">
				<div className="container">
					<div className="row gutter-40">
						<div className="col-12 col-xl-8">
							<div className="blog__details-card lottery-details__card">
								<div
									className="details__content lottery__poster"
									data-aos="fade-up"
									data-aos-duration="600"
								>
									<div className="thumb">
										<Image src={thumb} alt="Image" />
									</div>
									<div className="content">
										<h5 className="fw-6 title-animation">Jackpot Betting</h5>
										<p className="mt-20">
											Online lottery platforms combine excitement and opportunity, giving participants the chance to win attractive prizes through transparent lottery draws. Here are some key details about this lottery category:
										</p>
									</div>
								</div>
								<div className="details__content mt-40 mb-40">
									<hr className="divider" />
								</div>
								<div
									className="details__content"
									data-aos="fade-up"
									data-aos-duration="600"
								>
									<h6 className="title-animation neutral-top fw-6">
										Decentralization & Transparency:
									</h6>
									<ul className="details__list mt-16 mb-25">
										<li>
											Built on blockchain platforms, ensuring fairness and
											eliminating manipulation risks.
										</li>
										<li>
											Players can verify the randomness and fairness of each
											draw.
										</li>
									</ul>
									<p>
										It is a long established fact that a reader will be
										distracted by the readable content of a page when looking at
										its layout. The point of using Lorem Ipsum is that it has a
										more-or-less normal distribution of letters, as opposed to
										using Content here, content here, making it look like
										readable English. Many desktop publishing packages and web
										page editors now use Lorem Ipsum as their default model
										text.
									</p>
								</div>
								<div className="details__content mt-40 mb-40">
									<hr className="divider" />
								</div>
								<div
									className="details__content"
									data-aos="fade-up"
									data-aos-duration="600"
								>
									<h6 className="text-xl neutral-top fw-6">Easy Access:</h6>
									<p className="mt-16">
										It is a long established fact that a reader will be
										distracted by the readable content of a page when looking at
										its layout. The point of using Lorem Ipsum is that it has a
										more-or-less normal distribution of letters, as opposed to
										using Content here, content here, making it look like
										readable English. Many desktop publishing packages and web
										page editors now use Lorem Ipsum as their default model
										text.
									</p>
									<ul className="details__list mt-25">
										<li>
											Accessible worldwide, users only need a cryptocurrency
											wallet.
										</li>
										<li>
											Often allows small investments to participate in jackpots.
										</li>
									</ul>
								</div>
								<div className="details__content mt-40 mb-40">
									<hr className="divider" />
								</div>
								<div
									className="details__content"
									data-aos="fade-up"
									data-aos-duration="600"
								>
									<h6 className="text-xl neutral-top fw-6">
										Instant Transactions:
									</h6>
									<ul className="details__list mt-25">
										<li>Residential rooftop installations</li>
										<li>Off-grid solar systems</li>
										<li>Camping and RVs</li>
										<li>Remote communication equipment</li>
										<li>Marine solar setups</li>
									</ul>
								</div>
								<div className="details__content mt-40 mb-40">
									<hr className="divider" />
								</div>
								<div
									className="details__content"
									data-aos="fade-up"
									data-aos-duration="600"
								>
									<h6 className="text-xl neutral-top fw-6">Benefits:</h6>
									<p className="mt-16">
										It is a long established fact that a reader will be
										distracted by the readable content of a page when looking at
										its layout. The point of using Lorem Ipsum is that it has a
										more-or-less normal distribution of letters, as opposed to
										using Content here, content here, making it look like
										readable English. Many desktop publishing packages and web
										page editors now use Lorem Ipsum as their default model
										text,
									</p>
									<ul className="details__list mt-25">
										<li>
										Lucky Block: Offers exciting lottery draws with attractive prize opportunities.
										</li>
										<li>
										Millions Lotto: A popular lottery platform known for its large prize rewards.
										</li>
										<li>
										Lucky Dice: A fun lottery-style draw system with special prize opportunities.
										</li>
										<li>
										Stake Lottery: A platform featuring exciting lottery draws and jackpot prizes.
										</li>
									</ul>
								</div>
								<div className="details__content mt-40 mb-40">
									<hr className="divider" />
								</div>
								<div className="details__content details__footer">
									<div className="details-tag">
										<div className="tag-header">
											<p>
												Popular Tags <i className="ti ti-arrow-move-right"></i>
											</p>
										</div>
										<div className="tag-wrapper">
											<Link href="blog">Crypto</Link>
											<Link href="blog">Casino</Link>
										</div>
									</div>
									<div className="details-tag">
										<div className="tag-header">
											<p>
												Follow <i className="ti ti-arrow-move-right"></i>
											</p>
										</div>
										<div className="social">
											<Link
												href="https://www.facebook.com/"
												target="_blank"
												aria-label="share us on facebook"
												title="facebook"
											>
												<i className="fa-brands fa-facebook-f"></i>
											</Link>
											<Link
												href="https://instagram.com/"
												target="_blank"
												aria-label="share us on instagram"
												title="instagram"
											>
												<i className="fa-brands fa-instagram"></i>
											</Link>
											<Link
												href="https://x.com/"
												target="_blank"
												aria-label="share us on twitter"
												title="twitter"
											>
												<i className="fa-brands fa-twitter"></i>
											</Link>
											<Link
												href="https://www.linkedin.com/"
												target="_blank"
												aria-label="share us on linkedin"
												title="linkedin"
											>
												<i className="fa-brands fa-linkedin-in"></i>
											</Link>
										</div>
									</div>
								</div>
							</div>
							<GameReviews />
							<LeaveReviewForm />
						</div>
						<GameSidebar />
					</div>
				</div>
			</section>
		</>
	);
};

export default GameDetails;
