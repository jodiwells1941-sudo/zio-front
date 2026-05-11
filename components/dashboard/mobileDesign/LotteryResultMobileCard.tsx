"use client";

import React from "react";
import styles from "./dashboard.module.css";

type Props = {
  bgImage?: string;
  badgeText?: string;
  title?: string;
  ctaText?: string;
  onCtaClick?: () => void;
};

export default function LotteryResultMobileCard({
  bgImage = "/images/winnig_img.svg",
  badgeText = "Live Draw",
  title = "Lottery Result",
  ctaText = "Check My Number",
  onCtaClick,
}: Props) {
  return (
    <section className={styles.resultSection}>
      <div className={styles.resultCard}>
        {/* top image */}
        <div
          className={styles.resultImage}
          style={{ backgroundImage: `url(${bgImage})` }}
          aria-label="Lottery Result"
        >
          <div className={styles.resultImageOverlay} />
        </div>

        {/* bottom content */}
        <div className={styles.resultBottom}>
          <div className={styles.resultLeft}>
            <span className={styles.resultBadge}>{badgeText}</span>
            <div className={styles.resultTitle}>{title}</div>
          </div>

          <button className={styles.resultCta} type="button" onClick={onCtaClick}>
            {ctaText}
          </button>
        </div>
      </div>
    </section>
  );
}