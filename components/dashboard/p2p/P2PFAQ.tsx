"use client";

import React from "react";

const items = [
  "How to Avoid Common P2P Scams",
  "How do I make a payment?",
  "Is it safe to make payment to the seller?",
  "What should I look out for during the payment transfer?",
  "What do I do if the payment failed?",
];

export default function P2PFAQ() {
  return (
    <div className="p2pFaq">
      <div className="p2pFaqTitle">FAQ</div>

      <div className="accordion p2pAcc" id="p2pFaqAcc">
        {items.map((t, i) => (
          <div className="accordion-item p2pAccItem" key={i}>
            <h2 className="accordion-header">
              <button
                className={`accordion-button p2pAccBtn ${i === 0 ? "" : "collapsed"}`}
                type="button"
                data-bs-toggle="collapse"
                data-bs-target={`#faq${i}`}
              >
                {t}
              </button>
            </h2>
            <div
              id={`faq${i}`}
              className={`accordion-collapse collapse ${i === 0 ? "show" : ""}`}
              data-bs-parent="#p2pFaqAcc"
            >
              <div className="accordion-body p2pAccBody">
                Put your answer content here.
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}