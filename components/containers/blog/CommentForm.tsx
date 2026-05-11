"use client";

import { submitComment } from "@/actions/comments";

const CommentForm = () => {
	return (
		<div
			className="blog__details-card-sm mt-60"
			data-aos="fade-up"
			data-aos-duration="600"
		>
			<div className="card__intro">
				<h6 className="title-animation neutral-top fw-6">Leave A Comment</h6>
			</div>
			<hr className="divider mt-20 mb-40" />
			<form action={submitComment}>
				<div className="input-wrapper">
					<label htmlFor="com-fullName">Your Name</label>
					<div className="input-single">
						<input
							type="text"
							name="com-full-name"
							id="com-fullName"
							placeholder="Enter Name"
							required
						/>
						<i className="fa-solid fa-user"></i>
					</div>
				</div>

				<div className="input-wrapper mt-30">
					<label htmlFor="com-cEmail">Your Email</label>
					<div className="input-single">
						<input
							type="email"
							name="com-c-email"
							id="com-cEmail"
							placeholder="Enter Email"
							required
						/>
						<i className="fa-solid fa-envelope"></i>
					</div>
				</div>

				<div className="input-wrapper mt-30">
					<label htmlFor="com-contactMessage">Your Message</label>
					<div className="input-single alter-input">
						<textarea
							name="com-contact-message"
							id="com-contactMessage"
							placeholder="Your Message..."
						></textarea>
						<i className="fa-solid fa-comments"></i>
					</div>
				</div>

				<div className="mt-40">
					<button
						type="submit"
						aria-label="submit comment"
						title="submit comment"
						className="btn--secondary"
					>
						Submit Comment
					</button>
				</div>
			</form>
		</div>
	);
};

export default CommentForm;
