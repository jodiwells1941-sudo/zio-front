"use client";

import Link from "next/link";
import { handlePayment } from "@/actions/deposit-form";

const GameSidebar = () => {
	return (
		<>
			<div className="col-12 col-xl-4">
				<div
					className="blog__sidebar"
					data-aos="fade-up"
					data-aos-duration="600"
				>
					<div className="blog__sidebar-widget game-details__widget">
						<div className="blog__widget-intro">
							<h6 className="fw-6 neutral-top">Overviews</h6>
							<ul className="platform mt-12">
								<li>Windows</li>
								<li>
									<span></span>
								</li>
								<li>Android</li>
								<li>
									<span></span>
								</li>
								<li>Xbox</li>
								<li>
									<span></span>
								</li>
								<li>Mac</li>
							</ul>
						</div>
						<hr className="divider mt-35 mb-35" />
						<div className="platform-meta">
							<p>
								<span>Category</span> <span>Casino Jackpot</span>
							</p>
							<p className="mt-12">
								<span>Rating</span>{" "}
								<span>
									<i className="fa-solid fa-star"></i>5
								</span>
							</p>
							<p className="mt-12">
								<span>Playing User</span>{" "}
								<span className="secondary-text fw-6">562M</span>
							</p>
						</div>
						<hr className="divider mt-35 mb-35" />
						<div className="platform__price">
							<p className="text-lg fw-6 neutral-top">Deposit And Play</p>
							<form action={handlePayment} className="mt-16">
								<div className="input-single mb-0">
									<input
										type="text"
										name="price-btc"
										id="priceBtc"
										placeholder="0.001"
										required
									/>
								</div>

								<select
									name="pay-method"
									className="payment-select select"
									defaultValue=""
									required
								>
									<option value="" disabled hidden>
										Currency
									</option>
									<option value="btc">BTC</option>
									<option value="eth">ETH</option>
									<option value="doge">DOGE</option>
								</select>

								<button
									type="submit"
									aria-label="play now"
									title="play now"
									className="btn--primary mt-16"
								>
									Play Now<i className="ti ti-arrow-narrow-right"></i>
								</button>
							</form>
						</div>
						<div className="platform__footer mt-25">
							<p>
								By Clicking you agree with our
								<Link href="terms-conditions">Terms and Conditions</Link>,
								<Link href="privacy-policy">Privacy Policy</Link>
							</p>
							<div className="action-group mt-25">
								<Link href="game-details" aria-label="save" title="save">
									<i className="ti ti-heart"></i>
								</Link>
								<Link href="game-details" aria-label="share" title="share">
									<i className="ti ti-share"></i>
								</Link>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default GameSidebar;
