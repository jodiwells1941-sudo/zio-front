"use client";

import { useEffect } from "react";

const CustomAnimations = () => {
	useEffect(() => {
		if (typeof window === "undefined") return;

		const tiltInstances: HTMLElement[] = [];

		const init = async () => {
			try {
				// Dynamically import client-only libraries
				const gsap = (await import("gsap")).default;
				const ScrollTrigger = (await import("gsap/ScrollTrigger")).default;
				const SplitType = (await import("split-type")).default;
				const VanillaTilt = (await import("vanilla-tilt")).default;

				gsap.registerPlugin(ScrollTrigger);

				// --- GSAP Progress Bars ---
				document
					.querySelectorAll<HTMLElement>(".pg-single")
					.forEach((element) => {
						const wrapper = element.querySelector<HTMLElement>(
							".progress-bar-wrapper"
						);
						const percentBar = element.querySelector<HTMLElement>(
							".progress-bar-percent"
						);
						const percentText =
							element.querySelector<HTMLElement>(".percent-value");

						if (!wrapper || !percentBar || !percentText) return;

						const percentAttr = wrapper.getAttribute("data-percent");
						if (!percentAttr) return;
						const percent = parseInt(percentAttr, 10);

						const tl = gsap.timeline({
							defaults: { duration: 2 },
							scrollTrigger: {
								trigger: element,
								start: "top 80%",
								end: "bottom 20%",
								toggleActions: "play none none none",
							},
						});

						tl.fromTo(percentBar, { width: "0%" }, { width: `${percent}%` });
						tl.from(
							percentText,
							{
								textContent: 0,
								snap: { textContent: 5 },
							},
							"<"
						);
					});

				// --- GSAP Title Split Animations ---
				document
					.querySelectorAll<HTMLElement>(".title-animation")
					.forEach((element) => {
						const split = new SplitType(element, { types: "chars,words" });
						const tl = gsap.timeline({
							scrollTrigger: {
								trigger: element,
								start: "top 90%",
								end: "bottom 60%",
								toggleActions: "play none none none",
							},
						});
						tl.from(split.chars, {
							duration: 0.8,
							x: 40,
							autoAlpha: 0,
							stagger: 0.05,
							ease: "back.out",
						});
					});

				// --- Vanilla Tilt ---
				document.querySelectorAll<HTMLElement>(".tilt").forEach((el) => {
					VanillaTilt.init(el, {
						max: 5,
						speed: 3000,
					});
					tiltInstances.push(el);
				});
			} catch (error) {
				console.error("Client-only animation error:", error);
			}
		};

		const handlePrivacyClick = (event: Event) => {
			const sidebar = document.querySelector(".privacy__sidebar");
			const target = (event.target as HTMLElement).closest(".privacy-btn");
			if (target && sidebar) {
				sidebar.querySelectorAll(".privacy-btn").forEach((btn) => {
					btn.classList.remove("active");
				});
				target.classList.add("active");
			}
		};

		const sidebar = document.querySelector(".privacy__sidebar");
		sidebar?.addEventListener("click", handlePrivacyClick);

		const timeoutId = setTimeout(() => {
			init();
		}, 100);

		return () => {
			clearTimeout(timeoutId);

			// Cleanup GSAP scroll triggers
			import("gsap/ScrollTrigger").then(({ default: ScrollTrigger }) => {
				ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
			});

			// Cleanup VanillaTilt
			tiltInstances.forEach((el) => {
				(
					el as HTMLElement & { vanillaTilt?: { destroy: () => void } }
				).vanillaTilt?.destroy();
			});

			sidebar?.removeEventListener("click", handlePrivacyClick);
		};
	}, []);

	return null;
};

export default CustomAnimations;
