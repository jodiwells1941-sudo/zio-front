"use client";

import { useAuth } from "@/hooks/useAuth";
import { logout } from "@/utils/auth";
import Link from "next/link";
import React, { useCallback, useEffect, useState } from "react";

type NotificationItem = {
  name: string;
  message: string;
  time: string;
  isActiveBg?: boolean;
};

type Props = {
  userName?: string;
  balance?: string;
  notificationsCount?: string;
  notifications?: NotificationItem[];
};

type User = {
  name?: string;
  wallet?: {
    amount?: number;
  };
};

export default function Header({
  
  notificationsCount = "05",
  notifications = [
    { name: "Kathryn Murphy", message: "hey! there i'm...", time: "12:30 PM" },
    { name: "John Doe", message: "hey! there i'm...", time: "12:30 PM", isActiveBg: true },
    { name: "John Abraham", message: "hey! there i'm...", time: "12:30 PM" },
    { name: "Kathryn Murphy", message: "hey! there i'm...", time: "12:30 PM", isActiveBg: true },
  ],
}: Props) {
  const stop = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
  }, []);

  const toggleLeftSidebar = useCallback(() => {
    document.querySelector(".left-sidebar-area")?.classList.toggle("active");
  }, []);

  const depositClick = useCallback(() => {
    // hook API / open modal etc
    // console.log("Deposit click");
  }, []);

  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const { isLoggedIn, user } = useAuth() as { isLoggedIn: boolean; user: User | null };  

    // const deleteCookie = (name: string) => {
    //   // Try multiple approaches to ensure cookie deletion
    //   const domains = [
    //   window.location.hostname,
    //   `.${window.location.hostname}`,
    //   window.location.hostname.split('.').slice(-2).join('.')
    //   ];
      
    //   const paths = ['/', '/dashboard', ''];
      
    //   domains.forEach(domain => {
    //   paths.forEach(path => {
    //     document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}; domain=${domain};`;
    //     document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path};`;
    //   });
    //   });
    // };

    const handleLogout = async () => {
      // Delete the httpOnly cookie via API route (cannot be done client-side)
      await fetch("/api/auth/logout", { method: "POST" });

      // Clear localStorage / in-memory auth state
      logout();

      window.location.href = "/sign-in";
    };

    useEffect(() => {
      if (!isLoggedIn) {
        window.location.href = "/";
      }
    }, [isLoggedIn]);

    useEffect(() => {
        if (!isLoggedIn) {
            window.location.href = '/';
        }
    }, [isLoggedIn]);

  return (
    <header className={`bg-navy-blue header py-2 z_index${isSticky ? ' sticky-header' : ''}`}>
      <div className="container-flouid px-3">
        <div className="row">
          <div className="col-12">
            <div className="main-header__menu-box">
              <nav className="navbar p-0 gap-2">
                <div className="d-flex align-items-center gap-sm-3 gap-2">
                  <div className="navbar-logo d-none d-xl-block">
                    <a href={"/"}>
                      <img src="/images/logo.png" alt="Image" />
                    </a>
                  </div>

                  <div className="navbar-logo2 d-xl-none">
                    <a href="index.html">
                      <img src="/images/phone-logo.png" alt="Image" />
                    </a>
                  </div>

                  <button
                    type="button"
                    className="left-sidebar-btn d-xl-none d-flex"
                    onClick={toggleLeftSidebar}
                  >
                    <i className="fa-solid fa-bars"></i>
                  </button>
                </div>

                <div className="border border-dark-light rounded-pill py-2 px-sm-3 px-2 d-flex align-items-center gap-1 d-md-none">
                  <span className="d-none d-md-block">
                    <img src="/images/coin.png" alt="Coin" />
                  </span>
                  <span className="text-white fw-bold text-xl">${user?.wallet?.amount?.toFixed(2) || 0}</span>
                </div>

                <div className="navbar__options">
                  <div
                    className="d-flex align-items-center gap-md-3 gap-2"
                  >
                    {/* Deposit Button */}
                    <div className="wallet-menu position-relative">
                      <button
                        type="button"
                        title="Play Lottery"
                        className="btn--secondary py-lg-2 py-1 px-3 d-sm-flex d-none"
                        onClick={depositClick}
                      >
                        Deposit
                      </button>
                      <ul className="wallet-submenu">
                        <li>
                          <a href="/dashboard/wallet/?tab=tab1">Balance</a>
                        </li>

                        <li>
                          <a href="/dashboard/wallet/?tab=tab2">Deposit</a>
                        </li>

                        <li>
                          <a href="/dashboard/wallet/?tab=tab3">P2P</a>
                        </li>

                        <li>
                          <a href="/dashboard/wallet/?tab=tab4">Transfer</a>
                        </li>

                        <li>
                          <a href="/dashboard/wallet/?tab=tab5">Withdraw</a>
                        </li>

                        <li>
                          <a href="/dashboard/wallet/?tab=tab6">
                            Transactions History
                          </a>
                        </li>
                      </ul>
                    </div>

                    {/* Wallet Balance */}
                    <div className="wallet-menu position-relative d-md-flex d-none border border-dark-light rounded-pill py-2 px-sm-3 px-2 align-items-center gap-1 bg-dark">
                      <span>
                        <img src="/images/coin.png" alt="Coin" />
                      </span>

                      <span className="text-white">
                        {user?.wallet?.amount?.toFixed(2) || 0}
                      </span>

                      <ul className="wallet-submenu">
                        <li>
                          <a href="/dashboard/wallet/?tab=tab1">Balance</a>
                        </li>

                        <li>
                          <a href="/dashboard/wallet/?tab=tab2">Deposit</a>
                        </li>

                        <li>
                          <a href="/dashboard/wallet/?tab=tab3">P2P</a>
                        </li>

                        <li>
                          <a href="/dashboard/wallet/?tab=tab4">Transfer</a>
                        </li>

                        <li>
                          <a href="/dashboard/wallet/?tab=tab5">Withdraw</a>
                        </li>

                        <li>
                          <a href="/dashboard/wallet/?tab=tab6">
                            Transactions History
                          </a>
                        </li>
                      </ul>
                    </div>

                    <div className="dropdown">
                      <button
                        className="squire-btn d-sm-flex d-none"
                        aria-label="search products"
                        title="Notification Dropdown"
                        type="button"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                        data-bs-auto-close="outside"
                      >
                        <i className="fa-regular fa-bell"></i>
                        <span className="notify-dot"></span>
                      </button>

                      <button
                        className="d-sm-none d-flex h5 mb-0 me-2 me-md-0"
                        aria-label="search products"
                        title="Notification Dropdown"
                        type="button"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                        data-bs-auto-close="outside"
                      >
                        <i className="fa-regular fa-bell"></i>
                      </button>

                      <div className="dropdown-menu end-0 left-auto notification-dropdown rounded-4">
                        <div className="py-2 px-3 rounded-3 bg-neutral-100 m-3 d-flex align-items-center justify-content-between gap-2">
                          <div>
                            <h6 className="text-lg text-primary-light fw-semibold mb-0">
                              Notifications
                            </h6>
                          </div>

                          <span className="rounded-text rounded-circle d-flex justify-content-center align-items-center">
                            {notificationsCount}
                          </span>
                        </div>

                        <div className="max-h-400-px overflow-y-auto scroll-sm d-flex flex-column">
                          {notifications.map((n, idx) => (
                            <a
                              key={idx}
                              href="#"
                              onClick={stop}
                              className={[
                                "px-3 py-2 d-flex align-items-start gap-3 justify-content-between notification-item",
                                n.isActiveBg ? "bg-neutral-100" : "",
                              ].join(" ")}
                            >
                              <div className="text-black hover-bg-transparent hover-text-primary d-flex align-items-center gap-3">
                                <span className="rounded-text rounded-circle d-flex justify-content-center align-items-center bg-neutral-100 rounded-circle flex-shrink-0 position-relative text-black">
                                  <i className="fa-regular fa-circle-check"></i>
                                  <span className="w-8-px h-8-px bg-success-main rounded-circle position-absolute end-0 bottom-0"></span>
                                </span>

                                <div>
                                  <h6 className="text-md fw-semibold mb-0">{n.name}</h6>
                                  <p className="mb-0 text-sm text-secondary-light text-w-100-px">
                                    {n.message}
                                  </p>
                                </div>
                              </div>

                              <div className="d-flex flex-column align-items-end">
                                <span className="text-sm text-secondary-light flex-shrink-0">
                                  {n.time}
                                </span>
                              </div>
                            </a>
                          ))}
                        </div>

                        <div className="text-center py-3">
                          <a href="#" className="text-primary" onClick={stop}>
                            See All Notification
                          </a>
                        </div>
                      </div>
                    </div>

                    <div className="dropdown">
                      <button
                        className="h6 mb-0 dropdown-toggle py-3 text-xl"
                        aria-label="search products"
                        title="User Info Dropdown"
                        type="button"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                        data-bs-auto-close="outside"
                      >
                        <span className="d-sm-block d-none">{user?.name || "User"}</span>
                        <span className="d-sm-none d-flex h5 mb-0 ms-1">
                          <i className="fa-regular fa-user"></i>
                        </span>
                      </button>

                      <div className="dropdown-menu end-0 left-auto p-3 rounded-4">
                        <ul className="d-flex flex-column gap-2">
                          <li>
                            <Link
                              href={"/dashboard/account"}
                              className="text-black d-flex align-items-center gap-2 hover-text-yellow"
                            >
                              <span className="d-flex text-sm w-16-px">
                                <i className="fa-regular fa-user"></i>
                              </span>
                              <span className="d-flex">My Account</span>
                            </Link>
                          </li>

                          <li>
                            <Link
                              href={"/dashboard/wallet"}
                              className="text-black d-flex align-items-center gap-2 hover-text-yellow"
                            >
                              <span className="d-flex text-sm w-16-px">
                                <i className="fa-solid fa-money-bill-transfer"></i>
                              </span>
                              <span className="d-flex">Transactions</span>
                            </Link>
                          </li>

                          <li>
                            <button type="button" onClick={handleLogout}
                              className="text-black d-flex align-items-center gap-2 hover-text-yellow"
                            >
                              <span className="d-flex text-sm w-16-px">
                                <i className="fas fa-sign-out"></i>
                              </span>
                              <span className="d-flex">Log Out</span>
                            </button>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <button
                    className="open-offcanvas-nav d-none"
                    aria-label="toggle mobile menu"
                    title="open offcanvas menu"
                    type="button"
                  >
                    <span className="icon-bar top-bar"></span>
                    <span className="icon-bar middle-bar"></span>
                    <span className="icon-bar bottom-bar"></span>
                  </button>
                </div>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}