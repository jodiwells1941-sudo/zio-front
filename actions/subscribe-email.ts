"use server";

export async function handleNewsletterSubscribe(formData: FormData) {
	const email = formData.get("subscribe-email")?.toString() || "";

	if (!email || !email.includes("@")) {
		console.error("Invalid email submitted:", email);
		return;
	}

	console.log("New newsletter subscription:", email);
}
