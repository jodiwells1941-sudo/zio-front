"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import NavbarData from "@/public/data/navbar-data";
import logo from "@/public/images/logo.png";

interface OffCanvasMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const OffCanvasMenu = ({ isOpen, onClose }: OffCanvasMenuProps) => {
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);

  const handleDropdownToggle = (index: number) => {
    setOpenDropdown((prev) => (prev === index ? null : index));
  };

  const getMenuHref = (path?: string) => {
    if (!path) return "/";
    return path.startsWith("/") ? path : `/${path}`;
  };

  const menuWrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen && menuWrapperRef.current) {
      const fadeEls =
        menuWrapperRef.current.querySelectorAll<HTMLElement>(".nav-fade");
      fadeEls.forEach((el, i) => {
        el.style.animationDelay = `${1.75 + i * 0.25}s`;
      });
    }
  }, [isOpen]);

  // Reset open dropdown whenever the menu closes
  useEffect(() => {
    if (!isOpen) setOpenDropdown(null);
  }, [isOpen]);

  return (
    <>
      <div className={`mobile-menu d-block d-xl-none${isOpen ? " show-menu" : ""}`}>
        <nav className="mobile-menu__wrapper" ref={menuWrapperRef}>

          {/* Header */}
          <div className="mobile-menu__header nav-fade">
            <div className="logo">
              <Link href="/" aria-label="home page" title="logo">
                <Image src={logo} alt="Logo" />
              </Link>
            </div>
            <button
              aria-label="close mobile menu"
              className="close-mobile-menu"
              onClick={onClose}
            >
              <i className="ti ti-x"></i>
            </button>
          </div>

          {/* Nav list */}
          <div className="mobile-menu__list">
            <ul className="navbar__list">
              {NavbarData.map((item, index) => {
                if (item.submenu) {
                  const isDropdownOpen = openDropdown === index;
                  return (
                    <li
                      key={index}
                      className="navbar__item navbar__item--has-children nav-fade"
                    >
                      {/* ── Dropdown trigger ── */}
                      <button
                        type="button"
                        aria-expanded={isDropdownOpen}
                        className={`ps-4 ms-3 border-bottom border-dark-light py-3 navbar__dropdown-label dropdown-label-alter${
                          isDropdownOpen ? " navbar__item-active" : ""
                        }`}
                        style={{
                          background: "none",
                          border: "none",
                          padding: 0,
                          width: "100%",
                          textAlign: "left",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                        onClick={() => handleDropdownToggle(index)}
                      >
                        {item.title}
                      </button>

                      {/* ── Submenu: pure CSS max-height accordion  navbar__sub-menu── */}
                      <ul
                        style={{
                          maxHeight: isDropdownOpen ? "600px" : "0px",
                          overflow: "hidden",
                          transition: "max-height 0.35s ease",
                          padding: 0,
                          margin: 0,
                          listStyle: "none",
                        }}
                      >
                        {item.submenu.map((sub, i) => (
                          <li key={i}>
                            <Link href={getMenuHref(sub.path)} onClick={onClose}>
                              {sub.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </li>
                  );
                }

                return (
                  <li key={index} className="navbar__item nav-fade">
                    <Link href={getMenuHref(item.path)} onClick={onClose}>
                      {item.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* CTA buttons */}
          <div className="mobile-menu__cta nav-fade d-block d-md-none">
            <Link
              href="/sign-up"
              aria-label="create account"
              title="create account"
              className="btn--primary"
              onClick={onClose}
            >
              Sign Up <i className="ti ti-arrow-narrow-right"></i>
            </Link>
            <Link
              href="/sign-in"
              className="btn--secondary mt-3 w-100 d-flex align-items-center justify-content-center"
              onClick={onClose}
            >
              Sign In <i className="ti ti-arrow-narrow-right"></i>
            </Link>
          </div>

          {/* Social links */}
          <div className="mobile-menu__social social nav-fade">
            <Link href="https://www.facebook.com/" target="_blank" aria-label="facebook" title="facebook">
              <i className="fa-brands fa-facebook-f"></i>
            </Link>
            <Link href="https://instagram.com/" target="_blank" aria-label="instagram" title="instagram">
              <i className="fa-brands fa-instagram"></i>
            </Link>
            <Link href="https://x.com/" target="_blank" aria-label="twitter" title="twitter">
              <i className="fa-brands fa-twitter"></i>
            </Link>
            <Link href="https://www.linkedin.com/" target="_blank" aria-label="linkedin" title="linkedin">
              <i className="fa-brands fa-linkedin-in"></i>
            </Link>
          </div>

        </nav>
      </div>

      {/* Backdrop */}
      <div
        className={`mobile-menu__backdrop${isOpen ? " mobile-menu__backdrop-active" : ""}`}
        onClick={onClose}
      />
    </>
  );
};

export default OffCanvasMenu;

