"use client";
import dynamic from "next/dynamic";

// const NiceSelectWrapper = dynamic(() => import("./NiceSelectWrapper"), {
// 	ssr: false,
// });
const CustomCursor = dynamic(() => import("./CustomCursor"), {
	ssr: false,
});
const ScrollProgress = dynamic(() => import("./ScrollProgress"), {
	ssr: false,
});
const CustomAnimations = dynamic(() => import("./CustomAnimations"), {
	ssr: false,
});
const InitAnimations = dynamic(() => import("./InitAnimations"), {
	ssr: false,
});

const ClientWrapper = () => {
	return (
		<>
			{/* <NiceSelectWrapper /> */}
			<CustomCursor />
			<ScrollProgress />
			<CustomAnimations />
			<InitAnimations />
		</>
	);
};

export default ClientWrapper;
