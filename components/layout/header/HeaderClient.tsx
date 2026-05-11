"use client";

import { useEffect, useState, ReactNode, createContext } from "react";
import dynamic from "next/dynamic";
import SearchPopup from "./SearchPopup";

const OffCanvasMenu = dynamic(() => import("./OffCanvasMenu"), { ssr: false });

interface Props {
	children: ReactNode;
}

interface HeaderContextProps {
	openSearch: () => void;
	openOffcanvas: () => void;
	isOffcanvasOpen: boolean;
}

export const HeaderContext = createContext<HeaderContextProps | null>(null);

const HeaderClient = ({ children }: Props) => {
	const [isOffcanvasOpen, setIsOffcanvasOpen] = useState(false);
	const [isSearchOpen, setIsSearchOpen] = useState(false);
	const [scrolled, setScrolled] = useState(false);

	const openOffcanvas = () => setIsOffcanvasOpen(true);
	const closeOffcanvas = () => setIsOffcanvasOpen(false);

	const openSearch = () => setIsSearchOpen(true);
	const closeSearch = () => setIsSearchOpen(false);

	useEffect(() => {
		const handleScroll = () => {
			setScrolled(window.scrollY > 45);
		};

		window.addEventListener("scroll", handleScroll);
		handleScroll();
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	useEffect(() => {
		const header = document.querySelector(".header");
		if (header) {
			if (scrolled) header.classList.add("sticky-header");
			else header.classList.remove("sticky-header");
		}
	}, [scrolled]);

	useEffect(() => {
		if (isSearchOpen) {
			document.body.classList.add("search-active");
		} else {
			document.body.classList.remove("search-active");
		}
		return () => {
			document.body.classList.remove("search-active");
		};
	}, [isSearchOpen]);

	return (
		<HeaderContext.Provider
			value={{ openSearch, openOffcanvas, isOffcanvasOpen }}
		>
			{children}
			<SearchPopup onClose={closeSearch} />
			<OffCanvasMenu isOpen={isOffcanvasOpen} onClose={closeOffcanvas} />
		</HeaderContext.Provider>
	);
};

export default HeaderClient;
