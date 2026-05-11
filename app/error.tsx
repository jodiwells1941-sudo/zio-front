"use client";
import { useEffect } from "react";
import Link from "next/link";

export default function Error({
	error,
	reset,
}: {
	error: Error;
	reset: () => void;
}) {
	useEffect(() => {
		console.error("Caught an error:", error);
	}, [error]);

	return (
		<section
			className="error error-cp"
			style={{ backgroundImage: "url(images/error-bg.jpg)" }}
		>
			<div className="container">
				<div className="row justify-content-center">
					<div className="col-12 col-lg-7 col-xl-6">
						<div className="error__inner pt-120 pb-120">
							<div
								className="error__content text-center"
								data-aos="fade-up"
								data-aos-duration="600"
								data-aos-delay="200"
							>
								<h2 className="fw-6 mb-20">Something went wrong</h2>
								<p className="text-xl">
									Sorry, an unexpected error occurred. Please try again later.
								</p>
								<p className="text-danger mt-3">{error.message}</p>

								<div className="d-flex justify-content-center gap-3 mt-40">
									<button
										onClick={() => reset()}
										className="btn--primary"
										aria-label="try again"
										title="Try Again"
									>
										Try Again
									</button>

									<Link
										href="/contact-us"
										aria-label="contact us"
										title="contact us"
										className="btn--primary"
									>
										Contact Us
									</Link>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
