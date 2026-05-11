"use server";

export async function registerUser(formData: FormData) {
	const firstName = formData.get("auth-first-name");
	const lastName = formData.get("auth-last-name");
	const email = formData.get("auth-email");
	const password = formData.get("auth-password");

	console.log("New User Registration:", {
		firstName,
		lastName,
		email,
		password,
	});
}
