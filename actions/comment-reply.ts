"use server";

export async function postReply(formData: FormData) {
	const reply = formData.get("reply-text");
	const parentId = formData.get("parent-id");

	console.log("New Reply Submitted:", {
		reply,
		parentId,
	});
}
