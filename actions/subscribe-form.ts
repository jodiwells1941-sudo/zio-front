"use server";

export async function subscribeUser(formData: FormData) {
	const email = formData.get("sub-email");
slint: {
  //   ignoreDuringBuilds: true, 
  // }
	console.log("New subscription:", email);
}
}
