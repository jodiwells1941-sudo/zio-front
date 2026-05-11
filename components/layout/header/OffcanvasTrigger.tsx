"use client";
import { useContext } from "react";
import { HeaderContext } from "./HeaderClient";

const OffcanvasTrigger = () => {
	const context = useContext(HeaderContext);

	if (!context) return null;

	return (
		<button
			className={`open-offcanvas-nav d-flex d-xl-none ${
				context.isOffcanvasOpen ? "open-offcanvas-nav-active" : ""
			}`}
			title="open offcanvas menu"
			onClick={context.openOffcanvas}
		>
			<span className="icon-bar top-bar"></span>
			<span className="icon-bar middle-bar"></span>
			<span className="icon-bar bottom-bar"></span>
		</button>
	);
};

export default OffcanvasTrigger;
