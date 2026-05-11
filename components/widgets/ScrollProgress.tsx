"use client";
import { useEffect, useRef } from "react";

const ScrollProgress = () => {
	const progressWrapRef = useRef<HTMLButtonElement>(null);
	const pathRef = useRef<SVGPathElement>(null);
	const pathLengthRef = useRef<number>(0);

	useEffect(() => {
		const progressWrap = progressWrapRef.current;
		const progressPath = pathRef.current;

		if (!progressWrap || !progressPath) return;

		const pathLength = progressPath.getTotalLength();
		pathLengthRef.current = pathLength;

		progressPath.style.transition = "none";
		progressPath.style.strokeDasharray = `${pathLength} ${pathLength}`;
		progressPath.style.strokeDashoffset = `${pathLength}`;
		progressPath.getBoundingClientRect();
		progressPath.style.transition = "stroke-dashoffset 10ms linear";

		const updateProgress = () => {
			const scrollTop = window.scrollY || window.pageYOffset;
			const height = document.documentElement.scrollHeight - window.innerHeight;

			const dashoffset = pathLength - (scrollTop * pathLength) / height;
			progressPath.style.strokeDashoffset = `${dashoffset}`;

			if (scrollTop > 50) {
				progressWrap.classList.add("active-progress");
			} else {
				progressWrap.classList.remove("active-progress");
			}
		};

		updateProgress();
		window.addEventListener("scroll", updateProgress);

		return () => {
			window.removeEventListener("scroll", updateProgress);
			progressPath.style.strokeDashoffset = `${pathLengthRef.current}`;
			progressWrap.classList.remove("active-progress");
		};
	}, []);

	const scrollToTop = (e: React.MouseEvent) => {
		e.preventDefault();

		document.documentElement.style.scrollBehavior = "auto";

		window.scrollTo({
			top: 0,
			behavior: "smooth",
		});

		setTimeout(() => {
			document.documentElement.style.scrollBehavior = "smooth";
		}, 1500);
	};

	return (
		<button
			ref={progressWrapRef}
			className="progress-wrap"
			aria-label="scroll indicator"
			title="Back to top"
			onClick={scrollToTop}
		>
			<span></span>
			<svg
				className="progress-circle svg-content"
				width="100%"
				height="100%"
				viewBox="-1 -1 102 102"
			>
				<path ref={pathRef} d="M50,1 a49,49 0 0,1 0,98 a49,49 0 0,1 0,-98" />
			</svg>
		</button>
	);
};

export default ScrollProgress;
