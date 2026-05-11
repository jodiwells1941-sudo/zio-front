"use server";

export async function submitComment(formData: FormData) {
	const fullName = formData.get("com-full-name")?.toString() || "";
	const email = formData.get("com-c-email")?.toString() || "";
	const message = formData.get("com-contact-message")?.toString() || "";

	console.log({ fullName, email, message });
}
