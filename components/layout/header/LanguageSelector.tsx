"use client";
import { useEffect, useRef, useState } from "react";
import LanguageData from "@/public/data/langauge-data";

const LanguageSelector: React.FC = () => {
	const [isOpen, setIsOpen] = useState(false);
	const languageBoxRef = useRef<HTMLDivElement>(null);

	const handleToggle = () => {
		setIsOpen((prev) => !prev);
	};

	const handleClose = () => {
		setIsOpen(false);
	};

	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (
				languageBoxRef.current &&
				!languageBoxRef.current.contains(e.target as Node)
			) {
				setIsOpen(false);
			}
		};

		document.addEventListener("click", handleClickOutside);
		return () => document.removeEventListener("click", handleClickOutside);
	}, []);

	return (
		<div className="language-box" ref={languageBoxRef}>
			<button
				className={`language-select ${isOpen ? "active" : ""}`}
				onClick={handleToggle}
				aria-label="select language"
				title="select language"
				type="button"
			>
				<i className="ti ti-world"></i>
			</button>

			<ul className={isOpen ? "language-select-active" : ""}>
				{LanguageData.map((item) => (
					<li key={item.id} onClick={handleClose}>
						{item.label}
					</li>
				))}
			</ul>
		</div>
	);
};

export default LanguageSelector;
