"use client";
import { useState } from "react";
import Image, { StaticImageData } from "next/image";
import { submitReply } from "@/actions/review-form";

interface Review {
	id: number;
	name: string;
	role: string;
	time: string;
	date: string;
	stars: number;
	avatar: string | StaticImageData;
	content: string;
	alt: string;
}

const GameReviewsClient = ({
	reviews,
	replyAvatar,
}: {
	reviews: Review[];
	replyAvatar: string | StaticImageData;
}) => {
	const [activeReplyId, setActiveReplyId] = useState<number | null>(null);

	const toggleReply = (id: number) => {
		setActiveReplyId((prev) => (prev === id ? null : id));
	};

	return (
		<>
			<div
				className="card__intro crc mb-40"
				data-aos="fade-up"
				data-aos-duration="600"
			>
				<h6 className="title-animation neutral-top fw-6">All Reviews</h6>
				<div className="sort-wrapper">
					<p>Sort By:</p>
					<select name="sort" className="sort-select select" defaultValue="">
						<option value="" disabled hidden>
							Date
						</option>
						<option value="new">New</option>
						<option value="old">Old</option>
					</select>
				</div>
			</div>

			{reviews.map((review) => (
				<div
					className="comment__single mt-30"
					key={review.id}
					data-aos="fade-up"
					data-aos-duration="600"
				>
					<div className="comment__meta">
						<div className="author__info">
							<div className="thumb">
								<Image src={review.avatar} alt={review.alt} />
							</div>
							<div className="content">
								<p className="text-xl fw-6">{review.name}</p>
								<p>{review.role}</p>
							</div>
						</div>
						<div className="time">
							<p>{review.time}</p>
							<p>{review.date}</p>
						</div>
					</div>
					<hr className="divider mt-25 mb-30" />
					<div className="comment__single-content">
						<div className="review mb-20">
							{[...Array(review.stars)].map((_, i) => (
								<i key={i} className="fa-solid fa-star"></i>
							))}
						</div>
						<p>{review.content}</p>
						<hr className="divider mt-25 mb-25" />
						<div className="comment__single-action">
							<button title="like" className="single">
								<i className="ti ti-thumb-up"></i> 190
							</button>
							<div className="reply-button">
								<button
									aria-label="reply"
									onClick={() => toggleReply(review.id)}
									className={activeReplyId === review.id ? "active" : ""}
								>
									<i className="ti ti-messages"></i>Reply
								</button>
							</div>
						</div>

						{activeReplyId === review.id && (
							<div className="reply__comment mt-30">
								<div className="reply__comment-inner">
									<div className="thumb">
										<Image src={replyAvatar} alt="Reply Avatar" />
									</div>
									<form action={submitReply}>
										<input type="hidden" name="review-id" value={review.id} />
										<div className="input-group">
											<div className="input-single">
												<textarea
													name="reply-message"
													placeholder="Join the discussion..."
													required
												></textarea>
											</div>
											<div className="btn-wrapper">
												<button type="submit" className="btn--primary">
													Reply
												</button>
											</div>
										</div>
									</form>
								</div>
							</div>
						)}
					</div>
				</div>
			))}
		</>
	);
};

export default GameReviewsClient;
