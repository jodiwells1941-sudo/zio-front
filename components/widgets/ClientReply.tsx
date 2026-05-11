"use client";

import { useState } from "react";
import Image from "next/image";
import two from "@/public/images/avatar/two.png";
import { postReply } from "@/actions/comment-reply";
import CommentData from "@/public/data/comment-data";

const ClientReply = () => {
	const [activeReplyId, setActiveReplyId] = useState<number | null>(null);

	const handleReplyClick = (id: number) => {
		setActiveReplyId((prev) => (prev === id ? null : id));
	};

	return (
		<>
			{CommentData.map((comment) => (
				<div
					className="comment__single mt-30"
					key={comment.id}
					data-aos="fade-up"
					data-aos-duration="600"
				>
					<div className="comment__meta">
						<div className="author__info">
							<div className="thumb">
								<Image src={comment.avatar} alt={comment.name} />
							</div>
							<div className="content">
								<p className="text-xl fw-6">{comment.name}</p>
								<p>{comment.role}</p>
							</div>
						</div>
						<div className="time">
							<p>{comment.time}</p>
							<p>{comment.date}</p>
						</div>
					</div>

					<hr className="divider mt-25 mb-30" />

					<div className="comment__single-content">
						<div className="review mb-20">
							{Array.from({ length: 5 }).map((_, idx) => (
								<i className="fa-solid fa-star" key={idx}></i>
							))}
						</div>
						<p>{comment.content}</p>

						<hr className="divider mt-25 mb-25" />

						<div className="comment__single-action">
							<button title="like" className="single">
								<i className="ti ti-thumb-up"></i> 190
							</button>
							<div className="reply-button">
								<button
									aria-label="reply"
									onClick={() => handleReplyClick(comment.id)}
									className={activeReplyId === comment.id ? "active" : ""}
								>
									<i className="ti ti-messages"></i>Reply
								</button>
							</div>
						</div>

						{activeReplyId === comment.id && (
							<div className="reply__comment mt-30">
								<div className="reply__comment-inner">
									<div className="thumb">
										<Image src={two} alt="Reply Avatar" />
									</div>
									<form action={postReply}>
										<div className="input-group">
											<div className="input-single">
												<textarea
													name="reply-text"
													placeholder="Join the discussion..."
													required
												></textarea>
												<input
													type="hidden"
													name="parent-id"
													value={comment.id}
												/>
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

export default ClientReply;
