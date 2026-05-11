import Image from "next/image";
import React from "react";

export type Champion = {
  serial: string; // "#1"
  avatarSrc: string;
  name: string;
  wonText: string; // "Won 45 minutes ago"
  numbers: string;
  activeNumber?: number;
  drawDate: string; // "27/11/24"
  aosDelay?: number;
};

type Props = {
  item: Champion;
  className?: string;
};

const LotteryWinnerSlider: React.FC<Props> = ({ item, className }) => {
  return (
    <div
      className={`col-12 col-md-6 col-xl-4 col-xxl-3 ${className ?? ""}`}
      data-aos="fade-up"
      data-aos-duration="600"
      {...(typeof item.aosDelay === "number" ? { "data-aos-delay": item.aosDelay } : {})}
    >
      <div className="lt-type__single champion__single text-center tilt">
        <span className="serial">{item.serial}</span>
        <span className="price">R-458</span>

        <div className="thumb">
          <Image width={100} height={100} src={item.avatarSrc} alt="Image" />
        </div>

        <div className="content mt-20">
          <p className="fw-7 text-warning text-xxl">$999.89</p>
          <h6 className="fw-6">{item.name} </h6>
          <p className="text-sm mt-4 primary-text pb-1">{item.wonText}</p>
          <p><b>Ticket No : </b></p>
        </div>

        <div className="cta mt-2 pt-1">
          <ul className="champion">
            {Array.from(
              { length: Math.ceil(item.numbers.length / 2) },
              (_, i) => item.numbers.slice(i * 2, i * 2 + 2)
            ).map((group, index) => (
              <li
                key={index}
                className={index === item.activeNumber ? "active" : undefined}
              >
                {group}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-3">
          <p className="text-md text-yellow"><b>Lucky Day ( Round 1)</b></p>
          <p className="text-info text-sm"><b>Draw at November 21st 2025</b></p>
        </div>

        <div className="timer mt-3">
          <p className="text-sm">
            Next Draw : 
          </p>
          
          <div className="time-left-items gap-2 d-flex align-items-center justify-content-center pt-1">
            <span style={{ backgroundColor: '#1a2b3c', padding: '5px 8px', borderRadius: '5px' }}>3D</span>
            <span style={{ backgroundColor: '#1a2b3c', padding: '5px 8px', borderRadius: '5px' }}>6H</span>
            <span style={{ backgroundColor: '#1a2b3c', padding: '5px 8px', borderRadius: '5px' }}>5M</span>
            <span style={{ backgroundColor: '#1a2b3c', padding: '5px 8px', borderRadius: '5px' }}>6S</span>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LotteryWinnerSlider;
