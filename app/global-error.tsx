"use client";
interface GlobalErrorProps {
	error: Error;
	reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
	return (
		<div className="global-error-wrapper">
			<div className="global-error-content">
				<h1>Application Error</h1>
				<p>{error.message}</p>
				<button onClick={reset}>Reload Application</button>
			</div>
		</div>
	);
}
