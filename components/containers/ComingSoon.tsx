"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import logo from "@/public/images/logo.png";
import thumb from "@/public/images/banner/banner-two-bg.png";
import { subscribeUser } from "@/actions/subscribe-form";

const ComingSoon = () => {
	const hourHandRef = useRef<HTMLDivElement>(null);
	const minuteHandRef = useRef<HTMLDivElement>(null);
	const secondHandRef = useRef<HTMLDivElement>(null);
	const dayRef = useRef<HTMLSpanElement>(null);
	const hourRef = useRef<HTMLSpanElement>(null);
	const minuteRef = useRef<HTMLSpanElement>(null);
	const secondRef = useRef<HTMLSpanElement>(null);
	const hourMarkersRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (hourMarkersRef.current) {
			hourMarkersRef.current.innerHTML = "";
			for (let i = 0; i < 12; i++) {
				const marker = document.createElement("div");
				marker.classList.add("hour-marker");
				const rotation = i * 30;
				marker.style.transform = `rotate(${rotation}deg) translateY(-216.25px)`;

				const hourText = document.createElement("span");
				hourText.textContent = i === 0 ? "12" : i.toString();
				hourText.style.transform = `rotate(-${rotation}deg)`;
				marker.appendChild(hourText);

				hourMarkersRef.current.appendChild(marker);
			}
		}

		const setClock = () => {
			const now = new Date();
			const seconds = now.getSeconds() + now.getMilliseconds() / 1000;
			const minutes = now.getMinutes() + seconds / 60;
			const hours = (now.getHours() % 12) + minutes / 60;

			const secondsDeg = (seconds / 60) * 360;
			const minutesDeg = (minutes / 60) * 360;
			const hoursDeg = (hours / 12) * 360;

			if (hourHandRef.current)
				hourHandRef.current.style.transform = `rotate(${hoursDeg}deg)`;
			if (minuteHandRef.current)
				minuteHandRef.current.style.transform = `rotate(${minutesDeg}deg)`;
			if (secondHandRef.current)
				secondHandRef.current.style.transform = `rotate(${secondsDeg}deg)`;
		};

		const clockInterval = setInterval(setClock, 50);
		setClock();

		const endDate = new Date();
		endDate.setDate(endDate.getDate() + 100);

		const updateCountdown = () => {
			const now = new Date();
			let timeRemaining = endDate.getTime() - now.getTime();

			if (timeRemaining <= 0) {
				endDate.setDate(endDate.getDate() + 100);
				timeRemaining = endDate.getTime() - now.getTime();
			}

			const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
			const hours = Math.floor(
				(timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
			);
			const minutes = Math.floor(
				(timeRemaining % (1000 * 60 * 60)) / (1000 * 60)
			);
			const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

			if (dayRef.current) dayRef.current.textContent = days.toString();
			if (hourRef.current)
				hourRef.current.textContent = hours < 10 ? `0${hours}` : `${hours}`;
			if (minuteRef.current)
				minuteRef.current.textContent =
					minutes < 10 ? `0${minutes}` : `${minutes}`;
			if (secondRef.current)
				secondRef.current.textContent =
					seconds < 10 ? `0${seconds}` : `${seconds}`;
		};

		const countdownInterval = setInterval(updateCountdown, 1000);
		updateCountdown();

		return () => {
			clearInterval(clockInterval);
			clearInterval(countdownInterval);
		};
	}, []);

	return (
		<section className="soon">
			<div className="container">
				<div className="row">
					<div className="col-12">
						<div className="soon__inner">
							<div className="soon__logo">
								<Link href="/">
									<Image src={logo} alt="Logo" />
								</Link>
							</div>
							<div className="countdown-wrapper">
								<div className="clock">
									<div className="hand hour-hand" ref={hourHandRef}></div>
									<div className="hand minute-hand" ref={minuteHandRef}></div>
									<div className="hand second-hand" ref={secondHandRef}></div>
									<div className="center-dot"></div>
									<div className="center-dot-orange"></div>
									<div className="hour-markers" ref={hourMarkersRef}></div>
									<div className="minute-markers"></div>
								</div>
								<div className="time-countdown">
									<div
										className="counter-column"
										data-aos="fade-up"
										data-aos-duration="600"
									>
										<span className="count day" ref={dayRef}>
											0
										</span>
										Days
									</div>
									<div
										className="counter-column"
										data-aos="fade-up"
										data-aos-duration="600"
										data-aos-delay="200"
									>
										<span className="count hour" ref={hourRef}>
											00
										</span>
										Hours
									</div>
									<div
										className="counter-column"
										data-aos="fade-up"
										data-aos-duration="600"
										data-aos-delay="400"
									>
										<span className="count minute" ref={minuteRef}>
											00
										</span>
										Minutes
									</div>
									<div
										className="counter-column"
										data-aos="fade-up"
										data-aos-duration="600"
										data-aos-delay="600"
									>
										<span className="count second" ref={secondRef}>
											00
										</span>
										Seconds
									</div>
								</div>
							</div>
							<div
								className="content"
								data-aos="fade-up"
								data-aos-duration="600"
								data-aos-delay="200"
							>
								<h4 className="title-animation">
									Something exciting is coming!
								</h4>
								<p className="mt-25">Exciting updates are on the way.</p>
								<p>
									<strong>Stay with us!</strong>
								</p>

								<form action={subscribeUser} className="mt-60">
									<div className="form-group">
										<input
											type="email"
											name="sub-email"
											id="subEmail"
											placeholder="Your Email"
											required
										/>
										<button
											type="submit"
											className="btn--primary"
											aria-label="subscribe our newsletter"
											title="subscribe our newsletter"
										>
											Subscribe
										</button>
									</div>
								</form>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div className="soon-bg">
				<Image src={thumb} alt="Background Image" />
			</div>
		</section>
	);
};

export default ComingSoon;
