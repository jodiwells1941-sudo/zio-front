import Image from "next/image";

const TopRated = () => {
    return (
        <section className="about about-alternate pt-120 pb-120">
            <div className="container">
                <div className="row align-items-center">

                    {/* Left Content */}
                    <div className="col-12 col-lg-6 col-xl-6">
                        <div
                            className="about__content"
                            data-aos="fade-right"
                            data-aos-duration="600"
                        >
                            <div className="section__content text-start">
                                <span className="fw-6 secondary-text text-xl">
                                    <strong>Trusted,</strong> by Thousands of Winners
                                </span>

                                <h2 className="title-animation fw-6 mt-25">
                                    Join the Top-Rated Lottery, <span>Play Here</span>
                                </h2>

                                <p className="mt-25">
                                    We go beyond simply offering lottery games; we provide a trusted,
                                    secure environment where millions of players come to enjoy.
                                </p>
                            </div>

                            <hr className="divider mt-35 mb-40" />

                            <div className="about__content-group">
                                <div className="about__content-single">
                                    <div className="thumb">
                                        <i className="ti ti-device-gamepad-2"></i>
                                    </div>
                                    <div className="content">
                                        <h6 className="fw-6">Guaranteed Fair Play</h6>
                                        <p className="text-sm mt-8">
                                            We prioritize fair gameplay with verified lottery draws processes
                                        </p>
                                    </div>
                                </div>

                                <span className="divideer d-none d-xxl-block"></span>

                                <div className="about__content-single">
                                    <div className="thumb">
                                        <i className="ti ti-wallet"></i>
                                    </div>
                                    <div className="content">
                                        <h6 className="fw-6">Instant Secure Payouts</h6>
                                        <p className="text-sm mt-8">
                                            Enjoy seamless and quick payouts with the highest place.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <ul className="list-group-row mt-40">
                                <li><i className="ti ti-check"></i> Risk Management Consulting</li>
                                <li><i className="ti ti-check"></i> Customer Relationship</li>
                                <li><i className="ti ti-check"></i> Leadership Development</li>
                                <li><i className="ti ti-check"></i> Supply Chain Optimization</li>
                            </ul>

                            <div className="mt-40">
                                <a
                                    href="/lottery"
                                    className="btn--primary"
                                >
                                    Play Lottery <i className="ti ti-arrow-narrow-right"></i>
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Right Images */}
                    <div className="col-12 col-lg-6 col-xl-5 offset-xl-1">
                        <div className="authentication__thumb text-center d-none d-lg-block">

                            <div className="circle-img">
                                <Image
                                    src="/assets/images/authentication/circle.png"
                                    alt="Circle"
                                    width={120}
                                    height={120}
                                />
                            </div>

                            <div className="thumb">
                                <Image
                                    src="/assets/images/authentication/thumb.png"
                                    alt="Thumb"
                                    width={400}
                                    height={400}
                                    data-aos="zoom-in"
                                    data-aos-duration="600"
                                    data-aos-delay="200"
                                />
                            </div>

                            <div className="number-img">
                                <Image
                                    src="/assets/images/authentication/numbers.png"
                                    alt="Numbers"
                                    width={160}
                                    height={160}
                                />
                            </div>

                        </div>
                    </div>

                </div>
            </div>

            {/* Floating Images */}
            <div className="left-thumb">
                <Image
                    src="/assets/images/spring.png"
                    alt="Spring"
                    width={100}
                    height={100}
                />
            </div>

            <div className="rocket">
                <Image
                    src="/assets/images/rocket-sm.png"
                    alt="Rocket"
                    width={80}
                    height={80}
                />
            </div>
        </section>
    );
};

export default TopRated;
