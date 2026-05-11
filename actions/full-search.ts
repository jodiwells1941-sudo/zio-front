"use server";

export async function handlePopupSearch(formData: FormData) {
	const query = formData.get("search-field")?.toString().trim() || "";

	if (!query) {
		console.warn("Empty search submitted.");
		return;
	}

	console.log("Popup search submitted:", query);
}
