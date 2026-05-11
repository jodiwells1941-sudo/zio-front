"use client";

import React from "react";
import Image from "next/image";
import styles from "./dashboard.module.css";

type Winner = {
  place: "1st" | "2nd" | "3rd";
  roundCode: string;
  avatarSrc: string;
  name: string;
  username: string;
  won: number;
  tickets: number;
  ring: "green" | "purple" | "blue";
};

function WinnerCard({ w }: { w: Winner }) {
  return (
    <div className={styles.card}>
      <div className={styles.cardTop}>
        <div className={styles.placePill}>
          <i className="fa-solid fa-trophy" />
          <span>{w.place}</span>
        </div>

        <div className={styles.roundPill}>{w.roundCode}</div>
      </div>

      <div className={`${styles.avatarWrap} ${styles[`ring_${w.ring}`]}`}>
        <Image
          src={w.avatarSrc}
          alt={w.name}
          width={78}
          height={78}
          className={styles.avatar}
        />
        <span className={styles.check}>
          <i className="fa-solid fa-check" />
        </span>
      </div>

      <div className={styles.title}>{w.name}</div>
      <div className={styles.username}>{w.username}</div>

      <div className={styles.wonBox}>WON ${w.won.toLocaleString()}</div>

      <div className={styles.tickets}>
        Total Ticket : <span>{w.tickets}</span>
      </div>

      <button className={styles.detailsBtn} type="button">
        View Details <i className="fa-solid fa-arrow-right" />
      </button>
    </div>
  );
}

export default function TopWinnersMobileCard() {
  const winners: Winner[] = [
    {
      place: "1st",
      roundCode: "R-45",
      avatarSrc: "/images/avatar/a-six.png", // change to your image path
      name: "Lucky Day",
      username: "@koodyl_lilly",
      won: 99999,
      tickets: 200,
      ring: "green",
    },
    {
      place: "2nd",
      roundCode: "R-46",
      avatarSrc: "/images/avatar/a-six.png", // change to your image path
      name: "Lucky Day",
      username: "@jacob_iyhd",
      won: 85476,
      tickets: 142,
      ring: "purple",
    },
  ];

  return (
    <section className={styles.section}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.heading}>
          Top <span className={styles.headingAccent}>Winners</span>
        </div>

        <a href="#" className={styles.seeAll}>
          See All <i className="fa-solid fa-arrow-right" />
        </a>
      </div>

      {/* Cards row */}
      <div className={styles.row}>
        {winners.map((w) => (
          <WinnerCard key={`${w.place}-${w.roundCode}`} w={w} />
        ))}
      </div>

      {/* Dots */}
      <div className={styles.dots}>
        <span className={styles.dot} />
        <span className={`${styles.dot} ${styles.dotActive}`} />
        <span className={styles.dot} />
      </div>
    </section>
  );
}