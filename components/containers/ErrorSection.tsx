import Link from "next/link";
import Image from "next/image";
import thumb from "@/public/images/error.png";

const ErrorSection = () => {
	return (
		<section
			className="error pt-120 pb-120"
			style={{ backgroundImage: "url(images/error-bg.jpg)" }}
		>
			<div className="container">
				<div className="row justify-content-center">
					<div className="col-12 col-lg-7 col-xl-6">
						<div className="error__inner">
							<div
								className="error__thumb text-center"
								data-aos="zoom-in"
								data-aos-duration="600"
							>
								<Image src={thumb} alt="Image" />
							</div>
							<div
								className="error__content text-center mt-60"
								data-aos="fade-up"
								data-aos-duration="600"
								data-aos-delay="200"
							>
								<h4 className="title-animation fw-6 mb-20">
									Oops! Page Not Found
								</h4>
								<p>
									Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
									do eiusmod tempor incididunt ut labore et dolore magna aliqua.
								</p>
								<div className="mt-40">
									<Link
										href="/"
										aria-label="back to home"
										title="back to home"
										className="btn--primary"
									>
										Back To Home <i className="ti ti-arrow-narrow-right"></i>
									</Link>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default ErrorSection;
