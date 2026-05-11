"use client";

import React from "react";
import styles from "./dashboard.module.css";

type Props = {
  title?: string;
  subtitle?: string;
  bgImageUrl?: string; // e.g. "/images/new/refer-bg.png"
  onClick?: () => void;
};

export default function ReferEarnMobileCard({
  title = "Refer & Earn Bonus\nTickets",
  subtitle = "Invite your friends and receive 1 free ticket for every\nsignup they complete.",
  bgImageUrl = "/images/new/refer-bg.png", // change to your actual image
  onClick,
}: Props) {
  return (
   <section className={styles.referWrap}>
    <div
      className={styles.referCard}
      style={{ backgroundImage: `url(${bgImageUrl})` }}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => (e.key === "Enter" ? onClick?.() : null)}
    >
      <div className={styles.referOverlay} />

      <div className={styles.referContent}>
        <h3 className={styles.referTitle}>
          {title.split("\n").map((t, i) => (
            <span key={i} className={styles.referLine}>
              {t}
            </span>
          ))}
        </h3>

        <p className={styles.referSubtitle}>
          {subtitle.split("\n").map((t, i) => (
            <span key={i} className={styles.referLine} >
              {t}
            </span>
          ))}
        </p>
      </div>

      <button className={styles.referAction} type="button" aria-label="Open">
        <i className="fa-solid fa-arrow-right" />
      </button>
    </div>
  </section>
  );
}