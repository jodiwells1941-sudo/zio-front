"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// export async function loginUser(formData: FormData) {
// 	const email = formData.get("auth-email");
// 	const password = formData.get("auth-password");

// 	if (email && password) {
// 		const token = "some-random-string";

// 		cookies().set("auth_token", token, {
// 			httpOnly: true,
// 			secure: true,
// 			path: "/",
// 		});

// 		redirect("/dashboard");
// 	}

// 	return { error: "Invalid credentials" };
// }


export async function loginUser(formData: FormData): Promise<void> {
	const email = formData.get("auth-email");
	const password = formData.get("auth-password");

  	if (email && password) {
		const token = "some-random-string";

		const cookieStore = await cookies();
		cookieStore.set("auth_token", token, {
		httpOnly: true,
		secure: true,
		path: "/",
		});

		redirect("/dashboard");
	}
}
