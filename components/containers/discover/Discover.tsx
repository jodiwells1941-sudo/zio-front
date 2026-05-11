// components/discover.tsx
import React from "react";
import Link from "next/link";
import Image from "next/image";

type DiscoverFeature = {
  iconClass: string;
  title: string;
  description: string;
  extraClass?: string;
};

const FEATURES: DiscoverFeature[] = [
  {
    iconClass: "ti ti-device-gamepad-2",
    title: "Online Lottery Platform",
    description:
      "We prioritize fairness in every game. With provably fair technology, you can trust that every outcome is transparent and unbiased.",
  },
  {
    iconClass: "ti ti-wallet",
    title: "Secure Withdrawals",
    description:
      "We ensure that all deposits and withdrawals are processed quickly and securely, providing users with a smooth and reliable experience on the Zio Lottery platform.",
    extraClass: "mt-30",
  },
];

export default function Discover() {
  return (
    <section
      className="discover pt-120 pb-190"
      data-background="/images/discover/discover-bg.png"
    >
      <div className="container">
        <div className="row align-items-center rtl-header">
          <div className="col-12 col-lg-4 col-xl-5">
            <div className="discover__thumb">
              <div className="refer__thumb d-none d-lg-block">
                <div
                  className="thumb text-start"
                  data-aos="fade-right"
                  data-aos-duration="600"
                >
                  <Image
                    src="/images/discover/thumb.png"
                    alt="Image"
                    width={100} height={100}
                  />
                </div>

                <div className="btc">
                  <Image src="/images/discover/one.png" alt="Image" width={100} height={100} />
                </div>
                <div className="eth">
                  <Image src="/images/discover/two.png" alt="Image" width={100} height={100} />
                </div>
                <div className="arrow">
                  <Image src="/images/discover/three.png" alt="Image" width={100} height={100} />
                </div>
                <div className="btc-alt">
                  <Image src="/images/discover/four.png" alt="Image" width={100} height={100} />
                </div>
                <div className="eth-alt">
                  <Image src="/images/discover/vr.png" alt="Image" width={100} height={100} />
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-7 offset-lg-1 col-xl-6 offset-xl-1">
            <div
              className="discover__content"
              data-aos="fade-left"
              data-aos-duration="600"
              data-aos-delay="200"
            >
              <div className="section__content text-start">
                <span className="fw-6 secondary-text text-xl">
                  <strong>Why,</strong> Choose Us!
                </span>
                <h2 className="title-animation fw-6 mt-25">
                  Discover Why to Choose <span>Zio Lottery</span> for Online Lottery
                </h2>
                <p className="mt-25">
                  Our commitment to providing an exceptional online lottery experience is supported by advanced technology and a transparent system designed to ensure fairness, security, and reliability for all participants.
                </p>
              </div>

              <div className="about__content-group mt-40">
                {FEATURES.map((f, idx) => (
                  <div
                    key={idx}
                    className={`about__content-single ${f.extraClass ?? ""}`}
                  >
                    <div className="thumb">
                      <i className={f.iconClass}></i>
                    </div>
                    <div className="content">
                      <h6 className="fw-6">{f.title}</h6>
                      <p className="text-sm mt-8">{f.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-40">
                <Link
                  href="/about-us"
                  aria-label="Read More"
                  title="Read More"
                  className="btn--primary"
                >
                  Read More <i className="ti ti-arrow-narrow-right"></i>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="left-thumb">
        <Image src="/images/square.png" alt="Image" width={100} height={100} />
      </div>
      <div className="right-thumb">
        <Image src="/images/tower.png" alt="Image" width={100} height={100} />
      </div>
      <div className="chart">
        <Image src="/images/chart.png" alt="Image" width={100} height={100} />
      </div>
      <div className="left-th">
        <Image src="/images/right-th.png" alt="Image" width={100} height={100} />
      </div>
    </section>
  );
}
