"use server";

export async function searchProduct(formData: FormData) {
	const searchTerm = formData.get("search-product");

	console.log("Searching for:", searchTerm);
}
