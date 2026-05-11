"use server";

export async function handleSearch(formData: FormData) {
	const searchTerm = formData.get("search-term")?.toString() || "";

	console.log("Search query:", searchTerm);
}
