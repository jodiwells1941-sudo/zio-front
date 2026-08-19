"use client";

import { useRouter } from "next/navigation";
import React from "react";

const benefits = [
  {
    icon: "fa-solid fa-chart-line",
    title: "Higher Earnings",
    text: (
      <>
        Earn <strong>2%</strong> commission from every successful order.
      </>
    ),
    color: "purple",
  },
  {
    icon: "fa-solid fa-shield-halved",
    title: "Trusted Badge",
    text: <>Get a verified merchant badge and build trust.</>,
    color: "green",
  },
  {
    icon: "fa-solid fa-users",
    title: "More Visibility",
    text: <>Your ads get more exposure in the marketplace.</>,
    color: "yellow",
  },
  {
    icon: "fa-solid fa-headset",
    title: "Priority Support",
    text: <>Get faster support for your business.</>,
    color: "blue",
  },
];

const steps = [
  {
    number: "1",
    title: "Apply",
    icon: "fa-solid fa-user-plus",
    description: "Submit your merchant application and basic information.",
  },
  {
    number: "2",
    title: "Verification",
    icon: "fa-solid fa-shield-halved",
    description: "Complete KYC verification and submit required documents.",
  },
  {
    number: "3",
    title: "Security Deposit",
    icon: "fa-solid fa-wallet",
    description: "Deposit security amount to activate your merchant account.",
  },
  {
    number: "4",
    title: "Start Trading",
    icon: "fa-solid fa-store",
    description: "Create ads and start earning commission on orders.",
  },
];

export default function BecomeMerchant() {
  const router = useRouter();

  return (
    <section className="merchant-landing rounded">

      {/* Header */}
      <div className="merchant-heading">
        <div className="merchant-heading-icon">
          <i className="fa-solid fa-star" />
        </div>

        <div>
          <h1>Become a Merchant</h1>
          <p>
            Grow your business, build trust, and earn{" "}
            <strong>2%</strong> commission on every completed order.
          </p>
        </div>
      </div>

      {/* Hero */}
      <div className="merchant-hero">
        <div className="merchant-hero-content">
          <h2>Why Become a Merchant?</h2>

          <ul>
            <li>
              <i className="fa-regular fa-circle-check" />
              Earn <strong>2%</strong> commission on every completed order
            </li>

            <li>
              <i className="fa-regular fa-circle-check" />
              Create unlimited buy &amp; sell advertisements
            </li>

            <li>
              <i className="fa-regular fa-circle-check" />
              Build your reputation and get more buyers
            </li>

            <li>
              <i className="fa-regular fa-circle-check" />
              Priority support and higher order limit
            </li>
          </ul>
        </div>

        {/* Replace with your actual merchant illustration */}
        <div className="merchant-hero-art">
          <div className="merchant-store">
            <div className="store-roof">
              <span />
              <span />
              <span />
              <span />
              <span />
            </div>

            <div className="store-body">
              <div className="store-window">
                <i className="fa-solid fa-store" />
              </div>
            </div>

            <div className="store-sign">
              <i className="fa-solid fa-star" />
            </div>
          </div>

          <div className="coin coin-one">
            <i className="fa-solid fa-coins" />
          </div>

          <div className="coin coin-two">
            <i className="fa-solid fa-coins" />
          </div>

          <div className="coin coin-three">
            <span>₮</span>
          </div>

          <div className="hero-glow" />
        </div>
      </div>

      {/* Benefits */}
      <div className="merchant-section">
        <h3>Merchant Benefits</h3>

        <div className="row g-3">
          {benefits.map((benefit) => (
            <div className="col-12 col-sm-6 col-xl-3" key={benefit.title}>
              <div className="benefit-card">
                <div className={`benefit-icon ${benefit.color}`}>
                  <i className={benefit.icon} />
                </div>

                <h4>{benefit.title}</h4>
                <p>{benefit.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div className="merchant-section merchant-how-section">
        <h3>How It Works</h3>

        <div className="row g-3">
          {steps.map((step, index) => (
            <React.Fragment key={step.number}>
              <div className="col-12 col-md-6 col-xl">
                <div className="merchant-step">
                  <div className="step-icon">
                    <i className={step.icon} />
                  </div>

                  <h4>
                    {step.number}. {step.title}
                  </h4>

                  <p>{step.description}</p>
                </div>
              </div>

              {index < steps.length - 1 && (
                <div className="step-arrow">
                  <i className="fa-solid fa-arrow-right" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="merchant-cta">
        <div className="cta-glow" />

        <h2>Ready to start your journey?</h2>

        <p>Join our growing community of trusted merchants.</p>

        <button type="button" className="merchant-primary-btn" onClick={() => router.push("/dashboard/merchant/application")}>
          Apply Now
          <i className="fa-solid fa-arrow-right" />
        </button>

        <div className="secure-text">
          <i className="fa-solid fa-lock" />
          Your information is 100% secure and encrypted.
        </div>
      </div>
    </section>
  );
}