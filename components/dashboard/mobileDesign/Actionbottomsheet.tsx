"use client";
import { useEffect } from "react";
import styles from "./dashboard.module.css";
import Link from "next/link";

type ModalType = "deposit" | "withdraw" | null;

interface ActionBottomSheetProps {
  type: ModalType;
  onClose: () => void;
}

const BUTTONS = {
  deposit: [
    { label: "Deposit Now", description:'Use the correct network for Binance deposits', tab: "tab2",  icon: "fas fa-donate",          style: "p2pBtn", delay: "0.25s" },
    { label: "P2P But & Sell", description:'Use only your own payment account',  tab: "tab3",   icon: "fa-solid fa-person-military-to-person", style: "p2pBtn", delay: "0.35s" },
  ],
  withdraw: [
    { label: "Transfer", description:'Use the correct User ID', tab: "tab4", icon: "fas fa-paper-plane",        style: "p2pBtn", delay: "0.25s" },
    { label: "Withdraw Crypto", description:'Use the correct withdrawal details.', tab: "tab5", icon: "fas fa-money-check-alt", style: "p2pBtn",           delay: "0.35s" },
    { label: "P2P But & Sell", description:'Use only your own payment account',  tab: "tab3",   icon: "fa-solid fa-person-military-to-person", style: "p2pBtn", delay: "0.35s" },
  ],
};

const ActionBottomSheet = ({ type, onClose }: ActionBottomSheetProps) => {
  const isOpen = type !== null;
  const buttons = type ? BUTTONS[type] : [];

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`${styles.backdrop} ${isOpen ? styles.backdropVisible : ""}`}
        onClick={onClose}
      />

      {/* Bottom Sheet */}
      <div className={`${styles.sheet} ${isOpen ? styles.sheetOpen : ""}`}>

        {/* Drag handle */}
        <div className={styles.handle} />

        {/* Header */}
        <div
          className={`${styles.item} ${isOpen ? styles.itemVisible : ""}`}
          style={{ "--delay": "0.15s" } as React.CSSProperties}
        >
          <div className={styles.header}>
            <h5 className={styles.title}>
              {type === "deposit" ? "Select Deposit Method" : "Withdraw"}
            </h5>
            <button
              type="button"
              className={styles.closeBtn}
              onClick={onClose}
              aria-label="Close"
            >
              <i className="ti ti-x" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className={styles.body}>
          {buttons.map((btn) => (
            <div
              key={btn.label}
              className={`${styles.item} ${isOpen ? styles.itemVisible : ""}`}
              style={{ "--delay": btn.delay } as React.CSSProperties}
            >
              <Link href={`/dashboard/wallet?tab=${btn.tab}`}
                type="button"
                className={styles[btn.style as keyof typeof styles]}
                onClick={onClose}
              >
                <i className={`${btn.icon} text-xxl`} />
                <div className="ps-2">
                  <div>{btn.label}</div>
                  <small className="fw-4 fs-10">{btn.description}</small>
                </div>
              </Link>
            </div>
          ))}
        </div>

      </div>
    </>
  );
};

export default ActionBottomSheet;