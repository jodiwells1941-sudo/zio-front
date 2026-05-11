import { handleNewsletterSubscribe } from "@/actions/subscribe-email";

const Newsletter = () => {
	return (
		<div className="row">
			<div className="col-12">
				<div
					className="footer__newsletter"
					style={{ backgroundImage: "url(images/newsletter-bg.png)" }}
					data-aos="fade-up"
					data-aos-duration="600"
				>
					<div className="row align-items-center gutter-24">
						<div className="col-12 col-lg-6">
							<div className="footer__newsletter-content">
								<h4 className="title-animation fw-5 neutral-top">
									Subscribe to our newsletter for the latest updates
								</h4>
							</div>
						</div>
						<div className="col-12 col-lg-6 col-xl-5 offset-xl-1">
							<div className="footer__newsletter-form">
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

export default Newsletter;
