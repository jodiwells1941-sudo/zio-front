"use client";

import Link from "next/link";
import React, { useCallback, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

type NavItem = {
  label: string;
  href: string;
  iconClass: string;
  subItems?: { label: string; href: string }[];
};

type SocialItem = {
  href: string;
  iconClass: string;
};

type Props = {
  navItems?: NavItem[];
  faqItems?: NavItem[];
  socials?: SocialItem[];
  referralLink?: string;
};

export default function LeftSidebar({
  navItems = [
    { label: "Dashboard", href: "/dashboard", iconClass: "fas fa-home" },
    { label: "My Wallet", href: "/dashboard/wallet", iconClass: "fas fa-wallet", 
      subItems: [
        { label: "Balance", href: "/dashboard/wallet?tab=tab1" },
        { label: "Deposit", href: "/dashboard/wallet?tab=tab2" },
        { label: "P2P", href: "/dashboard/wallet?tab=tab3" },
        { label: "Transfer", href: "/dashboard/wallet?tab=tab4" },
        { label: "Withdraw", href: "/dashboard/wallet?tab=tab5" },
        { label: "Transactions History", href: "/dashboard/wallet?tab=tab6" },
      ],
    },
    { label: "Lottery", href: "/dashboard/lottery", iconClass: "fa-regular fa-futbol" },
    { label: "Investment", href: "/dashboard/investment", iconClass: "fa-solid fa-chart-line" },
    { label: "Lottery Winner", href: "/dashboard/lottery-winner", iconClass: "fa-solid fa-trophy" },
    { label: "Lottery Result", href: "/dashboard/lottery-result", iconClass: "fa-solid fa-receipt" },
    { label: "Ticket History", href: "/dashboard/ticket-history", iconClass: "fa-solid fa-ticket" },
    { label: "Affiliate", href: "/dashboard/affiliate", iconClass: "fas fa-link" },
    { label: "Support", href: "/dashboard/support", iconClass: "fa-solid fa-headset" },
    { label: "My Account", href: "/dashboard/account", iconClass: "fa-solid fa-user-gear"},
  ],
  faqItems = [
    { label: "Documentation", href: "#", iconClass: "fa-regular fa-file" },
    { label: "Probably Fair", href: "#", iconClass: "fas fa-bolt" },
    { label: "Payment Proof", href: "#", iconClass: "fa-solid fa-receipt" },
    { label: "Contact Us", href: "#", iconClass: "fa-solid fa-phone" },
    { label: "Live Support", href: "#", iconClass: "fa-solid fa-headset" },
  ],
  socials = [
    { href: "#", iconClass: "fab fa-facebook-f" },
    { href: "#", iconClass: "fab fa-telegram-plane" },
    { href: "#", iconClass: "fab fa-linkedin-in" },
    { href: "#", iconClass: "fab fa-twitter" },
    { href: "#", iconClass: "fab fa-youtube" },
    { href: "#", iconClass: "fab fa-tiktok" },
    { href: "#", iconClass: "fab fa-skype" },
  ],
  referralLink = "https://ziolottery.com/",
}: Props) {
  const pathname = usePathname();

  const [collapsed, setCollapsed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [openSubMenus, setOpenSubMenus] = useState<Record<string, boolean>>({});
  const router = useRouter();

  const onCloseMobile = useCallback(() => {
    document.querySelector(".left-sidebar-area")?.classList.remove("active");
  }, []);

  const onToggleCollapse = useCallback(() => {
    setCollapsed((v) => !v);
  }, []);

  const onCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {}
  }, [referralLink]);

  const sidebarClass = useMemo(
    () =>
      [
        "lottery-sidebar left-sidebar-area scrollbar-transparent rounded-0",
        collapsed ? "sidebar-collapsed" : "",
      ].join(" "),
    [collapsed]
  );

  const stop = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if ((e.currentTarget.getAttribute("href") || "").startsWith("#")) e.preventDefault();
  };

  const isActive = useCallback(
    (href: string) => {
      if (!href || href === "#") return false;
      const current = pathname?.replace(/\/+$/, "") || "/";
      const target = href.replace(/\/+$/, "") || "/";
      if (target === "/dashboard") return current === "/dashboard";
      return current === target || current.startsWith(target + "/");
    },
    [pathname]
  );

  const isWalletActive = isActive("/dashboard/wallet");

  const toggleSubMenu = useCallback((label: string) => {
    setOpenSubMenus((prev) => ({ ...prev, [label]: !prev[label] }));
  }, []);

  // Auto-open wallet submenu if on a wallet route
  const isSubMenuOpen = useCallback(
    (item: NavItem) => {
      if (openSubMenus[item.label] !== undefined) return openSubMenus[item.label];
      // Auto-expand if current path is under this item
      return item.subItems?.some((sub) => isActive(sub.href)) ?? false;
    },
    [openSubMenus, isActive]
  );

  const onNavigate = useCallback((href: string) => {
    const sidebar = document.querySelector(".left-sidebar-area");
    sidebar?.classList.remove("active");
    router.push(href);
  }, [router]);

  return (
    <>
      <div className="flex-shrink-0 width-260-px d-xl-block d-none"></div>

      <aside className={sidebarClass}>
        <button
          type="button"
          className="collapse-btn position-absolute end-0 top-0 me-3 mt-12 d-xl-block d-none"
          onClick={onToggleCollapse}
        >
          <span className="icon">
            <i className="fa-solid fa-arrow-right-from-bracket"></i>
          </span>
        </button>

        <button
          type="button"
          className="left-sidebar-close position-absolute top-0 end-0 text-white fs-3 mt-16 me-3 d-xl-none d-flex"
          onClick={onCloseMobile}
        >
          <i className="fa-solid fa-xmark"></i>
        </button>

        <nav className="nav-menu">
          <ul>
            {navItems.map((item) => {
              const hasSubItems = item.subItems && item.subItems.length > 0;
              const subOpen = hasSubItems && isSubMenuOpen(item);
              const parentActive = isActive(item.href);

              return (
                <li
                  key={item.label}
                  className={[
                    parentActive && !hasSubItems ? "active" : "",
                    hasSubItems && isWalletActive ? "active" : "",
                    hasSubItems ? "has-submenu" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {hasSubItems ? (
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        toggleSubMenu(item.label);
                      }}
                      aria-expanded={subOpen}
                    >
                      <i className={item.iconClass}></i>{" "}
                      <span className="sidebar-text">{item.label}</span>
                      <i
                        className={`fas fa-chevron-right submenu-arrow sidebar-text ${subOpen ? "open" : ""}`}
                      ></i>
                    </a>
                  ) : (
                    <Link href={item.href} onClick={(e) => { e.preventDefault(); onNavigate(item.href); }}>
                      <i className={item.iconClass}></i>
                      <span className="sidebar-text">{item.label}</span>
                    </Link>
                  )}

                  {hasSubItems && (
                    <ul className={`mx-2 nav-submenu mt-4 ${subOpen ? "submenu-open" : ""}`}>
                      {item.subItems!.map((sub) => (
                        <li key={sub.label} className={isActive(sub.href) ? "active" : ""}>
                          <Link href={sub.href} onClick={onCloseMobile}>{sub.label}</Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="sidebar-divider border-bottom border-dark-light"></div>

        <div className="community-area">
          <p className="section-label">JOIN OUR COMMUNITY</p>
          <div className="social-grid d-flex flex-wrap">
            {socials.map((s, idx) => (
              <a key={idx} href={s.href} onClick={stop}>
                <i className={s.iconClass}></i>
              </a>
            ))}
          </div>
        </div>

        <div className="invite-area">
          <p className="section-label">INVITE YOUR FRIENDS</p>
          <p className="invite-desc">
            Refer users using your referral link and earn up to 20% of their winnings.
          </p>
        </div>

        <div className="copy-input-wrapper position-relative mt-24">
          <input type="text" className="copy-input form-control" value={referralLink} readOnly />
          <button type="button" className="copy-btn" onClick={onCopy}>
            {copied ? <i className="fa-solid fa-check"></i> : <i className="fa-solid fa-copy"></i>}
          </button>
        </div>

        <div className="sidebar-divider border-bottom border-dark-light"></div>

        <p className="section-label">FAQ</p>
        <nav className="nav-menu">
          <ul>
            {faqItems.map((item) => (
              <li key={item.label} className="mb-0">
                {/* <a href={item.href} onClick={stop} > */}
                {/* <a href={item.href} onClick={(e) => { stop(e); onCloseMobile(); }}> */}
                <a href={item.href} onClick={(e) => { e.preventDefault(); onNavigate(item.href); }}>
                  <i className={item.iconClass}></i>{" "}
                  <span className="sidebar-text">{item.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar-divider border-bottom border-dark-light"></div>

        <button type="button" className="collapse-btn" onClick={onToggleCollapse}>
          <span className="icon">
            <i className="fa-solid fa-arrow-right-from-bracket"></i>
          </span>
          <span className="sidebar-text">Collapse</span>
        </button>
      </aside>
    </>
  );
}