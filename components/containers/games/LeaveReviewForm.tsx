"use client";
import { useState } from "react";
import { submitReview } from "@/actions/submit-review";

const LeaveReviewForm = () => {
	const [rating, setRating] = useState(0);

	const handleStarClick = (value: number) => {
		setRating(value);
		const ratingInput = document.getElementById("r-rating") as HTMLInputElement;
		if (ratingInput) {
			ratingInput.value = value.toString();
		}
	};

	return (
		<div
			className="blog__details-card-sm mt-60"
			data-aos="fade-up"
			data-aos-duration="600"
		>
			<div className="card__intro">
				<h6 className="title-animation neutral-top fw-6">Leave A Review</h6>
			</div>
			<hr className="divider mt-20 mb-40" />
			<form action={submitReview}>
				<div className="input-wrapper">
					<label htmlFor="r-fullName">Your Name</label>
					<div className="input-single">
						<input
							type="text"
							name="r-full-name"
							id="r-fullName"
							placeholder="Enter Name"
							required
						/>
						<i className="fa-solid fa-user"></i>
					</div>
				</div>

				<div className="input-wrapper mt-30">
					<label htmlFor="r-cEmail">Your Email</label>
					<div className="input-single">
						<input
							type="email"
							name="r-c-email"
							id="r-cEmail"
							placeholder="Enter Email"
							required
						/>
						<i className="fa-solid fa-envelope"></i>
					</div>
				</div>

				<div className="input-wrapper mt-30">
					<p>Ratings</p>
					<div className="review review-game mt-16">
						{[1, 2, 3, 4, 5].map((val) => (
							<i
								key={val}
								className={`ti ti-star ${rating >= val ? "active" : ""}`}
								onClick={() => handleStarClick(val)}
								style={{ cursor: "pointer" }}
							></i>
						))}
						<input type="hidden" id="r-rating" name="r-rating" value={rating} />
					</div>
				</div>

				<div className="input-wrapper mt-30">
					<label htmlFor="r-reviewMessage">Your Review</label>
					<div className="input-single alter-input">
						<textarea
							name="r-review-message"
							id="r-reviewMessage"
							placeholder="Your Review..."
						></textarea>
						<i className="fa-solid fa-comments"></i>
					</div>
				</div>

				<div className="mt-40">
					<button
						type="submit"
						aria-label="submit review"
						title="submit review"
						className="btn--secondary"
					>
						Submit Review
					</button>
				</div>
			</form>
		</div>
	);
};

export default LeaveReviewForm;
