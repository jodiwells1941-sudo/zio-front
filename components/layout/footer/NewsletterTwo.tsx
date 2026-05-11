"use client";

import { handleNewsletterSubscribe } from "@/actions/subscribe-email";

const NewsletterTwo = () => {
	return (
		<div className="row">
			<div className="col-12 px-2">
				<div
					className="footer__newsletter footer__newsletter-two"
					style={{ backgroundImage: "url(/images/newsletter-bg-two.png)" }}
					data-aos="fade-up"
					data-aos-duration="600"
				>
					<div className="row justify-content-center">
						<div className="col-12 col-lg-10 col-xl-8 px-0">
							<div className="footer__newsletter-content w-full text-center">
								<h2 className="title-animation fw-6 neutral-top mb-10">
									Join Our Newsletter
								</h2>
								<p>
									Subscribe to our newsletter for the latest updates, news, and
									exclusive insights straight to your inbox.
								</p>
							</div>
							<div className="footer__newsletter-form mt-35">
								<form action={handleNewsletterSubscribe}>
									<input
										type="email"
										required
										name="subscribe-email"
										id="subscribeEmail"
										placeholder="Enter Email"
									/>
									<button
										type="submit"
										aria-label="subscribe to our newsletter"
										title="subscribe to our newsletter"
									>
										<i className="fa-solid fa-paper-plane"></i>
									</button>
								</form>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default NewsletterTwo;
