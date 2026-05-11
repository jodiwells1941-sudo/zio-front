"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import GameReviewsData from "@/public/data/reveiw-data";

const GameReviewsClient = dynamic(
	() => import("@/components/widgets/GameReviewsClient")
);

const GameReviews = () => {
	const { averageRating, reviews, replyAvatar } = GameReviewsData;

	return (
		<div className="blog__details-card-sm mt-60">
			<div className="card__intro">
				<h6 className="title-animation neutral-top fw-6">Average Reviews</h6>
			</div>

			<hr className="divider mt-30 mb-40" />

			<div
				className="review-wrapper"
				data-aos="fade-up"
				data-aos-duration="600"
			>
				<div className="review-left text-center">
					<h3 className="fw-6">
						{averageRating.score}
						<span className="text-xxl">/5</span>
					</h3>
					<div className="review mt-8">
						{[...Array(Math.floor(averageRating.score))].map((_, i) => (
							<i key={i} className="fa-solid fa-star"></i>
						))}
						{averageRating.score % 1 !== 0 && (
							<i className="fa-solid fa-star-half-stroke"></i>
						)}
					</div>
					<p className="mt-12 fw-5">{averageRating.totalRatings} Rating</p>
				</div>

				<div className="review-right">
					<div className="pg-wrapper">
						{averageRating.stars.map((star, idx) => (
							<div className="pg-single" key={star}>
								<p className="pg-left">
									<i className="fa-solid fa-star"></i>
									{star}
								</p>
								<div
									className="progress-bar-wrapper"
									data-percent={`${averageRating.distribution[idx]}%`}
								>
									<div className="progress-bar">
										<div
											className="progress-bar-percent"
											style={{
												width: `${averageRating.distribution[idx]}%`,
											}}
										></div>
									</div>
								</div>
								<span className="percent-value">
									{averageRating.distribution[idx]}%
								</span>
							</div>
						))}
					</div>
				</div>
			</div>

			<hr className="divider mt-40 mb-40" />

			<GameReviewsClient reviews={reviews} replyAvatar={replyAvatar} />

			<div className="mt-40">
				<Link href="/game-details" className="btn--secondary">
					See All Reviews
				</Link>
			</div>
		</div>
	);
};

export default GameReviews;
