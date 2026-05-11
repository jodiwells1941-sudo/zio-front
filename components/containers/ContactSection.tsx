"use client";

import { submitContactFormApi } from "@/app/api/common";
import Link from "next/link";
import { toast } from "react-toastify";

const ContactSection = () => {

	const submitContactForm = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		const form = e.currentTarget;

		const payload = {
			name: (form.elements.namedItem("full-name") as HTMLInputElement).value,
			email: (form.elements.namedItem("c-email") as HTMLInputElement).value,
			mobile: (form.elements.namedItem("phone-number") as HTMLInputElement).value,
			message: (form.elements.namedItem("contact-message") as HTMLTextAreaElement).value,
		};

		try {
			await submitContactFormApi(payload);
			toast.success('Message submitted successfully');
			form.reset();
		} catch (error) {
			console.error("Error submitting form:", error);
			toast.error('Failed to submit message. Please try again.');
		}
	}

	return (
		<section className="contact pt-120 pb-120">
			<div className="container">
				<div className="row justify-content-center">
					<div className="col-12 col-xl-8">
						<div
							className="section__header text-center mb-55"
							data-aos="fade-up"
							data-aos-duration="600"
						>
							<span className="fw-6 secondary-text text-xl">
								<strong>Contact,</strong> Us With Support
							</span>
							<h2 className="title-animation fw-6 mt-25">Let Us Help You</h2>
							<p className="mt-25">
								Get in touch with us for questions, feedback, or support.
								We&apos;re here to assist with your account or any service
								inquiries.
							</p>
						</div>
					</div>
				</div>
				<div className="row gutter-24">
					<div className="col-12 col-lg-5 col-xl-4">
						<div className="contact__content">
							<div
								className="contact__content-single"
								data-aos="fade-up"
								data-aos-duration="600"
							>
								<div className="icon">
									<i className="ti ti-map-pin"></i>
								</div>
								<div className="content">
									<h6 className="fw-6 mb-5">Main Office</h6>
									<div className="content-group">
										<p>
											<Link href="https://www.google.com/maps/place/Kentucky,+USA/@37.8172108,-87.087054,8z/data=!3m1!4b1!4m6!3m5!1s0x8842734c8b1953c9:0x771f6f4ec5ccdffc!8m2!3d37.8393332!4d-84.2700179!16zL20vMDQ5OHk?entry=ttu">
												2972 Westheimer Rd. Santa Ana, Illinois 85486{" "}
											</Link>
										</p>
									</div>
								</div>
							</div>
							<div
								className="contact__content-single mt-20"
								data-aos="fade-up"
								data-aos-duration="600"
								data-aos-delay="200"
							>
								<div className="icon">
									<i className="ti ti-mail-opened"></i>
								</div>
								<div className="content">
									<h6 className="fw-6 mb-5">Email Address</h6>
									<div className="content-group">
										<p>
											<Link href="mailto:example@ziolotto.com">
												ziolotto@gmail.com
											</Link>
										</p>
										<p className="mt-4">
											<Link href="mailto:contact@ziolotto.com">
												ziolottodemo@gmail.com
											</Link>
										</p>
									</div>
								</div>
							</div>
							<div
								className="contact__content-single mt-20"
								data-aos="fade-up"
								data-aos-duration="600"
								data-aos-delay="200"
							>
								<div className="icon">
									<i className="ti ti-phone-call"></i>
								</div>
								<div className="content">
									<h6 className="fw-6 mb-5">Phone Number</h6>
									<div className="content-group">
										<p>
											<Link href="tel:1-368-567-89-54">+1 (368) 567 89 54</Link>
										</p>
										<p className="mt-4">
											<Link href="tel:1-468-568-79-34">+1 (468) 568 79 34</Link>
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>
					<div className="col-12 col-lg-7 col-xl-8">
						<div
							className="contact__form"
							data-aos="fade-left"
							data-aos-duration="600"
							data-aos-delay="200"
						>
							<div className="contact__form-intro">
								<h5 className="title-animation neutral-top fw-6">
									Get In Touch
								</h5>
							</div>
							<hr className="divider mt-30 mb-40" />
							<form onSubmit={submitContactForm}>
								<div className="input-wrapper">
									<label htmlFor="fullName">Your Name</label>
									<div className="input-single">
										<input
											type="text"
											name="full-name"
											id="fullName"
											placeholder="Enter Name"
											required
										/>
										<i className="fa-solid fa-user"></i>
									</div>
								</div>

								<div className="input-wrapper mt-30">
									<label htmlFor="cEmail">Your Email</label>
									<div className="input-single">
										<input
											type="email"
											name="c-email"
											id="cEmail"
											placeholder="Enter Email"
											required
										/>
										<i className="fa-solid fa-envelope"></i>
									</div>
								</div>

								<div className="input-wrapper mt-30">
									<label htmlFor="phoneNumber">Your Number</label>
									<div className="input-single">
										<input
											type="text"
											name="phone-number"
											id="phoneNumber"
											placeholder="Phone Number"
											required
										/>
										<i className="fa-solid fa-phone"></i>
									</div>
								</div>

								<div className="input-wrapper mt-30">
									<label htmlFor="contactMessage">Your Message</label>
									<div className="input-single alter-input">
										<textarea
											name="contact-message"
											id="contactMessage"
											placeholder="Your Message..."
										></textarea>
										<i className="fa-solid fa-comments"></i>
									</div>
								</div>

								<div className="form-cta mt-40">
									<button
										type="submit"
										aria-label="submit message"
										title="submit message"
										className="btn--primary"
									>
										Submit Message <i className="ti ti-arrow-narrow-right"></i>
									</button>
								</div>
							</form>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default ContactSection;
