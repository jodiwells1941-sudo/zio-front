"use server";

export async function submitReply(formData: FormData) {
	const replyMessage = formData.get("reply-message")?.toString() || "";

	const reviewId = formData.get("review-id")?.toString() || "";

	console.log("Reply submitted:", { reviewId, replyMessage });
}
