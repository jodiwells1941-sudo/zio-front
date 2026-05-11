"use client";
import { useContext } from "react";
import { HeaderContext } from "./HeaderClient";

const SearchTrigger = () => {
	const context = useContext(HeaderContext);

	if (!context) return null;

	return (
		<button
			className="open-search"
			title="open search box"
			onClick={context.openSearch}
		>
			<i className="ti ti-search"></i>
		</button>
	);
};

export default SearchTrigger;
