"use server";

export async function submitReview(formData: FormData) {
	const fullName = formData.get("r-full-name")?.toString() || "";
	const email = formData.get("r-c-email")?.toString() || "";
	const message = formData.get("r-review-message")?.toString() || "";
	const rating = formData.get("r-rating")?.toString() || "0";

	console.log("Review submitted:", { fullName, email, message, rating });
}
