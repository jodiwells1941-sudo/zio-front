"use client";
import { useState } from "react";
import Image from "next/image";
import visa from "@/public/images/payment/visa.png";
import apple from "@/public/images/payment/apple.png";
import bit from "@/public/images/payment/bit.png";
import dines from "@/public/images/payment/dines.png";
import discover from "@/public/images/payment/discover.png";
import gpay from "@/public/images/payment/gpay.png";
import mastercard from "@/public/images/payment/mastercard.png";
import paypal from "@/public/images/payment/paypal.png";
import verifone from "@/public/images/payment/verifone.png";
import amex from "@/public/images/payment/amex.png";

const NUMBERS = Array.from({ length: 40 }, (_, i) => i + 1);
const POWER_NUMBERS = Array.from({ length: 30 }, (_, i) => i + 1);

const LotteryPick = () => {
	const [selectedQuickPick, setSelectedQuickPick] = useState<number[]>([]);
	const [selectedPowerPick, setSelectedPowerPick] = useState<number | null>(
		null
	);
	const [luckyNumbers, setLuckyNumbers] = useState<number[]>([]);
	const [luckyPower, setLuckyPower] = useState<number | null>(null);

	const toggleQuickPick = (num: number) => {
		setSelectedQuickPick((prev) => {
			if (prev.includes(num)) return prev.filter((n) => n !== num);
			if (prev.length < 5) return [...prev, num];
			return prev;
		});
	};

	const togglePowerPick = (num: number) => {
		setSelectedPowerPick((prev) => (prev === num ? null : num));
	};

	const handleQuickPick = () => {
		const randomNumbers: number[] = [];
		while (randomNumbers.length < 5) {
			const rand = Math.floor(Math.random() * 40) + 1;
			if (!randomNumbers.includes(rand)) {
				randomNumbers.push(rand);
			}
		}

		const power = Math.floor(Math.random() * 30) + 1;

		setSelectedQuickPick(randomNumbers);
		setSelectedPowerPick(power);
	};

	const handleClearAll = () => {
		setSelectedQuickPick([]);
		setSelectedPowerPick(null);
		setLuckyNumbers([]);
		setLuckyPower(null);
	};

	const handleAddNumbers = () => {
		if (selectedQuickPick.length !== 5 || !selectedPowerPick) {
			alert("Please select exactly 5 quick numbers and 1 power number.");
			return;
		}

		setLuckyNumbers(selectedQuickPick);
		setLuckyPower(selectedPowerPick);
		setSelectedQuickPick([]);
		setSelectedPowerPick(null);
	};

	const handleDelete = () => {
		setLuckyNumbers([]);
		setLuckyPower(null);
	};

	const isDeactive = (num: number) =>
		selectedQuickPick.length >= 5 && !selectedQuickPick.includes(num);

	return (
		<div className="row gutter-40">
			<div className="col-12">
				<div className="lottery-card">
					<div className="lt-alternate-card">
						<div className="lottery-intro mb-35">
							<h5 className="title-animation fw-6 neutral-top">Pick Numbers</h5>
							<div className="lottery-intro__action">
								<button className="quick-pick" onClick={handleQuickPick}>
									Quick Pick
								</button>
								<button className="clear-all" onClick={handleClearAll}>
									Clear All
								</button>
								<button className="add-numbers" onClick={handleAddNumbers}>
									Add Numbers
								</button>
							</div>
						</div>

						<div className="pick-numbers">
							<div className="pick-number__single">
								<p className="text-xl fw-5 neutral-top">Picks 5 Numbers</p>
								<ul className="pick-number-list quick-pick-list mt-20">
									{NUMBERS.map((num) => (
										<li
											key={num}
											className={`${
												selectedQuickPick.includes(num) ? "active" : ""
											} ${isDeactive(num) ? "deactive" : ""}`}
											onClick={() => toggleQuickPick(num)}
										>
											{num}
										</li>
									))}
								</ul>
							</div>

							<hr className="divider mt-10 mb-10" />

							<div className="pick-number__single">
								<p className="text-xl fw-5 neutral-top">Pick 1 Power Ball</p>
								<ul className="pick-number-list power-pick-list mt-20">
									{POWER_NUMBERS.map((num) => (
										<li
											key={num}
											className={`${
												selectedPowerPick === num ? "active" : ""
											} ${
												selectedPowerPick && selectedPowerPick !== num
													? "deactive"
													: ""
											}`}
											onClick={() => togglePowerPick(num)}
										>
											{num}
										</li>
									))}
								</ul>
							</div>
						</div>
					</div>
					<div className="lt-alternate-card mt-16">
						<div className="lottery-intro mb-35">
							<h5 className="title-animation fw-6 neutral-top">
								Selected Numbers
							</h5>
							<div className="lottery-intro__action">
								<button className="delete-all dlt" onClick={handleDelete}>
									Delete All
								</button>
							</div>
						</div>

						<div className="lt-alternate-view">
							<div className="lt-alternate-single">
								<h6 className="fw-6">Lucky Numbers</h6>
								<div className="lt-luck-wrapper mt-16">
									{[...Array(5)].map((_, idx) => (
										<span
											key={idx}
											className={`lucky-number ${
												luckyNumbers[idx] ? "active" : ""
											}`}
										>
											{luckyNumbers[idx] || "00"}
										</span>
									))}
								</div>
							</div>
							<div className="lt-alternate-single">
								<h6 className="fw-6">Lucky Power Ball</h6>
								<div className="lt-luck-wrapper mt-16">
									<span
										className={`lucky-power-number ${
											luckyPower ? "active" : ""
										}`}
									>
										{luckyPower || "00"}
									</span>
								</div>
							</div>
						</div>

						<hr className="divider mt-40 mb-40" />

						<div className="price-meta mt-40">
							<div className="content">
								<h6 className="neutral-top fw-6 secondary-text">$945.58</h6>
								<p className="text-sm mt-6">Ticket Price</p>
							</div>
							<div className="cta">
								<button className="btn--primary">Buy Ticket</button>
							</div>
						</div>
					</div>
					<hr className="divider mt-40 mb-30" />
					<div className="lt-alternate-card mt-16">
						<div className="payment-methods">
							<p className="fw-6 text-xl">Payment methods we accept :</p>
							<div className="payment-methods__inner mt-24">
								{[
									visa,
									apple,
									bit,
									dines,
									discover,
									gpay,
									mastercard,
									paypal,
									verifone,
									amex,
								].map((img, i) => (
									<div className="payment-method-single" key={i}>
										<Image src={img} alt="payment method" />
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default LotteryPick;
