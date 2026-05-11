"use server";

export async function handlePayment(formData: FormData) {
	const priceBtc = formData.get("price-btc")?.toString() || "";
	const paymentMethod = formData.get("pay-method")?.toString() || "";

	console.log("Payment Info:", { priceBtc, paymentMethod });
}
