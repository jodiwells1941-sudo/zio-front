"use client";

import Link from "next/link";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { getMerchantAccount } from "@/app/api/merchant";

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

type MerchantStatus = "approved" | "pending" | "rejected" | string;

type MerchantAccount = {
  status?: MerchantStatus;
};

/*
 * -----------------------------------------------------------
 * MERCHANT-ONLY SIDEBAR (approved merchants only)
 * -----------------------------------------------------------
 * Once a merchant's application is approved, the ENTIRE
 * sidebar nav switches to only these merchant management
 * links — every other item (Dashboard, Wallet, Lottery, etc.)
 * is hidden while the merchant is approved.
 */
const MERCHANT_APPROVED_NAV_ITEMS: NavItem[] = [
  { label: "Merchant Account", href: "/dashboard/merchant", iconClass: "fa-solid fa-user-tie" },
  { label: "Merchant Commission", href: "/dashboard/merchant/commission-earnings", iconClass: "fa-solid fa-coins" },
  { label: "Merchant Level", href: "/dashboard/merchant/level", iconClass: "fa-solid fa-layer-group" },
  { label: "Merchant Profile", href: "/dashboard/merchant/profile", iconClass: "fa-solid fa-id-card" },
  { label: "Merchant Reviews", href: "/dashboard/merchant/reviews", iconClass: "fa-solid fa-star" },
  { label: "Merchant Settings", href: "/dashboard/merchant/settings", iconClass: "fa-solid fa-gear" },
];

export default function LeftSidebar({
  navItems = [
    { label: "Dashboard", href: "/dashboard", iconClass: "fas fa-home" },
    { label: "My Wallet", href: "/dashboard/wallet", iconClass: "fas fa-wallet", 
      subItems: [
        { label: "Balance", href: "/dashboard/wallet?tab=tab1" },
        { label: "Deposit", href: "/dashboard/wallet?tab=tab2" },
        { label: "Transfer", href: "/dashboard/wallet?tab=tab4" },
        { label: "Withdraw", href: "/dashboard/wallet?tab=tab5" },
        { label: "Transactions History", href: "/dashboard/wallet?tab=tab6" },
      ],
    },
    {
      label: "P2P", href: "/dashboard/wallet", iconClass: "fa-solid fa-handshake", 
      subItems: [
        { label: "P2P Buy & Sell", href: "/dashboard/wallet?tab=tab3" },
        { label: "Merchant Apply", href: "/dashboard/merchant" },
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

  const [merchantAccount, setMerchantAccount] = React.useState<MerchantAccount>({});

  useEffect(() => {
    const fetchDepositInfo = async () => {
      try {
        const merchantAccount = await getMerchantAccount();
        setMerchantAccount(merchantAccount?.data?.application ?? {});
      } catch (err) {
        console.error("Error fetching merchant account:", err);
      }
    };

    fetchDepositInfo();
  }, []);

  const isApprovedMerchant = merchantAccount?.status === "approved";

  /*
   * -------------------------------------------------------
   * EFFECTIVE NAV ITEMS
   * -------------------------------------------------------
   * Once the merchant application is approved, the sidebar
   * shows ONLY the merchant management links — every other
   * item (Dashboard, Wallet, Lottery, etc.) is hidden.
   */
  const effectiveNavItems = useMemo(() => {
    if (isApprovedMerchant) {
      return MERCHANT_APPROVED_NAV_ITEMS;
    }

    return navItems;
  }, [navItems, isApprovedMerchant]);

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
      const [hrefPath] = href.split("?");
      const current = pathname?.replace(/\/+$/, "") || "/";
      const target = hrefPath.replace(/\/+$/, "") || "/";
      if (target === "/dashboard") return current === "/dashboard";
      return current === target || current.startsWith(target + "/");
    },
    [pathname]
  );

  const isWalletActive = isActive("/dashboard/wallet");
  const searchParams = useSearchParams();

  const tab = searchParams.get('tab');


  const toggleSubMenu = useCallback((label: string) => {
    setOpenSubMenus((prev) => ({ ...prev, [label]: !prev[label] }));
  }, []);

  // Auto-open a submenu if the current path/tab matches one of its sub items
  const isSubMenuOpen = useCallback(
    (item: NavItem) => {
      if (openSubMenus[item.label] !== undefined) return openSubMenus[item.label];

      return (
        item.subItems?.some((sub) => {
          if (sub.href.includes("tab=")) {
            return tab === sub.href.split("tab=")[1];
          }
          return isActive(sub.href);
        }) ?? false
      );
    },
    [openSubMenus, isActive, tab]
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
            {effectiveNavItems.map((item) => {
              const hasSubItems = item.subItems && item.subItems.length > 0;
              const subOpen = hasSubItems && isSubMenuOpen(item);
              const parentActive = isActive(item.href);

              const anySubActive =
                hasSubItems &&
                item.subItems!.some((sub) =>
                  sub.href.includes("tab=")
                    ? tab === sub.href.split("tab=")[1]
                    : isActive(sub.href)
                );

              return (
                <li
                  key={item.label}
                  className={[
                    parentActive && !hasSubItems ? "active" : "",
                    hasSubItems && anySubActive ? "active" : "",
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
                    <ul
                      className={`mx-2 nav-submenu mt-4 ${
                        subOpen ? "submenu-open" : ""
                      }`}
                    >
                      {item.subItems!.map((sub) => {
                        const hasTabParam = sub.href.includes("tab=");
                        const subTab = hasTabParam ? sub.href.split("tab=")[1] : null;
                        const subActive = hasTabParam ? tab === subTab : isActive(sub.href);

                        return (
                          <li
                            key={sub.label}
                            className={subActive ? "active" : ""}
                          >
                            <Link href={sub.href}>
                              {sub.label}
                            </Link>
                          </li>
                        );
                      })}
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

