"use client";
import { useEffect } from "react";
import NiceSelect from "nice-select2";
import "nice-select2/dist/css/nice-select2.css";

const NiceSelectWrapper: React.FC<{ children?: React.ReactNode }> = ({
	children,
}) => {
	useEffect(() => {
		const selects = document.querySelectorAll("select");

		selects.forEach((select) => {
			if (!select.classList.contains("nice-select")) {
				new NiceSelect(select);
			}
		});

		return () => {
			selects.forEach((select) => {
				if (select._niceSelectInstance?.unbind) {
					select._niceSelectInstance.unbind();
				}
			});
		};
	}, []);

	return <>{children}</>;
};

export default NiceSelectWrapper;
