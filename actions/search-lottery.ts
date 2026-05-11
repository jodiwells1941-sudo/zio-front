"use server";

export async function handleLotterySearch(formData: FormData) {
	const query = formData.get("lottery-search")?.toString() || "";
	console.log("Lottery search query:", query);
}
