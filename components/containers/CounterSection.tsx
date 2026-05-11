"use client";

import dynamic from "next/dynamic";

const Counter = dynamic(
	() => import("@/components/widgets/Counter")
);

const CounterSection = () => {
	return (
		<section className="counter">
			<div className="container">
				<div className="row gutter-24">
					<div
						className="col-12 col-md-6 col-xl-3"
						data-aos="fade-up"
						data-aos-duration="100%"
					>
						<div className="counter__single text-center tilt">
							<div className="counter__single-thumb">
								<i className="ti ti-currency-bitcoin"></i>
							</div>
							<div className="counter__single-content mt-25">
								<h3 className="fw-6">
									<Counter value={15} /> M<span className="prefix">+</span>
								</h3>
								<p className="text-lg fw-5">Total Lottery Tickets Purchased</p>
							</div>
						</div>
					</div>
					<div
						className="col-12 col-md-6 col-xl-3"
						data-aos="fade-up"
						data-aos-duration="100%"
						data-aos-delay="200"
					>
						<div className="counter__single text-center tilt">
							<div className="counter__single-thumb">
								<i className="ti ti-users"></i>
							</div>
							<div className="counter__single-content mt-25">
								<h3 className="fw-6">
									<Counter value={350} /> K<span className="prefix">+</span>
								</h3>
								<p className="text-lg fw-5">Happy Players Worldwide</p>
							</div>
						</div>
					</div>
					<div
						className="col-12 col-md-6 col-xl-3"
						data-aos="fade-up"
						data-aos-duration="100%"
						data-aos-delay="400"
					>
						<div className="counter__single text-center tilt">
							<div className="counter__single-thumb">
								<i className="ti ti-device-gamepad-2"></i>
							</div>
							<div className="counter__single-content mt-25">
								<h3 className="fw-6">
									<Counter value={900} />K<span className="prefix">+</span>
								</h3>
								<p className="text-lg fw-5">Games Played Daily</p>
							</div>
						</div>
					</div>
					<div
						className="col-12 col-md-6 col-xl-3"
						data-aos="fade-up"
						data-aos-duration="100%"
						data-aos-delay="600"
					>
						<div className="counter__single text-center tilt">
							<div className="counter__single-thumb">
								<i className="ti ti-wallet"></i>
							</div>
							<div className="counter__single-content mt-25">
								<h3 className="fw-6">
									<Counter value={10} />M<span className="prefix">+</span>
								</h3>
								<p className="text-lg fw-5">Total Lottery Rewards Paid</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default CounterSection;
