"use server";

export async function handleLotteryCheck(formData: FormData) {
	const contestNumber = formData.get("contest-number")?.toString() || "";
	const drawDate = formData.get("contest-date")?.toString() || "";

	const lotteryNumbers: string[] = [];
	for (let i = 1; i <= 5; i++) {
		const num = formData.get(`lottery-number-${i}`)?.toString();
		if (num) lotteryNumbers.push(num);
	}

	console.log("Lottery Check:", {
		contestNumber,
		drawDate,
		lotteryNumbers,
	});
}
